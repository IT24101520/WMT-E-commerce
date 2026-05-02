# Cold Ego E-Commerce Application

A personalized e-commerce mobile application for gift items with separate frontend and backend architecture.

## Project Structure

```
EGO_Project/
├── backend/           # Express.js API server
│   ├── controllers/   # API controllers
│   ├── models/        # MongoDB models
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   ├── uploads/       # File uploads
│   ├── server.js      # Main server file
│   ├── package.json   # Backend dependencies
│   ├── .env          # Environment variables
│   └── render.yaml   # Render deployment config
├── frontend/          # React Native mobile app
│   ├── src/          # Source code
│   ├── App.js        # Main app component
│   ├── package.json  # Frontend dependencies
│   ├── app.json      # Expo configuration
│   ├── eas.json      # EAS Build configuration
│   └── .env          # Environment variables
└── README.md
```

## Backend Setup

### Local Development

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in `.env`:
```
PORT=3000
MONGO_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-secret-key
```

4. Start the server:
```bash
npm start
```

### Render Deployment

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Use the `render.yaml` configuration
5. Set environment variables in Render dashboard:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Your JWT secret key

## Frontend Setup

### Local Development

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in `.env`:
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

4. Start the development server:
```bash
npm start
```

### Building Standalone Mobile App (EAS Build)

1. Install EAS CLI:
```bash
npm install -g @expo/eas-cli
```

2. Login to your Expo account:
```bash
eas login
```

3. Configure build settings:
```bash
eas build:configure
```

4. Build for Android:
```bash
npm run build:android
```

5. Build for iOS:
```bash
npm run build:ios
```

## API Configuration

### Development
- API URL: `http://localhost:3000/api`
- Health Check: `http://localhost:3000/health`

### Production (After Render Deployment)
- API URL: `https://your-app.onrender.com/api`
- Health Check: `https://your-app.onrender.com/health`

## Deployment Steps

1. **Deploy Backend to Render:**
   - Push code to GitHub
   - Create Render web service
   - Set environment variables
   - Deploy and get API URL

2. **Update Frontend API URL:**
   - Update `.env` file in frontend:
   ```
   EXPO_PUBLIC_API_URL=https://your-render-app.onrender.com/api
   ```

3. **Build Mobile App:**
   - Run EAS build commands
   - Download APK/IPA files
   - Install on mobile devices

## Features

- User authentication (login/register)
- Product catalog
- Shopping cart
- Order management
- Customization options
- Promo codes
- Reviews and ratings
- Media uploads
- Admin panel

## Technology Stack

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose
- JWT authentication
- Multer for file uploads
- CORS for mobile app access

**Frontend:**
- React Native with Expo
- React Navigation
- Axios for API calls
- EAS Build for standalone apps

## Database

- MongoDB Atlas for cloud database
- Automatic connection with environment variables
- Seeded with sample products and data

## Testing

1. Test backend locally first
2. Deploy to Render and test API
3. Update frontend API URL
4. Test mobile app with production API
5. Build and test standalone app
