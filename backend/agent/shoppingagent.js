const { Ollama } = require("ollama");

const {
    searchProducts,
    getProductDetails,
    findProductFromMessage
} = require("./producttools");

const ollama = new Ollama({
    host: "http://127.0.0.1:11434"
});

// ======================================================
// MAIN SHOPPING AGENT
// ======================================================

async function askShoppingAgent(message) {

    try {

        const cleanMessage =
            String(message).trim();

        const lowerMessage =
            cleanMessage.toLowerCase();

        // ==================================================
        // GENERAL CONVERSATION
        // ==================================================

        const generalWords = [
            "hello",
            "hi",
            "hey",
            "thanks",
            "thank you",
            "good morning",
            "good afternoon",
            "good evening"
        ];

        if (generalWords.includes(lowerMessage)) {

            const generalResponse =
                await ollama.chat({

                    model: "llama3.2:3b",

                    messages: [

                        {
                            role: "system",

                            content: `
You are the friendly VELORA Shopping Assistant.

VELORA is a fashion and lifestyle e-commerce website.

Be friendly, helpful and concise.

Do not invent products.
`
                        },

                        {
                            role: "user",
                            content: cleanMessage
                        }

                    ]

                });

            return generalResponse.message.content;
        }

        // ==================================================
        // STEP 1: ASK OLLAMA FOR INTENT
        // ==================================================

        const aiResponse =
            await ollama.chat({

                model: "llama3.2:3b",

                messages: [

                    {
                        role: "system",

                        content: `
You are the VELORA Shopping Assistant.

Convert the customer request into JSON.

Return ONLY valid JSON.
Do not use markdown.
Do not add explanations.

==================================================
AVAILABLE CATEGORIES
==================================================

Women
Men
Accessories

==================================================
AVAILABLE SUBCATEGORIES
==================================================

Women:
Dresses
Tops
Ethnic Wear

Men:
Shirts
Jeans
Jackets

Accessories:
Bags
Wallets
Watches
Sunglasses

==================================================
CATEGORY MAPPING
==================================================

Dresses -> Women
Tops -> Women
Ethnic Wear -> Women

Shirts -> Men
Jeans -> Men
Jackets -> Men

Bags -> Accessories
Wallets -> Accessories
Watches -> Accessories
Sunglasses -> Accessories

==================================================
IMPORTANT
==================================================

Shoes is NOT available.

Never invent a category.

Never invent a subcategory.

==================================================
SPECIFIC PRODUCT RULE
==================================================

A product name may contain a subcategory word.

Examples:

Utility Jacket
Oversized Jacket
Classic Denim Jacket

These can be specific product names.

If the user asks:

"How many Utility Jacket are available?"

this is a SPECIFIC PRODUCT question.

Return:

{
    "category": null,
    "subcategory": null,
    "minPrice": null,
    "maxPrice": null,
    "search": null,
    "productName": "Utility Jacket",
    "detailType": "stock",
    "showAll": false,
    "general": false,
    "productDetails": true
}

If the user asks:

"How much is Utility Jacket?"

return:

productName = "Utility Jacket"
detailType = "price"
productDetails = true

If the user asks:

"Is Utility Jacket available?"

return:

productName = "Utility Jacket"
detailType = "stock"
productDetails = true

If the user asks:

"Tell me about Utility Jacket"

return:

productName = "Utility Jacket"
detailType = "full"
productDetails = true

==================================================
NORMAL CATEGORY SEARCH
==================================================

"show me jackets"

category = Men
subcategory = Jackets
productDetails = false
showAll = true

"show me dresses"

category = Women
subcategory = Dresses
productDetails = false
showAll = true

"show me sunglasses"

category = Accessories
subcategory = Sunglasses
productDetails = false
showAll = true

==================================================
PRICE
==================================================

under 1000 -> maxPrice = 1000

below 1000 -> maxPrice = 1000

less than 1000 -> maxPrice = 1000

above 1000 -> minPrice = 1000

more than 1000 -> minPrice = 1000

between 500 and 1500:

minPrice = 500
maxPrice = 1500

==================================================
SEARCH
==================================================

Use search only for additional keywords.

Example:

"red dresses"

category = Women
subcategory = Dresses
search = red

"black jackets"

category = Men
subcategory = Jackets
search = black

==================================================
RECOMMENDATION
==================================================

Normal product requests:

showAll = true

Recommendation requests:

showAll = false

Examples:

"suggest some jackets"
"recommend some bags"
"show me some watches"

==================================================
JSON FORMAT
==================================================

{
    "category": null,
    "subcategory": null,
    "minPrice": null,
    "maxPrice": null,
    "search": null,
    "productName": null,
    "detailType": null,
    "showAll": false,
    "general": false,
    "productDetails": false
}
`
                    },

                    {
                        role: "user",
                        content: cleanMessage
                    }

                ]

            });

        console.log(
            "Ollama intent response:"
        );

        console.log(
            aiResponse.message.content
        );

        // ==================================================
        // STEP 2: PARSE JSON
        // ==================================================

        let intent;

        try {

            const jsonText =
                aiResponse.message.content
                    .replace(/```json/g, "")
                    .replace(/```/g, "")
                    .trim();

            intent =
                JSON.parse(jsonText);

        } catch (error) {

            console.error(
                "Could not parse Ollama JSON:",
                aiResponse.message.content
            );

            return (
                "Sorry, I couldn't understand your request. " +
                "Please try again."
            );
        }

        console.log(
            "Parsed intent:",
            intent
        );

        // ==================================================
        // STEP 3: DATABASE PRODUCT DETECTION
        // ==================================================

        // IMPORTANT:
        // Declare only ONCE.

        let detectedProduct = null;

        // First use product name from Ollama

        if (intent.productName) {

            detectedProduct =
                await getProductDetails(
                    intent.productName
                );
        }

        // If Ollama did not correctly identify it,
        // search directly from the user's message.

        if (!detectedProduct) {

            detectedProduct =
                await findProductFromMessage(
                    cleanMessage
                );
        }

        // ==================================================
        // STEP 4: SPECIFIC PRODUCT QUESTION
        // ==================================================

        const detailQuestion =
            isSpecificProductQuestion(
                cleanMessage
            );

        if (
            detectedProduct &&
            detailQuestion
        ) {

            console.log(
                "DATABASE PRODUCT DETECTED:",
                detectedProduct.name
            );

            const detailType =
                detectDetailType(
                    cleanMessage
                );

            console.log(
                "Detected detail type:",
                detailType
            );

            // ----------------------------------------------
            // PRICE
            // ----------------------------------------------

            if (detailType === "price") {

                return (
                    `The price of ${detectedProduct.name} ` +
                    `is ₹${detectedProduct.price}.`
                );
            }

            // ----------------------------------------------
            // STOCK
            // ----------------------------------------------

            if (detailType === "stock") {

                if (detectedProduct.stock > 0) {

                    return (
                        `${detectedProduct.name} is currently ` +
                        `in stock. ${detectedProduct.stock} ` +
                        `items are available.`
                    );

                }

                return (
                    `${detectedProduct.name} is currently ` +
                    `out of stock.`
                );
            }

            // ----------------------------------------------
            // DESCRIPTION
            // ----------------------------------------------

            if (detailType === "description") {

                if (detectedProduct.description) {

                    return (
                        `${detectedProduct.name}: ` +
                        `${detectedProduct.description}`
                    );
                }

                return (
                    `Sorry, no description is available ` +
                    `for ${detectedProduct.name}.`
                );
            }

            // ----------------------------------------------
            // CATEGORY
            // ----------------------------------------------

            if (detailType === "category") {

                return (
                    `${detectedProduct.name} belongs to the ` +
                    `${detectedProduct.category} category.`
                );
            }

            // ----------------------------------------------
            // SUBCATEGORY
            // ----------------------------------------------

            if (detailType === "subcategory") {

                return (
                    `${detectedProduct.name} is listed under ` +
                    `the ${detectedProduct.subcategory} subcategory.`
                );
            }

            // ----------------------------------------------
            // FULL DETAILS
            // ----------------------------------------------

            const availability =
                detectedProduct.stock > 0
                    ? `In stock (${detectedProduct.stock})`
                    : "Out of stock";

            let responseText =
                `Here are the details for ` +
                `${detectedProduct.name}:\n\n` +

                `Name: ${detectedProduct.name}\n` +

                `Price: ₹${detectedProduct.price}\n` +

                `Category: ${detectedProduct.category}\n` +

                `Subcategory: ${detectedProduct.subcategory}\n` +

                `Availability: ${availability}\n`;

            if (detectedProduct.description) {

                responseText +=
                    `Description: ` +
                    `${detectedProduct.description}\n`;
            }

            responseText +=
                "\nWould you like me to help you find something else?";

            return responseText;
        }

        // ==================================================
        // STEP 5: FORCE GENERAL FALSE FOR PRODUCT REQUEST
        // ==================================================

        if (
            intent.category ||
            intent.subcategory ||
            intent.search ||
            intent.productName ||
            intent.productDetails ||
            intent.minPrice !== null ||
            intent.maxPrice !== null
        ) {

            intent.general = false;
        }

        // ==================================================
        // STEP 6: RECOMMENDATION
        // ==================================================

        const recommendationWords = [
            "suggest",
            "recommend",
            "some",
            "few"
        ];

        const isRecommendation =
            recommendationWords.some(
                word =>
                    lowerMessage.includes(word)
            );

        // ==================================================
        // STEP 7: SHOW ALL
        // ==================================================

        if (
            !intent.productDetails &&
            (
                intent.category ||
                intent.subcategory ||
                intent.search ||
                intent.minPrice !== null ||
                intent.maxPrice !== null
            )
        ) {

            intent.showAll =
                !isRecommendation;
        }

        console.log(
            "Final corrected intent:",
            intent
        );

        // ==================================================
        // STEP 8: GENERAL CONVERSATION
        // ==================================================

        if (intent.general) {

            const generalResponse =
                await ollama.chat({

                    model: "llama3.2:3b",

                    messages: [

                        {
                            role: "system",

                            content: `
You are the friendly VELORA Shopping Assistant.

VELORA is a fashion and lifestyle e-commerce website.

Be friendly, helpful and concise.

Do not invent products.
`
                        },

                        {
                            role: "user",
                            content: cleanMessage
                        }

                    ]

                });

            return generalResponse.message.content;
        }

        // ==================================================
        // STEP 9: SEARCH PRODUCTS
        // ==================================================

        const products =
            await searchProducts({

                category:
                    intent.category,

                subcategory:
                    intent.subcategory,

                minPrice:
                    intent.minPrice,

                maxPrice:
                    intent.maxPrice,

                search:
                    intent.search

            });

        console.log(
            "Products found count:",
            products.length
        );

        // ==================================================
        // STEP 10: NO PRODUCTS
        // ==================================================

        if (
            !products ||
            products.length === 0
        ) {

            return (
                "Sorry, I couldn't find any matching " +
                "products currently available at VELORA."
            );
        }

        // ==================================================
        // STEP 11: SELECT PRODUCTS
        // ==================================================

        let productsToShow;

        if (intent.showAll) {

            productsToShow =
                products;

        } else {

            productsToShow =
                products.slice(0, 3);
        }

        // ==================================================
        // STEP 12: RESPONSE
        // ==================================================

        let responseText;

        if (intent.showAll) {

            responseText =
                `Here are all ${productsToShow.length} ` +
                `matching products available at VELORA:\n\n`;

        } else {

            responseText =
                `Here are some matching products ` +
                `available at VELORA:\n\n`;
        }

        productsToShow.forEach(
            (product, index) => {

                const availability =
                    product.stock > 0
                        ? `In stock (${product.stock})`
                        : "Out of stock";

                responseText +=
                    `${index + 1}. ${product.name}\n` +
                    `   Price: ₹${product.price}\n` +
                    `   Availability: ${availability}\n\n`;
            }
        );

        responseText +=
            "Would you like me to help you find something else?";

        return responseText;

    } catch (error) {

        console.error(
            "Ollama Shopping Agent Error:",
            error
        );

        throw error;
    }
}

// ======================================================
// SPECIFIC PRODUCT QUESTION
// ======================================================

function isSpecificProductQuestion(message) {

    const text =
        message.toLowerCase();

    const detailWords = [

        "price",
        "cost",
        "how much",

        "stock",
        "available",
        "availability",
        "how many",

        "description",
        "describe",

        "tell me about",
        "details",
        "detail",
        "information",
        "info",

        "what category",
        "what subcategory"

    ];

    return detailWords.some(
        word =>
            text.includes(word)
    );
}

// ======================================================
// DETAIL TYPE
// ======================================================

function detectDetailType(message) {

    const text =
        message.toLowerCase();

    if (
        text.includes("price") ||
        text.includes("cost") ||
        text.includes("how much")
    ) {

        return "price";
    }

    if (
        text.includes("stock") ||
        text.includes("available") ||
        text.includes("availability") ||
        text.includes("how many")
    ) {

        return "stock";
    }

    if (
        text.includes("description") ||
        text.includes("describe")
    ) {

        return "description";
    }

    if (
        text.includes("what category")
    ) {

        return "category";
    }

    if (
        text.includes("what subcategory")
    ) {

        return "subcategory";
    }

    return "full";
}

// ======================================================
// EXPORT
// ======================================================

module.exports = {
    askShoppingAgent
};