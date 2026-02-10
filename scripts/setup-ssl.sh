#!/bin/bash

# SSL Certificate Setup Script for ERP
# Prerequisites: .env file with DOMAIN_NAME and SSL_EMAIL

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO] $1${NC}"; }
log_warn() { echo -e "${YELLOW}[WARN] $1${NC}"; }
log_error() { echo -e "${RED}[ERROR] $1${NC}"; }

# Check .env
if [ ! -f .env ]; then
    log_error ".env file not found!"
    exit 1
fi

source .env

if [ -z "$DOMAIN_NAME" ] || [ -z "$SSL_EMAIL" ]; then
    log_error "DOMAIN_NAME or SSL_EMAIL not set in .env"
    exit 1
fi

FULL_DOMAIN="${DOMAIN_NAME}.duckdns.org"
log_info "Setting up SSL for: $FULL_DOMAIN ($SSL_EMAIL)"

# Create directories
log_info "Creating directories..."
mkdir -p certbot/conf certbot/www nginx/conf.d

# Configure Nginx - Force replacement of placeholder or existing domain
log_info "Configuring Nginx..."
if [ -f nginx/conf.d/default.conf ]; then
    # Reset to placeholder to ensure clean slate if needed, or just replace placeholder
    # Ideally we should use a template, but for now let's try to replace DOMAIN_PLACEHOLDER
    # If the file was already modified, DOMAIN_PLACEHOLDER might not exist.
    # We should strictly rely on the file having DOMAIN_PLACEHOLDER for the first run.
    # If it's already replaced, we assume it's correct or we might need to reset it.
    
    # Check if DOMAIN_PLACEHOLDER exists
    if grep -q "DOMAIN_PLACEHOLDER" nginx/conf.d/default.conf; then
        sed -i "s/DOMAIN_PLACEHOLDER/$FULL_DOMAIN/g" nginx/conf.d/default.conf
    else
        log_warn "DOMAIN_PLACEHOLDER not found in default.conf. Assuming it's already configured."
    fi

    # Fix deprecated directive if present
    sed -i "s/listen 443 ssl http2;/listen 443 ssl; http2 on;/g" nginx/conf.d/default.conf
else
    log_error "nginx/conf.d/default.conf not found"
    exit 1
fi

# Create Dummy Certificate for Nginx to start
# We must create it at the path Nginx expects: /etc/letsencrypt/live/$FULL_DOMAIN/fullchain.pem
# Which maps to ./certbot/conf/live/$FULL_DOMAIN/fullchain.pem on host
if [ ! -f "certbot/conf/live/$FULL_DOMAIN/fullchain.pem" ]; then
    log_info "Creating dummy certificate for $FULL_DOMAIN..."
    mkdir -p "certbot/conf/live/$FULL_DOMAIN"
    openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
        -keyout "certbot/conf/live/$FULL_DOMAIN/privkey.pem" \
        -out "certbot/conf/live/$FULL_DOMAIN/fullchain.pem" \
        -subj "/CN=localhost"
    
    # Ensure permissions
    chmod -R 755 certbot/conf/live/
fi

# Start Proxy
log_info "Starting nginx-proxy..."
docker compose up -d nginx-proxy
sleep 5

# Remove dummy certificate so Certbot can use the correct path
log_info "Removing dummy certificate to allow Certbot to place real certificate..."
rm -rf "certbot/conf/live/$FULL_DOMAIN"
rm -rf "certbot/conf/archive/$FULL_DOMAIN"
rm -f "certbot/conf/renewal/$FULL_DOMAIN.conf"

# Request Certificate
log_info "Requesting SSL certificate..."
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$SSL_EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$FULL_DOMAIN"

if [ $? -eq 0 ]; then
    log_info "SSL certificate obtained successfully."
else
    log_error "Failed to obtain SSL certificate."
    exit 1
fi

# Restart Proxy
log_info "Restarting nginx-proxy..."
docker compose restart nginx-proxy
sleep 3

# Start Services
log_info "Starting all services..."
docker compose up -d

log_info "SSL Setup Complete! Application available at https://$FULL_DOMAIN"

