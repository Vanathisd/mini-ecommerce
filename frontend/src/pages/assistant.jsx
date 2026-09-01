import { useEffect, useState } from "react";

import {
    FaComments,
    FaTimes,
    FaPaperPlane
} from "react-icons/fa";

import { useAuth } from "../context/authContext.jsx";

import {
    useCart
} from "../context/CartContext.jsx";

import "../styles/assistant.css";


function Assistant() {

    const { user } =
        useAuth();


    const {
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        increaseQuantity,
        decreaseQuantity
    } =
        useCart();


    const welcomeMessage = {

        sender:
            "bot",

        text:
            "Hi! 👋 I'm the VELORA Shopping Assistant. How can I help you today?"

    };


    const [
        isOpen,
        setIsOpen
    ] =
        useState(false);


    const [
        message,
        setMessage
    ] =
        useState("");


    const [
        messages,
        setMessages
    ] =
        useState([
            welcomeMessage
        ]);


    const [
        loading,
        setLoading
    ] =
        useState(false);


    // ==================================================
    // CHAT KEY
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
            localStorage.getItem(
                chatKey
            );


        if (!savedChat) {

            setMessages([
                welcomeMessage
            ]);

            return;

        }


        try {

            const parsedChat =
                JSON.parse(
                    savedChat
                );


            if (
                Array.isArray(
                    parsedChat
                ) &&
                parsedChat.length > 0
            ) {

                setMessages(
                    parsedChat
                );

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

    }, [user]);


    // ==================================================
    // SAVE CHAT
    // ==================================================

    useEffect(() => {

        if (!user?.id) {

            return;

        }


        if (
            messages.length === 0
        ) {

            return;

        }


        const chatKey =
            getChatKey();


        localStorage.setItem(

            chatKey,

            JSON.stringify(
                messages
            )

        );

    }, [
        messages,
        user
    ]);


    // ==================================================
    // SHOW CART DETECTION
    // ==================================================

    const isShowCartRequest = (
        text
    ) => {

        const lower =
            text
                .toLowerCase()
                .trim();


        return (

            /\b(show|view|see|display)\b.*\b(my\s+)?cart\b/i.test(
                lower
            )

            ||

            /\bwhat('?s| is)\b.*\bin\s+(my\s+)?cart\b/i.test(
                lower
            )

            ||

            /\bwhat\s+do\s+i\s+have\s+in\s+(my\s+)?cart\b/i.test(
                lower
            )

            ||

            /\bcheck\s+(my\s+)?cart\b/i.test(
                lower
            )

            ||

            lower === "cart"

            ||

            lower === "my cart"

        );

    };


    // ==================================================
    // SHOW CART
    // ==================================================

    const showCart = () => {

        if (
            !cart ||
            cart.length === 0
        ) {

            setMessages(
                prev => [

                    ...prev,

                    {

                        sender:
                            "bot",

                        text:
                            "🛒 Your cart is currently empty."

                    }

                ]
            );

            return;

        }


        let cartText =
            "🛒 Here is what's in your cart:\n\n";


        cart.forEach(
            (
                item,
                index
            ) => {

                cartText +=

                    `${index + 1}. ${item.name}\n` +

                    `   Price: ₹${item.price}\n` +

                    `   Quantity: ${item.quantity}\n\n`;

            }
        );


        const total =
            cart.reduce(

                (
                    sum,
                    item
                ) =>

                    sum +

                    Number(
                        item.price || 0
                    ) *

                    Number(
                        item.quantity || 0
                    ),

                0

            );


        cartText +=
            `Total: ₹${total.toLocaleString("en-IN")}`;


        setMessages(
            prev => [

                ...prev,

                {

                    sender:
                        "bot",

                    text:
                        cartText

                }

            ]
        );

    };


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


        setMessages(
            prev => [

                ...prev,

                {

                    sender:
                        "user",

                    text:
                        userMessage

                }

            ]
        );


        setMessage("");


        // ==================================================
        // SHOW CART
        // ==================================================

        if (
            isShowCartRequest(
                userMessage
            )
        ) {

            showCart();

            return;

        }


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

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                message:
                                    userMessage

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
            // ADD TO CART
            // ==================================================

            if (

                data.action ===
                "add_to_cart"

                &&

                data.product

            ) {

                const quantity =
                    Number(
                        data.quantity || 1
                    );


                const productId =
                    data.product._id ||
                    data.product.id;


                const existingProduct =
                    cart.find(

                        item =>

                            (
                                item._id ||
                                item.id
                            ) === productId

                    );


                const currentQuantity =
                    existingProduct
                        ? Number(
                            existingProduct.quantity || 0
                        )
                        : 0;


                const stock =
                    Number(
                        data.product.stock
                    );


                const requestedTotal =
                    currentQuantity +
                    quantity;


                console.log(
                    "ADD QUANTITY:",
                    quantity
                );


                console.log(
                    "CURRENT QUANTITY:",
                    currentQuantity
                );


                console.log(
                    "STOCK:",
                    stock
                );


                if (
                    Number.isFinite(stock) &&
                    requestedTotal > stock
                ) {

                    setMessages(
                        prev => [

                            ...prev,

                            {

                                sender:
                                    "bot",

                                text:
                                    `⚠️ Only ${stock} ${data.product.name} are available in stock. You already have ${currentQuantity} in your cart.`

                            }

                        ]
                    );

                }

                else {

                    addToCart(
                        data.product,
                        quantity
                    );


                    setMessages(
                        prev => [

                            ...prev,

                            {

                                sender:
                                    "bot",

                                text:
                                    `✅ ${quantity} ${data.product.name} ${quantity === 1 ? "has" : "have"} been added to your cart.`

                            }

                        ]
                    );

                }

            }


            // ==================================================
            // INCREASE QUANTITY
            // ==================================================

            else if (

                data.action ===
                "increase_quantity"

                &&

                data.product

            ) {

                const quantity =
                    Number(
                        data.quantity || 1
                    );


                const productId =
                    data.product._id ||
                    data.product.id;


                const existingProduct =
                    cart.find(

                        item =>

                            (
                                item._id ||
                                item.id
                            ) === productId

                    );


                if (!existingProduct) {

                    setMessages(
                        prev => [

                            ...prev,

                            {

                                sender:
                                    "bot",

                                text:
                                    `ℹ️ ${data.product.name} is not currently in your cart.`

                            }

                        ]
                    );

                }

                else {

                    const currentQuantity =
                        Number(
                            existingProduct.quantity || 0
                        );


                    const stock =
                        Number(
                            data.product.stock
                        );


                    const requestedTotal =
                        currentQuantity +
                        quantity;


                    console.log(
                        "INCREASE BY:",
                        quantity
                    );


                    console.log(
                        "CURRENT QUANTITY:",
                        currentQuantity
                    );


                    console.log(
                        "REQUESTED TOTAL:",
                        requestedTotal
                    );


                    console.log(
                        "STOCK:",
                        stock
                    );


                    if (
                        Number.isFinite(stock) &&
                        requestedTotal > stock
                    ) {

                        setMessages(
                            prev => [

                                ...prev,

                                {

                                    sender:
                                        "bot",

                                    text:
                                        `⚠️ Cannot increase ${data.product.name}. Only ${stock} are available, and you already have ${currentQuantity} in your cart.`

                                }

                            ]
                        );

                    }

                    else {

                        increaseQuantity(
                            productId,
                            quantity
                        );


                        setMessages(
                            prev => [

                                ...prev,

                                {

                                    sender:
                                        "bot",

                                    text:
                                        `➕ ${data.product.name} quantity has been increased by ${quantity}.`

                                }

                            ]
                        );

                    }

                }

            }


            // ==================================================
            // DECREASE QUANTITY
            // ==================================================

            else if (

                data.action ===
                "decrease_quantity"

                &&

                data.product

            ) {

                const quantity =
                    Number(
                        data.quantity || 1
                    );


                const productId =
                    data.product._id ||
                    data.product.id;


                const existingProduct =
                    cart.find(

                        item =>

                            (
                                item._id ||
                                item.id
                            ) === productId

                    );


                if (!existingProduct) {

                    setMessages(
                        prev => [

                            ...prev,

                            {

                                sender:
                                    "bot",

                                text:
                                    `ℹ️ ${data.product.name} is not currently in your cart.`

                            }

                        ]
                    );

                }

                else {

                    const currentQuantity =
                        Number(
                            existingProduct.quantity || 0
                        );


                    if (
                        currentQuantity <= 0
                    ) {

                        setMessages(
                            prev => [

                                ...prev,

                                {

                                    sender:
                                        "bot",

                                    text:
                                        `ℹ️ ${data.product.name} is not currently in your cart.`

                                }

                            ]
                        );

                    }

                    else {

                        const actualDecrease =
                            Math.min(
                                quantity,
                                currentQuantity
                            );


                        decreaseQuantity(
                            productId,
                            actualDecrease
                        );


                        const remainingQuantity =
                            currentQuantity -
                            actualDecrease;


                        if (
                            remainingQuantity === 0
                        ) {

                            setMessages(
                                prev => [

                                    ...prev,

                                    {

                                        sender:
                                            "bot",

                                        text:
                                            `🗑️ ${data.product.name} has been removed from your cart because its quantity reached 0.`

                                    }

                                ]
                            );

                        }

                        else {

                            setMessages(
                                prev => [

                                    ...prev,

                                    {

                                        sender:
                                            "bot",

                                        text:
                                            `➖ ${data.product.name} quantity has been decreased by ${actualDecrease}.`

                                    }

                                ]
                            );

                        }

                    }

                }

            }


            // ==================================================
            // REMOVE SINGLE PRODUCT
            // ==================================================

            else if (

                data.action ===
                "remove_from_cart"

                &&

                data.product

            ) {

                const productId =
                    data.product._id ||
                    data.product.id;


                const exists =
                    cart.some(

                        item =>

                            (
                                item._id ||
                                item.id
                            ) === productId

                    );


                if (!exists) {

                    setMessages(
                        prev => [

                            ...prev,

                            {

                                sender:
                                    "bot",

                                text:
                                    `ℹ️ ${data.product.name} is not currently in your cart.`

                            }

                        ]
                    );

                }

                else {

                    removeFromCart(
                        productId
                    );


                    setMessages(
                        prev => [

                            ...prev,

                            {

                                sender:
                                    "bot",

                                text:
                                    `🗑️ ${data.product.name} has been removed from your cart.`

                            }

                        ]
                    );

                }

            }


            // ==================================================
            // CLEAR ENTIRE CART
            // ==================================================

            else if (

                data.action ===
                "clear_cart"

            ) {

                if (
                    !cart ||
                    cart.length === 0
                ) {

                    setMessages(
                        prev => [

                            ...prev,

                            {

                                sender:
                                    "bot",

                                text:
                                    "🛒 Your cart is already empty."

                            }

                        ]
                    );

                }

                else {

                    clearCart();


                    setMessages(
                        prev => [

                            ...prev,

                            {

                                sender:
                                    "bot",

                                text:
                                    "🗑️ All products have been removed from your cart."

                            }

                        ]
                    );

                }

            }


            // ==================================================
            // NORMAL RESPONSE
            // ==================================================

            else {

                setMessages(
                    prev => [

                        ...prev,

                        {

                            sender:
                                "bot",

                            text:
                                data.response ||

                                "Sorry, I couldn't understand that."

                        }

                    ]
                );

            }

        }

        catch (error) {

            console.error(
                "Chatbot error:",
                error
            );


            setMessages(
                prev => [

                    ...prev,

                    {

                        sender:
                            "bot",

                        text:
                            "Sorry, I'm unable to respond right now. Please try again."

                    }

                ]
            );

        }

        finally {

            setLoading(false);

        }

    };


    // ==================================================
    // CLOSE CHAT
    // ==================================================

    const closeChat = () => {

        setIsOpen(false);

        setMessage("");


        if (!user?.id) {

            setMessages([
                welcomeMessage
            ]);

        }

    };


    // ==================================================
    // OPEN CHAT
    // ==================================================

    const openChat = () => {

        if (!user?.id) {

            setMessages([
                welcomeMessage
            ]);

            setMessage("");

        }


        setIsOpen(true);

    };


    // ==================================================
    // ENTER KEY
    // ==================================================

    const handleKeyDown = (
        e
    ) => {

        if (

            e.key ===
            "Enter"

            &&

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

                    onClick={
                        openChat
                    }

                >

                    <FaComments />

                </button>

            )}


            {isOpen && (

                <div
                    className="chatbot-container"
                >

                    <div
                        className="chatbot-header"
                    >

                        <div>

                            <h3>
                                VELORA Assistant
                            </h3>

                            <span>
                                Online
                            </span>

                        </div>


                        <button

                            onClick={
                                closeChat
                            }

                            className="chatbot-close"

                        >

                            <FaTimes />

                        </button>

                    </div>


                    <div
                        className="chatbot-messages"
                    >

                        {messages.map(

                            (
                                msg,
                                index
                            ) => (

                                <div

                                    key={
                                        index
                                    }

                                    className={
                                        `chat-message ${msg.sender}`
                                    }

                                >

                                    {msg.text}

                                </div>

                            )

                        )}


                        {loading && (

                            <div
                                className="chat-message bot"
                            >

                                Thinking...

                            </div>

                        )}

                    </div>


                    <div
                        className="chatbot-input"
                    >

                        <input

                            type="text"

                            value={
                                message
                            }

                            placeholder="Ask about products..."

                            onChange={
                                e =>
                                    setMessage(
                                        e.target.value
                                    )
                            }

                            onKeyDown={
                                handleKeyDown
                            }

                            disabled={
                                loading
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