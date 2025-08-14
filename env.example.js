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
