const { Ollama } = require("ollama");

const {
    searchProducts,
    getProductDetails,
    findProductFromMessage,
    findProductsFromCartMessage
} = require("./producttools");

const ollama = new Ollama({
    host: "http://127.0.0.1:11434"
});


async function askShoppingAgent(message) {

    try {

        const cleanMessage = String(message || "").trim();

        if (!cleanMessage) {
            return {
                response: "Please tell me what you are looking for.",
                action: "none"
            };
        }


        // ==========================================
        // GREETING
        // ==========================================

        if (isGreeting(cleanMessage)) {

            const greetingResponse = await ollama.chat({
                model: "llama3.2:3b",
                messages: [
                    {
                        role: "system",
                        content:
                            "You are VELORA shopping assistant. " +
                            "Reply to greetings in a short, friendly way. " +
                            "Do not mention products unless asked."
                    },
                    {
                        role: "user",
                        content: cleanMessage
                    }
                ]
            });

            return {
                response: greetingResponse.message.content,
                action: "none"
            };
        }


        // ==========================================
        // CLEAR CART
        // ==========================================

        if (isClearCartRequest(cleanMessage)) {

            return {
                response: "Your cart has been cleared.",
                action: "clear_cart"
            };
        }


        // ==========================================
        // CHECKOUT
        // ==========================================

        if (isCheckoutRequest(cleanMessage)) {

            return {
                response: "Taking you to checkout.",
                action: "checkout"
            };
        }


        // ==========================================
        // SHOW MY ORDERS
        // ==========================================

        if (isShowOrdersRequest(cleanMessage)) {

            return {
                response: "Fetching your orders...",
                action: "show_orders"
            };
        }


        // ==========================================
        // DECREASE CART QUANTITY
        // ==========================================

        const decreaseCartRequest =
            isDecreaseCartRequest(cleanMessage);

        if (decreaseCartRequest) {

            const productSearchText =
                extractProductNameFromQuantityMessage(
                    cleanMessage,
                    "decrease"
                );

            let detectedProduct = null;

            if (productSearchText) {

                detectedProduct =
                    await findProductFromMessage(
                        productSearchText
                    );
            }

            if (!detectedProduct) {

                detectedProduct =
                    await findProductFromMessage(
                        cleanMessage
                    );
            }

            if (!detectedProduct) {

                return {
                    response:
                        "Sorry, I couldn't find that product in VELORA.",
                    action: "none"
                };
            }

            const latestProduct =
                await getProductDetails(
                    detectedProduct.name
                );

            if (!latestProduct) {

                return {
                    response:
                        `Sorry, I couldn't find ${detectedProduct.name} in VELORA.`,
                    action: "none"
                };
            }

            const quantity =
                extractQuantity(
                    cleanMessage,
                    "decrease"
                );

            return {
                response:
                    `${latestProduct.name} quantity will be decreased by ${quantity}.`,
                action: "decrease_quantity",
                quantity,
                product: latestProduct
            };
        }


        // ==========================================
        // INCREASE CART QUANTITY
        // ==========================================

        const increaseCartRequest =
            isIncreaseCartRequest(cleanMessage);

        if (increaseCartRequest) {

            const productSearchText =
                extractProductNameFromQuantityMessage(
                    cleanMessage,
                    "increase"
                );

            let detectedProduct = null;

            if (productSearchText) {

                detectedProduct =
                    await findProductFromMessage(
                        productSearchText
                    );
            }

            if (!detectedProduct) {

                detectedProduct =
                    await findProductFromMessage(
                        cleanMessage
                    );
            }

            if (!detectedProduct) {

                return {
                    response:
                        "Sorry, I couldn't find that product in VELORA.",
                    action: "none"
                };
            }

            const latestProduct =
                await getProductDetails(
                    detectedProduct.name
                );

            if (!latestProduct) {

                return {
                    response:
                        `Sorry, I couldn't find ${detectedProduct.name} in VELORA.`,
                    action: "none"
                };
            }

            const quantity =
                extractQuantity(
                    cleanMessage,
                    "increase"
                );

            if (
                latestProduct.stock !== undefined &&
                latestProduct.stock < quantity
            ) {

                return {
                    response:
                        `Sorry, only ${latestProduct.stock} units of ${latestProduct.name} are available.`,
                    action: "none"
                };
            }

            return {
                response:
                    `${latestProduct.name} quantity will be increased by ${quantity}.`,
                action: "increase_quantity",
                quantity,
                product: latestProduct
            };
        }


        // ==========================================
        // ADD TO CART
        // ==========================================

        const addToCartRequest =
            isAddToCartRequest(cleanMessage);

        if (addToCartRequest) {

            const productSearchText =
                extractProductNameFromCartMessage(
                    cleanMessage
                );

            let detectedProducts = [];


            if (productSearchText) {

                detectedProducts =
                    await findProductsFromCartMessage(
                        productSearchText
                    );
            }


            if (detectedProducts.length === 0) {

                const singleProduct =
                    await findProductFromMessage(
                        cleanMessage
                    );

                if (singleProduct) {

                    detectedProducts = [
                        singleProduct
                    ];
                }
            }


            if (detectedProducts.length === 0) {

                return {
                    response:
                        "Sorry, I couldn't find that product in VELORA.",
                    action: "none"
                };
            }


            const latestProducts = [];

            for (const product of detectedProducts) {

                const latestProduct =
                    await getProductDetails(
                        product.name
                    );

                if (latestProduct) {

                    latestProducts.push(
                        latestProduct
                    );
                }
            }


            if (latestProducts.length === 0) {

                return {
                    response:
                        "Sorry, I couldn't find those products in VELORA.",
                    action: "none"
                };
            }


            const outOfStockProducts =
                latestProducts.filter(
                    product =>
                        product.stock !== undefined &&
                        product.stock <= 0
                );


            if (outOfStockProducts.length > 0) {

                const outOfStockNames =
                    outOfStockProducts.map(
                        product => product.name
                    );

                return {
                    response:
                        `${outOfStockNames.join(", ")} ${outOfStockNames.length === 1 ? "is" : "are"} currently out of stock.`,
                    action: "none"
                };
            }


            const productNames =
                latestProducts.map(
                    product => product.name
                );

            let response;


            if (productNames.length === 1) {

                response =
                    `${productNames[0]} has been added to your cart.`;

            } else if (productNames.length === 2) {

                response =
                    `${productNames[0]} and ${productNames[1]} have been added to your cart.`;

            } else {

                response =
                    `${productNames
                        .slice(0, -1)
                        .join(", ")} and ${productNames.at(-1)} have been added to your cart.`;
            }


            return {
                response,
                action: "add_to_cart",
                products: latestProducts
            };
        }


        // ==========================================
        // REMOVE FROM CART
        // ==========================================

        const removeFromCartRequest =
            isRemoveFromCartRequest(cleanMessage);

        if (removeFromCartRequest) {

            const productSearchText =
                extractProductNameFromRemoveMessage(
                    cleanMessage
                );

            let detectedProducts = [];


            if (productSearchText) {

                detectedProducts =
                    await findProductsFromCartMessage(
                        productSearchText
                    );
            }


            if (detectedProducts.length === 0) {

                const singleProduct =
                    await findProductFromMessage(
                        cleanMessage
                    );

                if (singleProduct) {

                    detectedProducts = [
                        singleProduct
                    ];
                }
            }


            if (detectedProducts.length === 0) {

                return {
                    response:
                        "Sorry, I couldn't find that product in VELORA.",
                    action: "none"
                };
            }


            const latestProducts = [];

            for (const product of detectedProducts) {

                const latestProduct =
                    await getProductDetails(
                        product.name
                    );

                if (latestProduct) {

                    latestProducts.push(
                        latestProduct
                    );
                }
            }


            if (latestProducts.length === 0) {

                return {
                    response:
                        "Sorry, I couldn't find those products in VELORA.",
                    action: "none"
                };
            }


            const productNames =
                latestProducts.map(
                    product => product.name
                );

            let response;


            if (productNames.length === 1) {

                response =
                    `${productNames[0]} has been removed from your cart.`;

            } else if (productNames.length === 2) {

                response =
                    `${productNames[0]} and ${productNames[1]} have been removed from your cart.`;

            } else {

                response =
                    `${productNames
                        .slice(0, -1)
                        .join(", ")} and ${productNames.at(-1)} have been removed from your cart.`;
            }


            return {
                response,
                action: "remove_from_cart",
                products: latestProducts
            };
        }


        // ==========================================
        // SPECIFIC PRODUCT QUESTION
        // ==========================================

        if (isSpecificProductQuestion(cleanMessage)) {

            const product =
                await findProductFromMessage(
                    cleanMessage
                );

            if (!product) {

                return {
                    response:
                        "Sorry, I couldn't find that product in VELORA.",
                    action: "none"
                };
            }


            const detailType =
                detectDetailType(cleanMessage);


            // ==========================================
            // PRICE
            // ==========================================

            if (detailType === "price") {

                return {
                    response:
                        `${product.name} is priced at ₹${product.price}.`,
                    action: "product_info",
                    product
                };
            }


            // ==========================================
            // STOCK
            // ==========================================

            if (detailType === "stock") {

                return {
                    response:
                        `${product.name} has ${product.stock} units available.`,
                    action: "product_info",
                    product
                };
            }


            // ==========================================
            // DESCRIPTION
            // ==========================================

            if (detailType === "description") {

                return {
                    response:
                        product.description ||
                        `${product.name} is available in VELORA.`,
                    action: "product_info",
                    product
                };
            }


            // ==========================================
            // GENERAL DETAILS
            // ==========================================

            return {
                response:
                    `${product.name} is available for ₹${product.price}. ${product.description || ""}`,
                action: "product_info",
                product
            };
        }


        // ==========================================
        // AI PRODUCT SEARCH
        // ==========================================

        const aiResponse =
            await ollama.chat({

                model: "llama3.2:3b",

                messages: [

                    {
                        role: "system",

                        content: `
You are VELORA's shopping assistant.

Your job is to understand the user's shopping request
and return ONLY valid JSON.

Available fields:

{
  "intent": "search",
  "category": "",
  "subcategory": "",
  "minPrice": null,
  "maxPrice": null,
  "search": "",
  "isNewArrival": false,
  "sortBy": ""
}

Rules:

1. For product searches use intent "search".
2. Do not invent products.
3. If user asks for women's products, category should be "Women".
4. If user asks for men's products, category should be "Men".
5. If user asks for accessories, category should be "Accessories".
6. Extract price limits when present.
7. Extract subcategory when present.
8. Extract useful search words into "search".
9. Return JSON only.
`
                    },

                    {
                        role: "user",
                        content: cleanMessage
                    }

                ]
            });


        let parsed;


        // ==========================================
        // PARSE AI RESPONSE
        // ==========================================

        try {

            let text =
                aiResponse.message.content.trim();

            text =
                text
                    .replace(/^```json/i, "")
                    .replace(/^```/i, "")
                    .replace(/```$/i, "")
                    .trim();

            parsed =
                JSON.parse(text);

        } catch (error) {

            return {
                response:
                    "Sorry, I couldn't understand your request. Please try again.",
                action: "none"
            };
        }


        // ==========================================
        // SEARCH PRODUCTS
        // ==========================================

        if (parsed.intent === "search") {

            const products =
                await searchProducts({

                    category:
                        parsed.category || "",

                    subcategory:
                        parsed.subcategory || "",

                    minPrice:
                        parsed.minPrice ?? null,

                    maxPrice:
                        parsed.maxPrice ?? null,

                    search:
                        parsed.search || "",

                    isNewArrival:
                        parsed.isNewArrival || false,

                    sortBy:
                        parsed.sortBy || ""
                });


            if (!products || products.length === 0) {

                return {
                    response:
                        "Sorry, I couldn't find any matching products in VELORA.",
                    action: "search_results",
                    products: []
                };
            }


            const limitedProducts =
                products.slice(0, 3);


            let response =
                "Here are some products I found:\n\n";


            limitedProducts.forEach(
                (product, index) => {

                    response +=
                        `${index + 1}. ${product.name}\n` +
                        `   Price: ₹${product.price}\n` +
                        `   Stock: ${product.stock}\n\n`;
                }
            );


            return {
                response,
                action: "search_results",
                products: limitedProducts
            };
        }


        // ==========================================
        // DEFAULT
        // ==========================================

        return {
            response:
                "Sorry, I couldn't understand your request. Please try again.",
            action: "none"
        };


    } catch (error) {

        console.error(
            "Shopping Agent Error:",
            error
        );

        return {
            response:
                "Something went wrong while processing your request.",
            action: "none"
        };
    }
}


// ==========================================
// GREETING DETECTION
// ==========================================

function isGreeting(message) {

    return /\b(hi|hello|hey|hii|good morning|good afternoon|good evening)\b/i
        .test(message);
}


// ==========================================
// ADD TO CART DETECTION
// ==========================================

function isAddToCartRequest(message) {

    return (
        /\b(add|put|place)\b.*\b(to|in)\s+(my\s+)?(cart|basket)\b/i.test(message) ||
        /\b(buy)\b/i.test(message)
    );
}


// ==========================================
// REMOVE FROM CART DETECTION
// ==========================================

function isRemoveFromCartRequest(message) {

    return (
        /\bremove\b.*\bfrom\s+(my\s+)?cart\b/i.test(message) ||
        /\bremove\b.*\bfrom\s+(my\s+)?basket\b/i.test(message) ||

        /\bdelete\b.*\bfrom\s+(my\s+)?cart\b/i.test(message) ||
        /\bdelete\b.*\bfrom\s+(my\s+)?basket\b/i.test(message) ||

        /\btake\b.*\bout\s+of\s+(my\s+)?cart\b/i.test(message) ||

        /\bi\s+don't\s+want\b/i.test(message) ||
        /\bi\s+do\s+not\s+want\b/i.test(message)
    );
}


// ==========================================
// CLEAR CART DETECTION
// ==========================================

function isClearCartRequest(message) {

    return (
        /\b(clear|empty)\b.*\b(cart|basket)\b/i.test(message) ||
        /\bremove\s+all\b/i.test(message) ||
        /\bdelete\s+all\b/i.test(message)
    );
}


// ==========================================
// CHECKOUT DETECTION
// ==========================================

function isCheckoutRequest(message) {

    return (
        /\b(checkout|check out)\b/i.test(message) ||
        /\bproceed\s+to\s+checkout\b/i.test(message) ||
        /\bbuy\s+now\b/i.test(message)
    );
}


// ==========================================
// SHOW MY ORDERS DETECTION
// ==========================================

function isShowOrdersRequest(message) {

    return (
        /\b(show|view|see|display|check)\b.*\b(my\s+)?orders?\b/i.test(message) ||
        /\bmy\s+orders?\b/i.test(message) ||
        /\border\s+history\b/i.test(message)
    );
}


// ==========================================
// INCREASE CART DETECTION
// ==========================================

function isIncreaseCartRequest(message) {

    return (
        /\bincrease\b.*\bquantity\b/i.test(message) ||
        /\bincrease\b.*\bcart\b/i.test(message) ||
        /\badd\s+\d+\s+more\b/i.test(message) ||
        /\badd\s+one\s+more\b/i.test(message) ||
        /\badd\s+another\b/i.test(message)
    );
}


// ==========================================
// DECREASE CART DETECTION
// ==========================================

function isDecreaseCartRequest(message) {

    return (
        /\bdecrease\b.*\bquantity\b/i.test(message) ||
        /\bdecrease\b.*\bcart\b/i.test(message) ||
        /\breduce\b.*\bquantity\b/i.test(message) ||
        /\bremove\s+one\b/i.test(message) ||
        /\bremove\s+\d+\b/i.test(message)
    );
}


// ==========================================
// EXTRACT ADD QUANTITY
// ==========================================

function extractAddQuantity(message) {

    const match =
        message.match(
            /\badd\s+(\d+)\s+more\b/i
        );

    if (match) {

        return parseInt(
            match[1],
            10
        );
    }

    if (
        /\badd\s+one\s+more\b/i.test(message) ||
        /\badd\s+another\b/i.test(message)
    ) {

        return 1;
    }

    return 1;
}


// ==========================================
// EXTRACT QUANTITY
// ==========================================

function extractQuantity(
    message,
    type
) {

    if (type === "increase") {

        const numericMatch =
            message.match(
                /\b(?:increase|add)\s+(\d+)\b/i
            );

        if (numericMatch) {

            return parseInt(
                numericMatch[1],
                10
            );
        }

        if (
            /\badd\s+one\s+more\b/i.test(message) ||
            /\badd\s+another\b/i.test(message)
        ) {

            return 1;
        }

        return 1;
    }


    if (type === "decrease") {

        const numericMatch =
            message.match(
                /\b(?:decrease|reduce|remove)\s+(\d+)\b/i
            );

        if (numericMatch) {

            return parseInt(
                numericMatch[1],
                10
            );
        }

        if (
            /\bremove\s+one\b/i.test(message)
        ) {

            return 1;
        }

        return 1;
    }


    return 1;
}


// ==========================================
// EXTRACT PRODUCT NAME FROM CART MESSAGE
// ==========================================

function extractProductNameFromCartMessage(
    message
) {

    let text = message.trim();


    text =
        text.replace(
            /^(add|put|place)\s+/i,
            ""
        );


    text =
        text.replace(
            /^\d+\s+/,
            ""
        );


    text =
        text.replace(
            /^one\s+more\s+/i,
            ""
        );


    text =
        text.replace(
            /^another\s+/i,
            ""
        );


    text =
        text.replace(
            /\s+(to|in)\s+(my\s+)?(cart|basket)\s*$/i,
            ""
        );


    text =
        text.replace(
            /^buy\s+/i,
            ""
        );


    text =
        text.replace(
            /^i\s+want\s+to\s+buy\s+/i,
            ""
        );


    return text.trim();
}


// ==========================================
// EXTRACT PRODUCT NAME FROM REMOVE MESSAGE
// ==========================================

function extractProductNameFromRemoveMessage(
    message
) {

    let text = message.trim();


    // Remove beginning command

    text =
        text.replace(
            /^(remove|delete|take)\s+/i,
            ""
        );


    text =
        text.replace(
            /\s+from\s+(my\s+)?cart\s*$/i,
            ""
        );


    text =
        text.replace(
            /\s+from\s+(my\s+)?basket\s*$/i,
            ""
        );


    text =
        text.replace(
            /\s+out\s+of\s+(my\s+)?cart\s*$/i,
            ""
        );


    text =
        text.replace(
            /^i\s+don't\s+want\s+/i,
            ""
        );


    text =
        text.replace(
            /^i\s+do\s+not\s+want\s+/i,
            ""
        );


    return text.trim();
}


// ==========================================
// EXTRACT PRODUCT NAME FROM QUANTITY MESSAGE
// ==========================================

function extractProductNameFromQuantityMessage(
    message,
    type
) {

    let text = message.trim();


    if (type === "increase") {

        text =
            text.replace(
                /^(increase|add)\s+/i,
                ""
            );


        text =
            text.replace(
                /^\d+\s+/,
                ""
            );


        text =
            text.replace(
                /^one\s+more\s+/i,
                ""
            );


        text =
            text.replace(
                /^another\s+/i,
                ""
            );


        text =
            text.replace(
                /\s+(to|in)\s+(my\s+)?(cart|basket)\s*$/i,
                ""
            );
    }


    if (type === "decrease") {

        text =
            text.replace(
                /^(decrease|reduce|remove)\s+/i,
                ""
            );


        text =
            text.replace(
                /^\d+\s+/,
                ""
            );


        text =
            text.replace(
                /\s+(from|in)\s+(my\s+)?(cart|basket)\s*$/i,
                ""
            );
    }


    return text.trim();
}


// ==========================================
// SPECIFIC PRODUCT QUESTION
// ==========================================

function isSpecificProductQuestion(message) {

    return (
        /\b(price|cost|rate)\b/i.test(message) ||
        /\b(stock|available|availability)\b/i.test(message) ||
        /\b(description|describe|details|detail)\b/i.test(message)
    );
}


// ==========================================
// DETECT DETAIL TYPE
// ==========================================

function detectDetailType(message) {

    if (
        /\b(price|cost|rate)\b/i.test(message)
    ) {

        return "price";
    }


    if (
        /\b(stock|available|availability)\b/i.test(message)
    ) {

        return "stock";
    }


    if (
        /\b(description|describe)\b/i.test(message)
    ) {

        return "description";
    }


    return "general";
}


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    askShoppingAgent
};