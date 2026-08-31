
const {
    Ollama
} = require("ollama");


const {
    searchProducts,
    getProductDetails
} = require("./producttools");


const ollama =
    new Ollama({

        host:
            "http://127.0.0.1:11434"

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

            return (
                "Please tell me what product you are looking for."
            );

        }


        // ==================================================
        // ALWAYS USE LOWERCASE FOR DETECTION
        // ==================================================

        const lowerMessage =
            cleanMessage.toLowerCase();


        // ==================================================
        // GENERAL CHAT
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
            generalWords.includes(
                lowerMessage
            )
        ) {

            const response =
                await ollama.chat({

                    model:
                        "llama3.2:3b",

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

                            content:
                                cleanMessage

                        }

                    ]

                });


            return response.message.content;

        }


        // ==================================================
        // STEP 1
        // NEW ARRIVAL DETECTION
        // ==================================================

        const isNewArrivalRequest =
            /\b(new arrival|new arrivals|new product|new products|latest arrival|latest arrivals|latest product|latest products|just arrived|fresh arrivals|newly added)\b/i
                .test(
                    cleanMessage
                );


        // ==================================================
        // STEP 2
        // CATEGORY DETECTION
        // ==================================================

        let category = null;

        let subcategory = null;


        if (
            !isNewArrivalRequest
        ) {

            if (
                /\bdresses?\b/i.test(
                    cleanMessage
                )
            ) {

                category = "Women";
                subcategory = "Dresses";

            }

            else if (
                /\btops?\b/i.test(
                    cleanMessage
                )
            ) {

                category = "Women";
                subcategory = "Tops";

            }

            else if (
                /\b(ethnic wear|ethnicwear|traditional wear)\b/i.test(
                    cleanMessage
                )
            ) {

                category = "Women";
                subcategory = "Ethnic Wear";

            }

            else if (
                /\bshirts?\b/i.test(
                    cleanMessage
                )
            ) {

                category = "Men";
                subcategory = "Shirts";

            }

            else if (
                /\bjeans?\b/i.test(
                    cleanMessage
                )
            ) {

                category = "Men";
                subcategory = "Jeans";

            }

            else if (
                /\bjackets?\b/i.test(
                    cleanMessage
                )
            ) {

                category = "Men";
                subcategory = "Jackets";

            }

            else if (
                /\bbags?\b/i.test(
                    cleanMessage
                )
            ) {

                category = "Accessories";
                subcategory = "Bags";

            }

            else if (
                /\bwallets?\b/i.test(
                    cleanMessage
                )
            ) {

                category = "Accessories";
                subcategory = "Wallets";

            }

            else if (
                /\bwatches?\b/i.test(
                    cleanMessage
                )
            ) {

                category = "Accessories";
                subcategory = "Watches";

            }

            else if (
                /\bsunglasses?\b/i.test(
                    cleanMessage
                )
            ) {

                category = "Accessories";
                subcategory = "Sunglasses";

            }

        }


        // ==================================================
        // STEP 3
        // PRICE DETECTION
        // ==================================================

        let minPrice = null;

        let maxPrice = null;


        const betweenMatch =
            lowerMessage.match(
                /between\s+(\d+)\s+(?:and|to)\s+(\d+)/
            );


        if (betweenMatch) {

            minPrice =
                Number(
                    betweenMatch[1]
                );

            maxPrice =
                Number(
                    betweenMatch[2]
                );

        }


        const underMatch =
            lowerMessage.match(
                /(?:under|below|less than)\s+₹?\s*(\d+)/
            );


        if (underMatch) {

            maxPrice =
                Number(
                    underMatch[1]
                );

        }


        const aboveMatch =
            lowerMessage.match(
                /(?:above|over|more than)\s+₹?\s*(\d+)/
            );


        if (aboveMatch) {

            minPrice =
                Number(
                    aboveMatch[1]
                );

        }


        // ==================================================
        // STEP 4
        // RECOMMENDATION DETECTION
        // ==================================================

        const isRecommendation =
            /\b(some|few|suggest|recommend|recommendation|recommendations)\b/i
                .test(
                    cleanMessage
                );


        // ==================================================
        // STEP 5
        // EXPLICIT NUMBER
        // ==================================================

        const numberMatch =
            lowerMessage.match(
                /\b(\d+)\b/
            );


        const requestedNumber =
            numberMatch
                ? Number(
                    numberMatch[1]
                )
                : null;


        // ==================================================
        // STEP 6
        // SPECIFIC PRODUCT QUESTION
        // ==================================================

        const detailQuestion =
            /\b(price|cost|stock|available|availability|in stock|how many|description|describe|details|detail|information|info|tell me about|what category|what subcategory)\b/i
                .test(
                    cleanMessage
                );


        // ==================================================
        // STEP 7
        // TRY SPECIFIC PRODUCT
        // ==================================================

        let detectedProduct = null;


        if (
            detailQuestion
        ) {

            // Ask Ollama only for the product name
            // in specific product questions.

            const productResponse =
                await ollama.chat({

                    model:
                        "llama3.2:3b",

                    messages: [

                        {

                            role: "system",

                            content: `
You are a product name extractor.

VELORA is a fashion store.

Extract ONLY the specific product name
from the customer's question.

Return ONLY the product name.

Do not return category names.

Do not return explanations.

Example:

"what is the price of Utility Jacket"

Return:

Utility Jacket

Example:

"how many Oversized Sunglasses are available"

Return:

Oversized Sunglasses
`

                        },

                        {

                            role: "user",

                            content:
                                cleanMessage

                        }

                    ]

                });


            const possibleProductName =
                productResponse
                    .message
                    .content
                    .trim();


            console.log(
                "Possible product from Ollama:",
                possibleProductName
            );


            detectedProduct =
                await getProductDetails(
                    possibleProductName
                );

        }


        // ==================================================
        // STEP 8
        // PRODUCT DETAILS RESPONSE
        // ==================================================

        if (
            detectedProduct &&
            detailQuestion
        ) {

            const detailType =
                detectDetailType(
                    cleanMessage
                );


            if (
                detailType === "price"
            ) {

                return (
                    `The price of ${detectedProduct.name} is ` +
                    `₹${detectedProduct.price}.`
                );

            }


            if (
                detailType === "stock"
            ) {

                if (
                    detectedProduct.stock > 0
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


            if (
                detailType === "description"
            ) {

                return (
                    detectedProduct.description
                        ? `${detectedProduct.name}: ${detectedProduct.description}`
                        : `Sorry, no description is available for ${detectedProduct.name}.`
                );

            }


            if (
                detailType === "category"
            ) {

                return (
                    `${detectedProduct.name} belongs to the ` +
                    `${detectedProduct.category} category.`
                );

            }


            if (
                detailType === "subcategory"
            ) {

                return (
                    `${detectedProduct.name} is listed under the ` +
                    `${detectedProduct.subcategory} subcategory.`
                );

            }


            return (

                `Here are the details for ${detectedProduct.name}:\n\n` +

                `Name: ${detectedProduct.name}\n` +

                `Price: ₹${detectedProduct.price}\n` +

                `Category: ${detectedProduct.category}\n` +

                `Subcategory: ${detectedProduct.subcategory}\n` +

                `Availability: ${
                    detectedProduct.stock > 0
                        ? `In stock (${detectedProduct.stock})`
                        : "Out of stock"
                }\n` +

                (
                    detectedProduct.description
                        ? `Description: ${detectedProduct.description}\n`
                        : ""
                )

            );

        }


        // ==================================================
        // STEP 9
        // SEARCH DATABASE
        // ==================================================

        const products =
            await searchProducts({

                category,

                subcategory,

                minPrice,

                maxPrice,

                search: null,

                isNewArrival:
                    isNewArrivalRequest

            });


        // ==================================================
        // NO PRODUCTS
        // ==================================================

        if (
            !products ||
            products.length === 0
        ) {

            if (
                isNewArrivalRequest
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
        // STEP 10
        // HOW MANY PRODUCTS TO SHOW
        // ==================================================

        let productsToShow;


        // Explicit number
        if (
            requestedNumber &&
            requestedNumber > 0
        ) {

            productsToShow =
                products.slice(
                    0,
                    requestedNumber
                );

        }

        // Some / suggest / recommend
        else if (
            isRecommendation
        ) {

            productsToShow =
                products.slice(
                    0,
                    3
                );

        }

        // Normal request = ALL
        else {

            productsToShow =
                products;

        }


        // ==================================================
        // STEP 11
        // RESPONSE TITLE
        // ==================================================

        let responseText;


        if (
            isNewArrivalRequest
        ) {

            if (
                productsToShow.length === products.length
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

        else if (
            isRecommendation
        ) {

            responseText =
                "Here are some matching products available at VELORA:\n\n";

        }

        else {

            responseText =
                `Here are all ${productsToShow.length} ` +
                `matching products available at VELORA:\n\n`;

        }


        // ==================================================
        // STEP 12
        // DISPLAY PRODUCTS
        // ==================================================

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

