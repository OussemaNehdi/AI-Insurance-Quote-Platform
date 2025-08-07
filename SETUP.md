# Insurance AI Platform - Setup Instructions

Follow these instructions to get the Insurance AI Platform up and running.

## Prerequisites

- Node.js 18.x or later
- MongoDB connection string (MongoDB Atlas recommended)
- OpenRouter API key with access to the DeepSeek model

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the existing .env.example file to .env and update the following values:

```bash
# OpenRouter API key for accessing DeepSeek LLM
OPENROUTER_API_KEY=your_openrouter_api_key

# URL for OpenRouter API
OPENROUTER_URL=https://openrouter.ai/api/v1/chat/completions

# Model configuration - using DeepSeek Chat
MODEL_NAME=deepseek/deepseek-chat-v3-0324

# Application settings
APP_NAME=Insurance AI Assistant
APP_URL=http://localhost:3000

# Database - Replace with your MongoDB connection string
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority

# JWT Secret for authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 3. Initialize the Database

You can initialize the database with sample companies and insurance configurations using either:

**Option A**: Run the initialization script (recommended):
```bash
npm run init-db
```

**Option B**: Use the web interface:
1. Start the development server with `npm run dev`
2. Open [http://localhost:3000](http://localhost:3000) in your browser
3. Click the "Initialize Database" button on the homepage

### 4. Run the Development Server

```bash
npm run dev
```

### 5. Access the Application

Open [http://localhost:3000](http://localhost:3000) in your browser

## Using the Application

### For Clients:

1. Click "Get Insurance Quote" on the homepage
2. Select an insurance company from the dropdown
3. Select an insurance type from the dropdown
4. Chat with the AI assistant to provide your information
5. Review your personalized quote

### For Companies:

Use the following demo credentials to log in:
- Email: contact@secureinsurance.example
- Password: company123

## Troubleshooting

If you encounter issues:

1. Ensure your MongoDB connection string is correct and accessible
2. Verify your OpenRouter API key has access to the DeepSeek model
3. Check console logs for any error messages
4. Make sure all required environment variables are set correctly

## Support

For questions or issues, please refer to the README.md file or contact support.
