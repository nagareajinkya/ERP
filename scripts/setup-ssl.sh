#!/bin/bash

# SSL Certificate Setup Script for ERP
# Optimized to prevent Rate Limiting by checking for existing real certificates.

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
CERT_PATH="certbot/conf/live/$FULL_DOMAIN/fullchain.pem"
log_info "Setting up SSL for: $FULL_DOMAIN ($SSL_EMAIL)"

# Create directories
log_info "Creating directories..."
mkdir -p certbot/conf certbot/www nginx/conf.d

# Configure Nginx
log_info "Configuring Nginx..."
if [ -f nginx/conf.d/default.conf ]; then
    if grep -q "DOMAIN_PLACEHOLDER" nginx/conf.d/default.conf; then
        sed -i "s/DOMAIN_PLACEHOLDER/$FULL_DOMAIN/g" nginx/conf.d/default.conf
    else
        log_warn "DOMAIN_PLACEHOLDER not found. Assuming already configured."
    fi
    # Fix deprecated directive
    sed -i "s/listen 443 ssl http2;/listen 443 ssl; http2 on;/g" nginx/conf.d/default.conf
else
    log_error "nginx/conf.d/default.conf not found"
    exit 1
fi

# --- INTELLIGENT CERTIFICATE LOGIC ---

NEEDS_REAL_CERT=true

if [ -f "$CERT_PATH" ]; then
    # Check if the issuer is Let's Encrypt or just a local dummy
    if sudo openssl x509 -in "$CERT_PATH" -noout -issuer | grep -q "Let's Encrypt"; then
        log_info "Valid Let's Encrypt certificate detected. Skipping fresh request."
        NEEDS_REAL_CERT=false
    else
        log_warn "Existing certificate is a dummy. Will attempt to replace with real SSL."
    fi
else
    log_info "No certificate found. Creating temporary dummy for Nginx startup..."
    mkdir -p "certbot/conf/live/$FULL_DOMAIN"
    sudo openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
        -keyout "certbot/conf/live/$FULL_DOMAIN/privkey.pem" \
        -out "$CERT_PATH" \
        -subj "/CN=localhost"
    sudo chmod -R 755 certbot/conf/live/
fi

# Start Proxy (Needs at least the dummy to start)
log_info "Starting nginx-proxy..."
docker compose up -d nginx-proxy
sleep 5

if [ "$NEEDS_REAL_CERT" = true ]; then
    log_info "Requesting REAL SSL certificate from Let's Encrypt..."
    
    # Remove dummy only right before requesting real one
    sudo rm -rf "certbot/conf/live/$FULL_DOMAIN"
    sudo rm -rf "certbot/conf/archive/$FULL_DOMAIN"
    sudo rm -f "certbot/conf/renewal/$FULL_DOMAIN.conf"

    docker compose run --rm --entrypoint "certbot" certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "$SSL_EMAIL" \
        --agree-tos \
        --no-eff-email \
        --non-interactive \
        -d "$FULL_DOMAIN"

    if [ $? -eq 0 ]; then
        log_info "SSL certificate obtained successfully."
        docker compose restart nginx-proxy
    else
        log_error "Failed to obtain SSL certificate. You may have hit rate limits."
        exit 1
    fi
else
    # Just run a renewal check. This is safe and doesn't count against the 'Duplicate' limit.
    log_info "Checking if renewal is needed..."
    docker compose run --rm --entrypoint "certbot" certbot renew --quiet
fi

# Start All Services
log_info "Starting all services..."
docker compose up -d

log_info "SSL Setup Complete! Application available at https://$FULL_DOMAIN"