const {
    Ollama
} = require("ollama");

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

        // ==================================================
        // CLEAN MESSAGE
        // ==================================================

        const cleanMessage =
            String(message || "")
                .trim();


        if (!cleanMessage) {

            return "Please tell me what product you are looking for.";

        }


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


        if (
            generalWords.includes(lowerMessage)
        ) {

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


            return generalResponse
                .message
                .content;

        }


        // ==================================================
        // STEP 1
        // FIND SPECIFIC PRODUCT
        // ==================================================

        /*
            IMPORTANT:

            We search the database BEFORE asking Ollama
            to understand categories.

            This allows:

            bifold wallet
            Bifold Wallet
            BIFOLD WALLET

            to refer to the same product.
        */

        let detectedProduct =
            await findProductFromMessage(
                cleanMessage
            );


        console.log(
            "Database detected product:",
            detectedProduct
                ? detectedProduct.name
                : "NONE"
        );


        // ==================================================
        // STEP 2
        // SPECIFIC PRODUCT QUESTION
        // ==================================================

        const specificQuestion =
            isSpecificProductQuestion(
                cleanMessage
            );


        /*
            VERY IMPORTANT:

            If a specific product was detected and
            the customer is asking about price,
            stock, description, etc.,

            DO NOT run category search.

            Example:

            "is aviator sunglasses available"

            must NOT become:

            category = Accessories
            subcategory = Sunglasses

            Instead it must directly return:

            Aviator Sunglasses is currently in stock.
        */

        if (
            detectedProduct &&
            specificQuestion
        ) {

            console.log(
                "SPECIFIC PRODUCT QUESTION"
            );

            console.log(
                "Product:",
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


            // ==================================================
            // PRICE
            // ==================================================

            if (
                detailType === "price"
            ) {

                return (
                    `The price of ${detectedProduct.name} is ` +
                    `₹${detectedProduct.price}.`
                );

            }


            // ==================================================
            // STOCK
            // ==================================================

            if (
                detailType === "stock"
            ) {

                if (
                    Number(detectedProduct.stock) > 0
                ) {

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


            // ==================================================
            // DESCRIPTION
            // ==================================================

            if (
                detailType === "description"
            ) {

                if (
                    detectedProduct.description
                ) {

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


            // ==================================================
            // CATEGORY
            // ==================================================

            if (
                detailType === "category"
            ) {

                return (
                    `${detectedProduct.name} belongs to the ` +
                    `${detectedProduct.category} category.`
                );

            }


            // ==================================================
            // SUBCATEGORY
            // ==================================================

            if (
                detailType === "subcategory"
            ) {

                return (
                    `${detectedProduct.name} is listed under ` +
                    `the ${detectedProduct.subcategory} subcategory.`
                );

            }


            // ==================================================
            // FULL DETAILS
            // ==================================================

            const availability =
                Number(detectedProduct.stock) > 0
                    ? `In stock (${detectedProduct.stock})`
                    : "Out of stock";


            let fullResponse =

                `Here are the details for ` +
                `${detectedProduct.name}:\n\n` +

                `Name: ${detectedProduct.name}\n` +

                `Price: ₹${detectedProduct.price}\n` +

                `Category: ${detectedProduct.category}\n` +

                `Subcategory: ${detectedProduct.subcategory}\n` +

                `Availability: ${availability}\n`;


            if (
                detectedProduct.description
            ) {

                fullResponse +=
                    `Description: ` +
                    `${detectedProduct.description}\n`;

            }


            fullResponse +=
                "\nWould you like me to help you find something else?";


            return fullResponse;

        }


        // ==================================================
        // STEP 3
        // ASK OLLAMA FOR SHOPPING INTENT
        // ==================================================

        const aiResponse =
            await ollama.chat({

                model: "llama3.2:3b",

                messages: [

                    {

                        role: "system",

                        content: `
You are the VELORA Shopping Assistant.

Your job is ONLY to understand the customer's
shopping request and return JSON.

Return ONLY valid JSON.

Do not use markdown.
Do not add explanations.


==========================================
AVAILABLE CATEGORIES
==========================================

Women
Men
Accessories


==========================================
AVAILABLE SUBCATEGORIES
==========================================

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


==========================================
CATEGORY MAPPING
==========================================

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


==========================================
NEW ARRIVALS
==========================================

New Arrivals is NOT a category.

It is a special product filter.

If the customer asks for:

new arrivals
new arrival
new products
latest arrivals
latest products
just arrived
fresh arrivals

set:

"isNewArrival": true


==========================================
PRICE FILTERS
==========================================

under 1000
=> maxPrice = 1000

below 1000
=> maxPrice = 1000

less than 1000
=> maxPrice = 1000

above 1000
=> minPrice = 1000

more than 1000
=> minPrice = 1000

between 500 and 1500
=> minPrice = 500
maxPrice = 1500


==========================================
NORMAL SEARCH
==========================================

"show me jackets"

category = Men
subcategory = Jackets

"show me bags"

category = Accessories
subcategory = Bags

"show me dresses"

category = Women
subcategory = Dresses


==========================================
RECOMMENDATIONS
==========================================

Normal requests:

showAll = true

Recommendation requests:

showAll = false

Examples:

"suggest some jackets"

"recommend some bags"

"show me some watches"

"give me 3 dresses"

For:

some
few
suggest
recommend

set:

showAll = false


==========================================
IMPORTANT PRODUCT RULE
==========================================

Do NOT treat a known product name as a
subcategory just because it contains a
subcategory word.

For example:

Utility Jacket

is a specific product.

It is NOT a request for all jackets.

Oversized Sunglasses

is a specific product.

It is NOT a request for all sunglasses.

Leather Wallet

is a specific product.

It is NOT a request for all wallets.

If the customer asks about a specific product,
productName should contain the product name.


==========================================
CASE INSENSITIVITY
==========================================

Customer input is NOT case-sensitive.

Treat these as the same:

watches
Watches
WATCHES

utility jacket
Utility Jacket
UTILITY JACKET

premium formal shirt
Premium Formal Shirt
PREMIUM FORMAL SHIRT

bifold wallet
Bifold Wallet
BIFOLD WALLET


==========================================
JSON FORMAT
==========================================

{
    "category": null,
    "subcategory": null,
    "minPrice": null,
    "maxPrice": null,
    "search": null,
    "productName": null,
    "detailType": null,
    "isNewArrival": false,
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
        // STEP 4
        // PARSE JSON
        // ==================================================

        let intent;


        try {

            let jsonText =
                aiResponse
                    .message
                    .content
                    .replace(
                        /```json/gi,
                        ""
                    )
                    .replace(
                        /```/g,
                        ""
                    )
                    .trim();


            intent =
                JSON.parse(
                    jsonText
                );


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
            "Parsed intent:"
        );

        console.log(
            intent
        );


        // ==================================================
        // STEP 5
        // NEW ARRIVAL DETECTION
        // ==================================================

        const newArrivalWords = [

            "new arrival",
            "new arrivals",
            "new product",
            "new products",
            "latest arrival",
            "latest arrivals",
            "latest product",
            "latest products",
            "just arrived",
            "fresh arrivals"

        ];


        const isNewArrivalRequest =
            newArrivalWords.some(
                word =>
                    lowerMessage.includes(
                        word
                    )
            );


        if (
            isNewArrivalRequest
        ) {

            intent.isNewArrival = true;

            intent.category = null;
            intent.subcategory = null;

        }


        // ==================================================
        // STEP 6
        // CATEGORY MAPPING
        // ==================================================

        /*
            IMPORTANT:

            Only do category mapping when a specific
            product has NOT been detected.

            This prevents:

            "is aviator sunglasses available"

            from becoming:

            Accessories -> Sunglasses

            because Aviator Sunglasses is a specific product.
        */

        if (
            !isNewArrivalRequest &&
            !detectedProduct
        ) {

            if (
                /\bdresses?\b/i.test(
                    cleanMessage
                )
            ) {

                intent.category = "Women";
                intent.subcategory = "Dresses";

            }

            else if (
                /\btops?\b/i.test(
                    cleanMessage
                )
            ) {

                intent.category = "Women";
                intent.subcategory = "Tops";

            }

            else if (
                /\b(ethnic wear|ethnicwear|traditional wear)\b/i.test(
                    cleanMessage
                )
            ) {

                intent.category = "Women";
                intent.subcategory = "Ethnic Wear";

            }

            else if (
                /\bshirts?\b/i.test(
                    cleanMessage
                )
            ) {

                intent.category = "Men";
                intent.subcategory = "Shirts";

            }

            else if (
                /\bjeans?\b/i.test(
                    cleanMessage
                )
            ) {

                intent.category = "Men";
                intent.subcategory = "Jeans";

            }

            else if (
                /\bjackets?\b/i.test(
                    cleanMessage
                )
            ) {

                intent.category = "Men";
                intent.subcategory = "Jackets";

            }

            else if (
                /\bbags?\b/i.test(
                    cleanMessage
                )
            ) {

                intent.category = "Accessories";
                intent.subcategory = "Bags";

            }

            else if (
                /\bwallets?\b/i.test(
                    cleanMessage
                )
            ) {

                intent.category = "Accessories";
                intent.subcategory = "Wallets";

            }

            else if (
                /\b(watches|watch)\b/i.test(
                    cleanMessage
                )
            ) {

                intent.category = "Accessories";
                intent.subcategory = "Watches";

            }

            else if (
                /\b(sunglasses|sunglass)\b/i.test(
                    cleanMessage
                )
            ) {

                intent.category = "Accessories";
                intent.subcategory = "Sunglasses";

            }

        }


        // ==================================================
        // STEP 7
        // RECOMMENDATION DETECTION
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
                    new RegExp(
                        `\\b${word}\\b`,
                        "i"
                    ).test(
                        cleanMessage
                    )
            );


        // ==================================================
        // STEP 8
        // NUMBER DETECTION
        // ==================================================

        const numberMatch =
            lowerMessage.match(
                /\b([1-3])\b/
            );


        const hasSmallNumber =
            Boolean(
                numberMatch
            );


        // ==================================================
        // STEP 9
        // SHOW ALL / SHOW 3
        // ==================================================

        if (
            isNewArrivalRequest
        ) {

            intent.showAll =
                !isRecommendation &&
                !hasSmallNumber;

        }

        else if (

            intent.category ||
            intent.subcategory ||
            intent.search ||
            intent.minPrice !== null ||
            intent.maxPrice !== null

        ) {

            intent.showAll =
                !isRecommendation &&
                !hasSmallNumber;

        }


        // ==================================================
        // STEP 10
        // GENERAL FLAG
        // ==================================================

        if (

            intent.category ||
            intent.subcategory ||
            intent.search ||
            intent.productName ||
            intent.productDetails ||
            intent.isNewArrival ||
            intent.minPrice !== null ||
            intent.maxPrice !== null

        ) {

            intent.general = false;

        }


        console.log(
            "Final corrected intent:"
        );

        console.log(
            intent
        );


        // ==================================================
        // STEP 11
        // DATABASE SEARCH
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
                    intent.search,

                isNewArrival:
                    intent.isNewArrival === true

            });


        console.log(
            "Final database product count:",
            products.length
        );


        // ==================================================
        // STEP 12
        // NO PRODUCTS
        // ==================================================

        if (
            !products ||
            products.length === 0
        ) {

            if (
                intent.isNewArrival
            ) {

                return (
                    "Sorry, I couldn't find any new arrival " +
                    "products currently available at VELORA."
                );

            }


            return (
                "Sorry, I couldn't find any matching " +
                "products currently available at VELORA."
            );

        }


        // ==================================================
        // STEP 13
        // SELECT PRODUCTS
        // ==================================================

        let productsToShow;


        if (
            intent.showAll
        ) {

            productsToShow =
                products;

        }

        else {

            productsToShow =
                products.slice(
                    0,
                    3
                );

        }


        console.log(
            "Products selected:",
            productsToShow.length
        );


        // ==================================================
        // STEP 14
        // RESPONSE HEADER
        // ==================================================

        let responseText;


        if (
            intent.isNewArrival
        ) {

            if (
                intent.showAll
            ) {

                responseText =
                    `Here are all ${productsToShow.length} ` +
                    `new arrival products available at VELORA:\n\n`;

            }

            else {

                responseText =
                    `Here are some new arrival products ` +
                    `available at VELORA:\n\n`;

            }

        }

        else {

            if (
                intent.showAll
            ) {

                responseText =
                    `Here are all ${productsToShow.length} ` +
                    `matching products available at VELORA:\n\n`;

            }

            else {

                responseText =
                    `Here are some matching products ` +
                    `available at VELORA:\n\n`;

            }

        }


        // ==================================================
        // STEP 15
        // DISPLAY PRODUCTS
        // ==================================================

        productsToShow.forEach(
            (product, index) => {

                const availability =
                    Number(product.stock) > 0
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
        String(message || "")
            .toLowerCase();


    const detailWords = [

        "price",
        "cost",
        "how much",

        "stock",
        "available",
        "availability",
        "in stock",
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
        String(message || "")
            .toLowerCase();


    // ==================================================
    // PRICE
    // ==================================================

    if (

        text.includes("price") ||
        text.includes("cost") ||
        text.includes("how much")

    ) {

        return "price";

    }


    // ==================================================
    // STOCK
    // ==================================================

    if (

        text.includes("stock") ||
        text.includes("available") ||
        text.includes("availability") ||
        text.includes("how many")

    ) {

        return "stock";

    }


    // ==================================================
    // DESCRIPTION
    // ==================================================

    if (

        text.includes("description") ||
        text.includes("describe")

    ) {

        return "description";

    }


    // ==================================================
    // CATEGORY
    // ==================================================

    if (
        text.includes("what category")
    ) {

        return "category";

    }


    // ==================================================
    // SUBCATEGORY
    // ==================================================

    if (
        text.includes("what subcategory")
    ) {

        return "subcategory";

    }


    // ==================================================
    // FULL DETAILS
    // ==================================================

    return "full";

}

module.exports = {

    askShoppingAgent

};