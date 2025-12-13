/**
 * Vérifier un token d'email et marquer l'email comme vérifié
 */

const { getCode, deleteCode } = require('../utils/codeStorage');
const { getUserByEmail, updateUser } = require('../utils/userStorage');

module.exports = async function (context, req) {
    context.log('🔐 Verify Email function triggered');
    
    try {
        const { token } = req.query || req.body;
        
        if (!token) {
            context.res = {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    error: 'Token requis',
                    success: false
                })
            };
            return;
        }
        
        // Récupérer le token depuis Azure Storage
        const tokenData = await getCode(token);
        
        if (!tokenData) {
            context.log.warn(`⚠️ Token invalide: ${token}`);
            context.res = {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    error: 'Token invalide ou expiré',
                    success: false
                })
            };
            return;
        }
        
        // Vérifier l'expiration
        const now = Date.now();
        if (tokenData.expiresAt < now) {
            context.log.warn(`⚠️ Token expiré: ${token}`);
            await deleteCode(token);
            
            context.res = {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    error: 'Lien de vérification expiré',
                    success: false
                })
            };
            return;
        }
        
        // Token valide - email associé au token est stocké dans tokenData.code
        const email = tokenData.code;
        
        context.log(`✅ Email vérifié: ${email}`);
        
        // Supprimer le token
        await deleteCode(token);
        
        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                success: true,
                message: 'Email vérifié avec succès !',
                email: email
            })
        };
        
    } catch (error) {
        context.log.error('❌ Erreur vérification email:', error);
        context.res = {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                error: 'Erreur lors de la vérification',
                details: error.message,
                success: false
            })
        };
    }
};
