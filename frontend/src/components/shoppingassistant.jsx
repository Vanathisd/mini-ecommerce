import { useState } from "react";

function ShoppingAssistant() {

    const [message, setMessage] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {

        if (!message.trim()) return;

        try {

            setLoading(true);
            setResponse("");

            const res = await fetch(
                "https://mini-ecommerce-backend-yxii.onrender.com/ai/chat",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        message: message
                    })
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.message || "Something went wrong"
                );
            }

            setResponse(data.response);

        } catch (error) {

            console.error("AI Chat Error:", error);

            setResponse(
                "Sorry, something went wrong. Please try again."
            );

        } finally {

            setLoading(false);

        }
    };

    return (
        <div>

            <h2>VELORA Shopping Assistant</h2>

            <input
                type="text"
                placeholder="Ask me about our products..."
                value={message}
                onChange={(e) =>
                    setMessage(e.target.value)
                }
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        sendMessage();
                    }
                }}
            />

            <button
                onClick={sendMessage}
                disabled={loading}
            >
                {loading ? "Searching..." : "Send"}
            </button>

            {response && (
                <div>
                    <p>{response}</p>
                </div>
            )}

        </div>
    );
}

export default ShoppingAssistant;