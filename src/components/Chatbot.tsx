import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getChatHistory, sendChatMessage } from "../services/apiService";

// This should match the structure returned by the backend
interface Message {
    content: string;
    role: "user" | "bot";
}

const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const { currentUser } = useAuth(); // Get user from auth context

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Fetch chat history when the component mounts and user is logged in
    useEffect(() => {
        if (currentUser) {
            const fetchHistory = async () => {
                setIsLoading(true);
                try {
                    const history = await getChatHistory();
                    // The backend sends 'content' and 'role', but the component used 'text' and 'sender'
                    // We need to map the fields to match the component's expected structure
                    const formattedHistory = history.map(h => ({ content: h.content, role: h.role as 'user' | 'bot' }));
                    setMessages(formattedHistory);
                } catch (error) {
                    console.error("Failed to fetch chat history:", error);
                    setMessages([{ content: "Could not load chat history.", role: "bot" }]);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchHistory();
        }
    }, [currentUser]); // Re-run if the user logs in or out

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !currentUser) return;

        const userMessage: Message = { content: input, role: "user" };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Use the new authenticated API service
            const data = await sendChatMessage(input);
            const botMessage: Message = { content: data.reply, role: "bot" };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Failed to send message:", error);
            const errorMessage: Message = {
                content: "Sorry, I'm having trouble connecting. Please try again later.",
                role: "bot",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[80vh] w-full max-w-2xl mx-auto rounded-lg ">
            {/* Message Display Area */}
            <div className="relative flex-1 p-4 overflow-y-auto">
                {messages.length === 0 && !currentUser ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <h2 className="text-2xl font-bold text-primary mb-2">
                           Movli AI
                        </h2>
                        <p className="text-gray-400 max-w-sm">
                           Please log in to chat with the AI.
                        </p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <h2 className="text-2xl font-bold text-primary mb-2">
                            Movli AI
                        </h2>
                        <p className="text-gray-400 max-w-sm">
                            Ask me to recommend a movie, find an actor's
                            filmography, or anything else you can think of!
                        </p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${
                                msg.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                            } mb-4`}
                        >
                            <div
                                className={`max-w-xs lg:max-w-md px-5 py-3 rounded-lg font-rubik ${
                                    msg.role === "user"
                                        ? "bg-accent text-primary"
                                        : "bg-gray-700 text-gray-200"
                                }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">
                                    {msg.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}

                {isLoading && messages.length > 0 && (
                    <div className="flex justify-start mb-4">
                        <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-700 text-gray-200">
                            <p className="text-sm animate-pulse">Thinking...</p>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-3 border-1 rounded-xl border-gray-700 ">
                <form onSubmit={handleSend} className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={!currentUser ? "Please log in to chat" : "Ask me anything about movies..."}
                        className="flex-1 px-4 py-2 bg-white border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        disabled={isLoading || !currentUser} // Disable if not logged in
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim() || !currentUser} // Disable if not logged in
                        className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chatbot;
