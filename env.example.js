// This is an example file.
// For local development, copy this file to a new file named `env.js`
// and replace the placeholder values with your actual credentials.
//
// IMPORTANT: DO NOT COMMIT `env.js` TO VERSION CONTROL.
// Ensure `env.js` is added to your .gitignore file.

window.process = {
  env: {
    // --- Required ---
    // Get your Gemini API Key from Google AI Studio: https://aistudio.google.com/app/apikey
    API_KEY: 'YOUR_GEMINI_API_KEY',

    // --- Image Search (Optional) ---
    // Get your Bing Search API Key from Azure Cognitive Services: https://azure.microsoft.com/en-us/services/cognitive-services/bing-web-search-api/
    // Free tier: 1,000 searches/month
    VITE_BING_SEARCH_API_KEY: 'YOUR_BING_SEARCH_API_KEY',

    // Get your Openverse API credentials from: https://api.openverse.org/v1/#tag/auth/operation/register
    // Free Creative Commons and public domain images
    VITE_OPENVERSE_CLIENT_ID: 'YOUR_OPENVERSE_CLIENT_ID',
    VITE_OPENVERSE_CLIENT_SECRET: 'YOUR_OPENVERSE_CLIENT_SECRET',

    // --- Future Database Integration (Guidelines) ---
    // When you're ready to connect a real backend, you can add your credentials here.
    // The application code would then need to be updated to read these values.

    /*
    // Example keys for Supabase:
    SUPABASE_URL: 'YOUR_SUPABASE_URL',
    SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
    */

    /*
    // Example keys for Firebase:
    FIREBASE_API_KEY: "YOUR_FIREBASE_API_KEY",
    FIREBASE_AUTH_DOMAIN: "your-project-id.firebaseapp.com",
    FIREBASE_PROJECT_ID: "your-project-id",
    FIREBASE_STORAGE_BUCKET: "your-project-id.appspot.com",
    FIREBASE_MESSAGING_SENDER_ID: "your-sender-id",
    FIREBASE_APP_ID: "your-app-id"
    */
  }
};
