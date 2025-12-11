# 🧹 Guide : Supprimer les Paramètres d'Application Interdits

## ❌ Problème

Azure Static Web Apps refuse le déploiement car des paramètres interdits ont été ajoutés :
- `AzureWebJobsStorage`
- `FUNCTIONS_WORKER_RUNTIME`
- `FUNCTIONS_API_KEY`
- `FUNCTIONS_BASE_URL`

Ces paramètres sont **automatiquement gérés** par Azure Static Web Apps et ne doivent **PAS** être configurés manuellement.

---

## ✅ Solution 1 : Via Azure Portal (Le plus simple)

### Étape 1 : Accéder à votre Static Web App

1. Allez sur : **https://portal.azure.com**
2. Dans la barre de recherche en haut, tapez : `victorious-rock` (ou le nom de votre app)
3. Cliquez sur votre **Static Web App**

### Étape 2 : Ouvrir la Configuration

4. Dans le menu de gauche, cherchez **"Configuration"** ou **"Settings"**
5. Cliquez sur **"Configuration"** (ou **"Application settings"**)

### Étape 3 : Supprimer les paramètres interdits

6. Vous verrez une liste de paramètres avec des colonnes : **Name**, **Value**, **Actions**

7. **Trouvez et supprimez** ces paramètres (cliquez sur la **poubelle** 🗑️) :
   - ❌ `AzureWebJobsStorage`
   - ❌ `FUNCTIONS_WORKER_RUNTIME`
   - ❌ `FUNCTIONS_API_KEY`
   - ❌ `FUNCTIONS_BASE_URL`

8. **Gardez seulement** ces paramètres (ne les supprimez pas !) :
   - ✅ `AZURE_COMMUNICATION_CONNECTION_STRING`
   - ✅ `AZURE_COMMUNICATION_SENDER`
   - ✅ `APPINSIGHTS_INSTRUMENTATIONKEY` (si présent)

### Étape 4 : Enregistrer

9. Cliquez sur **"Save"** en haut
10. Attendez la confirmation (notification verte)

---

## ✅ Solution 2 : Via Azure Cloud Shell

Si vous ne trouvez pas les paramètres dans le portail :

### Étape 1 : Ouvrir Cloud Shell

1. Sur **Azure Portal**, cliquez sur l'icône **Cloud Shell** (>_) en haut à droite
2. Choisissez **Bash**

### Étape 2 : Trouver votre Resource Group

```bash
# Lister vos Static Web Apps
az staticwebapp list --query "[].{name:name, resourceGroup:resourceGroup}" -o table
```

**Notez** :
- Le nom de votre **Static Web App** (ex: `victorious-rock`)
- Le nom du **Resource Group** (ex: `axilum-resources`)

### Étape 3 : Voir les paramètres actuels

```bash
# Remplacez <RESOURCE_GROUP> et <APP_NAME> par vos valeurs
az staticwebapp appsettings list \
    --name <APP_NAME> \
    --resource-group <RESOURCE_GROUP> \
    -o table
```

### Étape 4 : Supprimer les paramètres interdits

```bash
# Supprimer AzureWebJobsStorage
az staticwebapp appsettings delete \
    --name <APP_NAME> \
    --resource-group <RESOURCE_GROUP> \
    --setting-names AzureWebJobsStorage

# Supprimer FUNCTIONS_WORKER_RUNTIME
az staticwebapp appsettings delete \
    --name <APP_NAME> \
    --resource-group <RESOURCE_GROUP> \
    --setting-names FUNCTIONS_WORKER_RUNTIME

# Supprimer FUNCTIONS_API_KEY
az staticwebapp appsettings delete \
    --name <APP_NAME> \
    --resource-group <RESOURCE_GROUP> \
    --setting-names FUNCTIONS_API_KEY

# Supprimer FUNCTIONS_BASE_URL
az staticwebapp appsettings delete \
    --name <APP_NAME> \
    --resource-group <RESOURCE_GROUP> \
    --setting-names FUNCTIONS_BASE_URL
```

### Étape 5 : Vérifier

```bash
# Vérifier que les paramètres ont été supprimés
az staticwebapp appsettings list \
    --name <APP_NAME> \
    --resource-group <RESOURCE_GROUP> \
    -o table
```

**Vous devriez voir seulement** :
- ✅ `AZURE_COMMUNICATION_CONNECTION_STRING`
- ✅ `AZURE_COMMUNICATION_SENDER`

---

## ✅ Solution 3 : Script Automatique

Un script a été créé pour vous : `scripts/clean-azure-settings.sh`

### Utilisation :

1. Ouvrez le fichier `scripts/clean-azure-settings.sh`
2. **Modifiez** les lignes 9-10 avec vos valeurs :
   ```bash
   RESOURCE_GROUP="votre-resource-group"  # Votre Resource Group
   STATIC_WEB_APP_NAME="victorious-rock"  # Votre Static Web App
   ```

3. Dans **Azure Cloud Shell** :
   ```bash
   # Copier le script dans Cloud Shell
   # Puis exécuter :
   bash clean-azure-settings.sh
   ```

---

## 🔍 Pourquoi ces paramètres sont interdits ?

Azure Static Web Apps **gère automatiquement** les Azure Functions intégrées.

| Paramètre | Pourquoi interdit ? |
|-----------|---------------------|
| `AzureWebJobsStorage` | Géré automatiquement par Static Web Apps |
| `FUNCTIONS_WORKER_RUNTIME` | Détecté automatiquement (Node.js) |
| `FUNCTIONS_API_KEY` | Non nécessaire dans Static Web Apps |
| `FUNCTIONS_BASE_URL` | Calculé automatiquement (`/api`) |

**Ces paramètres sont pour Azure Functions standalone**, pas pour Static Web Apps !

---

## ✅ Paramètres Autorisés

Vous **POUVEZ** et **DEVEZ** garder :

```
✅ AZURE_COMMUNICATION_CONNECTION_STRING
✅ AZURE_COMMUNICATION_SENDER
✅ APPINSIGHTS_INSTRUMENTATIONKEY
✅ Tout autre paramètre custom pour votre app
```

---

## 🚀 Après Nettoyage

Une fois les paramètres interdits supprimés :

1. **Attendez 2-3 minutes** (propagation)
2. **Redéployez** :
   ```bash
   git commit --allow-empty -m "Trigger redeploy after cleaning settings"
   git push
   ```
3. **Vérifiez le workflow** : https://github.com/axilum2025/Axilum/actions
4. ✅ Le déploiement devrait réussir !

---

## 📞 Besoin d'aide ?

Si le problème persiste :
1. Vérifiez les logs du workflow GitHub Actions
2. Consultez les diagnostics dans Azure Portal → Static Web App → "Diagnose and solve problems"
3. Cherchez : "application settings" ou "deployment"
