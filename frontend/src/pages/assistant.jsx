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
        clearCart
    } =
        useCart();


    // ==================================================
    // WELCOME MESSAGE
    // ==================================================

    const welcomeMessage = {

        sender:
            "bot",

        text:
            "Hi! 👋 I'm the VELORA Shopping Assistant. How can I help you today?"

    };


    // ==================================================
    // STATE
    // ==================================================

    const [
        isOpen,
        setIsOpen
    ] = useState(false);


    const [
        message,
        setMessage
    ] = useState("");


    const [
        messages,
        setMessages
    ] = useState([
        welcomeMessage
    ]);


    const [
        loading,
        setLoading
    ] = useState(false);


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
    // LOAD CHAT HISTORY
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
    // SAVE CHAT HISTORY
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
    // SHOW CART REQUEST
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

        );

    };


    // ==================================================
    // CLEAR CART REQUEST
    // ==================================================

    const isClearCartRequest = (
        text
    ) => {

        const lower =
            text
                .toLowerCase()
                .trim();


        const patterns = [

            // clear cart
            /\bclear\s+(my\s+)?cart\b/i,

            // empty cart
            /\bempty\s+(my\s+)?cart\b/i,

            // remove everything
            /\bremove\s+everything\s+from\s+(my\s+)?cart\b/i,

            // remove all products
            /\bremove\s+all\s+(products\s+)?from\s+(my\s+)?cart\b/i,

            // remove all cart items
            /\bremove\s+all\s+(my\s+)?cart\s+items\b/i,

            // delete everything
            /\bdelete\s+everything\s+from\s+(my\s+)?cart\b/i,

            // delete all products
            /\bdelete\s+all\s+(products\s+)?from\s+(my\s+)?cart\b/i,

            // delete all cart items
            /\bdelete\s+all\s+(my\s+)?cart\s+items\b/i,

            // basket
            /\bclear\s+(my\s+)?basket\b/i,

            /\bempty\s+(my\s+)?basket\b/i,

            /\bremove\s+all\s+(products\s+)?from\s+(my\s+)?basket\b/i

        ];


        return patterns.some(
            pattern =>
                pattern.test(
                    lower
                )
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


        // Add user message
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


        // ==================================================
        // CLEAR ALL CART
        // ==================================================

        if (
            isClearCartRequest(
                userMessage
            )
        ) {

            console.log(
                "CLEAR CART REQUEST DETECTED IN ASSISTANT"
            );


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

                return;

            }


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


            return;

        }


        // ==================================================
        // START LOADING
        // ==================================================

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


            if (
                !response.ok
            ) {

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

                console.log(
                    "ADDING TO CART:",
                    data.product
                );


                addToCart(
                    data.product
                );


                setMessages(
                    prev => [

                        ...prev,

                        {

                            sender:
                                "bot",

                            text:
                                `✅ ${data.product.name} has been added to your cart.`

                        }

                    ]
                );

            }


            // ==================================================
            // REMOVE FROM CART
            // ==================================================

            else if (

                data.action ===
                "remove_from_cart"

                &&

                data.product

            ) {

                console.log(
                    "REMOVING FROM CART:",
                    data.product
                );


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
            // CLEAR CART FROM BACKEND ACTION
            // ==================================================

            else if (

                data.action ===
                "clear_cart"

            ) {

                console.log(
                    "CLEAR CART ACTION RECEIVED FROM AI"
                );


                if (
                    cart &&
                    cart.length > 0
                ) {

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

                else {

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

            }


            // ==================================================
            // SHOW CART ACTION
            // ==================================================

            else if (

                data.action ===
                "show_cart"

            ) {

                showCart();

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

        console.log(
            "CHAT CLOSE BUTTON CLICKED"
        );


        setIsOpen(false);

        setMessage("");


        if (
            !user?.id
        ) {

            setMessages([
                welcomeMessage
            ]);

        }

    };


    // ==================================================
    // OPEN CHAT
    // ==================================================

    const openChat = () => {

        if (
            !user?.id
        ) {

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

            e.key === "Enter"

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

                    {/* HEADER */}

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


                    {/* MESSAGES */}

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


                    {/* INPUT */}

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