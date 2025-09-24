# 🎨 Openverse Creative Commons Image Search Setup

This guide explains how to set up Creative Commons image search using the Openverse API.

## 🔑 Getting Your Openverse API Credentials

### Step 1: Register for API Access
1. Go to [Openverse API Registration](https://api.openverse.org/v1/#tag/auth/operation/register)
2. Fill out the registration form with:
   - **Name**: Your name or organization
   - **Description**: Brief description of your project (e.g., "Verses - Social voting platform")
   - **Email**: Your contact email

### Step 2: Get Your Credentials
After registration, you'll receive:
- **Client ID**: Your unique application identifier
- **Client Secret**: Your application secret key

## ⚙️ Configuration

### Option 1: Local Development (env.js)
1. Copy `env.example.js` to `env.js`
2. Add your Openverse credentials:
```javascript
window.process = {
  env: {
    API_KEY: 'your_gemini_key_here',
    VITE_OPENVERSE_CLIENT_ID: 'your_client_id_here',
    VITE_OPENVERSE_CLIENT_SECRET: 'your_client_secret_here',
  }
};
```

### Option 2: Production (.env files)
Add to your `.env.production` or `.env.staging`:
```
VITE_OPENVERSE_CLIENT_ID=your_client_id_here
VITE_OPENVERSE_CLIENT_SECRET=your_client_secret_here
```

## 🎯 What You Get

### **Creative Commons & Public Domain Images**
- 800+ million images from various sources
- All images are legally free to use
- Proper attribution automatically provided
- High-quality photos from sources like:
  - Wikimedia Commons
  - Flickr Creative Commons
  - Museums and cultural institutions
  - Government archives

### **Legal Safety**
- All images have clear Creative Commons licenses
- No copyright concerns
- Built-in attribution text generation
- Filters out mature/inappropriate content

## 🔧 Features

- **Smart Search**: Find images by topic (e.g., "basketball", "food", "nature")
- **Attribution Display**: Shows creator and license info on each image
- **Error Handling**: Graceful fallbacks if images fail to load
- **Free to Use**: No API costs or usage limits
- **Quality Filtering**: Focuses on photographs over clipart

## 💡 Usage Tips

- **Search Terms**: Use specific terms like "mountain landscape", "vintage car", "fresh fruit"
- **Attribution**: All selected images include proper Creative Commons attribution
- **Quality**: Images are filtered for photographic content and appropriate licensing
- **Variety**: Huge selection from cultural institutions worldwide

## 🚨 Troubleshooting

### "API credentials not configured" message
- Make sure you've added both `VITE_OPENVERSE_CLIENT_ID` and `VITE_OPENVERSE_CLIENT_SECRET`
- Restart your development server after adding credentials

### "Authentication failed" error
- Double-check your Client ID and Client Secret are correct
- Ensure there are no extra spaces in your credentials

### Images not loading
- Some older images may have broken links
- The fallback system will try alternative image URLs
- Try different search terms if results are limited

## 📊 Benefits

- **100% Free**: No costs or usage limits
- **Legal Compliance**: All images are properly licensed
- **High Quality**: Curated content from reputable sources
- **Attribution Built-in**: Automatic proper crediting
- **Diverse Content**: Global sources and perspectives

Perfect for finding legally safe, high-quality images for your VS battles!
