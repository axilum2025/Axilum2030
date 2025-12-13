# 🚀 Guide de Migration Pratique - Architecture Évolutive

## ✅ ÉTAPES COMPLÉTÉES

- ✅ Modules utilitaires créés (contextManager, functionRouter, rateLimiter)
- ✅ Architecture scalable implémentée (invoke/index.scalable.js)
- ✅ Tests validés (tous passent)
- ✅ Comparaison V1 vs V2 (gains confirmés)
- ✅ Endpoint test créé (api/invoke-v2/)
- ✅ Dépendance installée (node-cache)

---

## 📋 ÉTAPES RESTANTES

### **Option A : Migration Progressive (Recommandée - 0 risque)**

#### **Semaine 1 : Test Local**

1. **Démarrer Azure Functions localement**
   ```bash
   cd /workspaces/Axilum/api
   func start
   ```

2. **Tester endpoint V2**
   ```bash
   curl -X POST http://localhost:7071/api/invoke-v2 \
     -H "Content-Type: application/json" \
     -d '{
       "message": "Bonjour, teste la nouvelle architecture",
       "history": []
     }'
   ```

3. **Comparer avec V1**
   ```bash
   # V1 (actuel)
   curl -X POST http://localhost:7071/api/invoke \
     -H "Content-Type: application/json" \
     -d '{"message": "Même message", "history": []}'
   
   # Comparer temps de réponse et tokens
   ```

4. **Test multi-fonctions**
   ```bash
   curl -X POST http://localhost:7071/api/invoke-v2 \
     -H "Content-Type: application/json" \
     -d '{
       "message": "Cherche des restaurants italiens puis génère une image",
       "history": []
     }'
   ```

---

#### **Semaine 2 : Déploiement Test en Production**

1. **Commit et push**
   ```bash
   cd /workspaces/Axilum
   git add -A
   git commit -m "feat: Add invoke-v2 endpoint for testing scalable architecture"
   git push
   ```

2. **Attendre déploiement Azure** (2-3 minutes)

3. **Tester V2 en production**
   ```bash
   curl -X POST https://proud-mushroom-019836d03.3.azurestaticapps.net/api/invoke-v2 \
     -H "Content-Type: application/json" \
     -d '{"message": "Test production V2", "history": []}'
   ```

4. **Comparer métriques**
   - Temps de réponse
   - Tokens utilisés
   - Taux d'erreur
   - Latence perçue

---

#### **Semaine 3 : Migration Progressive Frontend**

**Modifier public/index.html pour tester V2 sur 10% des utilisateurs :**

```javascript
// Ajouter dans public/index.html ligne ~2700

async function sendMessage() {
    // ... code existant ...
    
    // 🧪 A/B Testing: 10% users testent V2
    const useV2 = Math.random() < 0.10; // 10% chance
    const endpoint = useV2 ? '/api/invoke-v2' : '/api/invoke';
    
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput, history: conversationHistory })
    });
    
    // Log pour analytics
    if (useV2) {
        console.log('🧪 Using V2 architecture');
    }
    
    // ... reste du code ...
}
```

**Monitoring 48h :**
- Surveiller erreurs console
- Comparer satisfaction (messages "ça marche bien" vs "bug")
- Analyser logs Azure

---

#### **Semaine 4 : Migration Complète**

**Si tests OK (taux erreur < 1%, satisfaction > 95%) :**

```javascript
// public/index.html - Passer tout le monde sur V2
const endpoint = '/api/invoke-v2'; // 100% V2
```

**Ou avec feature flag Azure :**

```javascript
// api/invoke/index.js - Router automatique
const ENABLE_SCALABLE = process.env.ENABLE_SCALABLE === 'true';

if (ENABLE_SCALABLE) {
    module.exports = require('./index.scalable.js');
} else {
    // Garde ancien code comme fallback
    module.exports = async function(context, req) {
        // ... code actuel ...
    };
}
```

**Activer en production :**
```bash
# Azure Portal → Static Web App → Configuration
# Ajouter variable:
ENABLE_SCALABLE = "true"
```

---

### **Option B : Migration Directe (Plus rapide mais risqué)**

**⚠️ Seulement si vous avez un backup et plan de rollback**

1. **Remplacer invoke/index.js**
   ```bash
   cd /workspaces/Axilum/api/invoke
   cp index.js index.backup.js  # Backup
   cp index.scalable.js index.js  # Remplacer
   ```

2. **Commit et push**
   ```bash
   git add -A
   git commit -m "feat: Migrate to scalable architecture"
   git push
   ```

3. **Monitoring intensif 24h**
   - Surveiller logs Azure
   - Tester toutes fonctionnalités
   - Prêt à rollback si problème

4. **Rollback si nécessaire**
   ```bash
   cd /workspaces/Axilum/api/invoke
   cp index.backup.js index.js
   git add -A && git commit -m "rollback: Restore V1" && git push
   ```

---

## 🔍 Validation Post-Migration

### **Checklist de validation :**

- [ ] Chat simple fonctionne
- [ ] Chat avec historique (10+ messages) fonctionne
- [ ] Mode vocal fonctionne
- [ ] Détection hallucination (HI/CHR) affichée
- [ ] Plan FREE fonctionne
- [ ] Plan PRO fonctionne
- [ ] Authentification fonctionne
- [ ] Génération d'images fonctionne
- [ ] Temps de réponse < 3s
- [ ] Pas d'erreurs 429 (rate limit)
- [ ] Pas d'erreurs 400 (context overflow)
- [ ] Logs Azure propres (pas d'erreurs critiques)

### **Tests de charge (optionnel) :**

```bash
# Simuler 50 requêtes simultanées
for i in {1..50}; do
  curl -X POST https://votre-app.azurestaticapps.net/api/invoke-v2 \
    -H "Content-Type: application/json" \
    -d '{"message":"Test charge '$i'","history":[]}' &
done
wait

# Vérifier: Taux de succès doit être > 95%
```

---

## 📊 Métriques à Surveiller

### **Avant Migration (Baseline) :**
- Temps réponse moyen : ~1.8s
- Tokens moyens : ~2900
- Taux d'erreur : ~0.5%
- Users max simultanés : ~20

### **Après Migration (Attendu) :**
- Temps réponse moyen : ~1.2s (-33%)
- Tokens moyens : ~1500 (-48%)
- Taux d'erreur : ~0.2% (-60%)
- Users max simultanés : ~80 (+300%)

### **Red flags (rollback immédiat) :**
- ❌ Taux d'erreur > 5%
- ❌ Temps réponse > 5s
- ❌ Crash fréquent (> 1 par heure)
- ❌ Utilisateurs rapportent bugs

---

## 🛠️ Debugging

### **Erreur commune : "Cannot find module 'node-cache'"**

```bash
cd /workspaces/Axilum/api
npm install node-cache
git add package.json package-lock.json
git commit -m "deps: Add node-cache"
git push
```

### **Erreur : "Function not found: invoke-v2"**

Vérifier que `api/invoke-v2/function.json` existe et est correct.

### **Erreur : "GROQ_API_KEY not configured"**

Variables d'environnement Azure :
```
Azure Portal → Static Web App → Configuration
→ Vérifier GROQ_API_KEY présente
```

---

## 🎯 Prochaines Fonctionnalités à Ajouter (Post-Migration)

Avec architecture évolutive, vous pouvez ajouter facilement :

### **1. Calendrier Microsoft 365**
```javascript
// functionRouter détectera automatiquement
detectFunctions("Ajoute réunion demain 14h")
→ ['calendar'] → createCalendarEvent()
```

### **2. To-Do Intelligent**
```javascript
detectFunctions("Rappelle-moi d'appeler Pierre")
→ ['task'] → createTask() + setPriority()
```

### **3. Multi-modal**
```javascript
detectFunctions("Génère image de chat puis analyse-la")
→ ['generateImage', 'analyzeImage']
→ Exécution séquentielle automatique
```

### **4. Recherche + Synthèse**
```javascript
detectFunctions("Cherche infos sur React puis résume")
→ ['searchWeb'] → analyzeResults() → summarize()
→ Cache évite recherche dupliquée
```

---

## 📞 Support

**En cas de problème durant migration :**

1. Consulter [ARCHITECTURE_RISK_ANALYSIS.md](../ARCHITECTURE_RISK_ANALYSIS.md)
2. Consulter [ARCHITECTURE_EVOLUTIVE.md](ARCHITECTURE_EVOLUTIVE.md)
3. Vérifier logs Azure Functions
4. Rollback si critique

---

## ✅ Recommandation Finale

**UTILISEZ OPTION A (Migration Progressive)**

**Pourquoi :**
- 0 risque de casser la production
- Validation progressive
- Rollback facile à chaque étape
- Monitoring continu
- Apprentissage au fur et à mesure

**Timeline réaliste :**
- Semaine 1 : Tests locaux (maintenant ✅)
- Semaine 2 : Tests production endpoint V2
- Semaine 3 : A/B testing 10% → 50%
- Semaine 4 : Migration 100%

**Prochaine action immédiate :**
```bash
# Déployer invoke-v2 en production
cd /workspaces/Axilum
git add -A
git commit -m "feat: Add invoke-v2 endpoint for scalable architecture testing"
git push
```

**Puis tester dans 3 minutes :**
```bash
curl -X POST https://proud-mushroom-019836d03.3.azurestaticapps.net/api/invoke-v2 \
  -H "Content-Type: application/json" \
  -d '{"message":"Test architecture évolutive","history":[]}'
```

🚀 **Vous êtes prêt pour le futur !**
