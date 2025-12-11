# 🚀 Migration vers le Nouveau Repository

## 📋 Repository Cible
**https://github.com/axilum2025/Axilum2030**

---

## ✅ Étape 1 : Initialiser le Nouveau Repo sur GitHub

Le repo `Axilum2030` existe mais est vide. Vous devez l'initialiser :

### Option A : Via GitHub Web (Recommandée)

1. **Allez sur** : https://github.com/axilum2025/Axilum2030

2. **Cliquez sur** : "creating a new file" ou le bouton **"Add file" → "Create new file"**

3. **Créez un fichier** : `.gitkeep` ou `README.md`
   - Nom : `README.md`
   - Contenu : 
     ```markdown
     # Axilum AI
     
     Assistant IA Conversationnel Multimodal
     ```

4. **Commitez** : "Initial commit"

5. **Attendez 1 minute** puis passez à l'Étape 2

---

### Option B : Via GitHub CLI (Si vous avez les droits admin)

```bash
# Depuis le terminal
cd /workspaces/Axilum
gh repo edit axilum2025/Axilum2030 --enable-issues --enable-wiki
```

---

## ✅ Étape 2 : Pousser le Code depuis CodeSpaces

Une fois le repo initialisé sur GitHub :

```bash
cd /workspaces/Axilum

# Supprimer l'ancien remote
git remote remove new-origin

# Définir origin vers le nouveau repo
git remote set-url origin https://github.com/axilum2025/Axilum2030.git

# Pull le commit initial
git pull origin main --allow-unrelated-histories

# Résoudre les conflits si nécessaire (normalement aucun)

# Pousser tout le code
git push origin main -f
```

---

## ✅ Étape 3 : Configurer la Nouvelle Static Web App Azure

1. **Créer une nouvelle Static Web App** dans Azure Portal
   - Nom : `axilum-ai-2030` (ou votre choix)
   - Resource Group : Créer nouveau ou existant
   - Region : Europe (ou votre région)
   - Source : **GitHub**
   - Repository : **axilum2025/Axilum2030**
   - Branch : **main**
   - Build Presets : **Custom**
   - App location : **`public`**
   - Api location : **`api`**
   - Output location : **`""`** (vide)

2. Azure va automatiquement :
   - Créer un workflow GitHub Actions
   - Ajouter le secret `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Faire le premier déploiement

3. **Ajouter les variables d'environnement** dans Configuration :
   ```
   AZURE_COMMUNICATION_CONNECTION_STRING = endpoint=https://bingo.europe.communication.azure.com/;accesskey=...
   AZURE_COMMUNICATION_SENDER = DoNotReply@3fe6fd0c-6f30-4619-b3e0-a7f1847ed5c5.azurecomm.net
   ```

4. **IMPORTANT** : Ne pas ajouter manuellement :
   - ❌ `AzureWebJobsStorage`
   - ❌ `FUNCTIONS_WORKER_RUNTIME`
   - ❌ `FUNCTIONS_API_KEY`
   - ❌ `FUNCTIONS_BASE_URL`

---

## ✅ Étape 4 : Mettre à Jour le Workflow (Si Azure ne le fait pas)

Si Azure n'a pas créé le workflow automatiquement, mettez à jour celui existant :

Fichier : `.github/workflows/azure-static-web-apps-*.yml`

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
          lfs: false
      
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "public"
          api_location: "api"
          output_location: ""
          skip_app_build: true

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

---

## 🧪 Étape 5 : Tester le Déploiement

1. **Vérifier GitHub Actions** :
   - https://github.com/axilum2025/Axilum2030/actions
   - Le workflow devrait être ✅ **Success**

2. **Vérifier Azure Portal** :
   - Static Web App → Overview
   - Status : **Ready**
   - URL visible

3. **Tester l'Application** :
   - Ouvrir l'URL de la Static Web App
   - Tester l'agent IA
   - Tester l'inscription avec email

4. **Vérifier les Paramètres** :
   - Configuration → Application settings
   - Devrait voir **SEULEMENT** :
     - ✅ `AZURE_COMMUNICATION_CONNECTION_STRING`
     - ✅ `AZURE_COMMUNICATION_SENDER`
   - **AUCUN** paramètre interdit !

---

## 📝 Checklist Complète

- [ ] Repo `Axilum2030` initialisé sur GitHub
- [ ] Code poussé depuis CodeSpaces
- [ ] Nouvelle Static Web App créée dans Azure
- [ ] Workflow GitHub configuré
- [ ] Variables d'environnement ajoutées
- [ ] Premier déploiement réussi
- [ ] Application accessible en ligne
- [ ] Inscription avec email fonctionne
- [ ] Aucun paramètre interdit dans Configuration

---

## 🎯 Résultat Final

Vous aurez :
- ✅ Un nouveau repo **propre** sans historique de paramètres interdits
- ✅ Une nouvelle Static Web App **propre** 
- ✅ Structure `api/` correcte (pas de `api/api/`)
- ✅ Déploiement fonctionnel sans erreurs
- ✅ Authentification email opérationnelle

---

## 🆘 En Cas de Problème

### Le push échoue avec 403
```bash
# Vérifier l'authentification GitHub
gh auth status

# Se réauthentifier si nécessaire
gh auth login
```

### Azure ajoute encore des paramètres interdits
- Vérifiez que `api_location` est bien `"api"` (pas `"api/api"`)
- Vérifiez la structure : `api/host.json` doit être à la racine de `api/`
- Recréez la Static Web App si nécessaire

### Workflow GitHub échoue
- Vérifiez que le secret `AZURE_STATIC_WEB_APPS_API_TOKEN` est bien configuré
- Régénérez le token dans Azure Portal si nécessaire
