#!/bin/bash

################################################################################
# DuckDNS IP Update Script
################################################################################
# Updates your DuckDNS domain with the current server's public IP
# Run this script if your EC2 IP address changes
################################################################################

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Load environment variables
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

source .env

# Validate required variables
if [ -z "$DOMAIN_NAME" ]; then
    echo -e "${RED}Error: DOMAIN_NAME not set in .env${NC}"
    exit 1
fi

if [ -z "$DUCKDNS_TOKEN" ]; then
    echo -e "${RED}Error: DUCKDNS_TOKEN not set in .env${NC}"
    exit 1
fi

# Get current public IP
echo "Fetching current public IP..."
CURRENT_IP=$(curl -s https://checkip.amazonaws.com)

if [ -z "$CURRENT_IP" ]; then
    echo -e "${RED}Error: Could not determine public IP${NC}"
    exit 1
fi

echo "Current IP: $CURRENT_IP"

# Update DuckDNS
echo "Updating DuckDNS domain: ${DOMAIN_NAME}.duckdns.org"
RESPONSE=$(curl -s "https://www.duckdns.org/update?domains=${DOMAIN_NAME}&token=${DUCKDNS_TOKEN}&ip=${CURRENT_IP}")

if [ "$RESPONSE" = "OK" ]; then
    echo -e "${GREEN}✓ DuckDNS updated successfully!${NC}"
    echo "Domain ${DOMAIN_NAME}.duckdns.org now points to $CURRENT_IP"
else
    echo -e "${RED}Error: DuckDNS update failed${NC}"
    echo "Response: $RESPONSE"
    exit 1
fi
