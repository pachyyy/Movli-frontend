# Movli - Your Movie Search Companion

Movli is a web application designed to help you discover movies effortlessly. It allows users to search for movies and access detailed information about them.

## Features

-   **Movie Search:** Find movies by title using a comprehensive search functionality.
-   **TMDB API Integration:** Leverages The Movie Database (TMDB) API to fetch up-to-date movie information, including descriptions, ratings, and more.

## Live Application

You can access the live version of Movli at: [movli.netlify.app](https://movli.netlify.app)

## Local Setup

To run Movli on your local machine, follow these steps:

1.  **Clone the repository:**
    \`\`\`bash
    git clone https://github.com/your-username/movli.git
    cd movli/Movli-frontend
    \`\`\`
    (Note: Replace \`https://github.com/your-username/movli.git\` with the actual repository URL if different.)

2.  **Install dependencies:**
    \`\`\`bash
    npm install
    \`\`\`

3.  **Set up environment variables:**
    Create a \`.env\` file in the \`Movli-frontend\` directory and add your TMDB API key:
    \`\`\`
    VITE_TMDB_API_KEY=YOUR_TMDB_API_KEY
    \`\`\`
    (You can obtain a TMDB API key from [The Movie Database API](https://www.themoviedb.org/documentation/api) website.)

4.  **Run the development server:**
    \`\`\`bash
    npm run dev
    \`\`\`

    This will start the application, and you can access it in your browser, usually at \`http://localhost:5173\`.
