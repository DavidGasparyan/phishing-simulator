# Phishing Simulator Project

## Project Overview
A full-stack phishing simulation and awareness web application built with:
- Backend: NestJS
- Frontend: React
- Database: MongoDB
- Containerization: Docker

## Prerequisites
- Node.js (v18+)
- Yarn
- Docker
- Docker Compose

## Project Structure
```
phishing-simulator/
│
├── apps/
│   ├── frontend/               # React web application
│   ├── phishing-simulation-service/  # NestJS service for phishing simulations
│   └── phishing-attempts-service/    # NestJS service for managing phishing attempts
│
├── libs/
│   ├── shared-types/           # Shared TypeScript interfaces and types
│   └── shared-utils/           # Shared utility functions
│
├── tools/
│   └── docker/                 # Dockerfiles for services
│
├── docker-compose.yml          # Docker Compose configuration
└── README.md
```

## Local Development Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd phishing-simulator
```

### 2. Install Dependencies
```bash
yarn install
```

### 3. Run Development Servers
```bash
# Start all services
yarn nx run-many --target=serve --all

# Or start specific services
yarn nx serve frontend
yarn nx serve phishing-simulation-service
yarn nx serve phishing-attempts-service
```

## Docker Deployment

### Build and Run with Docker Compose
```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Stop and Remove Containers
```bash
docker-compose down
```

## Key Features
- JWT-based authentication
- Phishing simulation email sending
- Real-time phishing attempt tracking
- Docker containerization

## Environment Variables
Create `.env` files in respective app directories for:
- Database connection strings
- JWT secrets
- Email service configurations

## Testing
```bash
# Run unit tests
yarn nx test frontend
yarn nx test phishing-simulation-service
yarn nx test phishing-attempts-service

# Run e2e tests
yarn nx e2e frontend-e2e
```

## Linting
```bash
yarn nx lint frontend
yarn nx lint phishing-simulation-service
yarn nx lint phishing-attempts-service
```

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
[Specify your license]

## Contact
[Your contact information]
