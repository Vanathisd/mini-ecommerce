
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

    const navigate =
        useNavigate();

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

        sender: "bot",

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


    const getChatKey = () => {

        if (user?.id) {

            return `assistant_chat_${user.id}`;

        }

        return null;

    };

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
                Array.isArray(parsedChat) &&
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


    useEffect(() => {

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

    }, [
        messages,
        user
    ]);


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


    const showCart = () => {

        if (
            !cart ||
            cart.length === 0
        ) {

            setMessages(
                prev => [

                    ...prev,

                    {
                        sender: "bot",

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
                    sender: "bot",

                    text: cartText
                }

            ]
        );

    };

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
                    sender: "user",

                    text: userMessage
                }

            ]
        );


        setMessage("");


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

                        method: "POST",

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

            if (
                data.action ===
                "checkout"
            ) {

                console.log(
                    "CHECKOUT REQUEST"
                );


                if (
                    !cart ||
                    cart.length === 0
                ) {

                    setMessages(
                        prev => [

                            ...prev,

                            {
                                sender: "bot",

                                text:
                                    "🛒 Your cart is empty. Please add some products before checkout."
                            }

                        ]
                    );

                    return;

                }


                setMessages(
                    prev => [

                        ...prev,

                        {
                            sender: "bot",

                            text:
                                "🛍️ Taking you to checkout..."
                        }

                    ]
                );


                setTimeout(
                    () => {

                        navigate(
                            "/checkout"
                        );

                    },
                    500
                );


                return;

            }

            if (
                data.action ===
                "add_to_cart"
            ) {


                let products = [];


                if (
                    Array.isArray(
                        data.products
                    )
                ) {

                    products =
                        data.products;

                }

                else if (
                    data.product
                ) {

                    products = [
                        data.product
                    ];

                }


                if (
                    products.length === 0
                ) {

                    setMessages(
                        prev => [

                            ...prev,

                            {
                                sender: "bot",

                                text:
                                    "Sorry, I couldn't find that product."
                            }

                        ]
                    );

                    return;

                }


                console.log(
                    "PRODUCTS TO ADD:",
                    products
                );


                const successfullyAdded = [];


                const failedProducts = [];


                products.forEach(
                    product => {

                        if (!product) {
                            return;
                        }


                        const productId =
                            product._id ||
                            product.id;


                        if (!productId) {

                            console.error(
                                "Product ID missing:",
                                product
                            );

                            failedProducts.push(
                                product
                            );

                            return;

                        }



                        const existingProduct =
                            cart.find(

                                item => {

                                    const itemId =
                                        item._id ||
                                        item.id;

                                    return (
                                        String(itemId) ===
                                        String(productId)
                                    );

                                }

                            );


                        const currentQuantity =
                            existingProduct
                                ? Number(
                                    existingProduct.quantity || 0
                                )
                                : 0;


                        const quantity =
                            Number(
                                data.quantity || 1
                            );


                        const validQuantity =
                            Number.isFinite(quantity) &&
                            quantity > 0
                                ? Math.floor(quantity)
                                : 1;


                        const stock =
                            Number(
                                product.stock
                            );


                        const requestedTotal =
                            currentQuantity +
                            validQuantity;


                        console.log(
                            "ADDING PRODUCT:",
                            product.name
                        );

                        console.log(
                            "PRODUCT ID:",
                            productId
                        );

                        console.log(
                            "CURRENT QUANTITY:",
                            currentQuantity
                        );

                        console.log(
                            "ADDING QUANTITY:",
                            validQuantity
                        );

                        console.log(
                            "STOCK:",
                            stock
                        );

                        console.log(
                            "REQUESTED TOTAL:",
                            requestedTotal
                        );


                        if (
                            Number.isFinite(stock) &&
                            requestedTotal > stock
                        ) {

                            console.warn(
                                `Not enough stock for ${product.name}`
                            );


                            failedProducts.push(
                                product
                            );

                            return;

                        }


                        addToCart(
                            product,
                            validQuantity
                        );


                        successfullyAdded.push(
                            product
                        );

                    }
                );


                let addResponse = "";


                if (
                    successfullyAdded.length > 0
                ) {

                    const names =
                        successfullyAdded.map(
                            product =>
                                product.name
                        );


                    if (names.length === 1) {

                        addResponse =
                            `✅ ${names[0]} has been added to your cart.`;

                    }

                    else if (names.length === 2) {

                        addResponse =
                            `✅ ${names[0]} and ${names[1]} have been added to your cart.`;

                    }

                    else {

                        addResponse =
                            `✅ ${names
                                .slice(0, -1)
                                .join(", ")} and ${names.at(-1)} have been added to your cart.`;

                    }

                }


                if (
                    failedProducts.length > 0
                ) {

                    const failedNames =
                        failedProducts.map(
                            product =>
                                product.name
                        );


                    let failedText;


                    if (
                        failedNames.length === 1
                    ) {

                        failedText =
                            `⚠️ ${failedNames[0]} could not be added because of stock availability.`;

                    }

                    else {

                        failedText =
                            `⚠️ ${failedNames.join(", ")} could not be added because of stock availability.`;

                    }


                    if (addResponse) {

                        addResponse +=
                            `\n\n${failedText}`;

                    }

                    else {

                        addResponse =
                            failedText;

                    }

                }


                setMessages(
                    prev => [

                        ...prev,

                        {
                            sender: "bot",

                            text:
                                addResponse ||
                                "Sorry, I couldn't add the products to your cart."
                        }

                    ]
                );


                return;

            }


            if (
                data.action ===
                "increase_quantity"
            ) {

                if (!data.product) {

                    setMessages(
                        prev => [

                            ...prev,

                            {
                                sender: "bot",

                                text:
                                    "Sorry, I couldn't find that product."
                            }

                        ]
                    );

                    return;

                }


                const quantity =
                    Number(
                        data.quantity || 1
                    );


                const productId =
                    data.product._id ||
                    data.product.id;


                const existingProduct =
                    cart.find(

                        item => {

                            const itemId =
                                item._id ||
                                item.id;

                            return (
                                String(itemId) ===
                                String(productId)
                            );

                        }

                    );


                if (!existingProduct) {

                    setMessages(
                        prev => [

                            ...prev,

                            {
                                sender: "bot",

                                text:
                                    `ℹ️ ${data.product.name} is not currently in your cart.`
                            }

                        ]
                    );

                    return;

                }


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
                                sender: "bot",

                                text:
                                    `⚠️ Cannot increase ${data.product.name}. Only ${stock} are available, and you already have ${currentQuantity} in your cart.`
                            }

                        ]
                    );

                    return;

                }


                increaseQuantity(
                    productId,
                    quantity
                );


                setMessages(
                    prev => [

                        ...prev,

                        {
                            sender: "bot",

                            text:
                                `➕ ${data.product.name} quantity has been increased by ${quantity}.`
                        }

                    ]
                );


                return;

            }


            if (
                data.action ===
                "decrease_quantity"
            ) {

                if (!data.product) {

                    setMessages(
                        prev => [

                            ...prev,

                            {
                                sender: "bot",

                                text:
                                    "Sorry, I couldn't find that product."
                            }

                        ]
                    );

                    return;

                }


                const quantity =
                    Number(
                        data.quantity || 1
                    );


                const productId =
                    data.product._id ||
                    data.product.id;


                const existingProduct =
                    cart.find(

                        item => {

                            const itemId =
                                item._id ||
                                item.id;

                            return (
                                String(itemId) ===
                                String(productId)
                            );

                        }

                    );


                if (!existingProduct) {

                    setMessages(
                        prev => [

                            ...prev,

                            {
                                sender: "bot",

                                text:
                                    `ℹ️ ${data.product.name} is not currently in your cart.`
                            }

                        ]
                    );

                    return;

                }


                const currentQuantity =
                    Number(
                        existingProduct.quantity || 1
                    );


                if (
                    currentQuantity <= 0
                ) {

                    setMessages(
                        prev => [

                            ...prev,

                            {
                                sender: "bot",

                                text:
                                    `ℹ️ ${data.product.name} is not currently in your cart.`
                            }

                        ]
                    );

                    return;

                }


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
                                sender: "bot",

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
                                sender: "bot",

                                text:
                                    `➖ ${data.product.name} quantity has been decreased by ${actualDecrease}.`
                            }

                        ]
                    );

                }


                return;

            }

            if (
                data.action ===
                "remove_from_cart"
            ) {

                let products = [];


                if (
                    Array.isArray(
                        data.products
                    )
                ) {

                    products =
                        data.products;

                }

                else if (
                    data.product
                ) {

                    products = [
                        data.product
                    ];

                }


                if (
                    products.length === 0
                ) {

                    setMessages(
                        prev => [

                            ...prev,

                            {
                                sender: "bot",

                                text:
                                    "Sorry, I couldn't find that product."
                            }

                        ]
                    );

                    return;

                }


                console.log(
                    "PRODUCTS TO REMOVE:",
                    products
                );


                const removedProducts = [];


                const notInCartProducts = [];


                products.forEach(
                    product => {

                        if (!product) {
                            return;
                        }


                        const productId =
                            product._id ||
                            product.id;


                        if (!productId) {

                            console.error(
                                "Product ID missing:",
                                product
                            );

                            return;

                        }


                        const exists =
                            cart.some(

                                item => {

                                    const itemId =
                                        item._id ||
                                        item.id;

                                    return (
                                        String(itemId) ===
                                        String(productId)
                                    );

                                }

                            );


                        if (!exists) {

                            notInCartProducts.push(
                                product
                            );

                            return;

                        }


                        removeFromCart(
                            productId
                        );


                        removedProducts.push(
                            product
                        );

                    }
                );


                let removeResponse = "";


                if (
                    removedProducts.length > 0
                ) {

                    const names =
                        removedProducts.map(
                            product =>
                                product.name
                        );


                    if (names.length === 1) {

                        removeResponse =
                            `🗑️ ${names[0]} has been removed from your cart.`;

                    }

                    else if (names.length === 2) {

                        removeResponse =
                            `🗑️ ${names[0]} and ${names[1]} have been removed from your cart.`;

                    }

                    else {

                        removeResponse =
                            `🗑️ ${names
                                .slice(0, -1)
                                .join(", ")} and ${names.at(-1)} have been removed from your cart.`;

                    }

                }


                // ------------------------------------------------
                // PRODUCTS NOT PRESENT IN CART
                // ------------------------------------------------

                if (
                    notInCartProducts.length > 0
                ) {

                    const names =
                        notInCartProducts.map(
                            product =>
                                product.name
                        );


                    let notFoundText;


                    if (
                        names.length === 1
                    ) {

                        notFoundText =
                            `ℹ️ ${names[0]} is not currently in your cart.`;

                    }

                    else {

                        notFoundText =
                            `ℹ️ ${names.join(", ")} are not currently in your cart.`;

                    }


                    if (removeResponse) {

                        removeResponse +=
                            `\n\n${notFoundText}`;

                    }

                    else {

                        removeResponse =
                            notFoundText;

                    }

                }


                setMessages(
                    prev => [

                        ...prev,

                        {
                            sender: "bot",

                            text:
                                removeResponse ||
                                "Sorry, I couldn't remove the products from your cart."
                        }

                    ]
                );


                return;

            }


            if (
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
                                sender: "bot",

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
                            sender: "bot",

                            text:
                                "🗑️ All products have been removed from your cart."
                        }

                    ]
                );


                return;

            }

            setMessages(
                prev => [

                    ...prev,

                    {
                        sender: "bot",

                        text:
                            data.response ||
                            "Sorry, I couldn't understand that."
                    }

                ]
            );

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
                        sender: "bot",

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



    const closeChat = () => {

        setIsOpen(false);

        setMessage("");


        if (!user?.id) {

            setMessages([
                welcomeMessage
            ]);

        }

    };


    const openChat = () => {

        if (!user?.id) {

            setMessages([
                welcomeMessage
            ]);

            setMessage("");

        }


        setIsOpen(true);

    };


    const handleKeyDown = (
        e
    ) => {

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

