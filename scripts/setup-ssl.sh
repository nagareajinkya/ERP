#!/bin/bash

################################################################################
# SSL Certificate Setup Script
################################################################################
# This script sets up HTTPS/SSL for your ERP application using Let's Encrypt
# Prerequisites:
#   - DuckDNS domain configured and pointing to this server's IP
#   - Port 80 and 443 open in EC2 security group
#   - .env file with DOMAIN_NAME and SSL_EMAIL configured
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}SSL Certificate Setup for ERP${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please create .env file with required variables:"
    echo "  - DOMAIN_NAME"
    echo "  - SSL_EMAIL"
    exit 1
fi

# Load environment variables
source .env

# Validate required variables
if [ -z "$DOMAIN_NAME" ]; then
    echo -e "${RED}Error: DOMAIN_NAME not set in .env${NC}"
    exit 1
fi

if [ -z "$SSL_EMAIL" ]; then
    echo -e "${RED}Error: SSL_EMAIL not set in .env${NC}"
    exit 1
fi

# Construct full domain
FULL_DOMAIN="${DOMAIN_NAME}.duckdns.org"

echo -e "${YELLOW}Domain:${NC} $FULL_DOMAIN"
echo -e "${YELLOW}Email:${NC} $SSL_EMAIL"
echo ""

# Create necessary directories
echo -e "${GREEN}[1/6] Creating directories...${NC}"
mkdir -p certbot/conf
mkdir -p certbot/www
mkdir -p nginx/conf.d
echo "✓ Directories created"
echo ""

# Update nginx config with actual domain name
echo -e "${GREEN}[2/6] Configuring nginx with domain...${NC}"
if [ -f nginx/conf.d/default.conf ]; then
    sed -i "s/DOMAIN_PLACEHOLDER/$FULL_DOMAIN/g" nginx/conf.d/default.conf
    echo "✓ Nginx configuration updated"
else
    echo -e "${RED}Error: nginx/conf.d/default.conf not found${NC}"
    exit 1
fi
echo ""

# Start nginx-proxy without SSL first (for ACME challenge)
echo -e "${GREEN}[3/6] Starting nginx-proxy for ACME challenge...${NC}"
docker-compose up -d nginx-proxy
sleep 5
echo "✓ Nginx proxy started"
echo ""

# Obtain SSL certificate
echo -e "${GREEN}[4/6] Requesting SSL certificate from Let's Encrypt...${NC}"
echo "This may take a minute..."
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $SSL_EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $FULL_DOMAIN

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ SSL certificate obtained successfully!${NC}"
else
    echo -e "${RED}Error: Failed to obtain SSL certificate${NC}"
    echo "Please check:"
    echo "  1. Domain $FULL_DOMAIN resolves to this server's IP"
    echo "  2. Port 80 is accessible from the internet"
    echo "  3. You haven't exceeded Let's Encrypt rate limits"
    exit 1
fi
echo ""

# Restart nginx-proxy to load SSL certificates
echo -e "${GREEN}[5/6] Restarting nginx-proxy with SSL...${NC}"
docker-compose restart nginx-proxy
sleep 3
echo "✓ Nginx restarted with SSL"
echo ""

# Start all services
echo -e "${GREEN}[6/6] Starting all services...${NC}"
docker-compose up -d
echo "✓ All services started"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ SSL Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Your application is now available at:"
echo -e "${GREEN}https://$FULL_DOMAIN${NC}"
echo ""
echo "SSL certificate will auto-renew every 60 days."
echo ""
echo "To check certificate status:"
echo "  docker-compose exec certbot certbot certificates"
echo ""
echo "To manually force renewal:"
echo "  docker-compose exec certbot certbot renew"
echo "  docker-compose restart nginx-proxy"
echo ""
