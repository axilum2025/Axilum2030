/**
 * Test endpoint pour vérifier l'envoi d'email
 */

module.exports = async function (context, req) {
    context.log('🧪 Test Send Email triggered');
    
    try {
        const email = req.query.email || 'test@example.com';
        const name = req.query.name || 'Test User';
        
        context.log(`📧 Test d'envoi d'email à ${email}`);
        
        // Vérifier les variables d'environnement
        const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
        const sender = process.env.AZURE_COMMUNICATION_SENDER;
        
        if (!connectionString) {
            context.res = {
                status: 500,
                body: JSON.stringify({
                    error: 'AZURE_COMMUNICATION_CONNECTION_STRING non configuré',
                    hasConnection: false,
                    hasSender: !!sender
                })
            };
            return;
        }
        
        // Importer le client
        const { EmailClient } = require("@azure/communication-email");
        const client = new EmailClient(connectionString);
        
        const emailMessage = {
            senderAddress: sender || "DoNotReply@azurecomm.net",
            content: {
                subject: "Test Email - Axilum AI",
                plainText: `Bonjour ${name},\n\nCeci est un email de test.\n\nSi vous recevez cet email, l'envoi fonctionne!`,
                html: `<h1>Test Email</h1><p>Bonjour ${name},</p><p>Si vous recevez cet email, l'envoi fonctionne!</p>`
            },
            recipients: {
                to: [{ address: email }]
            }
        };
        
        context.log('📤 Envoi en cours...');
        
        const poller = await client.beginSend(emailMessage);
        context.log(`⏳ Email ID: ${poller.getOperationState().id}`);
        
        // Attendre 30 secondes max
        const result = await Promise.race([
            poller.pollUntilDone(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 30000))
        ]);
        
        context.log(`✅ Email envoyé: ${result.status}`);
        
        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: true,
                message: 'Email envoyé avec succès',
                email: email,
                result: result
            })
        };
        
    } catch (error) {
        context.log.error('❌ Erreur:', error.message);
        context.res = {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: error.message,
                stack: error.stack
            })
        };
    }
};
