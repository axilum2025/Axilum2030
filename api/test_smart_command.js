// Test de l'assistant IA conversationnel - Smart Command
// Test des commandes: "Organise ma semaine", "Qu'est-ce que je dois faire?", "Déplace à demain"

// Couleurs pour console
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const BASE_URL = 'http://localhost:7071/api/taskManager';

async function testSmartCommand() {
    console.log('\n' + '='.repeat(60));
    console.log('🤖 TEST ASSISTANT IA CONVERSATIONNEL - SMART COMMAND');
    console.log('='.repeat(60) + '\n');

    let passCount = 0;
    let failCount = 0;

    // Fonction helper pour tester
    async function test(name, fn) {
        try {
            console.log(`\n${colors.cyan}▶ ${name}${colors.reset}`);
            await fn();
            console.log(`${colors.green}✅ PASS${colors.reset}`);
            passCount++;
        } catch (error) {
            console.log(`${colors.red}❌ FAIL: ${error.message}${colors.reset}`);
            failCount++;
        }
    }

    // Helper pour créer des tâches de test
    async function createTestTask(title, priority = 'medium', deadline = null) {
        const response = await fetch(`${BASE_URL}/smart-add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                description: `${title}${deadline ? ' pour ' + deadline : ''}${priority === 'urgent' ? ' URGENT' : ''}`
            })
        });
        const data = await response.json();
        return data.task;
    }

    // Helper pour smart command
    async function sendCommand(command) {
        const response = await fetch(`${BASE_URL}/smart-command`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        
        return await response.json();
    }

    // ============================================================
    // SETUP: Créer des tâches de test
    // ============================================================
    console.log(`\n${colors.blue}📋 SETUP: Création de tâches de test${colors.reset}`);
    
    await createTestTask('Finir le rapport urgent', 'urgent', 'demain');
    await createTestTask('Appeler le client', 'high', 'lundi');
    await createTestTask('Acheter du lait', 'low');
    await createTestTask('Préparer présentation', 'medium', 'vendredi');
    await createTestTask('Réviser code', 'medium');
    
    console.log(`${colors.green}✅ 5 tâches créées${colors.reset}`);

    // ============================================================
    // TEST 1: Commande "Qu'est-ce qui est urgent ?"
    // ============================================================
    await test('Commande: "Qu\'est-ce qui est urgent ?"', async () => {
        const result = await sendCommand("Qu'est-ce qui est urgent ?");
        
        console.log(`  Response: ${result.response.substring(0, 100)}...`);
        console.log(`  Action: ${result.action}`);
        
        if (result.insights && result.insights.urgent !== undefined) {
            console.log(`  ${colors.yellow}📊 Tâches urgentes: ${result.insights.urgent}${colors.reset}`);
        }
        
        if (!result.response) {
            throw new Error('Pas de réponse de l\'IA');
        }
    });

    // ============================================================
    // TEST 2: Commande "Qu'est-ce que je dois faire maintenant ?"
    // ============================================================
    await test('Commande: "Qu\'est-ce que je dois faire maintenant ?"', async () => {
        const result = await sendCommand("Qu'est-ce que je dois faire maintenant ?");
        
        console.log(`  Response: ${result.response.substring(0, 120)}...`);
        console.log(`  Action: ${result.action}`);
        
        if (result.suggestions && result.suggestions.length > 0) {
            console.log(`  ${colors.yellow}💡 Suggestions: ${result.suggestions.length} tâches${colors.reset}`);
            result.suggestions.slice(0, 2).forEach((s, i) => {
                console.log(`    ${i + 1}. Task ${s.taskId} - ${s.reason}`);
            });
        }
        
        if (!result.response || result.action !== 'suggest') {
            throw new Error('Format de réponse incorrect pour suggestion');
        }
    });

    // ============================================================
    // TEST 3: Commande "Organise ma semaine"
    // ============================================================
    await test('Commande: "Organise ma semaine"', async () => {
        const result = await sendCommand("Organise ma semaine");
        
        console.log(`  Response: ${result.response.substring(0, 120)}...`);
        console.log(`  Action: ${result.action}`);
        
        if (result.changes && result.changes.length > 0) {
            console.log(`  ${colors.yellow}✏️  Modifications: ${result.changes.length} tâches${colors.reset}`);
            result.changes.forEach((c, i) => {
                console.log(`    ${i + 1}. Task ${c.taskId}: ${JSON.stringify(c.updates)}`);
            });
        }
        
        if (result.insights) {
            console.log(`  ${colors.yellow}📊 Insights:${colors.reset}`, JSON.stringify(result.insights));
        }
        
        if (!result.response) {
            throw new Error('Pas de réponse de l\'IA');
        }
    });

    // ============================================================
    // TEST 4: Commande "Déplace le rapport à lundi"
    // ============================================================
    await test('Commande: "Déplace le rapport à lundi"', async () => {
        const result = await sendCommand("Déplace le rapport à lundi");
        
        console.log(`  Response: ${result.response.substring(0, 120)}...`);
        console.log(`  Action: ${result.action}`);
        console.log(`  Tâches modifiées: ${result.tasksModified}`);
        
        if (result.changes && result.changes.length > 0) {
            console.log(`  ${colors.yellow}✏️  Changement appliqué:${colors.reset}`);
            console.log(`    Task ${result.changes[0].taskId}: ${JSON.stringify(result.changes[0].updates)}`);
        }
        
        if (result.action !== 'modify') {
            throw new Error('Action devrait être "modify"');
        }
    });

    // ============================================================
    // TEST 5: Commande "Analyse ma charge de travail"
    // ============================================================
    await test('Commande: "Analyse ma charge de travail"', async () => {
        const result = await sendCommand("Analyse ma charge de travail");
        
        console.log(`  Response: ${result.response.substring(0, 120)}...`);
        console.log(`  Action: ${result.action}`);
        
        if (result.insights) {
            console.log(`  ${colors.yellow}📊 Insights complets:${colors.reset}`);
            Object.entries(result.insights).forEach(([key, value]) => {
                console.log(`    ${key}: ${value}`);
            });
        }
        
        if (!result.insights || Object.keys(result.insights).length === 0) {
            throw new Error('Insights manquants');
        }
    });

    // ============================================================
    // TEST 6: Commande contextuelle (heure du jour)
    // ============================================================
    await test('Commande: "Quoi faire ce matin ?" (contexte temporel)', async () => {
        const result = await sendCommand("Quoi faire ce matin ?");
        
        console.log(`  Response: ${result.response.substring(0, 120)}...`);
        console.log(`  Action: ${result.action}`);
        
        // L'IA devrait suggérer tâches complexes/créatives le matin
        if (result.suggestions && result.suggestions.length > 0) {
            console.log(`  ${colors.yellow}💡 Suggestions matinales: ${result.suggestions.length}${colors.reset}`);
        }
        
        if (!result.response) {
            throw new Error('Pas de réponse contextuelle');
        }
    });

    // ============================================================
    // TEST 7: Validation format réponse JSON
    // ============================================================
    await test('Validation: Format JSON structuré', async () => {
        const result = await sendCommand("Résume mes tâches");
        
        // Vérifier structure
        if (!result.response) throw new Error('Missing response field');
        if (!result.action) throw new Error('Missing action field');
        
        const validActions = ['organize', 'suggest', 'modify', 'analyze', 'info'];
        if (!validActions.includes(result.action)) {
            throw new Error(`Invalid action: ${result.action}`);
        }
        
        console.log(`  ${colors.green}✓${colors.reset} Structure JSON valide`);
        console.log(`  ${colors.green}✓${colors.reset} Action valide: ${result.action}`);
    });

    // ============================================================
    // TEST 8: Performance (tokens utilisés)
    // ============================================================
    await test('Performance: Tokens utilisés', async () => {
        const result = await sendCommand("Quick test");
        
        if (result.tokensUsed !== undefined) {
            console.log(`  ${colors.yellow}⚡ Tokens: ${result.tokensUsed}${colors.reset}`);
            
            if (result.tokensUsed > 3000) {
                console.log(`  ${colors.yellow}⚠️  Attention: Usage de tokens élevé${colors.reset}`);
            }
        }
        
        if (!result.response) {
            throw new Error('Pas de réponse');
        }
    });

    // ============================================================
    // RÉSULTATS FINAUX
    // ============================================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSULTATS FINAUX');
    console.log('='.repeat(60));
    console.log(`${colors.green}✅ Tests réussis: ${passCount}${colors.reset}`);
    console.log(`${colors.red}❌ Tests échoués: ${failCount}${colors.reset}`);
    console.log(`📈 Taux de succès: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`);
    console.log('='.repeat(60) + '\n');

    // Exit code
    process.exit(failCount > 0 ? 1 : 0);
}

// Run tests
testSmartCommand().catch(error => {
    console.error(`${colors.red}💥 Erreur fatale:${colors.reset}`, error);
    process.exit(1);
});
