const { Ollama } = require("ollama");

const {
    searchProducts,
    getProductDetails,
    findProductFromMessage
} = require("./producttools");

const ollama = new Ollama({
    host: "http://127.0.0.1:11434"
});


// =====================================================
// CLEAN TEXT
// =====================================================

function cleanText(text) {
    return String(text || "")
        .trim()
        .replace(/\s+/g, " ");
}


// =====================================================
// NORMALIZE TEXT
// =====================================================

function normalizeText(text) {
    return String(text || "")
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}


// =====================================================
// EXTRACT PRODUCT NAME FROM ADD MESSAGE
// =====================================================

function extractProductNameFromCartMessage(message) {

    let text = normalizeText(message);

    text = text
        .replace(/\badd\b/g, "")
        .replace(/\bput\b/g, "")
        .replace(/\bto\b/g, "")
        .replace(/\binto\b/g, "")
        .replace(/\bmy\b/g, "")
        .replace(/\bcart\b/g, "")
        .replace(/\bbasket\b/g, "")
        .replace(/\bplease\b/g, "")
        .replace(/\bquantity\b/g, "")
        .replace(/\bqty\b/g, "")
        .replace(/\bone more\b/g, "")
        .replace(/\banother\b/g, "")
        .replace(/\bmore\b/g, "")
        .replace(/\b\d+\b/g, "");

    return text.trim();
}


// =====================================================
// EXTRACT PRODUCT NAME FROM REMOVE MESSAGE
// =====================================================

function extractProductNameFromRemoveMessage(message) {

    let text = normalizeText(message);

    text = text
        .replace(/\bremove\b/g, "")
        .replace(/\bdelete\b/g, "")
        .replace(/\btake\b/g, "")
        .replace(/\bfrom\b/g, "")
        .replace(/\bmy\b/g, "")
        .replace(/\bcart\b/g, "")
        .replace(/\bbasket\b/g, "")
        .replace(/\bplease\b/g, "")
        .replace(/\bproduct\b/g, "");

    return text.trim();
}


// =====================================================
// EXTRACT PRODUCT NAME FROM QUANTITY MESSAGE
// =====================================================

function extractProductNameFromQuantityMessage(message) {

    let text = normalizeText(message);

    text = text
        .replace(/\bincrease\b/g, "")
        .replace(/\bincreased\b/g, "")
        .replace(/\bdecrease\b/g, "")
        .replace(/\bdecreased\b/g, "")
        .replace(/\breduce\b/g, "")
        .replace(/\breduced\b/g, "")
        .replace(/\bincrement\b/g, "")
        .replace(/\bincremented\b/g, "")
        .replace(/\bdecrement\b/g, "")
        .replace(/\bdecremented\b/g, "")
        .replace(/\blower\b/g, "")
        .replace(/\braise\b/g, "")
        .replace(/\badd\b/g, "")
        .replace(/\bone\b/g, "")
        .replace(/\banother\b/g, "")
        .replace(/\bmore\b/g, "")
        .replace(/\bquantity\b/g, "")
        .replace(/\bqty\b/g, "")
        .replace(/\bcart\b/g, "")
        .replace(/\bbasket\b/g, "")
        .replace(/\bplease\b/g, "");

    return text.trim();
}


// =====================================================
// EXTRACT QUANTITY
// =====================================================

function extractQuantityFromAddMessage(message) {

    const text = normalizeText(message);

    const wordNumbers = {
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6,
        seven: 7,
        eight: 8,
        nine: 9,
        ten: 10
    };

    for (const [word, number] of Object.entries(wordNumbers)) {

        if (new RegExp(`\\b${word}\\b`).test(text)) {
            return number;
        }
    }

    const numberMatch = text.match(/\b(\d+)\b/);

    if (numberMatch) {
        return parseInt(numberMatch[1], 10);
    }

    return 1;
}


// =====================================================
// ADD TO CART REQUEST
// =====================================================

function isAddToCartRequest(message) {

    const text = normalizeText(message);

    return (
        /\badd\b/.test(text) &&
        (
            /\bcart\b/.test(text) ||
            /\bbasket\b/.test(text)
        )
    );
}


// =====================================================
// INCREASE CART REQUEST
// =====================================================

function isIncreaseCartRequest(message) {

    const text = normalizeText(message);

    return (
        /\bincrease\b/.test(text) ||
        /\bincrement\b/.test(text) ||
        /\braise\b/.test(text) ||
        /\badd one more\b/.test(text) ||
        /\bone more\b/.test(text) ||
        /\badd another\b/.test(text) ||
        /\banother\b/.test(text)
    );
}


// =====================================================
// DECREASE CART REQUEST
// =====================================================

function isDecreaseCartRequest(message) {

    const text = normalizeText(message);

    return (
        /\bdecrease\b/.test(text) ||
        /\bdecrement\b/.test(text) ||
        /\breduce\b/.test(text) ||
        /\blower\b/.test(text) ||
        /\bremove one\b/.test(text) ||
        /\bdecrease one\b/.test(text)
    );
}


// =====================================================
// CLEAR CART REQUEST
// =====================================================

function isClearCartRequest(message) {

    const text = normalizeText(message);

    return (
        /\bclear\b.*\bcart\b/.test(text) ||
        /\bempty\b.*\bcart\b/.test(text) ||
        /\bremove all\b.*\bcart\b/.test(text) ||
        /\bdelete all\b.*\bcart\b/.test(text) ||
        /\bremove all products\b/.test(text) ||
        /\bdelete all products\b/.test(text)
    );
}


// =====================================================
// REMOVE SINGLE PRODUCT
// =====================================================

function isRemoveFromCartRequest(message) {

    const text = normalizeText(message);

    return (
        (
            /\bremove\b/.test(text) ||
            /\bdelete\b/.test(text)
        ) &&
        !isClearCartRequest(message) &&
        !isDecreaseCartRequest(message)
    );
}


// =====================================================
// SHOW CART REQUEST
// =====================================================

function isShowCartRequest(message) {

    const text = normalizeText(message);

    return (
        /\bshow\b.*\bcart\b/.test(text) ||
        /\bview\b.*\bcart\b/.test(text) ||
        /\bcheck\b.*\bcart\b/.test(text) ||
        /\bwhat.*\bin.*\bcart\b/.test(text) ||
        /\bwhats.*\bin.*\bcart\b/.test(text) ||
        /^cart$/.test(text)
    );
}


// =====================================================
// CHECKOUT REQUEST
// =====================================================

function isCheckoutRequest(message) {

    const text = normalizeText(message);

    return (
        /\bcheckout\b/.test(text) ||
        /\bcheck out\b/.test(text) ||
        /\bproceed to payment\b/.test(text) ||
        /\bgo to payment\b/.test(text) ||
        /\bbuy now\b/.test(text) ||
        /\bplace order\b/.test(text)
    );
}


// =====================================================
// SPECIFIC PRODUCT QUESTION
// =====================================================

function isSpecificProductQuestion(message) {

    const text = normalizeText(message);

    return (
        /\bprice\b/.test(text) ||
        /\bcost\b/.test(text) ||
        /\bstock\b/.test(text) ||
        /\bavailable\b/.test(text) ||
        /\bavailability\b/.test(text) ||
        /\bdescription\b/.test(text) ||
        /\bcategory\b/.test(text) ||
        /\bsubcategory\b/.test(text)
    );
}


// =====================================================
// DETECT DETAIL TYPE
// =====================================================

function detectDetailType(message) {

    const text = normalizeText(message);

    if (/\bprice\b|\bcost\b/.test(text)) {
        return "price";
    }

    if (
        /\bstock\b/.test(text) ||
        /\bavailable\b/.test(text) ||
        /\bavailability\b/.test(text)
    ) {
        return "stock";
    }

    if (/\bdescription\b/.test(text)) {
        return "description";
    }

    if (/\bsubcategory\b/.test(text)) {
        return "subcategory";
    }

    if (/\bcategory\b/.test(text)) {
        return "category";
    }

    return null;
}


// =====================================================
// MAIN SHOPPING AGENT
// =====================================================

async function askShoppingAgent(message) {

    try {

        const cleanMessage = cleanText(message);

        if (!cleanMessage) {

            return {
                response: "Please enter a message."
            };
        }


        const text = normalizeText(cleanMessage);


        // =================================================
        // GENERAL GREETING
        // =================================================

        const isGreeting =
            /^(hi|hello|hey|hii|helo|good morning|good afternoon|good evening|thanks|thank you)$/
                .test(text);

        if (isGreeting) {

            const greeting =
                await ollama.chat({

                    model: "llama3.2:3b",

                    messages: [
                        {
                            role: "system",
                            content: `
You are the shopping assistant for VELORA.

Reply naturally and briefly.
Do not search products for simple greetings.
`
                        },
                        {
                            role: "user",
                            content: cleanMessage
                        }
                    ]
                });

            return {
                response:
                    greeting?.message?.content?.trim() ||
                    "Hello! Welcome to VELORA. How can I help you?"
            };
        }


        // =================================================
        // SHOW CART
        // =================================================

        if (isShowCartRequest(cleanMessage)) {

            return {
                response:
                    "Please check the cart section to view your current cart.",
                action: "show_cart"
            };
        }


        // =================================================
        // CHECKOUT
        // =================================================

        if (isCheckoutRequest(cleanMessage)) {

            return {
                response:
                    "Your cart is ready. Please proceed to the Checkout page to enter your delivery details, choose a payment method, and place your order.",
                action: "checkout"
            };
        }


        // =================================================
        // CLEAR CART
        // =================================================

        if (isClearCartRequest(cleanMessage)) {

            return {
                response:
                    "All products have been removed from your cart.",
                action: "clear_cart"
            };
        }


        // =================================================
        // ADD TO CART
        // =================================================

        if (
            isAddToCartRequest(cleanMessage) &&
            !isIncreaseCartRequest(cleanMessage)
        ) {

            const productName =
                extractProductNameFromCartMessage(cleanMessage);

            const quantity =
                extractQuantityFromAddMessage(cleanMessage);

            if (quantity <= 0) {

                return {
                    response: "Please provide a valid quantity."
                };
            }

            const product =
                await findProductFromMessage(productName);

            if (!product) {

                return {
                    response:
                        `Sorry, I couldn't find "${productName}".`
                };
            }

            const latestProduct =
                await getProductDetails(
                    product._id || product.id
                );

            if (!latestProduct) {

                return {
                    response:
                        "Sorry, I couldn't get the product details."
                };
            }

            if (latestProduct.stock <= 0) {

                return {
                    response:
                        `${latestProduct.name} is currently out of stock.`
                };
            }

            if (quantity > latestProduct.stock) {

                return {
                    response:
                        `Only ${latestProduct.stock} ${latestProduct.name} are available.`
                };
            }

            return {
                response:
                    `${latestProduct.name} has been added to your cart.`,
                action: "add_to_cart",
                product: latestProduct,
                quantity
            };
        }


        // =================================================
        // INCREASE QUANTITY
        // =================================================

        if (isIncreaseCartRequest(cleanMessage)) {

            const productName =
                extractProductNameFromQuantityMessage(cleanMessage);

            const product =
                await findProductFromMessage(productName);

            if (!product) {

                return {
                    response:
                        `Sorry, I couldn't find "${productName}".`
                };
            }

            const latestProduct =
                await getProductDetails(
                    product._id || product.id
                );

            if (!latestProduct) {

                return {
                    response:
                        "Sorry, I couldn't get the product details."
                };
            }

            if (latestProduct.stock <= 0) {

                return {
                    response:
                        `${latestProduct.name} is currently out of stock.`
                };
            }

            return {
                response:
                    `${latestProduct.name} quantity has been increased.`,
                action: "increase_quantity",
                product: latestProduct
            };
        }


        // =================================================
        // DECREASE QUANTITY
        // =================================================

        if (isDecreaseCartRequest(cleanMessage)) {

            const productName =
                extractProductNameFromQuantityMessage(cleanMessage);

            const product =
                await findProductFromMessage(productName);

            if (!product) {

                return {
                    response:
                        `Sorry, I couldn't find "${productName}".`
                };
            }

            const latestProduct =
                await getProductDetails(
                    product._id || product.id
                );

            if (!latestProduct) {

                return {
                    response:
                        "Sorry, I couldn't get the product details."
                };
            }

            return {
                response:
                    `${latestProduct.name} quantity has been decreased.`,
                action: "decrease_quantity",
                product: latestProduct
            };
        }


        // =================================================
        // REMOVE SINGLE PRODUCT
        // =================================================

        if (isRemoveFromCartRequest(cleanMessage)) {

            const productName =
                extractProductNameFromRemoveMessage(cleanMessage);

            const product =
                await findProductFromMessage(productName);

            if (!product) {

                return {
                    response:
                        `Sorry, I couldn't find "${productName}".`
                };
            }

            const latestProduct =
                await getProductDetails(
                    product._id || product.id
                );

            if (!latestProduct) {

                return {
                    response:
                        "Sorry, I couldn't get the product details."
                };
            }

            return {
                response:
                    `${latestProduct.name} has been removed from your cart.`,
                action: "remove_from_cart",
                product: latestProduct
            };
        }


        // =================================================
        // SPECIFIC PRODUCT DETAILS
        // =================================================

        if (isSpecificProductQuestion(cleanMessage)) {

            const product =
                await findProductFromMessage(cleanMessage);

            if (product) {

                const latestProduct =
                    await getProductDetails(
                        product._id || product.id
                    );

                if (latestProduct) {

                    const detailType =
                        detectDetailType(cleanMessage);

                    let response = "";

                    switch (detailType) {

                        case "price":

                            response =
                                `${latestProduct.name} costs ₹${latestProduct.price}.`;

                            break;

                        case "stock":

                            response =
                                latestProduct.stock > 0
                                    ? `${latestProduct.name} is available with ${latestProduct.stock} items in stock.`
                                    : `${latestProduct.name} is currently out of stock.`;

                            break;

                        case "description":

                            response =
                                `${latestProduct.name}: ${latestProduct.description || "No description available."}`;

                            break;

                        case "category":

                            response =
                                `${latestProduct.name} belongs to the ${latestProduct.category} category.`;

                            break;

                        case "subcategory":

                            response =
                                `${latestProduct.name} belongs to the ${latestProduct.subcategory} subcategory.`;

                            break;
                    }

                    if (response) {

                        return {
                            response,
                            product: latestProduct
                        };
                    }
                }
            }
        }


        // =================================================
        // ASK OLLAMA TO UNDERSTAND PRODUCT SEARCH
        // =================================================

        const result =
            await ollama.chat({

                model: "llama3.2:3b",

                messages: [

                    {
                        role: "system",

                        content: `
You are the product search assistant for VELORA fashion store.

Return ONLY valid JSON.

Use exactly this structure:

{
    "category": "",
    "subcategory": "",
    "minPrice": null,
    "maxPrice": null,
    "search": "",
    "productName": "",
    "detailType": "",
    "sortBy": "",
    "isNewArrival": false,
    "showAll": false,
    "general": false,
    "productDetails": false
}

Allowed sortBy values:

price_asc
price_desc
rating_desc

Rules:

1. "cheapest" means price_asc.
2. "lowest price" means price_asc.
3. "least expensive" means price_asc.
4. "most expensive" means price_desc.
5. "highest price" means price_desc.
6. "costliest" means price_desc.
7. "highest rated" means rating_desc.
8. "best rated" means rating_desc.
9. "top rated" means rating_desc.
10. "new arrivals" means isNewArrival=true.
11. "all products" means showAll=true.
12. Use search for product names or keywords.
13. Do not invent product names.
14. Keep unknown values empty or null.
`
                    },

                    {
                        role: "user",
                        content: cleanMessage
                    }

                ]
            });


        // =================================================
        // PARSE OLLAMA JSON
        // =================================================

        let parsed;

        try {

            parsed =
                JSON.parse(result.message.content);

        } catch (error) {

            const jsonMatch =
                result.message.content.match(/\{[\s\S]*\}/);

            if (jsonMatch) {

                parsed =
                    JSON.parse(jsonMatch[0]);

            } else {

                return {
                    response:
                        "Sorry, I couldn't understand your request."
                };
            }
        }


        // =================================================
        // CATEGORY CORRECTIONS
        // =================================================

        if (/\bdresses?\b/.test(text)) {

            parsed.subcategory = "Dresses";
            parsed.category = "Women";
        }

        if (/\btops?\b/.test(text)) {

            parsed.subcategory = "Tops";
            parsed.category = "Women";
        }

        if (/\bethnic wear\b/.test(text)) {

            parsed.subcategory = "Ethnic Wear";
            parsed.category = "Women";
        }

        if (/\bouterwear\b/.test(text)) {

            parsed.subcategory = "Outerwear";
            parsed.category = "Women";
        }

        if (/\bshirts?\b/.test(text)) {

            parsed.subcategory = "Shirts";
            parsed.category = "Men";
        }

        if (/\bjeans?\b/.test(text)) {

            parsed.subcategory = "Jeans";
            parsed.category = "Men";
        }

        if (/\bjackets?\b/.test(text)) {

            parsed.subcategory = "Jackets";
        }

        if (/\bbags?\b/.test(text)) {

            parsed.subcategory = "Bags";
            parsed.category = "Accessories";
        }

        if (/\bwallets?\b/.test(text)) {

            parsed.subcategory = "Wallets";
            parsed.category = "Accessories";
        }

        if (/\bwatches?\b/.test(text)) {

            parsed.subcategory = "Watches";
            parsed.category = "Accessories";
        }

        if (/\bsunglasses\b/.test(text)) {

            parsed.subcategory = "Sunglasses";
            parsed.category = "Accessories";
        }


        // =================================================
        // CATEGORY
        // =================================================

        if (/\bwomen\b|\bwomens\b/.test(text)) {

            parsed.category = "Women";
        }

        if (/\bmen\b|\bmens\b/.test(text)) {

            parsed.category = "Men";
        }

        if (/\baccessories\b|\baccessory\b/.test(text)) {

            parsed.category = "Accessories";
        }


        // =================================================
        // NEW ARRIVALS
        // =================================================

        if (
            /\bnew arrivals?\b/.test(text) ||
            /\bnew products?\b/.test(text) ||
            /\blatest products?\b/.test(text)
        ) {

            parsed.isNewArrival = true;
        }


        // =================================================
        // PRICE FILTER - UNDER
        // =================================================

        const underPrice =
            text.match(
                /(?:under|below|less than|up to)\s*(?:₹|rs\.?|rupees?)?\s*(\d+)/
            );

        if (underPrice) {

            parsed.maxPrice =
                parseInt(underPrice[1], 10);
        }


        // =================================================
        // PRICE FILTER - ABOVE
        // =================================================

        const abovePrice =
            text.match(
                /(?:above|over|more than|greater than)\s*(?:₹|rs\.?|rupees?)?\s*(\d+)/
            );

        if (abovePrice) {

            parsed.minPrice =
                parseInt(abovePrice[1], 10);
        }


        // =================================================
        // PRICE FILTER - BETWEEN
        // =================================================

        const betweenPrice =
            text.match(
                /between\s*(?:₹|rs\.?|rupees?)?\s*(\d+)\s*(?:and|to|-)\s*(?:₹|rs\.?|rupees?)?\s*(\d+)/
            );

        if (betweenPrice) {

            parsed.minPrice =
                parseInt(betweenPrice[1], 10);

            parsed.maxPrice =
                parseInt(betweenPrice[2], 10);
        }


        // =================================================
        // SORTING
        // =================================================

        if (
            /\bcheapest\b/.test(text) ||
            /\blowest price\b/.test(text) ||
            /\bleast expensive\b/.test(text) ||
            /\blow price\b/.test(text)
        ) {

            parsed.sortBy = "price_asc";
        }


        if (
            /\bmost expensive\b/.test(text) ||
            /\bhighest price\b/.test(text) ||
            /\bcostliest\b/.test(text) ||
            /\bmost costly\b/.test(text)
        ) {

            parsed.sortBy = "price_desc";
        }


        if (
            /\bhighest rated\b/.test(text) ||
            /\bhighest rating\b/.test(text) ||
            /\bbest rated\b/.test(text) ||
            /\btop rated\b/.test(text) ||
            /\bbest rating\b/.test(text) ||
            /\bhighestrated\b/.test(text)
        ) {

            parsed.sortBy = "rating_desc";
        }


        // =================================================
        // SORT REQUEST
        // =================================================

        if (parsed.sortBy) {

            parsed.showAll = false;
        }


        // =================================================
        // SEARCH PRODUCTS
        // =================================================

        const products =
            await searchProducts({

                category:
                    parsed.category || null,

                subcategory:
                    parsed.subcategory || null,

                minPrice:
                    parsed.minPrice ?? null,

                maxPrice:
                    parsed.maxPrice ?? null,

                search:
                    parsed.search ||
                    parsed.productName ||
                    "",

                isNewArrival:
                    parsed.isNewArrival || false,

                sortBy:
                    parsed.sortBy || null
            });


        // =================================================
        // NO PRODUCTS
        // =================================================

        if (!products || products.length === 0) {

            return {
                response:
                    "Sorry, I couldn't find any products matching your request."
            };
        }


        // =================================================
        // DISPLAY PRODUCTS
        // =================================================

        let displayProducts = products;

        if (parsed.sortBy) {

            displayProducts =
                products.slice(0, 1);

        } else if (parsed.showAll) {

            displayProducts =
                products;

        } else {

            displayProducts =
                products.slice(0, 3);
        }


        // =================================================
        // RESPONSE TITLE
        // =================================================

        let response = "";

        if (parsed.sortBy === "price_asc") {

            response =
                "Here is the cheapest option:\n\n";

        } else if (parsed.sortBy === "price_desc") {

            response =
                "Here is the most expensive option:\n\n";

        } else if (parsed.sortBy === "rating_desc") {

            response =
                "Here is the highest-rated option:\n\n";

        } else {

            response =
                "Here are the products I found:\n\n";
        }


        // =================================================
        // PRODUCT LIST
        // =================================================

        displayProducts.forEach((product, index) => {

            response +=
                `${index + 1}. ${product.name}\n` +
                `Price: ₹${product.price}\n` +
                `Availability: ${
                    product.stock > 0
                        ? `${product.stock} in stock`
                        : "Out of stock"
                }\n\n`;
        });


        return {
            response,
            products: displayProducts
        };

    } catch (error) {

        console.error(
            "Shopping Agent Error:",
            error
        );

        return {
            response:
                "Sorry, something went wrong while processing your request."
        };
    }
}


module.exports = {
    askShoppingAgent
};