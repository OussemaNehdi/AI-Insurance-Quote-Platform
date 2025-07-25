# Insurance Platform Backend

This is the backend API for the Insurance Platform SaaS application, designed specifically for insurance companies to manage their authentication, profiles, and business settings.

## 🚀 Features

- **Company Authentication**: Secure login/register system for insurance companies
- **JWT-based Security**: Token-based authentication with configurable expiration
- **Company Profiles**: Manage company information and insurance settings
- **Subscription Management**: Handle different subscription tiers (basic, premium, enterprise)
- **Rate Limiting**: Protection against API abuse
- **Input Validation**: Comprehensive request validation
- **TypeScript**: Full type safety throughout the application
- **MongoDB**: Robust data persistence with Mongoose ODM

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configurations:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/insurance_platform
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=30d
   FRONTEND_URL=http://localhost:3000
   ```

3. **Database Setup:**
   - Make sure MongoDB is running locally, or
   - Set up MongoDB Atlas and update the `MONGODB_URI` in your `.env` file

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Watch Mode (TypeScript compilation)
```bash
npm run build:watch
```

## 📡 API Endpoints

### Base URL
```
http://localhost:5000
```




### Authentication Routes

#### Register Company
```
POST /api/auth/register
Content-Type: application/json

{
  "companyName": "Example Insurance Co.",
  "email": "admin@example-insurance.com",
  "password": "SecurePass123",
  "subscriptionPlan": "basic" // optional: basic, premium, enterprise
}
```

#### Login Company
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example-insurance.com",
  "password": "SecurePass123"
}
```

#### Get Company Profile (Protected)
```
GET /api/auth/profile
Authorization: Bearer <your_jwt_token>
```

#### Update Company Profile (Protected)
```
PUT /api/auth/profile
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "companyName": "Updated Company Name",
  "settings": {
    "ageMultipliers": [
      { "minAge": 18, "maxAge": 25, "multiplier": 1.5 },
      { "minAge": 26, "maxAge": 40, "multiplier": 1.0 }
    ],
    "locationMultipliers": [
      { "country": "US", "multiplier": 1.0 },
      { "country": "Canada", "multiplier": 1.1 }
    ],
    "insuranceTypes": [
      { "type": "Auto", "baseRate": 1000, "isActive": true },
      { "type": "Home", "baseRate": 1200, "isActive": true }
    ]
  }
}
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── index.ts      # Main config
│   │   └── database.ts   # Database connection
│   ├── controllers/      # Route handlers
│   │   └── authController.ts
│   ├── middleware/       # Express middleware
│   │   └── auth.ts       # Authentication middleware
│   ├── models/           # Mongoose models
│   │   └── Company.ts    # Company schema
│   ├── routes/           # Route definitions
│   │   └── auth.ts       # Auth routes
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   ├── jwt.ts       # JWT utilities
│   │   └── validation.ts # Request validation
│   └── server.ts        # Main server file
├── dist/                # Compiled JavaScript (generated)
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
└── tsconfig.json
```

## 🔒 Security Features

- **Helmet**: Security headers protection
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: API request throttling
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with configurable rounds
- **Input Validation**: express-validator for request sanitization
- **MongoDB Injection Protection**: Mongoose built-in protection

## 🧪 Testing the API

You can test the API using tools like:
- **Postman**: Import the collection (if provided)
- **curl**: Command-line testing
- **Thunder Client**: VS Code extension
- **Insomnia**: API client

### Example curl commands:

```bash
# Register a new company
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Insurance Co.",
    "email": "test@insurance.com",
    "password": "SecurePass123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@insurance.com",
    "password": "SecurePass123"
  }'

# Get profile (replace TOKEN with actual JWT)
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

## 🚀 Deployment

### Environment Variables for Production
Make sure to set these environment variables in production:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/insurance_platform
JWT_SECRET=your_super_secure_random_jwt_secret_key
JWT_EXPIRE=30d
FRONTEND_URL=https://your-frontend-domain.com
```

### Docker (Optional)
You can containerize this application using Docker. Create a Dockerfile if needed.

## 🔧 Development

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run build:watch` - Watch mode for TypeScript compilation
- `npm run clean` - Clean build directory

### Adding New Features
1. Create new routes in `src/routes/`
2. Add controllers in `src/controllers/`
3. Define types in `src/types/`
4. Add middleware if needed in `src/middleware/`
5. Update validation in `src/utils/validation.ts`

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support, please contact the development team or create an issue in the repository.
