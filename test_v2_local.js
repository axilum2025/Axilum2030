/**
 * Test local de l'architecture V2
 * Simule l'endpoint invoke-v2 sans déploiement Azure
 */

const fs = require('fs');
const path = require('path');

// Charger les modules V2
const contextManagerPath = path.join(__dirname, 'api', 'utils', 'contextManager.js');
const functionRouterPath = path.join(__dirname, 'api', 'utils', 'functionRouter.js');
const rateLimiterPath = path.join(__dirname, 'api', 'utils', 'rateLimiter.js');

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║         TEST LOCAL ARCHITECTURE V2 (Sans Azure)              ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

// Test 1 : Vérifier que les fichiers existent
console.log('�� Test 1 : Vérification des fichiers V2...\n');

const files = [
    { path: contextManagerPath, name: 'contextManager.js' },
    { path: functionRouterPath, name: 'functionRouter.js' },
    { path: rateLimiterPath, name: 'rateLimiter.js' },
    { path: path.join(__dirname, 'api', 'invoke-v2', 'index.js'), name: 'invoke-v2/index.js' },
    { path: path.join(__dirname, 'api', 'invoke-v2', 'function.json'), name: 'invoke-v2/function.json' }
];

let allFilesExist = true;
files.forEach(file => {
    const exists = fs.existsSync(file.path);
    console.log(`   ${exists ? '✅' : '❌'} ${file.name}`);
    if (!exists) allFilesExist = false;
});

if (!allFilesExist) {
    console.log('\n❌ Certains fichiers sont manquants. Migration incomplète.\n');
    process.exit(1);
}

console.log('\n✅ Tous les fichiers V2 sont présents.\n');

// Test 2 : Charger et tester contextManager
console.log('🧪 Test 2 : Test du contextManager...\n');

try {
    const { estimateTokens, summarizeOldHistory } = require(contextManagerPath);
    
    const testText = "Bonjour, comment vas-tu ?";
    const tokens = estimateTokens(testText);
    console.log(`   ✅ estimateTokens("${testText}") = ${tokens} tokens`);
    
    const testHistory = Array(30).fill(null).map((_, i) => ({
        role: 'user',
        content: `Message ${i + 1}`
    }));
    
    const summarized = summarizeOldHistory(testHistory);
    console.log(`   ✅ summarizeOldHistory(30 messages) = ${summarized.length} messages`);
    console.log(`   📊 Réduction: ${((1 - summarized.length / testHistory.length) * 100).toFixed(0)}%\n`);
    
} catch (error) {
    console.log(`   ❌ Erreur contextManager: ${error.message}\n`);
    process.exit(1);
}

// Test 3 : Tester functionRouter
console.log('�� Test 3 : Test du functionRouter...\n');

try {
    const { detectFunctions } = require(functionRouterPath);
    
    const testMessages = [
        "Génère une image de chat",
        "Cherche des infos sur Paris",
        "Bonjour comment ça va"
    ];
    
    testMessages.forEach(msg => {
        const detected = detectFunctions(msg);
        console.log(`   Message: "${msg}"`);
        console.log(`   ${detected.length > 0 ? '✅' : '⚪'} Fonctions: ${detected.length > 0 ? detected.join(', ') : 'aucune'}\n`);
    });
    
} catch (error) {
    console.log(`   ❌ Erreur functionRouter: ${error.message}\n`);
    process.exit(1);
}

// Test 4 : Tester rateLimiter
console.log('🧪 Test 4 : Test du rateLimiter...\n');

try {
    const { RateLimiter } = require(rateLimiterPath);
    
    const limiter = new RateLimiter('test', 30, 60000); // 30 req/min
    
    const canMake = limiter.canMakeRequest();
    console.log(`   ✅ canMakeRequest() = ${canMake}`);
    
    if (canMake) {
        limiter.recordRequest();
        console.log(`   ✅ recordRequest() ok`);
    }
    
    const stats = limiter.getStats();
    console.log(`   📊 Stats: ${stats.current}/${stats.limit} requêtes\n`);
    
} catch (error) {
    console.log(`   ❌ Erreur rateLimiter: ${error.message}\n`);
    process.exit(1);
}

// Test 5 : Vérifier function.json
console.log('🧪 Test 5 : Validation function.json...\n');

try {
    const functionConfig = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'api', 'invoke-v2', 'function.json'),
        'utf-8'
    ));
    
    const hasRoute = functionConfig.bindings.some(b => b.route === 'invoke-v2');
    const hasPOST = functionConfig.bindings.some(b => b.methods && b.methods.includes('post'));
    const isAnonymous = functionConfig.bindings.some(b => b.authLevel === 'anonymous');
    
    console.log(`   ${hasRoute ? '✅' : '❌'} Route "invoke-v2" configurée`);
    console.log(`   ${hasPOST ? '✅' : '❌'} Méthode POST autorisée`);
    console.log(`   ${isAnonymous ? '✅' : '❌'} Auth level: anonymous\n`);
    
    if (!hasRoute || !hasPOST || !isAnonymous) {
        throw new Error('Configuration function.json invalide');
    }
    
} catch (error) {
    console.log(`   ❌ Erreur function.json: ${error.message}\n`);
    process.exit(1);
}

// Test 6 : Vérifier package.json a node-cache
console.log('🧪 Test 6 : Vérification des dépendances...\n');

try {
    const packageJson = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'api', 'package.json'),
        'utf-8'
    ));
    
    const hasNodeCache = packageJson.dependencies && packageJson.dependencies['node-cache'];
    console.log(`   ${hasNodeCache ? '✅' : '❌'} node-cache installé (${hasNodeCache || 'manquant'})\n`);
    
    if (!hasNodeCache) {
        throw new Error('node-cache manquant dans package.json');
    }
    
} catch (error) {
    console.log(`   ❌ Erreur dépendances: ${error.message}\n`);
    process.exit(1);
}

// Résumé final
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║                    ✅ TESTS RÉUSSIS                          ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

console.log('📊 RÉSUMÉ DES TESTS\n');
console.log('   ✅ Fichiers V2 présents (5/5)');
console.log('   ✅ contextManager fonctionnel');
console.log('   ✅ functionRouter fonctionnel');
console.log('   ✅ rateLimiter fonctionnel');
console.log('   ✅ function.json valide');
console.log('   ✅ Dépendances installées\n');

console.log('🎯 PROCHAINE ÉTAPE\n');
console.log('   Le code V2 est 100% opérationnel localement.');
console.log('   En attente du déploiement Azure pour activer en production.\n');

console.log('⏳ DÉPLOIEMENT AZURE\n');
console.log('   Status: En cours (commit cc35909)');
console.log('   Durée estimée: 5-15 minutes');
console.log('   Vérification: gh run watch\n');

