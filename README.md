
# Verses.fun

A fun and engaging social platform where users can prompt an AI to generate creative 'versus' battles and then vote on them. See real-time results and discover endless imaginative matchups.

## ✨ Features

- **AI-Powered Content:** Uses the Google Gemini API to generate unique "VS" battle topics, titles, and images.
- **Interactive Voting:** Cast your vote on battles and see real-time results presented in a dynamic UI.
- **Modern UI:** A sleek, responsive, and mobile-first interface built with React and Tailwind CSS, featuring dark mode.
- **Social Interaction:** Save favorite posts, comment on battles (with nested replies), and share content.
- **User Profiles:** View your created posts, voting history, followers, and who you're following.
- **Powerful Search:** Easily find battles by title or contender names.
- **Authentication:** A complete, albeit mock, authentication flow for login and signup.

## 🛠️ Tech Stack

- **Frontend:** [React](https://react.dev/) (with Hooks), [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) for a utility-first CSS framework.
- **AI Integration:** [Google Gemini API](https://ai.google.dev/) via the `@google/genai` SDK for content generation.
- **Icons:** [React Icons](https://react-icons.github.io/react-icons/) for a comprehensive icon library.
- **Development Environment:** Requires a simple local web server for serving static files.

## 🚀 Getting Started: Local Development Guide

Follow these instructions to get the project up and running on your local machine for development and testing.

### Prerequisites

- A modern web browser (e.g., Chrome, Firefox, Safari).
- [Node.js](https://nodejs.org/) (LTS version recommended), which includes `npm`.
- A **Google Gemini API Key**. You can get one for free from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/ai-vs-arena.git
    cd ai-vs-arena
    ```

2.  **Set up your Environment File:**

    This project uses a simple `env.js` file to manage environment variables for local development. Create this file by copying the provided template:

    ```bash
    cp env.example.js env.js
    ```

    Now, open `env.js` and add your Google Gemini API Key. This file is specifically for local development and is already listed in `.gitignore`, so it **should not** be committed to version control.

    ```javascript
    // env.js
    window.process = {
      env: {
        // --- Required ---
        // Get your Gemini API Key from Google AI Studio
        API_KEY: 'YOUR_GEMINI_API_KEY', 
        
        // ... other keys for database integration will go here
      }
    };
    ```

3.  **Run the App with a Local Server:**

    Since this project is built with static files (HTML, CSS, JS), you can run it using any simple local web server. The recommended approach is to use the `serve` package from npm.
    
    First, install `serve` globally (if you don't have it already):
    ```bash
    npm install -g serve
    ```
    Then, run it from the project's root directory:
    ```bash
    serve .
    ```

    Open your browser and navigate to the URL provided by the server (usually `http://localhost:3000`). The app should now be running with your API key configured!

## 🔧 Database Integration & Further Development

The application currently uses mock data located in `constants.ts` to simulate a full user experience. To connect this to a real backend like **Supabase** or **Firebase**, follow these steps.

### 1. Set Up Your Backend

- **Choose a Backend-as-a-Service (BaaS):** [Supabase](https://supabase.com/) (PostgreSQL) and [Firebase](https://firebase.google.com/) (NoSQL) are excellent choices.
- **Create a Project:** Set up a new project on your chosen platform.
- **Define Your Schema:** Create tables/collections based on the app's data structures defined in `types.ts`. A recommended schema would include:
    - `users`: To store user profiles (id, name, email, profileImageUrl, etc.).
    - `posts`: To store the VS battles (id, author_id, title, optionA_name, optionB_image, etc.).
    - `comments`: To store comments (id, post_id, author_id, text, parent_id for replies).
    - `votes`: To track user votes on posts (user_id, post_id, chosen_option).
    - `likes`: To track likes on comments (user_id, comment_id).
    - `followers`: A relational table to manage user follows (follower_id, following_id).

### 2. Add Credentials to Environment

- **Get Credentials:** Obtain the necessary API keys and URLs from your backend's dashboard.
- **Add to `env.js`:** Add these keys to your local `env.js` file, using the commented-out examples in `env.example.js` as a guide.

    ```javascript
    // env.js
    window.process = {
      env: {
        API_KEY: 'YOUR_GEMINI_API_KEY',

        // Example for Supabase:
        SUPABASE_URL: 'YOUR_SUPABASE_URL',
        SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
      }
    };
    ```

### 3. Create a Data Service Layer

The best practice is to abstract all backend communication into a dedicated service file.

- **Create a Service File:** In the `services/` directory, create a new file (e.g., `supabaseService.ts` or `firebaseService.ts`).
- **Initialize Client:** In this file, initialize the client for your BaaS using the credentials from `process.env`.
- **Implement Data Functions:** Create functions for all data operations your app needs. These functions will be `async` and handle the fetching and mutation of data.

    **Example `supabaseService.ts` functions:**
    ```typescript
    import { createClient } from '@supabase/supabase-js';
    // ... import types

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    export const getPosts = async (): Promise<VsPost[]> => {
      const { data, error } = await supabase.from('posts').select('*');
      // ... handle error and transform data
      return data;
    }

    export const addVote = async (userId: string, postId: string, option: 'A' | 'B') => {
      // ... your logic to insert a vote
    }

    // ... other functions like getUser, createPost, addComment, etc.
    ```

### 4. Integrate the Service into the App

- **Location:** The main application logic and state management are centralized in `App.tsx`.
- **Fetch Initial Data:** Replace the `useState` calls that use `INITIAL_POSTS` and `MOCK_USERS` with `useEffect` hooks. These hooks will call your new service functions (e.g., `getPosts()`, `getCurrentUser()`) on component mount to fetch real data.

    **Example in `App.tsx`:**
    ```typescript
    // Before
    // const [posts, setPosts] = useState<VsPost[]>(INITIAL_POSTS);

    // After
    const [posts, setPosts] = useState<VsPost[]>([]);
    useEffect(() => {
      const fetchPosts = async () => {
        const fetchedPosts = await supabaseService.getPosts();
        setPosts(fetchedPosts);
      };
      fetchPosts();
    }, []);
    ```
- **Update Handler Functions:** Modify the handler functions (`handleClassicVote`, `handleToggleSave`, `handleAddComment`, etc.) to call your async service methods. After the backend call succeeds, update the local React state to reflect the change in the UI. This is known as "optimistic updates" or simply re-fetching to keep the UI in sync with the database.

## 📁 Project Structure

Understanding the file structure will help you navigate and develop the project more efficiently.

```
/
├── components/          # React components
│   ├── auth/            # Authentication screens (Login, Signup)
│   ├── common/          # Highly reusable components (Spinner, Icons)
│   ├── BottomNavBar.tsx
│   ├── CreateView.tsx
│   ├── FeedView.tsx
│   ├── PostCard.tsx
│   └── ... (other view and component files)
│
├── services/            # API services
│   └── geminiService.ts   # For interacting with the Google Gemini API
│
├── constants.ts         # Mock data for local development
├── types.ts             # TypeScript type definitions for the app
├── App.tsx              # Main application component, state management, routing logic
├── index.tsx            # React root entry point
├── index.html           # Main HTML file
└── README.md            # You are here
```
