# Insurance AI Platform

A Next.js application that provides an AI-driven insurance quote platform with the following features:

- User selection of insurance companies and types
- AI-powered chatbot for information collection using DeepSeek LLM via OpenRouter
- Dynamic insurance quote calculation based on collected data
- MongoDB database for storing company and insurance configuration

## Getting Started

### Prerequisites

- Node.js 18.x or later
- MongoDB connection string (MongoDB Atlas recommended)
- OpenRouter API key with access to the DeepSeek model

### Environment Setup

1. Copy the `.env.example` file to `.env` and update the following variables:

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

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Initial Setup

1. On the first run, click the "Initialize Database" button on the homepage to populate the database with sample insurance companies and configurations.
2. After initialization, you can:
   - Use the client interface to get insurance quotes
   - Log in as a company to manage insurance offerings

## Architecture

### Backend

- MongoDB database for storing company and insurance data
- Next.js API routes for handling:
  - Authentication
  - Insurance quote calculations
  - Company and insurance type management
  - Chat integration with OpenRouter API

### Frontend

- Next.js App Router for page structure
- React for UI components
- TailwindCSS for styling
- Context providers for state management

### AI Integration

- Integration with DeepSeek LLM via OpenRouter API
- Structured JSON responses for data collection
- Dynamic prompting based on insurance type

## Usage

### For Clients

1. Visit the homepage and click "Get Insurance Quote"
2. Select an insurance company
3. Select an insurance type
4. Chat with the AI assistant to provide your information
5. Review your personalized quote

### For Insurance Companies

1. Visit the homepage and click "Company Login"
2. Log in with your credentials
3. Manage your company profile and insurance offerings

## Demo Credentials

For testing purposes, the following credentials are available:

**Company Login:**
- Email: contact@secureinsurance.example
- Password: company123

## License

This project is licensed under the MIT License.

## Acknowledgments

- Next.js
- MongoDB
- OpenRouter
- DeepSeek AI
