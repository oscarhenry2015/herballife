#!/bin/bash

# Load environment variables
source ./.env

# Login to Azure (if not already logged in)
az login --tenant $TENANT_ID

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Deploy WebApp and App Service Plan
az deployment group create \
  --name WebAppDeployment \
  --resource-group $RESOURCE_GROUP \
  --template-file webapp_template.json\
  --parameters webapp_parameters.json

# Deploy PostgreSQL
az deployment group create \
  --name postgreSQLDeployment \
  --resource-group $RESOURCE_GROUP \
  --template-file postgresql_template.json \
  --parameters postgresql_parameters.json\
  --parameters administratorLoginPassword="$POSTGRES_ADMIN_PASSWORD"