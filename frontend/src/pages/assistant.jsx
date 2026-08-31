import { useState } from "react";
import { FaComments, FaTimes, FaPaperPlane } from "react-icons/fa";
import "../styles/assistant.css";


function Assistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([
        {
            sender: "bot",
            text: "Hi! 👋 I'm the VELORA Shopping Assistant. How can I help you today?"
        }
    ]);
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!message.trim() || loading) return;

        const userMessage = message.trim();

        setMessages(prev => [
            ...prev,
            {
                sender: "user",
                text: userMessage
            }
        ]);

        setMessage("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/ai/chat",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        message: userMessage
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            setMessages(prev => [
                ...prev,
                {
                    sender: "bot",
                    text: data.response
                }
            ]);

        } catch (error) {

            console.error("Chatbot error:", error);

            setMessages(prev => [
                ...prev,
                {
                    sender: "bot",
                    text: "Sorry, I'm unable to respond right now. Please try again."
                }
            ]);

        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    return (
        <>
            {!isOpen && (
                <button
                    className="chatbot-button"
                    onClick={() => setIsOpen(true)}
                >
                    <FaComments />
                </button>
            )}

            {isOpen && (
                <div className="chatbot-container">

                    <div className="chatbot-header">
                        <div>
                            <h3>VELORA Assistant</h3>
                            <span>Online</span>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="chatbot-close"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="chatbot-messages">

                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`chat-message ${msg.sender}`}
                            >
                                {msg.text}
                            </div>
                        ))}

                        {loading && (
                            <div className="chat-message bot">
                                Thinking...
                            </div>
                        )}

                    </div>

                    <div className="chatbot-input">

                        <input
                            type="text"
                            value={message}
                            placeholder="Ask about products..."
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                        />

                        <button
                            onClick={sendMessage}
                            disabled={loading || !message.trim()}
                        >
                            <FaPaperPlane />
                        </button>

                    </div>

                </div>
            )}
        </>
    );
}

export default Assistant;