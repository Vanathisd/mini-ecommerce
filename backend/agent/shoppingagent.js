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


async function askShoppingAgent(message) {

    try {

        const cleanMessage =
            String(message || "")
                .replace(/\s+/g, " ")
                .trim();


        if (!cleanMessage) {

            return "Please tell me what product you are looking for.";

        }


        const lowerMessage =
            cleanMessage.toLowerCase();


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


        const addToCartRequest =
            isAddToCartRequest(cleanMessage);


        console.log("======================================");
        console.log("USER MESSAGE:", cleanMessage);
        console.log("ADD TO CART REQUEST:", addToCartRequest);
        console.log("======================================");


        if (addToCartRequest) {

            console.log(
                "ADD TO CART REQUEST DETECTED"
            );



            const productSearchText =
                extractProductNameFromCartMessage(
                    cleanMessage
                );


            console.log(
                "PRODUCT SEARCH TEXT:",
                productSearchText
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


            console.log(
                "DETECTED PRODUCT:",
                detectedProduct
                    ? `${detectedProduct.name} | STOCK: ${detectedProduct.stock}`
                    : "NONE"
            );


            if (!detectedProduct) {

                return {

                    response:
                        "Sorry, I couldn't find that product in VELORA.",

                    action:
                        "none"

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

                    action:
                        "none"

                };

            }


            const stock =
                Number(
                    latestProduct.stock
                );


            if (
                !Number.isFinite(stock) ||
                stock <= 0
            ) {

                return {

                    response:
                        `${latestProduct.name} is currently out of stock.`,

                    action:
                        "none"

                };

            }


            console.log(
                "ADDING PRODUCT:",
                latestProduct.name
            );


            // ------------------------------------------------
            // RETURN CART ACTION
            // ------------------------------------------------

            return {

                response:
                    `${latestProduct.name} has been added to your cart.`,

                action:
                    "add_to_cart",

                product:
                    latestProduct

            };

        }


        const detectedProduct =
            await findProductFromMessage(
                cleanMessage
            );


        console.log(
            "Database detected product:",
            detectedProduct
                ? `${detectedProduct.name} | STOCK: ${detectedProduct.stock}`
                : "NONE"
        );


        const specificQuestion =
            isSpecificProductQuestion(
                cleanMessage
            );


        if (
            detectedProduct &&
            specificQuestion
        ) {

            console.log(
                "======================================"
            );

            console.log(
                "SPECIFIC PRODUCT QUESTION"
            );

            console.log(
                "PRODUCT:",
                detectedProduct.name
            );

            console.log(
                "STOCK:",
                detectedProduct.stock
            );

            console.log(
                "======================================"
            );


            const latestProduct =
                await getProductDetails(
                    detectedProduct.name
                );


            if (!latestProduct) {

                return (
                    `Sorry, I couldn't find ` +
                    `${detectedProduct.name} in VELORA.`
                );

            }


            console.log(
                "LATEST PRODUCT STOCK:",
                latestProduct.stock
            );


            const detailType =
                detectDetailType(
                    cleanMessage
                );


            console.log(
                "Detected detail type:",
                detailType
            );


            if (
                detailType === "price_stock"
            ) {

                const stock =
                    Number(
                        latestProduct.stock
                    );


                const availability =
                    Number.isFinite(stock) &&
                    stock > 0
                        ? `In stock (${stock})`
                        : "Out of stock";


                return (
                    `${latestProduct.name} costs ` +
                    `₹${latestProduct.price} and is ` +
                    `${availability.toLowerCase()}.`
                );

            }


            if (
                detailType === "price"
            ) {

                return (
                    `The price of ${latestProduct.name} is ` +
                    `₹${latestProduct.price}.`
                );

            }


            if (
                detailType === "stock"
            ) {

                const stock =
                    Number(
                        latestProduct.stock
                    );


                console.log(
                    "FINAL STOCK VALUE:",
                    stock
                );


                if (
                    Number.isFinite(stock) &&
                    stock > 0
                ) {

                    return (
                        `${latestProduct.name} is currently ` +
                        `in stock. ${stock} ` +
                        `items are available.`
                    );

                }


                return (
                    `${latestProduct.name} is currently ` +
                    `out of stock.`
                );

            }


            if (
                detailType === "description"
            ) {

                if (
                    latestProduct.description
                ) {

                    return (
                        `${latestProduct.name}: ` +
                        `${latestProduct.description}`
                    );

                }


                return (
                    `Sorry, no description is available ` +
                    `for ${latestProduct.name}.`
                );

            }


            if (
                detailType === "category"
            ) {

                return (
                    `${latestProduct.name} belongs to the ` +
                    `${latestProduct.category} category.`
                );

            }


            if (
                detailType === "subcategory"
            ) {

                return (
                    `${latestProduct.name} is listed under ` +
                    `the ${latestProduct.subcategory} subcategory.`
                );

            }


            const stock =
                Number(
                    latestProduct.stock
                );


            const availability =
                Number.isFinite(stock) &&
                stock > 0
                    ? `In stock (${stock})`
                    : "Out of stock";


            let fullResponse =

                `Here are the details for ` +
                `${latestProduct.name}:\n\n` +

                `Name: ${latestProduct.name}\n` +

                `Price: ₹${latestProduct.price}\n` +

                `Category: ${latestProduct.category}\n` +

                `Subcategory: ${latestProduct.subcategory}\n` +

                `Availability: ${availability}\n`;


            if (
                latestProduct.description
            ) {

                fullResponse +=
                    `Description: ` +
                    `${latestProduct.description}\n`;

            }


            fullResponse +=
                "\nWould you like me to help you find something else?";


            return fullResponse;

        }


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
PRICE SORTING
==========================================

If customer asks:

most expensive
most costly
highest price
highest priced
expensive

set:

"sortBy": "price_desc"

If customer asks:

cheapest
least expensive
lowest price
lowest priced
least costly

set:

"sortBy": "price_asc"

==========================================
RATING SORTING
==========================================

If customer asks:

highest rated
best rated
top rated
best rating

set:

"sortBy": "rating_desc"

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

Do NOT treat a specific product name as a
subcategory.

For example:

Utility Jacket

is a specific product.

Oversized Sunglasses

is a specific product.

Leather Wallet

is a specific product.

Premium Formal Shirt

is a specific product.

A specific product question should NOT become
a category search.

==========================================
CASE INSENSITIVE
==========================================

Customer input is NOT case-sensitive.

Treat these as the same:

watches
WATCHES

aviator sunglasses
Aviator Sunglasses
AVIATOR SUNGLASSES

premium formal shirt
Premium Formal Shirt
PREMIUM FORMAL SHIRT

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
    "sortBy": null,
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


        let intent;


        try {

            let jsonText =
                aiResponse
                    .message
                    .content
                    .replace(/```json/gi, "")
                    .replace(/```/g, "")
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
                    lowerMessage.includes(word)
            );


        if (
            isNewArrivalRequest
        ) {

            intent.isNewArrival = true;

            intent.category = null;

            intent.subcategory = null;

        }



        if (
            !isNewArrivalRequest
        ) {

            if (
                /\bdresses?\b/i.test(cleanMessage)
            ) {

                intent.category = "Women";
                intent.subcategory = "Dresses";

            }

            else if (
                /\btops?\b/i.test(cleanMessage)
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
                /\bshirts?\b/i.test(cleanMessage)
            ) {

                intent.category = "Men";
                intent.subcategory = "Shirts";

            }

            else if (
                /\bjeans?\b/i.test(cleanMessage)
            ) {

                intent.category = "Men";
                intent.subcategory = "Jeans";

            }

            else if (
                /\bjackets?\b/i.test(cleanMessage)
            ) {

                intent.category = "Men";
                intent.subcategory = "Jackets";

            }

            else if (
                /\bbags?\b/i.test(cleanMessage)
            ) {

                intent.category = "Accessories";
                intent.subcategory = "Bags";

            }

            else if (
                /\bwallets?\b/i.test(cleanMessage)
            ) {

                intent.category = "Accessories";
                intent.subcategory = "Wallets";

            }

            else if (
                /\b(watches|watch)\b/i.test(cleanMessage)
            ) {

                intent.category = "Accessories";
                intent.subcategory = "Watches";

            }

            else if (
                /\b(sunglasses|sunglass)\b/i.test(cleanMessage)
            ) {

                intent.category = "Accessories";
                intent.subcategory = "Sunglasses";

            }

        }



        const lower =
            cleanMessage.toLowerCase();


        if (
            /\b(cheapest|lowest price|least expensive|low price)\b/i.test(lower)
        ) {

            intent.sortBy =
                "price_asc";

        }

        else if (
            /\b(most expensive|highest price|costliest|most costly|expensive)\b/i.test(lower)
        ) {

            intent.sortBy =
                "price_desc";

        }

        else if (
            /\b(highest rated|highest rating|best rated|top rated|best rating|highestrated)\b/i.test(lower)
        ) {

            intent.sortBy =
                "rating_desc";

        }


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
                    ).test(cleanMessage)
            );



        const numberMatch =
            lowerMessage.match(
                /\b([1-3])\b/
            );


        const hasSmallNumber =
            Boolean(numberMatch);


        if (
            intent.sortBy
        ) {

            intent.showAll = false;

        }

        else if (
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



        if (

            intent.category ||
            intent.subcategory ||
            intent.search ||
            intent.productName ||
            intent.productDetails ||
            intent.isNewArrival ||
            intent.sortBy ||
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
                    intent.isNewArrival === true,

                sortBy:
                    intent.sortBy

            });


        console.log(
            "Final database product count:",
            products.length
        );


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


        let productsToShow;


        if (
            intent.sortBy
        ) {

            productsToShow =
                products.slice(0, 1);

        }

        else if (
            intent.showAll
        ) {

            productsToShow =
                products;

        }

        else {

            productsToShow =
                products.slice(0, 3);

        }


        let responseText;


        if (
            intent.sortBy === "price_desc"
        ) {

            responseText =
                `The most expensive ${intent.subcategory || "product"} available at VELORA is:\n\n`;

        }

        else if (
            intent.sortBy === "price_asc"
        ) {

            responseText =
                `The cheapest ${intent.subcategory || "product"} available at VELORA is:\n\n`;

        }

        else if (
            intent.sortBy === "rating_desc"
        ) {

            responseText =
                `The highest rated ${intent.subcategory || "product"} available at VELORA is:\n\n`;

        }

        else if (
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


        productsToShow.forEach(
            (product, index) => {

                const stock =
                    Number(
                        product.stock
                    );


                const availability =
                    Number.isFinite(stock) &&
                    stock > 0
                        ? `In stock (${stock})`
                        : "Out of stock";


                responseText +=

                    `${index + 1}. ${product.name}\n` +

                    `   Price: ₹${product.price}\n` +

                    `   Availability: ${availability}\n`;


                if (
                    intent.sortBy === "rating_desc"
                ) {

                    responseText +=
                        `   Rating: ${product.rating ?? "N/A"}\n`;

                }


                responseText += "\n";

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


function extractProductNameFromCartMessage(message) {

    let text =
        String(message || "")
            .trim();


    text =
        text.replace(
            /^(please\s+)?(add|put|place)\s+/i,
            ""
        );


    text =
        text.replace(
            /\s+(to|in)\s+(my\s+)?(shopping\s+)?(cart|basket)\s*$/i,
            ""
        );


    text =
        text.replace(
            /^(please\s+)?buy\s+/i,
            ""
        );


    text =
        text.replace(
            /^i\s+want\s+to\s+buy\s+/i,
            ""
        );



    text =
        text.replace(
            /^(this|that|it)\s*$/i,
            ""
        );


    return text.trim();

}


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


function detectDetailType(message) {

    const text =
        String(message || "")
            .toLowerCase();


    const asksPrice =
        text.includes("price") ||
        text.includes("cost") ||
        text.includes("how much");


    const asksStock =
        text.includes("stock") ||
        text.includes("available") ||
        text.includes("availability") ||
        text.includes("how many") ||
        text.includes("in stock");


    const asksDescription =
        text.includes("description") ||
        text.includes("describe");


    const asksCategory =
        text.includes("what category");


    const asksSubcategory =
        text.includes("what subcategory");


    // Both price + stock

    if (
        asksPrice &&
        asksStock
    ) {

        return "price_stock";

    }


    if (asksPrice) {

        return "price";

    }


    if (asksStock) {

        return "stock";

    }


    if (asksDescription) {

        return "description";

    }


    if (asksCategory) {

        return "category";

    }


    if (asksSubcategory) {

        return "subcategory";

    }


    return "full";

}


function isAddToCartRequest(message) {

    const text =
        String(message || "")
            .toLowerCase()
            .trim();


    const addToCartPatterns = [

        /\badd\b.*\bto\s+(my\s+)?cart\b/i,

        /\bput\b.*\bin\s+(my\s+)?cart\b/i,

        /\bplace\b.*\bin\s+(my\s+)?cart\b/i,

        /\badd\b.*\bto\s+(my\s+)?basket\b/i,

        /\bput\b.*\bin\s+(my\s+)?basket\b/i,

        /\bbuy\b.*\b(this|that|it)\b/i,

        /\bi\s+want\s+to\s+buy\b/i

    ];


    return addToCartPatterns.some(
        pattern =>
            pattern.test(text)
    );

}


module.exports = {

    askShoppingAgent

};