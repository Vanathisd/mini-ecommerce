import { useEffect, useState } from "react";
import { FaComments, FaTimes, FaPaperPlane } from "react-icons/fa";

import { useAuth } from "../context/authContext.jsx";
import { useCart } from "../context/CartContext.jsx";

import "../styles/assistant.css";


function Assistant() {

    const { user } = useAuth();

    const { addToCart } = useCart();


    const [isOpen, setIsOpen] = useState(false);

    const [message, setMessage] = useState("");

    const [messages, setMessages] = useState([]);

    const [loading, setLoading] = useState(false);



    const getChatKey = () => {

        if (user?.id) {

            return `assistant_chat_${user.id}`;

        }

        return "assistant_chat_guest";

    };



    useEffect(() => {

        const chatKey = getChatKey();

        const savedChat =
            localStorage.getItem(chatKey);


        if (savedChat) {

            try {

                const parsedChat =
                    JSON.parse(savedChat);


                if (Array.isArray(parsedChat)) {

                    setMessages(parsedChat);

                } else {

                    setMessages([
                        {
                            sender: "bot",
                            text:
                                "Hi! 👋 I'm the VELORA Shopping Assistant. How can I help you today?"
                        }
                    ]);

                }

            } catch (error) {

                console.error(
                    "Failed to load assistant chat:",
                    error
                );

                setMessages([
                    {
                        sender: "bot",
                        text:
                            "Hi! 👋 I'm the VELORA Shopping Assistant. How can I help you today?"
                    }
                ]);

            }

        } else {

            setMessages([
                {
                    sender: "bot",
                    text:
                        "Hi! 👋 I'm the VELORA Shopping Assistant. How can I help you today?"
                }
            ]);

        }

    }, [user]);



    useEffect(() => {

        if (messages.length === 0) {
            return;
        }


        const chatKey = getChatKey();


        localStorage.setItem(
            chatKey,
            JSON.stringify(messages)
        );

    }, [messages, user]);



    const sendMessage = async () => {

        if (
            !message.trim() ||
            loading
        ) {

            return;

        }


        const userMessage =
            message.trim();


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


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Something went wrong"
                );

            }


            if (
                data.action === "add_to_cart" &&
                data.product
            ) {

                addToCart(
                    data.product
                );


                setMessages(prev => [

                    ...prev,

                    {
                        sender: "bot",

                        text:
                            `${data.product.name} has been added to your cart.`
                    }

                ]);

            }

            else {


                setMessages(prev => [

                    ...prev,

                    {
                        sender: "bot",
                        text: data.response
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


    const handleKeyDown = (e) => {

        if (
            e.key === "Enter" &&
            !e.shiftKey
        ) {

            e.preventDefault();

            sendMessage();

        }

    };


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
                            onClick={() =>
                                setIsOpen(false)
                            }
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
                                    className={`chat-message ${msg.sender}`}
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

