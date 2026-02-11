# SBMS (Smart Business Management System)

A comprehensive, microservices-based Enterprise Resource Planning (ERP) system designed for modern business management. This project features a polyglot microservices architecture, a responsive modern frontend, and containerized deployment.

## 🚀 Technology Stack

### Backend Services
The backend is composed of multiple microservices using different technologies best suited for their specific domains:

*   **Auth Service**: Java 21, Spring Boot 3.x
    *   *Responsibility*: User authentication, JWT issuance, Profile management.
*   **Trading Service**: Java 21, Spring Boot 3.x
    *   *Responsibility*: Core transaction management (Sales, Purchases, Product, Categories and Unit ).
*   **Parties Service**: C#, .NET 8.0
    *   *Responsibility*: Management of Customers, and Suppliers.
*   **Smart Ops Service**: Node.js, Express
    *   *Responsibility*: Background operations, Cron jobs, Utility tasks.
*   **API Gateway**: Java 21, Spring Cloud Gateway
    *   *Responsibility*: Centralized entry point, Routing, Load Balancing.

### Frontend
A high-performance Single Page Application (SPA) built with:
*   **React 19**
*   **Vite** (Build tool)
*   **TailwindCSS 4** (Styling)
*   **React Query / TanStack Query** (Server state management)
*   **React Context** (Global UI/Auth state)
*   **React Window** (Virtualization for large data tables)
*   **Lucide React** (Modern iconography)

### Databases
*   **PostgreSQL**:
    *   `sbms_db`: Dedicated to Auth Service.
    *   `trading_db`: Shared database utilized by both Trading Service and Parties Service for tight integration.
*   **MongoDB**: Using Mongoose, dedicated to Smart Ops Service.

### Infrastructure
*   **Docker & Docker Compose**: Containerization and orchestration.
*   **Nginx**: Reverse proxy and SSL termination.
*   **Certbot**: Automated SSL certificate management (Let's Encrypt).

---

## 🏗 Architecture Overview

| Service | Internal Port | Technology | Database |
| :--- | :--- | :--- | :--- |
| **API Gateway** | `8080` | Spring Boot | - |
| **Auth Service** | `8081` | Spring Boot | PostgreSQL (`sbms_db`) |
| **Trading Service** | `8082` | Spring Boot | PostgreSQL (`trading_db`) |
| **Parties Service** | `5000` | .NET 8.0 | PostgreSQL (`trading_db`) |
| **Smart Ops** | `5002` | Node.js | MongoDB |
| **Frontend** | `5173` | React/Vite | - |

**External Access**: All services are accessed via Nginx on ports `80` (HTTP) and `443` (HTTPS).

---

## 🛠 Prerequisites

*   **Docker** and **Docker Compose** installed on your machine.
*   (Optional for local dev) **Node.js 20+**, **Java 21 JDK**, **.NET 8.0 SDK**.

---

## ⚙️ Configuration

1.  **Environment Variables**:
    Copy the example environment file to create your production configuration:
    ```bash
    cp .env.example .env
    ```

2.  **Edit `.env`**:
    Update the `.env` file with your specific configuration (Database passwords, JWT secrets, AWS credentials, Domain name).
    *   *Note: The system uses a centralized `.env` file at the root which is injected into containers via Docker Compose.*

---

## 🚀 Installation & Running

### Using Docker (Recommended)

1.  **Build and Start Services**:
    ```bash
    docker-compose up --build -d
    ```

2.  **Access the Application**:
    *   Frontend: `http://localhost` (or your configured domain)
    *   API Gateway: `http://localhost/api/`

### Local Development (Manual)
To run services individually without Docker (useful for debugging):

1.  **Databases**: Ensure PostgreSQL and MongoDB are running locally.
2.  **Backend Services**: 
    *   Run Spring Boot apps (`./mvnw spring-boot:run`)
    *   Run .NET app (`dotnet run`)
    *   Run Node app (`npm run dev`)
3.  **Frontend**:
    ```bash
    cd client
    npm install
    npm run dev
    ```

---

## 🔒 Security
*   **JWT Authentication**: Stateless authentication mechanism securing all API endpoints.
*   **SSL/TLS**: Nginx handles SSL termination using certificates auto-managed by Certbot.
*   **CORS**: Configurable CORS policies in API Gateway.

