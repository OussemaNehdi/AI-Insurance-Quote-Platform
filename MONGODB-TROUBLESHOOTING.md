# MongoDB Connection Troubleshooting

This document provides guidance on how to resolve MongoDB connection issues in the Insurance AI platform.

## Common Issues

The most common MongoDB connection error is:
```
SSL routines:ssl3_read_bytes:tlsv1 alert internal error
```

This typically occurs due to SSL/TLS configuration issues with the MongoDB connection.

## Solutions

### 1. Update Environment Configuration

You can run the environment update script to configure your MongoDB connection:

```bash
node src/scripts/update-env.js
```

This will guide you through setting up either a local MongoDB instance or configuring a cloud MongoDB connection.

### 2. Use Local MongoDB for Development

For local development, you can use a local MongoDB instance:

1. Install MongoDB on your machine: [MongoDB Installation Guide](https://www.mongodb.com/docs/manual/installation/)
2. Start the MongoDB service
3. Run the setup script:

```bash
node src/scripts/setup-local-mongo.js
```

4. Update your `.env.local` file:

```
DATABASE_URL=mongodb://localhost:27017/insurance-ai
MONGODB_SSL=false
MONGODB_TLS=false
```

### 3. Configure Cloud MongoDB

If you want to use a cloud MongoDB instance:

1. Make sure your connection string is correct
2. Set the right SSL/TLS settings in your `.env.local` file:

```
DATABASE_URL=your_mongodb_connection_string
MONGODB_SSL=true
MONGODB_TLS=true
```

### 4. Using the Troubleshooting Page

The application includes a MongoDB troubleshooter page at `/troubleshoot/mongodb` that provides guided assistance.

### 5. Initialize Sample Data

After setting up your database connection, you can initialize the database with sample data by visiting:

```
/api/db/init?key=init-insurance-platform
```

## Default Access Credentials

When using a local MongoDB instance set up with our scripts, you can use:

- Email: `admin@insurance-ai.local`
- Password: `password`

## Need More Help?

If you continue to experience issues:

1. Check the server logs for detailed error messages
2. Verify your MongoDB version and compatibility
3. Ensure any firewall settings allow MongoDB connections

---

*Note: This solution implements both cloud and local MongoDB support with automatic fallback to ensure the application works in all environments.*
