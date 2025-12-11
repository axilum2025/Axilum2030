#!/bin/bash
# Script pour supprimer les paramètres interdits d'Azure Static Web Apps
# Usage: Exécutez ce script dans Azure Cloud Shell

echo "🧹 Nettoyage des paramètres d'application interdits"
echo "=================================================="
echo ""

# Remplacez ces valeurs par les vôtres
RESOURCE_GROUP="votre-resource-group"  # Remplacez par votre Resource Group
STATIC_WEB_APP_NAME="victorious-rock"  # Nom de votre Static Web App

echo "📋 Configuration:"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   Static Web App: $STATIC_WEB_APP_NAME"
echo ""

# Liste des paramètres à supprimer
FORBIDDEN_SETTINGS=(
    "AzureWebJobsStorage"
    "FUNCTIONS_WORKER_RUNTIME"
    "FUNCTIONS_API_KEY"
    "FUNCTIONS_BASE_URL"
)

echo "🔍 Vérification des paramètres actuels..."
az staticwebapp appsettings list \
    --name $STATIC_WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    -o table

echo ""
echo "🗑️  Suppression des paramètres interdits..."

for setting in "${FORBIDDEN_SETTINGS[@]}"; do
    echo "   → Suppression de $setting..."
    az staticwebapp appsettings delete \
        --name $STATIC_WEB_APP_NAME \
        --resource-group $RESOURCE_GROUP \
        --setting-names $setting \
        2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "      ✅ $setting supprimé"
    else
        echo "      ⚠️  $setting n'existe pas ou déjà supprimé"
    fi
done

echo ""
echo "✅ Nettoyage terminé!"
echo ""
echo "📋 Paramètres restants:"
az staticwebapp appsettings list \
    --name $STATIC_WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    -o table

echo ""
echo "🚀 Vous pouvez maintenant redéployer votre application!"
