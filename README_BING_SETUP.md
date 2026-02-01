# 🌐 Web Image Search Setup (Bing API)

This guide explains how to set up web image search functionality using Microsoft Bing Image Search API.

## 🔑 Getting Your Bing API Key

### Step 1: Create Azure Account
1. Go to [Azure Portal](https://portal.azure.com/)
2. Sign up for a free Azure account (if you don't have one)
3. You get $200 in free credits for 30 days

### Step 2: Create Bing Search Resource
1. In Azure Portal, click "Create a resource"
2. Search for "Bing Search v7"
3. Click "Create"
4. Fill in the details:
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new or use existing
   - **Name**: Choose a name (e.g., "verses-bing-search")
   - **Pricing Tier**: **F1 (Free)** - 1,000 transactions/month
   - **Location**: Choose closest to your users

### Step 3: Get Your API Key
1. After creation, go to your Bing Search resource
2. Click "Keys and Endpoint" in the left sidebar
3. Copy **Key 1** (this is your API key)

## ⚙️ Configuration

### Option 1: Local Development (env.js)
1. Copy `env.example.js` to `env.js`
2. Add your Bing API key:
```javascript
window.process = {
  env: {
    API_KEY: 'your_gemini_key_here',
    VITE_BING_SEARCH_API_KEY: 'your_bing_api_key_here', // Add this line
  }
};
```

### Option 2: Production (.env files)
Add to your `.env.production` or `.env.staging`:
```
VITE_BING_SEARCH_API_KEY=your_bing_api_key_here
```

## 🎯 How It Works

1. **Web Images Tab**: Users can search for images from across the web
2. **High Quality**: Bing provides high-quality, diverse image results
3. **Free Tier**: 1,000 searches per month at no cost
4. **Fallback**: If no API key is configured, the tab shows a helpful message

## 🔧 Features

- **Smart Search**: Searches based on the VS battle topic (e.g., "Kobe vs LeBron")
- **Image Previews**: Shows thumbnails with dimensions and format info
- **Error Handling**: Graceful fallbacks if images fail to load
- **CORS Safe**: Uses Bing's official API (no proxy needed)

## 💡 Usage Tips

- **Search Terms**: Use descriptive terms like "pizza", "sports car", "mountain landscape"
- **Quality**: Bing returns high-resolution images suitable for VS battles
- **Speed**: Results load quickly with thumbnail previews
- **Legal**: All images come through official Bing API (respects usage rights)

## 🚨 Troubleshooting

### "API key not configured" message
- Make sure you've added `VITE_BING_SEARCH_API_KEY` to your environment
- Restart your development server after adding the key

### "API quota exceeded" error
- You've used your 1,000 free searches for the month
- Upgrade to a paid tier in Azure Portal if needed

### Images not loading
- Some images may have CORS restrictions
- The fallback system will try the full-size image if thumbnail fails

## 📊 Pricing

- **Free Tier**: 1,000 transactions/month - $0
- **S1 Tier**: Up to 1M transactions/month - $5/1K transactions
- **S2 Tier**: Higher volume pricing available

Perfect for development and small-scale production use!
