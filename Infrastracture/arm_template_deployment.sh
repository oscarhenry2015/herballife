!/bin/bash

# Login to Azure (if not already logged in)
#az login --tenant 72b7ff39-ea55-4d53-924c-80758b5dba9b

# Create a resource group (if not already created)
az group create --name HerbalLife_RG --location eastus2

# Deploy WebApp and App Service Plan to Azure
az deployment group create \
  --name WebAppDeployment \
  --resource-group HerbalLife_RG \
  --template-file WebAppTemplate.json \
  --parameters WebAppParameters.json \

# Deploy PostgreSQL to Azure
#az deployment group create \
#  --name postgreSQLDeployment \
#  --resource-group Herbal_Life_RG \
#  --template-file PostgreSQLTemplate.json \
#  --parameters PostgreSQLParameters.json \
#  --parameters administratorLoginPassword="P@ss1234"
