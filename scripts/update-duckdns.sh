#!/bin/bash

# DuckDNS IP Update Script

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO] $1${NC}"; }
log_error() { echo -e "${RED}[ERROR] $1${NC}"; }

# Check .env
if [ ! -f .env ]; then
    log_error ".env file not found"
    exit 1
fi

source .env

if [ -z "$DOMAIN_NAME" ] || [ -z "$DUCKDNS_TOKEN" ]; then
    log_error "DOMAIN_NAME or DUCKDNS_TOKEN not set in .env"
    exit 1
fi

# Get Public IP
log_info "Fetching current public IP..."
CURRENT_IP=$(curl -s --max-time 10 https://checkip.amazonaws.com)

if [ -z "$CURRENT_IP" ]; then
    log_error "Could not determine public IP"
    exit 1
fi

log_info "Current IP: $CURRENT_IP"

# Update DuckDNS
log_info "Updating DuckDNS..."
RESPONSE=$(curl -s --max-time 10 "https://www.duckdns.org/update?domains=${DOMAIN_NAME}&token=${DUCKDNS_TOKEN}&ip=${CURRENT_IP}")

if [ "$RESPONSE" = "OK" ]; then
    log_info "DuckDNS updated successfully! Domain ${DOMAIN_NAME}.duckdns.org -> $CURRENT_IP"
else
    log_error "DuckDNS update failed. Response: $RESPONSE"
    exit 1
fi
