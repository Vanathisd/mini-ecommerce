const { Ollama } = require("ollama");
const { searchProducts } = require("./producttools");

const ollama = new Ollama({
    host: "http://127.0.0.1:11434"
});

async function askShoppingAgent(message) {

    try {

        // ==========================================
        // STEP 1: UNDERSTAND USER REQUEST
        // ==========================================

        const aiResponse = await ollama.chat({

            model: "llama3.2:3b",

            messages: [

                {
                    role: "system",

                    content: `
You are the VELORA Shopping Assistant.

Your ONLY job is to understand the customer's request
and convert it into JSON filters for MongoDB.

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
AVAILABLE WOMEN SUBCATEGORIES
==========================================

Dresses
Tops
Ethnic Wear

==========================================
AVAILABLE MEN SUBCATEGORIES
==========================================

Shirts
Jeans
Jackets

==========================================
AVAILABLE ACCESSORIES SUBCATEGORIES
==========================================

Bags
Wallets
Watches
Sunglasses

IMPORTANT:
Shoes is NOT an available subcategory.

NEVER use Shoes as a subcategory.

==========================================
SUBCATEGORY MAPPING
==========================================

Women:

Dresses -> Women
Tops -> Women
Ethnic Wear -> Women

Men:

Shirts -> Men
Jeans -> Men
Jackets -> Men

Accessories:

Bags -> Accessories
Wallets -> Accessories
Watches -> Accessories
Sunglasses -> Accessories

==========================================
CATEGORY RULES
==========================================

If the customer asks for women's products:

category = "Women"

If the customer asks for men's products:

category = "Men"

If the customer asks for accessories:

category = "Accessories"

==========================================
WOMEN SUBCATEGORY RULES
==========================================

If the customer asks for dresses:

category = "Women"
subcategory = "Dresses"

If the customer asks for tops:

category = "Women"
subcategory = "Tops"

If the customer asks for ethnic wear:

category = "Women"
subcategory = "Ethnic Wear"

IMPORTANT:

"ethnic wear"
"ethnicwear"
"ethnic clothes"
"traditional wear"

should map to:

category = "Women"
subcategory = "Ethnic Wear"

==========================================
MEN SUBCATEGORY RULES
==========================================

If the customer asks for shirts:

category = "Men"
subcategory = "Shirts"

If the customer asks for jeans:

category = "Men"
subcategory = "Jeans"

If the customer asks for jackets:

category = "Men"
subcategory = "Jackets"

IMPORTANT:

"jacket"
"jackets"
"men jackets"
"mens jackets"
"men's jackets"

should map to:

category = "Men"
subcategory = "Jackets"

==========================================
ACCESSORIES SUBCATEGORY RULES
==========================================

If the customer asks for bags:

category = "Accessories"
subcategory = "Bags"

If the customer asks for wallets:

category = "Accessories"
subcategory = "Wallets"

If the customer asks for watches:

category = "Accessories"
subcategory = "Watches"

If the customer asks for sunglasses:

category = "Accessories"
subcategory = "Sunglasses"

IMPORTANT:

"sunglass"
"sunglasses"

should map to:

category = "Accessories"
subcategory = "Sunglasses"

==========================================
PRICE RULES
==========================================

"under 1000"
=> maxPrice = 1000

"below 1000"
=> maxPrice = 1000

"less than 1000"
=> maxPrice = 1000

"above 1000"
=> minPrice = 1000

"more than 1000"
=> minPrice = 1000

"between 500 and 1500"
=> minPrice = 500
maxPrice = 1500

==========================================
SEARCH RULE
==========================================

Use "search" ONLY for an additional keyword
that is NOT already a category or subcategory.

Example:

"red dresses"

category = "Women"
subcategory = "Dresses"
search = "red"

Example:

"black jackets"

category = "Men"
subcategory = "Jackets"
search = "black"

Do NOT put known category or subcategory names
inside the search field.

Example:

"show me watches"

CORRECT:

{
    "category": "Accessories",
    "subcategory": "Watches",
    "search": null
}

==========================================
SHOW ALL RULE
==========================================

NORMAL PRODUCT SEARCH MUST USE:

"showAll": true

Examples:

"show me jackets"
"show me jacket"
"show me ethnic wear"
"show ethnic wear"
"show me dresses"
"show me tops"
"show me watches"
"show me bags"
"show me wallets"
"show me sunglasses"
"find jackets"
"find ethnic wear"
"list jackets"
"list ethnic wear"

These requests MUST return:

"showAll": true

Only use:

"showAll": false

when the customer explicitly asks for a small
number of recommendations.

Examples:

"suggest some jackets"
"recommend some jackets"
"show me some jackets"
"suggest ethnic wear"
"recommend some ethnic wear"
"show me some ethnic wear"
"give me 3 jackets"
"give me 3 ethnic wear"

IMPORTANT:

"show me jackets"

means ALL matching jackets.

"show me ethnic wear"

means ALL matching ethnic wear.

"show me some jackets"

means ONLY 3 jackets.

"show me some ethnic wear"

means ONLY 3 ethnic wear products.

==========================================
GENERAL CONVERSATION
==========================================

Only treat the request as general conversation when
the customer is NOT asking for products.

Examples:

"hello"
"hi"
"hey"
"thank you"
"thanks"
"good morning"

Return:

{
    "category": null,
    "subcategory": null,
    "minPrice": null,
    "maxPrice": null,
    "search": null,
    "showAll": false,
    "general": true
}

IMPORTANT:

If a product category, subcategory, keyword,
or price filter exists, general MUST be false.

==========================================
IMPORTANT
==========================================

NEVER invent a category.

NEVER invent a subcategory.

NEVER use Shoes as a subcategory.

NEVER put a category inside the subcategory field.

NEVER put a subcategory inside the category field.

Use ONLY the categories and subcategories listed above.

Use null when a filter is not specified.

==========================================
JSON FORMAT
==========================================

{
    "category": null,
    "subcategory": null,
    "minPrice": null,
    "maxPrice": null,
    "search": null,
    "showAll": false,
    "general": false
}

==========================================
EXAMPLES
==========================================

Customer:
"Show me ethnic wear"

Response:

{
    "category": "Women",
    "subcategory": "Ethnic Wear",
    "minPrice": null,
    "maxPrice": null,
    "search": null,
    "showAll": true,
    "general": false
}

Customer:
"Show me jackets"

Response:

{
    "category": "Men",
    "subcategory": "Jackets",
    "minPrice": null,
    "maxPrice": null,
    "search": null,
    "showAll": true,
    "general": false
}

Customer:
"Show me ethnic wear under 2000"

Response:

{
    "category": "Women",
    "subcategory": "Ethnic Wear",
    "minPrice": null,
    "maxPrice": 2000,
    "search": null,
    "showAll": true,
    "general": false
}

Customer:
"Show me jackets under 3000"

Response:

{
    "category": "Men",
    "subcategory": "Jackets",
    "minPrice": null,
    "maxPrice": 3000,
    "search": null,
    "showAll": true,
    "general": false
}

Customer:
"Suggest some jackets"

Response:

{
    "category": "Men",
    "subcategory": "Jackets",
    "minPrice": null,
    "maxPrice": null,
    "search": null,
    "showAll": false,
    "general": false
}

Customer:
"Suggest some ethnic wear"

Response:

{
    "category": "Women",
    "subcategory": "Ethnic Wear",
    "minPrice": null,
    "maxPrice": null,
    "search": null,
    "showAll": false,
    "general": false
}

Customer:
"Show me bags"

Response:

{
    "category": "Accessories",
    "subcategory": "Bags",
    "minPrice": null,
    "maxPrice": null,
    "search": null,
    "showAll": true,
    "general": false
}

Customer:
"Show me wallets"

Response:

{
    "category": "Accessories",
    "subcategory": "Wallets",
    "minPrice": null,
    "maxPrice": null,
    "search": null,
    "showAll": true,
    "general": false
}

Customer:
"Show me watches"

Response:

{
    "category": "Accessories",
    "subcategory": "Watches",
    "minPrice": null,
    "maxPrice": null,
    "search": null,
    "showAll": true,
    "general": false
}

Customer:
"Show me sunglasses"

Response:

{
    "category": "Accessories",
    "subcategory": "Sunglasses",
    "minPrice": null,
    "maxPrice": null,
    "search": null,
    "showAll": true,
    "general": false
}

Customer:
"hello"

Response:

{
    "category": null,
    "subcategory": null,
    "minPrice": null,
    "maxPrice": null,
    "search": null,
    "showAll": false,
    "general": true
}
`
                },

                {
                    role: "user",
                    content: message
                }

            ]

        });


        console.log("Ollama intent response:");
        console.log(aiResponse.message.content);


        // ==========================================
        // STEP 2: PARSE JSON
        // ==========================================

        let intent;

        try {

            let jsonText = aiResponse.message.content
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            intent = JSON.parse(jsonText);

        } catch (error) {

            console.error(
                "Could not parse Ollama JSON:",
                aiResponse.message.content
            );

            return "Sorry, I couldn't understand your request. Please try again.";

        }


        console.log("Parsed intent:");
        console.log(intent);


        // ==========================================
        // STEP 3: CORRECT PRODUCT REQUEST
        // ==========================================

        if (
            intent.category ||
            intent.subcategory ||
            intent.search ||
            intent.minPrice !== null ||
            intent.maxPrice !== null
        ) {

            intent.general = false;

        }


        // ==========================================
        // STEP 4: FORCE SHOW ALL / RECOMMENDATION
        // ==========================================

        const lowerMessage = message.toLowerCase();

        const recommendationWords = [
            "suggest",
            "recommend",
            "some",
            "few"
        ];

        const isRecommendation = recommendationWords.some(word =>
            lowerMessage.includes(word)
        );


        if (
            intent.category ||
            intent.subcategory ||
            intent.search ||
            intent.minPrice !== null ||
            intent.maxPrice !== null
        ) {

            intent.showAll = !isRecommendation;

        }


        console.log("Final corrected intent:");
        console.log(intent);


        // ==========================================
        // STEP 5: GENERAL CONVERSATION
        // ==========================================

        if (
            intent.general &&
            !intent.category &&
            !intent.subcategory &&
            !intent.search &&
            intent.minPrice === null &&
            intent.maxPrice === null
        ) {

            const generalResponse = await ollama.chat({

                model: "llama3.2:3b",

                messages: [

                    {
                        role: "system",

                        content: `
You are the friendly VELORA Shopping Assistant.

VELORA is a fashion and lifestyle e-commerce website.

Be friendly, helpful and concise.

Do not invent products.
Do not discuss specific products unless they are provided.
`
                    },

                    {
                        role: "user",
                        content: message
                    }

                ]

            });

            return generalResponse.message.content;
        }


        // ==========================================
        // STEP 6: SEARCH MONGODB
        // ==========================================

        const products = await searchProducts({

            category: intent.category,
            subcategory: intent.subcategory,
            minPrice: intent.minPrice,
            maxPrice: intent.maxPrice,
            search: intent.search

        });


        console.log("Products found:", products);
        console.log("Products found count:", products.length);


        // ==========================================
        // STEP 7: NO PRODUCTS
        // ==========================================

        if (!products || products.length === 0) {

            return "Sorry, I couldn't find any matching products currently available at VELORA.";

        }


        // ==========================================
        // STEP 8: SELECT PRODUCTS
        // ==========================================

        let productsToShow;

        if (intent.showAll) {

            productsToShow = products;

        } else {

            productsToShow = products.slice(0, 3);

        }


        console.log(
            "Products selected:",
            productsToShow.length
        );


        // ==========================================
        // STEP 9: CREATE RESPONSE
        // ==========================================

        let responseText = "";

        if (intent.showAll) {

            responseText =
                `Here are all ${productsToShow.length} matching products available at VELORA:\n\n`;

        } else {

            responseText =
                `Here are some matching products available at VELORA:\n\n`;

        }


        productsToShow.forEach((product, index) => {

            const availability =
                product.stock > 0
                    ? `In stock (${product.stock})`
                    : "Out of stock";

            responseText +=
                `${index + 1}. ${product.name}\n` +
                `   Price: ₹${product.price}\n` +
                `   Availability: ${availability}\n\n`;

        });


        // ==========================================
        // STEP 10: FINAL RESPONSE
        // ==========================================

        responseText +=
            "Would you like me to help you find something else?";


        console.log("Final response:");
        console.log(responseText);


        return responseText;


    } catch (error) {

        console.error(
            "Ollama Shopping Agent Error:",
            error
        );

        throw error;

    }

}


module.exports = {
    askShoppingAgent
};