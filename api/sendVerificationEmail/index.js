/**
 * Azure Function - Send Verification Email
 * Envoie un lien de vérification email
 */

const { storeCode } = require('../utils/codeStorage');

module.exports = async function (context, req) {
    context.log('📧 Send Verification Email function triggered');
    
    try {
        const { email, name, verifyLink, token, isVerificationLink } = req.body;
        
        if (!email) {
            context.res = {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Email requis' })
            };
            return;
        }
        
        // Stocker le token si c'est pour la vérification
        if (isVerificationLink && token) {
            const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 heures
            await storeCode(email, token, expiresAt, 'verification');
        }
        
        context.log(`✅ Token généré pour ${email}`);
        
        // Retourner immédiatement
        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: true,
                message: 'Email envoyé'
            })
        };
        
        // ========== Envoi d'email en arrière-plan (non-bloquant) ==========
        const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
        
        if (!connectionString) {
            context.log.warn('⚠️ Email non configuré - mode développement');
            return;
        }
        
        // Envoyer l'email de manière asynchrone
        setImmediate(async () => {
            try {
                const { EmailClient } = require("@azure/communication-email");
                const client = new EmailClient(connectionString);
                const senderAddress = process.env.AZURE_COMMUNICATION_SENDER || "DoNotReply@azurecomm.net";
                
                // Email avec lien de vérification
                const emailMessage = {
                    senderAddress: senderAddress,
                    content: {
                        subject: "Vérifiez votre email Axilum AI",
                        plainText: `Bonjour ${name || 'utilisateur'},\n\nBienvenue sur Axilum AI !\n\nCliquez sur le lien ci-dessous pour vérifier votre adresse email:\n${verifyLink}\n\nCe lien expire dans 24 heures.\n\nSi vous n'avez pas créé ce compte, ignorez cet email.\n\nCordialement,\nL'équipe Axilum AI`,
                        html: `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <style>
                                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0; }
                                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                                    .button-box { text-align: center; margin: 30px 0; }
                                    .button { background: #667eea; color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; }
                                    .button:hover { background: #5568d3; }
                                    .link-text { color: #667eea; word-break: break-all; font-size: 12px; margin-top: 15px; padding: 10px; background: white; border: 1px dashed #ddd; border-radius: 5px; }
                                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                                    .timer { color: #ff6b6b; font-weight: bold; }
                                </style>
                            </head>
                            <body>
                                <div class="container">
                                    <div class="header">
                                        <h1>🤖 Axilum AI</h1>
                                        <p>Vérification de votre email</p>
                                    </div>
                                    <div class="content">
                                        <p>Bonjour <strong>${name || 'utilisateur'}</strong>,</p>
                                        <p>Bienvenue sur <strong>Axilum AI</strong> ! Pour finaliser la création de votre compte, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous:</p>
                                        
                                        <div class="button-box">
                                            <a href="${verifyLink}" class="button">✅ Vérifier mon email</a>
                                        </div>
                                        
                                        <p>Ou copiez et collez ce lien dans votre navigateur:</p>
                                        <div class="link-text">${verifyLink}</div>
                                        
                                        <p style="margin-top: 20px;"><span class="timer">⏰ Ce lien expire dans 24 heures.</span></p>
                                        
                                        <p>Si vous n'avez pas créé ce compte, vous pouvez ignorer cet email en toute sécurité.</p>
                                        
                                        <p style="margin-top: 30px;">Cordialement,<br><strong>L'équipe Axilum AI</strong></p>
                                    </div>
                                    <div class="footer">
                                        <p>AI Solutions Hub® - support@solutionshub.uk</p>
                                    </div>
                                </div>
                            </body>
                            </html>
                        `
                    },
                    recipients: {
                        to: [{ address: email }]
                    }
                };
                
                context.log(`�� Envoi d'email à ${email}...`);
                
                const poller = await client.beginSend(emailMessage);
                context.log(`✅ Email démarré (ID: ${poller.getOperationState().id})`);
                
                // Attendre en arrière-plan
                const result = await poller.pollUntilDone();
                context.log(`✅ Email envoyé avec succès à ${email}:`, result.status);
                
            } catch (emailError) {
                context.log.error(`❌ Erreur lors de l'envoi d'email:`, emailError.message);
            }
        });
        
    } catch (error) {
        context.log.error('❌ Erreur:', error);
        context.res = {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                error: 'Erreur lors du traitement',
                details: error.message 
            })
        };
    }
};
