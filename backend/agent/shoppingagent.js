const { Ollama } = require("ollama");

const {
    searchProducts,
    getProductDetails,
    findProductFromMessage
} = require("./producttools");

const ollama = new Ollama({
    host:  "http://127.0.0.1:11434"
});

async function askShoppingAgent(message) {

    try {

        const cleanMessage =
            String(message || "")
                .replace(/\s+/g, " ")
                .trim();

        if (!cleanMessage) {

            return {
                response:
                    "Please tell me what product you are looking for.",
                action:
                    "none"
            };
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

        if (
            generalWords.includes(
                lowerMessage
            )
        ) {

            const generalResponse =
                await ollama.chat({

                    model:
                        "llama3.2:3b",

                    messages: [

                        {
                            role:
                                "system",

                            content:
                                `You are the friendly VELORA Shopping Assistant.

VELORA is a fashion and lifestyle e-commerce website.

Be friendly, helpful and concise.

Do not invent products.`
                        },

                        {
                            role:
                                "user",

                            content:
                                cleanMessage
                        }

                    ]

                });

            return {

                response:
                    generalResponse.message.content,

                action:
                    "none"

            };

        }

        console.log(
            "======================================"
        );

        console.log(
            "USER MESSAGE:",
            cleanMessage
        );

        console.log(
            "======================================"
        );


        const clearCartRequest =
            isClearCartRequest(
                cleanMessage
            );

        console.log(
            "CLEAR CART:",
            clearCartRequest
        );

        if (clearCartRequest) {

            return {

                response:
                    "All products have been removed from your cart.",

                action:
                    "clear_cart"

            };

        }


        const checkoutRequest =
            isCheckoutRequest(
                cleanMessage
            );

        console.log(
            "CHECKOUT REQUEST:",
            checkoutRequest
        );

        if (checkoutRequest) {

            console.log(
                "CHECKOUT REQUEST DETECTED"
            );

            return {

                response:
                    "Sure! I'll take you to checkout to complete your order.",

                action:
                    "checkout"

            };

        }

        const showOrdersRequest =
    isShowOrdersRequest(
        cleanMessage
    );

console.log(
    "SHOW ORDERS:",
    showOrdersRequest
);

if (showOrdersRequest) {

    console.log(
        "SHOW ORDERS REQUEST DETECTED"
    );

    return {

        response:
            "Sure! I'll show you your orders.",

        action:
            "show_orders"

    };

}


        const decreaseCartRequest =
            isDecreaseCartRequest(
                cleanMessage
            );

        console.log(
            "DECREASE QUANTITY:",
            decreaseCartRequest
        );

        if (decreaseCartRequest) {

            console.log(
                "DECREASE QUANTITY REQUEST DETECTED"
            );

            const quantity =
                extractQuantity(
                    cleanMessage,
                    "decrease"
                );

            const productSearchText =
                extractProductNameFromQuantityMessage(
                    cleanMessage
                );

            console.log(
                "DECREASE QUANTITY:",
                quantity
            );

            console.log(
                "PRODUCT SEARCH:",
                productSearchText
            );

            let detectedProduct =
                null;

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
                "DECREASE DETECTED PRODUCT:",
                detectedProduct
                    ? detectedProduct.name
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

            return {

                response:
                    `${latestProduct.name} quantity has been decreased by ${quantity}.`,

                action:
                    "decrease_quantity",

                quantity,

                product:
                    latestProduct

            };

        }


        const increaseCartRequest =
            isIncreaseCartRequest(
                cleanMessage
            );

        console.log(
            "INCREASE QUANTITY:",
            increaseCartRequest
        );

        if (increaseCartRequest) {

            console.log(
                "INCREASE QUANTITY REQUEST DETECTED"
            );

            const quantity =
                extractQuantity(
                    cleanMessage,
                    "increase"
                );

            const productSearchText =
                extractProductNameFromQuantityMessage(
                    cleanMessage
                );

            console.log(
                "INCREASE QUANTITY:",
                quantity
            );

            console.log(
                "PRODUCT SEARCH:",
                productSearchText
            );

            let detectedProduct =
                null;

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
                "INCREASE DETECTED PRODUCT:",
                detectedProduct
                    ? detectedProduct.name
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

            return {

                response:
                    `${latestProduct.name} quantity has been increased by ${quantity}.`,

                action:
                    "increase_quantity",

                quantity,

                product:
                    latestProduct

            };

        }


        const addToCartRequest =
            isAddToCartRequest(
                cleanMessage
            );

        console.log(
            "ADD TO CART:",
            addToCartRequest
        );

        if (addToCartRequest) {

            console.log(
                "ADD TO CART REQUEST DETECTED"
            );


            const multipleProductNames =
                extractMultipleProductNamesFromCartMessage(
                    cleanMessage
                );

            if (
                multipleProductNames.length > 1
            ) {

                console.log(
                    "MULTIPLE PRODUCTS TO ADD:",
                    multipleProductNames
                );

                const productsToAdd = [];

                for (
                    const productName
                    of multipleProductNames
                ) {

                    const detectedProduct =
                        await findProductFromMessage(
                            productName
                        );

                    if (
                        detectedProduct
                    ) {

                        const latestProduct =
                            await getProductDetails(
                                detectedProduct.name
                            );

                        if (
                            latestProduct
                        ) {

                            const stock =
                                Number(
                                    latestProduct.stock
                                );

                            if (
                                Number.isFinite(stock) &&
                                stock > 0
                            ) {

                                productsToAdd.push(
                                    latestProduct
                                );

                            }

                        }

                    }

                }


                if (
                    productsToAdd.length === 0
                ) {

                    return {

                        response:
                            "Sorry, I couldn't find those products in VELORA.",

                        action:
                            "none"

                    };

                }


                const productNames =
                    productsToAdd.map(
                        product =>
                            product.name
                    );


                let response;

                if (
                    productNames.length === 2
                ) {

                    response =
                        `${productNames[0]} and ${productNames[1]} have been added to your cart.`;

                }

                else {

                    response =
                        `${productNames
                            .slice(0, -1)
                            .join(", ")} and ${productNames.at(-1)} have been added to your cart.`;

                }


                return {

                    response,

                    action:
                        "add_multiple_to_cart",

                    products:
                        productsToAdd

                };

            }


            const quantity =
                extractAddQuantity(
                    cleanMessage
                );

            const productSearchText =
                extractProductNameFromCartMessage(
                    cleanMessage
                );

            console.log(
                "ADD QUANTITY:",
                quantity
            );

            console.log(
                "PRODUCT SEARCH TEXT:",
                productSearchText
            );

            let detectedProduct =
                null;

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

            if (
                quantity > stock
            ) {

                return {

                    response:
                        `Only ${stock} ${latestProduct.name} are available in stock.`,

                    action:
                        "none"

                };

            }

            console.log(
                "ADDING PRODUCT:",
                latestProduct.name
            );

            return {

                response:
                    `${latestProduct.name} has been added to your cart.`,

                action:
                    "add_to_cart",

                quantity,

                product:
                    latestProduct

            };

        }


        const removeFromCartRequest =
            isRemoveFromCartRequest(
                cleanMessage
            );

        console.log(
            "REMOVE FROM CART:",
            removeFromCartRequest
        );

        if (removeFromCartRequest) {



            const multipleProductNames =
                extractMultipleProductNamesFromRemoveMessage(
                    cleanMessage
                );

            if (
                multipleProductNames.length > 1
            ) {

                console.log(
                    "MULTIPLE PRODUCTS TO REMOVE:",
                    multipleProductNames
                );

                const productsToRemove = [];

                for (
                    const productName
                    of multipleProductNames
                ) {

                    const detectedProduct =
                        await findProductFromMessage(
                            productName
                        );

                    if (
                        detectedProduct
                    ) {

                        const latestProduct =
                            await getProductDetails(
                                detectedProduct.name
                            );

                        if (
                            latestProduct
                        ) {

                            productsToRemove.push(
                                latestProduct
                            );

                        }

                    }

                }


                if (
                    productsToRemove.length === 0
                ) {

                    return {

                        response:
                            "Sorry, I couldn't find those products in VELORA.",

                        action:
                            "none"

                    };

                }


                const productNames =
                    productsToRemove.map(
                        product =>
                            product.name
                    );


                let response;

                if (
                    productNames.length === 2
                ) {

                    response =
                        `${productNames[0]} and ${productNames[1]} have been removed from your cart.`;

                }

                else {

                    response =
                        `${productNames
                            .slice(0, -1)
                            .join(", ")} and ${productNames.at(-1)} have been removed from your cart.`;

                }


                return {

                    response,

                    action:
                        "remove_multiple_from_cart",

                    products:
                        productsToRemove

                };

            }


            const productSearchText =
                extractProductNameFromRemoveMessage(
                    cleanMessage
                );

            let detectedProduct =
                null;

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

            return {

                response:
                    `${latestProduct.name} has been removed from your cart.`,

                action:
                    "remove_from_cart",

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
                ? `${detectedProduct.name} | ${detectedProduct.stock}`
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

            const detailType =
                detectDetailType(
                    cleanMessage
                );


           

            if (
                detailType ===
                "price_stock"
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

                return {

                    response:
                        `${latestProduct.name} costs ₹${latestProduct.price} and is ${availability.toLowerCase()}.`,

                    action:
                        "none"

                };

            }


           

            if (
                detailType ===
                "price"
            ) {

                return {

                    response:
                        `The price of ${latestProduct.name} is ₹${latestProduct.price}.`,

                    action:
                        "none"

                };

            }


     

            if (
                detailType ===
                "stock"
            ) {

                const stock =
                    Number(
                        latestProduct.stock
                    );

                if (
                    Number.isFinite(stock) &&
                    stock > 0
                ) {

                    return {

                        response:
                            `${latestProduct.name} is currently in stock. ${stock} items are available.`,

                        action:
                            "none"

                    };

                }

                return {

                    response:
                        `${latestProduct.name} is currently out of stock.`,

                    action:
                        "none"

                };

            }



            if (
                detailType ===
                "description"
            ) {

                return {

                    response:
                        latestProduct.description
                            ? `${latestProduct.name}: ${latestProduct.description}`
                            : `Sorry, no description is available for ${latestProduct.name}.`,

                    action:
                        "none"

                };

            }



            if (
                detailType ===
                "category"
            ) {

                return {

                    response:
                        `${latestProduct.name} belongs to the ${latestProduct.category} category.`,

                    action:
                        "none"

                };

            }


            if (
                detailType ===
                "subcategory"
            ) {

                return {

                    response:
                        `${latestProduct.name} is listed under the ${latestProduct.subcategory} subcategory.`,

                    action:
                        "none"

                };

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
                `Here are the details for ${latestProduct.name}:\n\n` +

                `Name: ${latestProduct.name}\n` +

                `Price: ₹${latestProduct.price}\n` +

                `Category: ${latestProduct.category}\n` +

                `Subcategory: ${latestProduct.subcategory}\n` +

                `Availability: ${availability}\n`;

            if (
                latestProduct.description
            ) {

                fullResponse +=
                    `Description: ${latestProduct.description}\n`;

            }

            fullResponse +=
                "\nWould you like me to help you find something else?";

            return {

                response:
                    fullResponse,

                action:
                    "none"

            };

        }



        const aiResponse =
            await ollama.chat({

                model:
                    "llama3.2:3b",

                messages: [

                    {
                        role:
                            "system",

                        content:
                            `You are the VELORA Shopping Assistant.

Your job is ONLY to understand the customer's shopping request and return JSON.

Return ONLY valid JSON.

Do not use markdown.

Do not add explanations.

AVAILABLE CATEGORIES:

Women
Men
Accessories

AVAILABLE SUBCATEGORIES:

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

CATEGORY MAPPING:

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

NEW ARRIVALS:

New Arrivals is NOT a category.

If customer asks for new arrivals, set:

"isNewArrival": true

PRICE FILTERS:

under 1000 => maxPrice = 1000
below 1000 => maxPrice = 1000
less than 1000 => maxPrice = 1000

above 1000 => minPrice = 1000
more than 1000 => minPrice = 1000

between 500 and 1500 => minPrice = 500 maxPrice = 1500

PRICE SORTING:

most expensive -> price_desc
most costly -> price_desc
highest price -> price_desc

cheapest -> price_asc
least expensive -> price_asc
lowest price -> price_asc

RATING SORTING:

highest rated -> rating_desc
best rated -> rating_desc
top rated -> rating_desc

RECOMMENDATIONS:

For normal category/product searches:

some
few
suggest
recommend

set:

showAll = false

IMPORTANT:

If the customer asks for new arrivals, always set:

"isNewArrival": true

New Arrivals is a complete collection.
Even if the customer says "suggest me new arrivals"
or "recommend new arrivals", show ALL available
new-arrival products.

Do NOT set showAll=false for new arrivals.

For normal category searches:

showAll = true

JSON FORMAT:

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
}`
                    },

                    {
                        role:
                            "user",

                        content:
                            cleanMessage
                    }

                ]

            });


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

        }
        catch (error) {

            console.error(
                "Could not parse Ollama JSON:",
                aiResponse.message.content
            );

            return {

                response:
                    "Sorry, I couldn't understand your request. Please try again.",

                action:
                    "none"

            };

        }



        if (
            /\bdresses?\b/i.test(
                cleanMessage
            )
        ) {

            intent.category =
                "Women";

            intent.subcategory =
                "Dresses";

        }

        else if (
            /\btops?\b/i.test(
                cleanMessage
            )
        ) {

            intent.category =
                "Women";

            intent.subcategory =
                "Tops";

        }

        else if (
            /\b(ethnic wear|ethnicwear|traditional wear)\b/i.test(
                cleanMessage
            )
        ) {

            intent.category =
                "Women";

            intent.subcategory =
                "Ethnic Wear";

        }

        else if (
            /\bshirts?\b/i.test(
                cleanMessage
            )
        ) {

            intent.category =
                "Men";

            intent.subcategory =
                "Shirts";

        }

        else if (
            /\bjeans?\b/i.test(
                cleanMessage
            )
        ) {

            intent.category =
                "Men";

            intent.subcategory =
                "Jeans";

        }

        else if (
            /\bjackets?\b/i.test(
                cleanMessage
            )
        ) {

            intent.category =
                "Men";

            intent.subcategory =
                "Jackets";

        }

        else if (
            /\bbags?\b/i.test(
                cleanMessage
            )
        ) {

            intent.category =
                "Accessories";

            intent.subcategory =
                "Bags";

        }

        else if (
            /\bwallets?\b/i.test(
                cleanMessage
            )
        ) {

            intent.category =
                "Accessories";

            intent.subcategory =
                "Wallets";

        }

        else if (
            /\b(watches|watch)\b/i.test(
                cleanMessage
            )
        ) {

            intent.category =
                "Accessories";

            intent.subcategory =
                "Watches";

        }

        else if (
            /\b(sunglasses|sunglass)\b/i.test(
                cleanMessage
            )
        ) {

            intent.category =
                "Accessories";

            intent.subcategory =
                "Sunglasses";

        }



        if (
            /\b(most expensive|highest price|costliest|most costly|expensive)\b/i.test(
                lowerMessage
            )
        ) {

            intent.sortBy = "price_desc";

        }

        else if (
            /\b(cheapest|lowest price|least expensive|low price)\b/i.test(
                lowerMessage
            )
        ) {

            intent.sortBy = "price_asc";

        }

        else if (
            /\b(highest rated|highest rating|best rated|top rated|best rating|highestrated)\b/i.test(
                lowerMessage
            )
        ) {

            intent.sortBy = "rating_desc";

        }



        if (
            /\b(cheapest|lowest price|least expensive|low price)\b/i.test(
                lowerMessage
            ) &&
            /\b(sunglasses|sunglass)\b/i.test(
                lowerMessage
            )
        ) {

            console.log(
                "CHEAPEST SUNGLASSES REQUEST DETECTED"
            );

            intent.category =
                "Accessories";

            intent.subcategory =
                "Sunglasses";

            intent.sortBy =
                "price_asc";

            intent.showAll =
                false;

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
                    ).test(
                        cleanMessage
                    )
            );


        const numberMatch =
            lowerMessage.match(
                /\b([1-3])\b/
            );

        const hasSmallNumber =
            Boolean(
                numberMatch
            );


       if (
            intent.sortBy
        ) {

            intent.showAll =
                false;

        }

        else if (
            intent.isNewArrival === true
        ) {

            intent.showAll =
                true;

        }

        else if (
            intent.category ||
            intent.subcategory
        ) {

            intent.showAll =
                !isRecommendation &&
                !hasSmallNumber;

        }

        else if (
            intent.category ||
            intent.subcategory
        ) {

            intent.showAll =
                !isRecommendation &&
                !hasSmallNumber;

        }


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


        if (
            !products ||
            products.length === 0
        ) {

            return {

                response:
                    "Sorry, I couldn't find any matching products currently available at VELORA.",

                action:
                    "none"

            };

        }


        let productsToShow;


        if (
            intent.sortBy
        ) {

            productsToShow =
                products.slice(
                    0,
                    1
                );

        }

        else if (
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



        let responseText =
            "Here are some matching products available at VELORA:\n\n";


        productsToShow.forEach(
            (
                product,
                index
            ) => {

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

                    `   Availability: ${availability}\n\n`;

            }
        );


        responseText +=
            "Would you like me to help you find something else?";


        return {

            response:
                responseText,

            action:
                "none"

        };

    }

    catch (error) {

        console.error(
            "Ollama Shopping Agent Error:",
            error
        );

        throw error;

    }

}



function extractAddQuantity(
    message
) {

    const text =
        String(message || "")
            .toLowerCase();



    if (
        /\badd\s+one\s+more\b/i.test(
            text
        )
    ) {

        return 1;

    }



    if (
        /\badd\s+another\b/i.test(
            text
        )
    ) {

        return 1;

    }


  

    const numberMatch =
        text.match(
            /\badd\s+(\d+)\b/i
        );


    if (
        numberMatch
    ) {

        const number =
            Number(
                numberMatch[1]
            );

        if (
            Number.isFinite(number) &&
            number > 0
        ) {

            return Math.floor(
                number
            );

        }

    }


    return 1;

}


function extractQuantity(
    message,
    type
) {

    const text =
        String(message || "")
            .toLowerCase();



    const byMatch =
        text.match(
            new RegExp(
                `${type}[^0-9]{0,30}by\\s+(\\d+)`,
                "i"
            )
        );


    if (
        byMatch
    ) {

        const number =
            Number(
                byMatch[1]
            );

        if (
            Number.isFinite(number) &&
            number > 0
        ) {

            return Math.floor(
                number
            );

        }

    }



    const directMatch =
        text.match(
            new RegExp(
                `\\b${type}\\s+(\\d+)`,
                "i"
            )
        );


    if (
        directMatch
    ) {

        const number =
            Number(
                directMatch[1]
            );

        if (
            Number.isFinite(number) &&
            number > 0
        ) {

            return Math.floor(
                number
            );

        }

    }



    if (
        /\bone\s+more\b/i.test(
            text
        )
    ) {

        return 1;

    }


    if (
        /\bone\s+less\b/i.test(
            text
        )
    ) {

        return 1;

    }


    return 1;

}



function extractProductNameFromCartMessage(
    message
) {

    let text =
        String(message || "")
            .trim();


    text =
        text.replace(
            /^(please\s+)?(add|put|place)\s+/i,
            ""
        );


    // Remove quantity after "add"

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


    return text.trim();

}


function extractMultipleProductNamesFromCartMessage(
    message
) {

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


    const parts =
        text
            .split(
                /\s*(?:,|\band\b)\s*/i
            )
            .map(
                item =>
                    item.trim()
            )
            .filter(
                item =>
                    item.length > 0
            );


    return parts;

}


function extractProductNameFromRemoveMessage(
    message
) {

    let text =
        String(message || "")
            .trim();


    text =
        text.replace(
            /^(please\s+)?(remove|delete|take)\s+/i,
            ""
        );


    text =
        text.replace(
            /\s+(from|out\s+of)\s+(my\s+)?(shopping\s+)?(cart|basket)\s*$/i,
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



function extractMultipleProductNamesFromRemoveMessage(
    message
) {

    let text =
        String(message || "")
            .trim();


    text =
        text.replace(
            /^(please\s+)?(remove|delete|take)\s+/i,
            ""
        );


    text =
        text.replace(
            /\s+(from|out\s+of)\s+(my\s+)?(shopping\s+)?(cart|basket)\s*$/i,
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


    const parts =
        text
            .split(
                /\s*(?:,|\band\b)\s*/i
            )
            .map(
                item =>
                    item.trim()
            )
            .filter(
                item =>
                    item.length > 0
            );


    return parts;

}


function extractProductNameFromQuantityMessage(
    message
) {

    let text =
        String(message || "")
            .trim();


    text =
        text.replace(
            /^(please\s+)?(increase|decrease|reduce|increment|decrement|lower|raise)\s+/i,
            ""
        );


    text =
        text.replace(
            /^(please\s+)?add\s+one\s+more\s+/i,
            ""
        );


    text =
        text.replace(
            /^(please\s+)?add\s+another\s+/i,
            ""
        );


    text =
        text.replace(
            /^(please\s+)?add\s+more\s+/i,
            ""
        );


    text =
        text.replace(
            /\s+by\s+\d+\s*$/i,
            ""
        );


    text =
        text.replace(
            /^\d+\s+/,
            ""
        );


    text =
        text.replace(
            /\s+(quantity|qty)\s*$/i,
            ""
        );


    text =
        text.replace(
            /\s+(in|to|from)\s+(my\s+)?(shopping\s+)?(cart|basket)\s*$/i,
            ""
        );


    return text.trim();

}


function isAddToCartRequest(
    message
) {

    const text =
        String(message || "")
            .toLowerCase()
            .trim();


    const patterns = [

        /\badd\s+\d+\b/i,

        /\badd\s+\d+\s+.*\b(cart|basket)\b/i,

        /\badd\s+one\s+more\b/i,

        /\badd\s+another\b/i,

        /\badd\b.*\bto\s+(my\s+)?cart\b/i,

        /\bput\b.*\bin\s+(my\s+)?cart\b/i,

        /\bplace\b.*\bin\s+(my\s+)?cart\b/i,

        /\badd\b.*\bto\s+(my\s+)?basket\b/i,

        /\bput\b.*\bin\s+(my\s+)?basket\b/i,

        /\bbuy\b.*\b(this|that|it)\b/i,

        /\bi\s+want\s+to\s+buy\b/i

    ];


    return patterns.some(
        pattern =>
            pattern.test(text)
    );

}



function isIncreaseCartRequest(
    message
) {

    const text =
        String(message || "")
            .toLowerCase()
            .trim();


    const patterns = [

        /\bincrease\b/i,

        /\bincrement\b/i,

        /\braise\b.*\bquantity\b/i,

        /\badd\s+one\s+more\b/i,

        /\badd\s+another\b/i,

        /\bone\s+more\b/i

    ];


    return patterns.some(
        pattern =>
            pattern.test(text)
    );

}



function isDecreaseCartRequest(
    message
) {

    const text =
        String(message || "")
            .toLowerCase()
            .trim();


    const patterns = [

        /\bdecrease\b/i,

        /\breduce\b/i,

        /\bdecrement\b/i,

        /\blower\b.*\bquantity\b/i,

        /\bremove\s+one\b/i,

        /\bone\s+less\b/i

    ];


    return patterns.some(
        pattern =>
            pattern.test(text)
    );

}



function isClearCartRequest(
    message
) {

    const text =
        String(message || "")
            .toLowerCase()
            .trim();


    const patterns = [

        /\bclear\s+(my\s+)?cart\b/i,

        /\bempty\s+(my\s+)?cart\b/i,

        /\bremove\s+everything\s+from\s+(my\s+)?cart\b/i,

        /\bremove\s+all\s+(products\s+)?from\s+(my\s+)?cart\b/i,

        /\bremove\s+all\s+(items\s+)?from\s+(my\s+)?cart\b/i,

        /\bdelete\s+everything\s+from\s+(my\s+)?cart\b/i,

        /\bdelete\s+all\s+(products\s+)?from\s+(my\s+)?cart\b/i,

        /\bdelete\s+all\s+(items\s+)?from\s+(my\s+)?cart\b/i,

        /\bremove\s+all\s+products\s+from\s+cart\b/i,

        /\bremove\s+all\s+items\s+from\s+cart\b/i,

        /\bremove\s+all\s+from\s+cart\b/i,

        /\bdelete\s+all\s+from\s+cart\b/i

    ];


    return patterns.some(
        pattern =>
            pattern.test(text)
    );

}


function isCheckoutRequest(
    message
) {

    const text =
        String(message || "")
            .toLowerCase()
            .trim();


    const patterns = [

        /^checkout$/i,

        /\bgo\s+to\s+checkout\b/i,

        /\bproceed\s+to\s+checkout\b/i,

        /\bproceed\s+checkout\b/i,

        /\bcontinue\s+to\s+checkout\b/i,

        /\bcomplete\s+(my\s+)?order\b/i,

        /\bplace\s+(my\s+)?order\b/i,

        /\bplace\s+order\b/i,

        /\bbuy\s+(my\s+)?cart\b/i

    ];


    return patterns.some(
        pattern =>
            pattern.test(text)
    );

}

function isShowOrdersRequest(
    message
) {

    const text =
        String(message || "")
            .toLowerCase()
            .trim();

    const patterns = [

        /\bshow\s+(my\s+)?orders?\b/i,

        /\bview\s+(my\s+)?orders?\b/i,

        /\bsee\s+(my\s+)?orders?\b/i,

        /\bcheck\s+(my\s+)?orders?\b/i,

        /\bdisplay\s+(my\s+)?orders?\b/i,

        /\bmy\s+orders?\b/i,

        /\border\s+history\b/i,

        /\bshow\s+order\s+history\b/i

    ];

    return patterns.some(
        pattern =>
            pattern.test(text)
    );

}

function isRemoveFromCartRequest(
    message
) {

    const text =
        String(message || "")
            .toLowerCase()
            .trim();


    const patterns = [

        /\bremove\b.*\bfrom\s+(my\s+)?cart\b/i,

        /\bremove\b.*\bfrom\s+(my\s+)?basket\b/i,

        /\bdelete\b.*\bfrom\s+(my\s+)?cart\b/i,

        /\bdelete\b.*\bfrom\s+(my\s+)?basket\b/i,

        /\btake\b.*\bout\s+of\s+(my\s+)?cart\b/i,

        /\bi\s+don't\s+want\b/i,

        /\bi\s+do\s+not\s+want\b/i

    ];


    return patterns.some(
        pattern =>
            pattern.test(text)
    );

}



function isSpecificProductQuestion(
    message
) {

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


function detectDetailType(
    message
) {

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


module.exports = {
    askShoppingAgent
};