// Local development environment variables
// Copy from env.example.js and replace with your actual values
// IMPORTANT: DO NOT COMMIT THIS FILE TO VERSION CONTROL

window.process = {
  env: {
    // --- Required for AI Features ---
    // Get your Gemini API Key from Google AI Studio: https://aistudio.google.com/app/apikey
    API_KEY: 'YOUR_GEMINI_API_KEY_HERE',
    GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY_HERE', // Vite config expects this name

    // --- Database Configuration (Supabase Recommended) ---
    // Create account at https://supabase.com and get these from your project settings
    SUPABASE_URL: 'https://jadzbyvvdiyccwvmrexk.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphZHpieXZ2ZGl5Y2N3dm1yZXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NzI3NTEsImV4cCI6MjA4NDQ0ODc1MX0.Eoxr3Y-cCBcUEIbcwfTZAwJLCLX9B9m86rGDhmYReLU',
    SUPABASE_SERVICE_ROLE_KEY: 'YOUR_SUPABASE_SERVICE_ROLE_KEY', // For admin operations

    // --- Authentication Configuration ---
    // These will be used when implementing real auth
    AUTH_REDIRECT_URL: 'http://localhost:5173/auth/callback',

    VITE_OPENVERSE_CLIENT_ID: 'FtzCY2OWaceV5jjTHsy9hnJVGZq5ryUldHkZCD22',
    VITE_OPENVERSE_CLIENT_SECRET: 'wJRXqAwZd9WzuTWjOl7UULeDSGjPMjE2mi2XSVaadqKhiEK6RtVb2o44ko3fjIxoLPUHDXRhmZlmOMwshHCGbDBRQvjBoe5w66tDdscLrbkyRb18hBqoPYnOuGehl2l5'
    
    // --- Optional: Firebase Alternative ---
    // Uncomment if you choose Firebase instead of Supabase
    // FIREBASE_API_KEY: 'YOUR_FIREBASE_API_KEY',
    // FIREBASE_AUTH_DOMAIN: 'your-project-id.firebaseapp.com',
    // FIREBASE_PROJECT_ID: 'your-project-id',
    // FIREBASE_STORAGE_BUCKET: 'your-project-id.appspot.com',
    // FIREBASE_MESSAGING_SENDER_ID: 'your-sender-id',
    // FIREBASE_APP_ID: 'your-app-id',

    // --- Development Configuration ---
    NODE_ENV: 'development',
    VITE_APP_TITLE: 'Verses - Dev',
    
    // --- Image Upload Configuration ---
    // Cloudinary for image storage and transformations
    CLOUDINARY_CLOUD_NAME: 'YOUR_CLOUDINARY_CLOUD_NAME',
    CLOUDINARY_API_KEY: 'YOUR_CLOUDINARY_API_KEY',
    CLOUDINARY_API_SECRET: 'YOUR_CLOUDINARY_API_SECRET',
    CLOUDINARY_UPLOAD_PRESET: 'verses_uploads', // Create this in Cloudinary dashboard
    
    // --- Image Search APIs ---
    // Unsplash for stock photos (recommended)
    UNSPLASH_ACCESS_KEY: 'YOUR_UNSPLASH_ACCESS_KEY',
    
    // Google Custom Search (optional)
    GOOGLE_CUSTOM_SEARCH_API_KEY: 'YOUR_GOOGLE_SEARCH_API_KEY',
    GOOGLE_CUSTOM_SEARCH_ENGINE_ID: 'YOUR_SEARCH_ENGINE_ID',
    
    // --- AI Image Generation APIs ---
    // Replicate Stable Diffusion (primary - cost effective)
    REPLICATE_API_TOKEN: 'YOUR_REPLICATE_API_TOKEN',
    
    // OpenAI DALL-E 3 (backup option for high quality)
    OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY',
    
    // Fallback: Supabase Storage (if you prefer)
    SUPABASE_STORAGE_BUCKET: 'avatars',
    MAX_FILE_SIZE: '5242880', // 5MB in bytes
    
    // --- Rate Limiting ---
    // For AI API calls to prevent abuse
    AI_REQUESTS_PER_MINUTE: '10',
    
    // --- Analytics (Optional) ---
    // GOOGLE_ANALYTICS_ID: 'G-XXXXXXXXXX',
    // MIXPANEL_TOKEN: 'your-mixpanel-token',
  }
};
