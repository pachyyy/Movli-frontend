import axios from 'axios';
import { getAuth } from 'firebase/auth';
import app from '../../firebaseConfig';

// Type for movies coming from the TMDB API, used by the Search page.
export type Movie = {
    id: number;
    title: string;
    release_date: string;
    poster_path: string;
    overview: string;
};

// This type defines the structure of a movie object as it is stored in our backend.
export type SavedMovie = {
    imdbID: string;
    Title: string;
    Year: string;
    Poster: string;
    watched: boolean;
};

// The base URL for your Node.js backend API.
// const API_BASE_URL = 'https://movli-backend.onrender.com';
const API_BASE_URL = 'https://movli-backend.onrender.com';

// --- Axios instance with Auth ---
// This instance automatically includes the user's Firebase ID token in the
// headers of every request, which the backend uses for verification.
const authedAxios = axios.create({
    baseURL: API_BASE_URL,
});

// The interceptor attaches the token to outgoing requests.
authedAxios.interceptors.request.use(async (config) => {
    const auth = getAuth(app);
    const user = auth.currentUser;

    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

/**
 * Sends a movie object to the backend to be saved to the current user's watchlist.
 * It transforms the TMDB movie object into a consistent format for the backend.
 * @param movie - The movie data from TMDB.
 * @returns The response data from the server.
 */
export const saveMovie = async (movie: Movie) => {
    try {
        // Transform the TMDB data to match the backend's expected structure
        const movieToSave = {
            imdbID: `tmdb_${movie.id}`, // Create a unique ID using the tmdb id
            Title: movie.title,
            Year: movie.release_date ? movie.release_date.substring(0, 4) : 'N/A',
            Poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '',
            watched: false // New movies are always unwatched by default
        };

        const response = await authedAxios.post('/api/movies', movieToSave);
        return response.data;
    } catch (error) {
        console.error('Error in saveMovie:', error);
        // Re-throw the error so the component can handle it.
        throw error;
    }
};

/**
 * Fetches the list of all saved movies for the currently logged-in user.
 * @returns A promise that resolves to an array of the user's saved movies.
 */
export const getSavedMovies = async (): Promise<SavedMovie[]> => {
    try {
        const response = await authedAxios.get('/api/movies');
        return response.data;
    } catch (error) {
        console.error('Error fetching saved movies:', error);
        throw error;
    }
};

/**
 * Deletes a movie from the user's watchlist.
 * @param movieId - The imdbID of the movie to delete.
 */
export const deleteMovie = async (movieId: string): Promise<void> => {
    try {
        await authedAxios.delete(`/api/movies/${movieId}`);
    } catch (error) {
        console.error(`Error deleting movie with ID ${movieId}:`, error);
        throw error;
    }
};

/**
 * Updates a movie in the user's watchlist (e.g., toggles 'watched' status).
 * @param movieId - The imdbID of the movie to update.
 * @param updates - An object containing the fields to update (e.g., { watched: true }).
 */
export const updateMovie = async (movieId: string, updates: Partial<SavedMovie>): Promise<void> => {
    try {
        await authedAxios.put(`/api/movies/${movieId}`, updates);
    } catch (error) {
        console.error(`Error updating movie with ID ${movieId}:`, error);
        throw error;
    }
};

/**
 * Sends a chat message to the backend.
 * @param prompt The user's message.
 * @returns The bot's reply.
 */
export const sendChatMessage = async (prompt: string): Promise<{ reply: string }> => {
    try {
        const response = await authedAxios.post('/api/chat', { prompt });
        return response.data;
    } catch (error) {
        console.error('Error sending chat message:', error);
        throw error;
    }
};

/**
 * Fetches the user's chat history.
 * @returns A promise that resolves to an array of chat messages.
 */
export const getChatHistory = async (): Promise<{ role: string; content: string }[]> => {
    try {
        const response = await authedAxios.get('/api/chat/history');
        return response.data;
    } catch (error) {
        console.error('Error fetching chat history:', error);
        throw error;
    }
};

