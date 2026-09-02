import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaRobot,
    FaPaperPlane,
    FaTimes,
    FaTrash
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Assistant() {

    const navigate = useNavigate();

    const { user } = useAuth();

    const {
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        increaseQuantity,
        decreaseQuantity
    } = useCart();


    const [isOpen, setIsOpen] = useState(false);

    const [message, setMessage] = useState("");

    const [messages, setMessages] = useState([]);

    const [loading, setLoading] = useState(false);


    const chatKey = user
        ? `assistant_chat_${user.id}`
        : "assistant_chat_guest";



    useEffect(() => {

        const savedChat = localStorage.getItem(chatKey);

        if (savedChat) {

            try {

                setMessages(JSON.parse(savedChat));

            } catch (error) {

                console.error(
                    "Failed to load chat:",
                    error
                );

                setMessages([
                    {
                        sender: "bot",
                        text: "👋 Hi! Welcome to VELORA. How can I help you?"
                    }
                ]);
            }

        } else {

            setMessages([
                {
                    sender: "bot",
                    text: "👋 Hi! Welcome to VELORA. How can I help you?"
                }
            ]);
        }

    }, [chatKey]);


    useEffect(() => {

        if (messages.length > 0) {

            localStorage.setItem(
                chatKey,
                JSON.stringify(messages)
            );

        }

    }, [messages, chatKey]);


    function isShowCartRequest(text) {

        return (
            /\b(show|view|see|display|check)\b.*\bcart\b/i.test(text) ||
            /\bmy\s+cart\b/i.test(text) ||
            /\bcart\b/i.test(text)
        );

    }


    function showCart() {

        if (!cart || cart.length === 0) {

            setMessages(prev => [
                ...prev,
                {
                    sender: "bot",
                    text: "🛒 Your cart is empty."
                }
            ]);

            return;
        }


        let cartText = "🛒 Your cart:\n\n";

        cart.forEach((item, index) => {

            const price = Number(
                item.price || 0
            );

            const quantity = Number(
                item.quantity || 1
            );

            cartText +=
                `${index + 1}. ${item.name}\n` +
                `   Price: ₹${price.toLocaleString("en-IN")}\n` +
                `   Quantity: ${quantity}\n` +
                `   Total: ₹${(
                    price * quantity
                ).toLocaleString("en-IN")}\n\n`;

        });


        const total = cart.reduce(
            (sum, item) =>
                sum +
                Number(item.price || 0) *
                Number(item.quantity || 1),
            0
        );


        cartText +=
            `💰 Cart Total: ₹${total.toLocaleString("en-IN")}`;


        setMessages(prev => [
            ...prev,
            {
                sender: "bot",
                text: cartText
            }
        ]);

    }

    async function sendMessage() {

        const cleanMessage = message.trim();

        if (!cleanMessage || loading) {
            return;
        }



        setMessages(prev => [
            ...prev,
            {
                sender: "user",
                text: cleanMessage
            }
        ]);


        setMessage("");

        setLoading(true);


        try {


            if (isShowCartRequest(cleanMessage)) {

                showCart();

                setLoading(false);

                return;
            }


            const response = await fetch(
                "http://192.168.0.23:5000/ai/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        message: cleanMessage
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Something went wrong"
                );

            }


            console.log(
                "AI Response:",
                data
            );

            if (data.action === "checkout") {

                console.log(
                    "CHECKOUT REQUEST"
                );


                if (!cart || cart.length === 0) {

                    setMessages(prev => [
                        ...prev,
                        {
                            sender: "bot",
                            text:
                                "🛒 Your cart is empty. Please add some products before checkout."
                        }
                    ]);

                    setLoading(false);

                    return;
                }


                setMessages(prev => [
                    ...prev,
                    {
                        sender: "bot",
                        text:
                            "🛍️ Taking you to checkout..."
                    }
                ]);


                setTimeout(() => {

                    navigate("/checkout");

                }, 500);


                setLoading(false);

                return;
            }


            if (data.action === "show_orders") {

                // User must be logged in
                if (!user) {

                    setMessages(prev => [
                        ...prev,
                        {
                            sender: "bot",
                            text:
                                "🔐 Please login to view your orders."
                        }
                    ]);

                    setLoading(false);

                    navigate("/login");

                    return;
                }


                try {

                    const token =
                        localStorage.getItem("token");


                    if (!token) {

                        setMessages(prev => [
                            ...prev,
                            {
                                sender: "bot",
                                text:
                                    "🔐 Your session has expired. Please login again."
                            }
                        ]);

                        setLoading(false);

                        navigate("/login");

                        return;
                    }


                    const orderResponse =
                        await fetch(
                            "http://192.168.0.23:5000/orders/myorders",
                            {
                                method: "GET",

                                headers: {
                                    "Authorization":
                                        `Bearer ${token}`
                                }
                            }
                        );


                    const orderData =
                        await orderResponse.json();


                    if (!orderResponse.ok) {

                        throw new Error(
                            orderData.message ||
                            "Failed to fetch orders"
                        );

                    }


                    const orders =
                        orderData.orders || [];


                    if (orders.length === 0) {

                        setMessages(prev => [
                            ...prev,
                            {
                                sender: "bot",
                                text:
                                    "📦 You haven't placed any orders yet."
                            }
                        ]);

                        setLoading(false);

                        return;
                    }

                    let ordersText =
                        "📦 Here are your orders:\n\n";


                    orders.forEach(
                        (order, index) => {

                            const date =
                                order.createdAt
                                    ? new Date(
                                        order.createdAt
                                    ).toLocaleDateString(
                                        "en-IN"
                                    )
                                    : "N/A";


                            const payment =
                                String(
                                    order.paymentMethod ||
                                    ""
                                ).toUpperCase();


                            const total =
                                Number(
                                    order.totalAmount ||
                                    0
                                );


                            ordersText +=
                                `${index + 1}. Order ID: ${order._id}\n` +
                                `   Status: ${order.orderStatus || "Placed"}\n` +
                                `   Payment: ${payment}\n` +
                                `   Total: ₹${total.toLocaleString("en-IN")}\n` +
                                `   Date: ${date}\n\n`;

                        }
                    );


                    setMessages(prev => [
                        ...prev,
                        {
                            sender: "bot",
                            text: ordersText
                        }
                    ]);

                } catch (error) {

                    console.error(
                        "Fetch orders error:",
                        error
                    );


                    setMessages(prev => [
                        ...prev,
                        {
                            sender: "bot",
                            text:
                                "Sorry, I couldn't fetch your orders right now."
                        }
                    ]);

                }


                setLoading(false);

                return;
            }

            if (data.action === "add_to_cart") {

                if (data.product) {

                    addToCart(
                        data.product
                    );


                    setMessages(prev => [
                        ...prev,
                        {
                            sender: "bot",
                            text:
                                `🛒 ${data.product.name} has been added to your cart.`
                        }
                    ]);

                } else {

                    setMessages(prev => [
                        ...prev,
                        {
                            sender: "bot",
                            text:
                                data.response ||
                                "I couldn't find that product."
                        }
                    ]);

                }


                setLoading(false);

                return;
            }

            if (
                data.action ===
                "increase_quantity"
            ) {

                if (data.product) {

                    increaseQuantity(
                        data.product._id ||
                        data.product.id
                    );


                    setMessages(prev => [
                        ...prev,
                        {
                            sender: "bot",
                            text:
                                `➕ Increased the quantity of ${data.product.name}.`
                        }
                    ]);

                } else {

                    setMessages(prev => [
                        ...prev,
                        {
                            sender: "bot",
                            text:
                                data.response ||
                                "I couldn't find that product in your cart."
                        }
                    ]);

                }


                setLoading(false);

                return;
            }


            if (
                data.action ===
                "decrease_quantity"
            ) {

                if (data.product) {

                    decreaseQuantity(
                        data.product._id ||
                        data.product.id
                    );


                    setMessages(prev => [
                        ...prev,
                        {
                            sender: "bot",
                            text:
                                `➖ Decreased the quantity of ${data.product.name}.`
                        }
                    ]);

                } else {

                    setMessages(prev => [
                        ...prev,
                        {
                            sender: "bot",
                            text:
                                data.response ||
                                "I couldn't find that product in your cart."
                        }
                    ]);

                }


                setLoading(false);

                return;
            }


            if (
                data.action ===
                "remove_from_cart"
            ) {

                if (data.product) {

                    removeFromCart(
                        data.product._id ||
                        data.product.id
                    );


                    setMessages(prev => [
                        ...prev,
                        {
                            sender: "bot",
                            text:
                                `🗑️ ${data.product.name} has been removed from your cart.`
                        }
                    ]);

                } else {

                    setMessages(prev => [
                        ...prev,
                        {
                            sender: "bot",
                            text:
                                data.response ||
                                "I couldn't find that product in your cart."
                        }
                    ]);

                }


                setLoading(false);

                return;
            }


            if (
                data.action ===
                "clear_cart"
            ) {

                clearCart();


                setMessages(prev => [
                    ...prev,
                    {
                        sender: "bot",
                        text:
                            "🗑️ Your cart has been cleared."
                    }
                ]);


                setLoading(false);

                return;
            }


            setMessages(prev => [
                ...prev,
                {
                    sender: "bot",
                    text:
                        data.response ||
                        "Sorry, I couldn't understand that."
                }
            ]);

        } catch (error) {

            console.error(
                "Chatbot error:",
                error
            );


            setMessages(prev => [
                ...prev,
                {
                    sender: "bot",
                    text:
                        "Sorry, something went wrong. Please try again."
                }
            ]);

        } finally {

            setLoading(false);

        }

    }


    function handleKeyDown(e) {

        if (e.key === "Enter") {

            sendMessage();

        }

    }


    function clearChat() {

        const initialMessage = {
            sender: "bot",
            text:
                "👋 Hi! Welcome to VELORA. How can I help you?"
        };


        setMessages([
            initialMessage
        ]);


        localStorage.setItem(
            chatKey,
            JSON.stringify([
                initialMessage
            ])
        );

    }


    return (

        <>


            {!isOpen && (

                <button
                    className="assistant-button"
                    onClick={() =>
                        setIsOpen(true)
                    }
                >

                    <FaRobot />

                </button>

            )}


            {isOpen && (

                <div className="assistant-container">


                    <div className="assistant-header">

                        <div>

                            <FaRobot />

                            <span>
                                VELORA Assistant
                            </span>

                        </div>


                        <div className="assistant-header-actions">

                            <button
                                onClick={clearChat}
                                title="Clear chat"
                            >
                                <FaTrash />
                            </button>


                            <button
                                onClick={() =>
                                    setIsOpen(false)
                                }
                                title="Close"
                            >
                                <FaTimes />
                            </button>

                        </div>

                    </div>


                    <div className="assistant-messages">

                        {messages.map(
                            (msg, index) => (

                                <div
                                    key={index}
                                    className={
                                        msg.sender === "user"
                                            ? "user-message"
                                            : "bot-message"
                                    }
                                >

                                    {msg.text
                                        .split("\n")
                                        .map(
                                            (
                                                line,
                                                lineIndex
                                            ) => (

                                                <div
                                                    key={
                                                        lineIndex
                                                    }
                                                >
                                                    {line}
                                                </div>

                                            )
                                        )}

                                </div>

                            )
                        )}



                        {loading && (

                            <div className="bot-message">

                                Typing...

                            </div>

                        )}

                    </div>


                    <div className="assistant-input">

                        <input
                            type="text"
                            value={message}
                            placeholder="Ask me anything..."
                            onChange={e =>
                                setMessage(
                                    e.target.value
                                )
                            }
                            onKeyDown={
                                handleKeyDown
                            }
                        />


                        <button
                            onClick={
                                sendMessage
                            }
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