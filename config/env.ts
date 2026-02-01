// Centralized environment configuration
// Works for both local development (env.js) and production (Vite env vars)

// Helper to get env var from either source
const getEnvVar = (key: string): string => {
  // First try Vite's import.meta.env (production)
  const viteEnv = (import.meta as any).env;
  if (viteEnv?.[key]) {
    return viteEnv[key];
  }
  
  // Then try window.process.env (local dev with env.js)
  const windowEnv = (window as any).process?.env;
  if (windowEnv?.[key]) {
    return windowEnv[key];
  }
  
  return '';
};

// Export all environment variables
export const env = {
  // Gemini AI
  GEMINI_API_KEY: getEnvVar('VITE_GEMINI_API_KEY') || getEnvVar('GEMINI_API_KEY') || getEnvVar('API_KEY'),
  
  // Supabase
  SUPABASE_URL: getEnvVar('VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY'),
  
  // Serper (Google Image Search)
  SERPER_API_KEY: getEnvVar('VITE_SERPER_API_KEY'),
  
  // Pollinations AI
  POLLINATIONS_API_KEY: getEnvVar('VITE_POLLINATIONS_API_KEY'),
  
  // Openverse
  OPENVERSE_CLIENT_ID: getEnvVar('VITE_OPENVERSE_CLIENT_ID'),
  OPENVERSE_CLIENT_SECRET: getEnvVar('VITE_OPENVERSE_CLIENT_SECRET'),
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: getEnvVar('VITE_CLOUDINARY_CLOUD_NAME') || getEnvVar('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_UPLOAD_PRESET: getEnvVar('VITE_CLOUDINARY_UPLOAD_PRESET') || getEnvVar('CLOUDINARY_UPLOAD_PRESET'),
};

export default env;
