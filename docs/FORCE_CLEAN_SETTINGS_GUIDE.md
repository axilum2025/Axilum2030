# 🛠️ Guide Définitif : Supprimer les Paramètres Interdits

## 🎯 Problème

Azure affiche ce message d'erreur :
```
Les paramètres d'application avec des noms « AzureWebJobsStorage » ne sont pas autorisés.
Les paramètres d'application avec un ou plusieurs noms « FUNCTIONS_WORKER_RUNTIME » ne sont pas autorisés.
Les paramètres d'application avec des noms « FUNCTIONS_API_KEY,FUNCTIONS_BASE_URL » ne sont pas autorisés.
```

Ces paramètres **bloquent les déploiements** de fonctions gérées dans Azure Static Web Apps.

---

## ✅ Solution Définitive (3 méthodes)

### 🥇 **MÉTHODE 1 : Azure Portal (Interface Graphique)**

#### Étape par Étape :

1. **Ouvrir Azure Portal**
   - Allez sur : https://portal.azure.com
   - Connectez-vous avec votre compte Azure

2. **Trouver votre Static Web App**
   ```
   ┌─────────────────────────────────────────┐
   │  🔍 [Rechercher...]                     │  ← Barre en haut
   └─────────────────────────────────────────┘
   
   Tapez : "victorious-rock" (ou le nom de votre app)
   Cliquez sur le résultat sous "Static Web Apps"
   ```

3. **Accéder à la Configuration**
   ```
   ┌─ Menu Gauche ─────────────────┐
   │                                │
   │  🏠 Overview                   │
   │  ⚙️  Settings                  │
   │     └─ 📝 Configuration       │  ← CLIQUEZ ICI
   │     └─ 🔐 Identity            │
   │  📊 Monitoring                 │
   └────────────────────────────────┘
   ```

4. **Voir les Paramètres**
   ```
   ┌─ Configuration ───────────────────────────────────┐
   │                                                    │
   │  + Add     🔄 Refresh     💾 Save     ❌ Discard  │
   │                                                    │
   │  NAME                              | VALUE    | 🗑 │
   │  ────────────────────────────────  │ ──────── │ ──│
   │  AZURE_COMMUNICATION_...           | endpo... │   │  ← GARDER
   │  AZURE_COMMUNICATION_SENDER        | DoNot... │   │  ← GARDER
   │  AzureWebJobsStorage              | Defau... │ 🗑│  ← SUPPRIMER
   │  FUNCTIONS_WORKER_RUNTIME         | node     │ 🗑│  ← SUPPRIMER
   │  FUNCTIONS_API_KEY                | xxxxx    │ 🗑│  ← SUPPRIMER
   │  FUNCTIONS_BASE_URL               | https... │ 🗑│  ← SUPPRIMER
   │                                                    │
   └────────────────────────────────────────────────────┘
   ```

5. **Supprimer les Paramètres Interdits**
   - Cliquez sur la **poubelle** 🗑️ à droite de :
     - ❌ `AzureWebJobsStorage`
     - ❌ `FUNCTIONS_WORKER_RUNTIME`
     - ❌ `FUNCTIONS_API_KEY`
     - ❌ `FUNCTIONS_BASE_URL`
     - ❌ `ACTIONS_BASE_URL` (si présent)

6. **⚠️ NE PAS SUPPRIMER** :
   - ✅ `AZURE_COMMUNICATION_CONNECTION_STRING`
   - ✅ `AZURE_COMMUNICATION_SENDER`
   - ✅ `APPINSIGHTS_INSTRUMENTATIONKEY`

7. **Enregistrer**
   - Cliquez sur **💾 Save** en haut
   - Attendez la confirmation (notification verte)
   - ⏳ Patientez 2-3 minutes pour la propagation

---

### 🥈 **MÉTHODE 2 : Azure Cloud Shell (Recommandée si pas visible)**

Si les paramètres n'apparaissent PAS dans l'interface, utilisez Cloud Shell :

#### 1. Ouvrir Cloud Shell

```
┌─ Azure Portal (en haut à droite) ─┐
│                                     │
│  🔔  ⚙️  ❓  >_  👤                │  ← Cliquez sur >_ (Cloud Shell)
└─────────────────────────────────────┘
```

Choisissez **Bash**

#### 2. Lister vos Static Web Apps

```bash
az staticwebapp list --query "[].{name:name, resourceGroup:resourceGroup}" -o table
```

**Exemple de sortie :**
```
Name              ResourceGroup
----------------  ----------------
victorious-rock   axilum-rg
```

**Notez** :
- Nom de l'app : `victorious-rock`
- Resource Group : `axilum-rg`

#### 3. Voir les paramètres actuels

```bash
az staticwebapp appsettings list \
    --name victorious-rock \
    --resource-group axilum-rg \
    -o table
```

#### 4. Supprimer TOUS les paramètres interdits en UNE commande

```bash
az staticwebapp appsettings delete \
    --name victorious-rock \
    --resource-group axilum-rg \
    --setting-names AzureWebJobsStorage FUNCTIONS_WORKER_RUNTIME FUNCTIONS_API_KEY FUNCTIONS_BASE_URL ACTIONS_BASE_URL
```

#### 5. Vérifier

```bash
az staticwebapp appsettings list \
    --name victorious-rock \
    --resource-group axilum-rg \
    -o table
```

**Vous devriez voir seulement :**
```
Name                                      Value
----------------------------------------  --------
AZURE_COMMUNICATION_CONNECTION_STRING     endpo...
AZURE_COMMUNICATION_SENDER                DoNot...
```

---

### 🥉 **MÉTHODE 3 : Script Automatique**

Un script interactif a été créé : `scripts/force-clean-settings.sh`

#### Utilisation :

1. **Ouvrir Azure Cloud Shell** (>_ dans Azure Portal)

2. **Copier le contenu du script** :
   ```bash
   # Ouvrir : /workspaces/Axilum/scripts/force-clean-settings.sh
   # Copier tout le contenu (Ctrl+A, Ctrl+C)
   ```

3. **Dans Cloud Shell** :
   ```bash
   # Créer le fichier
   nano clean-settings.sh
   
   # Coller le contenu (Clic droit → Paste)
   # Sauvegarder : Ctrl+O, Enter, Ctrl+X
   
   # Rendre exécutable
   chmod +x clean-settings.sh
   
   # Exécuter
   ./clean-settings.sh
   ```

4. **Suivre les instructions** :
   - Entrez le nom de votre Static Web App
   - Entrez le Resource Group
   - Confirmez la suppression
   - ✅ Terminé !

---

## 🔍 Comment Savoir si c'est Réglé ?

### Test 1 : Via Azure Portal

1. Static Web App → **Configuration**
2. Vous devriez voir **SEULEMENT** :
   - ✅ `AZURE_COMMUNICATION_CONNECTION_STRING`
   - ✅ `AZURE_COMMUNICATION_SENDER`
3. **AUCUN** de ces paramètres :
   - ❌ `AzureWebJobsStorage`
   - ❌ `FUNCTIONS_WORKER_RUNTIME`
   - ❌ `FUNCTIONS_API_KEY`
   - ❌ `FUNCTIONS_BASE_URL`

### Test 2 : Diagnostics Azure

1. Static Web App → **Diagnose and solve problems**
2. Recherchez : **"application settings"** ou **"deployment"**
3. Les erreurs de paramètres interdits devraient disparaître

### Test 3 : Déploiement

```bash
cd /workspaces/Axilum
git commit --allow-empty -m "Test deploy after cleaning settings"
git push
```

Vérifiez sur : https://github.com/axilum2025/Axilum/actions

Le workflow devrait **réussir** ✅

---

## 🚨 Si le Problème Persiste

### Option A : Forcer la Recréation des Paramètres

Azure peut mettre en cache les anciens paramètres.

**Solution** : Ajouter puis supprimer un paramètre factice

```bash
# Ajouter un paramètre temporaire
az staticwebapp appsettings set \
    --name victorious-rock \
    --resource-group axilum-rg \
    --setting-names TEMP_PARAM=test

# Supprimer immédiatement + tous les interdits
az staticwebapp appsettings delete \
    --name victorious-rock \
    --resource-group axilum-rg \
    --setting-names TEMP_PARAM AzureWebJobsStorage FUNCTIONS_WORKER_RUNTIME FUNCTIONS_API_KEY FUNCTIONS_BASE_URL
```

### Option B : Contacter le Support Azure

Si vraiment rien ne fonctionne :

1. Azure Portal → **Help + support**
2. **+ New support request**
3. **Issue type** : Technical
4. **Service** : Static Web Apps
5. **Summary** : "Unable to remove forbidden app settings"
6. Décrivez le problème en détail

---

## 📊 Tableau Récapitulatif

| Paramètre | Statut | Action |
|-----------|--------|--------|
| `AZURE_COMMUNICATION_CONNECTION_STRING` | ✅ Requis | **GARDER** |
| `AZURE_COMMUNICATION_SENDER` | ✅ Requis | **GARDER** |
| `APPINSIGHTS_INSTRUMENTATIONKEY` | ✅ Autorisé | **GARDER** |
| `AzureWebJobsStorage` | ❌ Interdit | **SUPPRIMER** |
| `FUNCTIONS_WORKER_RUNTIME` | ❌ Interdit | **SUPPRIMER** |
| `FUNCTIONS_API_KEY` | ❌ Interdit | **SUPPRIMER** |
| `FUNCTIONS_BASE_URL` | ❌ Interdit | **SUPPRIMER** |
| `ACTIONS_BASE_URL` | ❌ Interdit | **SUPPRIMER** |

---

## 💡 Pourquoi ces Paramètres Causent des Problèmes ?

Azure Static Web Apps utilise des **fonctions gérées** qui fonctionnent différemment des Azure Functions standalone.

### Fonctions Gérées (Static Web Apps) ✅
- ✅ Déploiement automatique
- ✅ Configuration automatique
- ✅ Pas de gestion manuelle
- ✅ Intégration native avec l'app

### Azure Functions Standalone ❌
- ❌ Configuration manuelle requise
- ❌ `AzureWebJobsStorage` requis
- ❌ `FUNCTIONS_WORKER_RUNTIME` à définir
- ❌ Déploiement séparé

**Ces deux modes sont INCOMPATIBLES !** Vous ne pouvez pas mélanger les deux.

---

## ✅ Checklist Finale

Avant de déployer, vérifiez :

- [ ] Aucun `AzureWebJobsStorage` dans Configuration
- [ ] Aucun `FUNCTIONS_WORKER_RUNTIME` dans Configuration
- [ ] Aucun `FUNCTIONS_API_KEY` dans Configuration
- [ ] Aucun `FUNCTIONS_BASE_URL` dans Configuration
- [ ] Présence de `AZURE_COMMUNICATION_CONNECTION_STRING`
- [ ] Présence de `AZURE_COMMUNICATION_SENDER`
- [ ] Pas de `local.settings.json` dans le repo Git
- [ ] `.gitignore` contient `local.settings.json`

---

## 🎯 Résultat Attendu

Après le nettoyage :

```bash
# Commande
az staticwebapp appsettings list --name victorious-rock --resource-group axilum-rg -o table

# Sortie attendue
Name                                      Value
----------------------------------------  ------------------------------
AZURE_COMMUNICATION_CONNECTION_STRING     endpoint=https://bingo.eur...
AZURE_COMMUNICATION_SENDER                DoNotReply@3fe6fd0c-6f30-...
```

**C'EST TOUT !** Pas d'autres paramètres.

---

## 🚀 Après le Nettoyage

1. ⏳ **Attendez 2-3 minutes** (propagation Azure)
2. 🔄 **Redéployez** : `git push`
3. ✅ **Vérifiez** le workflow GitHub Actions
4. 🧪 **Testez** l'inscription avec email
5. 🎉 **Profitez** de votre application fonctionnelle !
