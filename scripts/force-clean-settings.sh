#!/bin/bash
# Script pour FORCER la suppression des paramètres interdits via Azure Portal
# Ce script doit être copié et exécuté dans Azure Cloud Shell

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  SUPPRESSION FORCÉE DES PARAMÈTRES INTERDITS              ║"
echo "║  Azure Static Web Apps - Fonctions Gérées                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Étape 1: Identifier votre Static Web App
echo "📋 Étape 1: Listage de vos Static Web Apps..."
echo ""

az staticwebapp list --query "[].{Nom:name, ResourceGroup:resourceGroup, Location:location}" -o table

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "📝 Entrez le NOM de votre Static Web App: " APP_NAME
read -p "📝 Entrez le RESOURCE GROUP: " RESOURCE_GROUP

echo ""
echo "✅ Configuration:"
echo "   App Name: $APP_NAME"
echo "   Resource Group: $RESOURCE_GROUP"
echo ""

# Étape 2: Afficher les paramètres actuels
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Étape 2: Paramètres d'application ACTUELS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

az staticwebapp appsettings list \
    --name "$APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    -o table

echo ""
read -p "⚠️  Voulez-vous continuer avec la suppression? (o/n): " CONFIRM

if [[ $CONFIRM != "o" && $CONFIRM != "O" ]]; then
    echo "❌ Opération annulée."
    exit 0
fi

# Étape 3: Suppression des paramètres interdits
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗑️  Étape 3: Suppression des paramètres INTERDITS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Liste des paramètres à supprimer
declare -a FORBIDDEN=(
    "AzureWebJobsStorage"
    "FUNCTIONS_WORKER_RUNTIME"
    "FUNCTIONS_API_KEY"
    "FUNCTIONS_BASE_URL"
    "ACTIONS_BASE_URL"
    "WEBSITE_NODE_DEFAULT_VERSION"
)

for SETTING in "${FORBIDDEN[@]}"; do
    echo "🔍 Vérification de: $SETTING"
    
    # Essayer de supprimer (ignorera si n'existe pas)
    RESULT=$(az staticwebapp appsettings delete \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --setting-names "$SETTING" \
        2>&1)
    
    if [[ $? -eq 0 ]]; then
        echo "   ✅ $SETTING supprimé (ou n'existait pas)"
    else
        if [[ $RESULT == *"not found"* || $RESULT == *"does not exist"* ]]; then
            echo "   ℹ️  $SETTING n'existait pas (OK)"
        else
            echo "   ⚠️  Erreur lors de la suppression de $SETTING"
            echo "      $RESULT"
        fi
    fi
    echo ""
done

# Étape 4: Vérification finale
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Étape 4: Paramètres APRÈS suppression"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

az staticwebapp appsettings list \
    --name "$APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    -o table

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ OPÉRATION TERMINÉE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Paramètres AUTORISÉS qui doivent rester:"
echo "   ✅ AZURE_COMMUNICATION_CONNECTION_STRING"
echo "   ✅ AZURE_COMMUNICATION_SENDER"
echo "   ✅ APPINSIGHTS_INSTRUMENTATIONKEY (si présent)"
echo ""
echo "📝 Paramètres INTERDITS qui ont été supprimés:"
echo "   ❌ AzureWebJobsStorage"
echo "   ❌ FUNCTIONS_WORKER_RUNTIME"
echo "   ❌ FUNCTIONS_API_KEY"
echo "   ❌ FUNCTIONS_BASE_URL"
echo "   ❌ ACTIONS_BASE_URL"
echo ""
echo "🚀 Prochaines étapes:"
echo "   1. Attendez 2-3 minutes (propagation)"
echo "   2. Déployez à nouveau votre application"
echo "   3. Vérifiez le workflow GitHub Actions"
echo ""
echo "📊 Diagnostics Azure:"
echo "   https://portal.azure.com → Static Web App → Diagnose and solve problems"
echo ""
