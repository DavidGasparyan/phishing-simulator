# Phishing Simulator 🎣🛡️

## Project Overview

Phishing Simulator is a comprehensive web application designed to help organizations understand and improve their cybersecurity awareness by simulating phishing attempts.

### Key Features
- User Authentication (JWT-based)
- Phishing Attempt Management
- Email Tracking
- Role-Based Access Control
- Detailed Reporting

## Technology Stack

- **Backend**: NestJS
- **Frontend**: React
- **Database**: MongoDB
- **Authentication**: Passport.js, JWT
- **Email Service**: Nodemailer
- **Containerization**: Docker

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18+)
- npm or Yarn
- Docker (optional)
- MongoDB
- Postman (for API testing)

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/phishing-simulator.git
cd phishing-simulator
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the project root with the following configuration:

```env
# Application Configuration
NODE_ENV=development
PORT=3002

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/phishing-simulator

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRATION=1h

# Email Service Configuration
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_username
SMTP_PASS=your_mailtrap_password
SMTP_SECURE=false
EMAIL_FROM="Phishing Simulator" <test@phishingsim.com>
```

### 4. Running the Application

#### Development Mode
```bash
# Start MongoDB (if not already running)
docker-compose up mongodb

# Run Backend Services
npm run start:dev
# or
yarn start:dev
```

#### Production Mode
```bash
# Build the application
npm run build

# Start the application
npm run start:prod
```

## API Endpoints

### Authentication Endpoints

#### Register
- **Method**: POST
- **URL**: `/auth/register`
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "role": "ADMIN" // Optional, defaults to USER
}
```

#### Login
- **Method**: POST
- **URL**: `/auth/login`
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

### Phishing Attempts Endpoints

#### Create Phishing Attempt
- **Method**: POST
- **URL**: `/phishing-attempts`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "recipientEmail": "target@example.com",
  "emailContent": "Click here to verify your account"
}
```

#### List Phishing Attempts
- **Method**: GET
- **URL**: `/phishing-attempts?page=1&limit=10`
- **Headers**: `Authorization: Bearer <token>`

#### Get Phishing Attempt Statistics
- **Method**: GET
- **URL**: `/phishing-attempts/stats`
- **Headers**: `Authorization: Bearer <token>`

## Testing

### Run Unit Tests
```bash
npm run test
# or
yarn test
```

### Run E2E Tests
```bash
npm run test:e2e
# or
yarn test:e2e
```

## Postman Collection

A Postman collection is available in `docs/postman/phishing-simulator.json` for easy API testing.

## Docker Deployment

### Build Docker Images
```bash
docker-compose build
```

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

## Security Considerations

- Use strong, unique passwords
- Rotate JWT secrets regularly
- Implement additional security headers
- Use HTTPS in production
- Regularly update dependencies

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Your Name - your.email@example.com

Project Link: [https://github.com/your-username/phishing-simulator](https://github.com/your-username/phishing-simulator)

## Acknowledgements

- [NestJS](https://nestjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Passport.js](http://www.passportjs.org/)
- [Nodemailer](https://nodemailer.com/)
