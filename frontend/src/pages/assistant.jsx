import { useEffect, useState } from "react";
import {
    FaComments,
    FaTimes,
    FaPaperPlane
} from "react-icons/fa";

import { useAuth } from "../context/authContext.jsx";
import { useCart } from "../context/CartContext.jsx";

import "../styles/assistant.css";


function Assistant() {

    const { user } = useAuth();

    const { addToCart } = useCart();


    const welcomeMessage = {
        sender: "bot",
        text:
            "Hi! 👋 I'm the VELORA Shopping Assistant. How can I help you today?"
    };


    const [isOpen, setIsOpen] = useState(false);

    const [message, setMessage] = useState("");

    const [messages, setMessages] = useState([
        welcomeMessage
    ]);

    const [loading, setLoading] = useState(false);


    // ==================================================
    // GET USER CHAT KEY
    // ==================================================

    const getChatKey = () => {

        if (user?.id) {

            return `assistant_chat_${user.id}`;

        }

        return null;

    };


    // ==================================================
    // LOAD CHAT
    // ==================================================

    useEffect(() => {

        /*
         * IMPORTANT:
         *
         * Logged-in users:
         *     Load chat from localStorage.
         *
         * Guest users:
         *     DO NOT load from localStorage.
         *     Always start a fresh chat.
         */

        if (!user?.id) {

            setMessages([
                welcomeMessage
            ]);

            setMessage("");

            return;

        }


        const chatKey =
            getChatKey();


        const savedChat =
            localStorage.getItem(chatKey);


        if (savedChat) {

            try {

                const parsedChat =
                    JSON.parse(savedChat);


                if (
                    Array.isArray(parsedChat) &&
                    parsedChat.length > 0
                ) {

                    setMessages(parsedChat);

                }

                else {

                    setMessages([
                        welcomeMessage
                    ]);

                }

            }

            catch (error) {

                console.error(
                    "Failed to load assistant chat:",
                    error
                );

                setMessages([
                    welcomeMessage
                ]);

            }

        }

        else {

            setMessages([
                welcomeMessage
            ]);

        }

    }, [user]);


    // ==================================================
    // SAVE CHAT ONLY FOR LOGGED-IN USERS
    // ==================================================

    useEffect(() => {

        /*
         * Guest chat is intentionally NOT saved.
         *
         * Therefore:
         *
         * Guest closes website
         *       ↓
         * Browser destroys React state
         *       ↓
         * Website opened again
         *       ↓
         * Fresh chat
         *
         * Logged-in user
         *       ↓
         * Chat saved in localStorage
         *       ↓
         * Can continue previous chat
         */

        if (!user?.id) {

            return;

        }


        if (messages.length === 0) {

            return;

        }


        const chatKey =
            getChatKey();


        localStorage.setItem(
            chatKey,
            JSON.stringify(messages)
        );

    }, [messages, user]);


    // ==================================================
    // SEND MESSAGE
    // ==================================================

    const sendMessage = async () => {

        if (
            !message.trim() ||
            loading
        ) {

            return;

        }


        const userMessage =
            message.trim();


        // Show user message immediately

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

            console.log(
                "Sending message to AI:",
                userMessage
            );


            const response =
                await fetch(
                    "http://localhost:5000/ai/chat",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            message: userMessage
                        })

                    }
                );


            const data =
                await response.json();


            console.log(
                "AI response:",
                data
            );


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Something went wrong"
                );

            }


            // ==================================================
            // ADD TO CART ACTION
            // ==================================================

            if (
                data.action === "add_to_cart" &&
                data.product
            ) {

                console.log(
                    "ADDING TO CART:",
                    data.product
                );


                addToCart(
                    data.product
                );


                setMessages(prev => [

                    ...prev,

                    {
                        sender: "bot",

                        text:
                            `✅ ${data.product.name} has been added to your cart.`
                    }

                ]);

            }

            // ==================================================
            // NORMAL AI RESPONSE
            // ==================================================

            else {

                setMessages(prev => [

                    ...prev,

                    {
                        sender: "bot",

                        text:
                            data.response ||
                            "Sorry, I couldn't understand that."
                    }

                ]);

            }

        }

        catch (error) {

            console.error(
                "Chatbot error:",
                error
            );


            setMessages(prev => [

                ...prev,

                {
                    sender: "bot",

                    text:
                        "Sorry, I'm unable to respond right now. Please try again."
                }

            ]);

        }

        finally {

            setLoading(false);

        }

    };


    // ==================================================
    // CLOSE CHAT
    // ==================================================

    const closeChat = () => {

        console.log(
            "CHAT CLOSE BUTTON CLICKED"
        );


        setIsOpen(false);

        setMessage("");


        /*
         * Clear only the current UI chat.
         *
         * For logged-in users:
         * localStorage remains untouched,
         * so reopening the chat restores history.
         *
         * For guests:
         * there is no localStorage,
         * so closing/reopening starts fresh.
         */

        if (!user?.id) {

            setMessages([
                welcomeMessage
            ]);

        }

    };


    // ==================================================
    // ENTER KEY
    // ==================================================

    const handleKeyDown = (e) => {

        if (
            e.key === "Enter" &&
            !e.shiftKey
        ) {

            e.preventDefault();

            sendMessage();

        }

    };


    // ==================================================
    // UI
    // ==================================================

    return (

        <>

            {!isOpen && (

                <button
                    className="chatbot-button"
                    onClick={() =>
                        setIsOpen(true)
                    }
                >

                    <FaComments />

                </button>

            )}


            {isOpen && (

                <div className="chatbot-container">


                    <div className="chatbot-header">

                        <div>

                            <h3>
                                VELORA Assistant
                            </h3>

                            <span>
                                Online
                            </span>

                        </div>


                        <button
                            onClick={closeChat}
                            className="chatbot-close"
                        >

                            <FaTimes />

                        </button>

                    </div>


                    <div className="chatbot-messages">

                        {messages.map(
                            (msg, index) => (

                                <div
                                    key={index}
                                    className={
                                        `chat-message ${msg.sender}`
                                    }
                                >

                                    {msg.text}

                                </div>

                            )
                        )}


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
                            onChange={(e) =>
                                setMessage(
                                    e.target.value
                                )
                            }
                            onKeyDown={
                                handleKeyDown
                            }
                            disabled={loading}
                        />


                        <button
                            onClick={sendMessage}
                            disabled={
                                loading ||
                                !message.trim()
                            }
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

