const Product = require("../models/product");


function escapeRegex(text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeText(text) {
    return String(text || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
}


function activeProductFilter() {
    return {
        $or: [
            {
                isDeleted: false
            },
            {
                isDeleted: {
                    $exists: false
                }
            }
        ]
    };
}


// ======================================================
// SEARCH PRODUCTS
// ======================================================

async function searchProducts({
    category = null,
    subcategory = null,
    minPrice = null,
    maxPrice = null,
    search = null,
    isNewArrival = false,
    sortBy = null
}) {

    try {

        const query = {
            $and: [
                activeProductFilter(),

                {
                    stock: {
                        $gt: 0
                    }
                }
            ]
        };


        // ==================================================
        // CATEGORY
        // ==================================================

        if (
            category !== null &&
            category !== undefined &&
            String(category).trim() !== ""
        ) {

            query.$and.push({
                category: {
                    $regex:
                        `^${escapeRegex(
                            String(category).trim()
                        )}$`,
                    $options: "i"
                }
            });

        }


        // ==================================================
        // SUBCATEGORY
        // ==================================================

        if (
            subcategory !== null &&
            subcategory !== undefined &&
            String(subcategory).trim() !== ""
        ) {

            query.$and.push({
                subcategory: {
                    $regex:
                        `^${escapeRegex(
                            String(subcategory).trim()
                        )}$`,
                    $options: "i"
                }
            });

        }


        // ==================================================
        // NEW ARRIVALS
        // ==================================================

        if (isNewArrival === true) {

            query.$and.push({
                isNewArrival: true
            });

        }


        // ==================================================
        // PRICE
        // ==================================================

        if (
            minPrice !== null &&
            minPrice !== undefined &&
            Number.isFinite(Number(minPrice))
        ) {

            query.$and.push({
                price: {
                    $gte: Number(minPrice)
                }
            });

        }


        if (
            maxPrice !== null &&
            maxPrice !== undefined &&
            Number.isFinite(Number(maxPrice))
        ) {

            query.$and.push({
                price: {
                    $lte: Number(maxPrice)
                }
            });

        }


        // ==================================================
        // SEARCH
        // ==================================================

        if (
            search !== null &&
            search !== undefined &&
            String(search).trim() !== ""
        ) {

            const escapedSearch =
                escapeRegex(
                    String(search).trim()
                );


            query.$and.push({
                $or: [
                    {
                        name: {
                            $regex: escapedSearch,
                            $options: "i"
                        }
                    },
                    {
                        description: {
                            $regex: escapedSearch,
                            $options: "i"
                        }
                    }
                ]
            });

        }


        console.log(
            "MongoDB search query:",
            JSON.stringify(query, null, 2)
        );


        // ==================================================
// SORTING
// ==================================================

let sortQuery = {
    createdAt: -1,
    _id: -1
};


// Cheapest
if (sortBy === "price_asc") {

    sortQuery = {
        price: 1,
        _id: 1
    };

}


// Most expensive
else if (sortBy === "price_desc") {

    sortQuery = {
        price: -1,
        _id: -1
    };

}


// Highest rated
else if (sortBy === "rating_desc") {

    sortQuery = {
        rating: -1,
        _id: -1
    };

}


const products =
    await Product.find(query)
        .select(
            "name category subcategory description price stock image rating reviews isNewArrival createdAt"
        )
        .sort(sortQuery);


        console.log(
            "Products found:",
            products.length
        );


        console.log(
            "Products:",
            products.map(product => ({
                name: product.name,
                price: product.price,
                stock: product.stock
            }))
        );


        return products;

    } catch (error) {

        console.error(
            "Product search error:",
            error
        );

        throw error;

    }

}


// ======================================================
// GET SPECIFIC PRODUCT DETAILS
// ======================================================

async function getProductDetails(productName) {

    try {

        if (
            !productName ||
            String(productName).trim() === ""
        ) {
            return null;
        }


        const cleanName =
            String(productName)
                .replace(/\s+/g, " ")
                .trim();


        console.log(
            "Searching specific product:",
            cleanName
        );


        // ==================================================
        // EXACT MATCH
        // ==================================================

        let product =
            await Product.findOne({

                name: {
                    $regex:
                        `^${escapeRegex(cleanName)}$`,
                    $options: "i"
                },

                ...activeProductFilter()

            });


        if (product) {

            console.log(
                "EXACT PRODUCT FOUND:",
                product.name,
                "PRICE:",
                product.price,
                "STOCK:",
                product.stock
            );

            return product;

        }


        // ==================================================
        // WORD MATCH
        // ==================================================

        const words =
            normalizeText(cleanName)
                .split(" ")
                .filter(Boolean);


        if (words.length > 0) {

            const wordConditions =
                words.map(word => ({
                    name: {
                        $regex:
                            escapeRegex(word),
                        $options: "i"
                    }
                }));


            product =
                await Product.findOne({

                    $and: [

                        activeProductFilter(),

                        ...wordConditions

                    ]

                })
                .sort({
                    createdAt: -1,
                    _id: -1
                });

        }


        if (product) {

            console.log(
                "WORD MATCH PRODUCT FOUND:",
                product.name,
                "PRICE:",
                product.price,
                "STOCK:",
                product.stock
            );

        } else {

            console.log(
                "Product detail result: NOT FOUND"
            );

        }


        return product;

    } catch (error) {

        console.error(
            "Get product details error:",
            error
        );

        throw error;

    }

}


// ======================================================
// LEVENSHTEIN DISTANCE
// Used for small spelling mistakes
// ======================================================

function levenshtein(a, b) {

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {

        for (let j = 1; j <= a.length; j++) {

            if (
                b.charAt(i - 1) ===
                a.charAt(j - 1)
            ) {

                matrix[i][j] =
                    matrix[i - 1][j - 1];

            } else {

                matrix[i][j] =
                    Math.min(

                        matrix[i - 1][j] + 1,

                        matrix[i][j - 1] + 1,

                        matrix[i - 1][j - 1] + 1

                    );

            }

        }

    }

    return matrix[b.length][a.length];

}


// ======================================================
// CHECK SIMILAR WORD
// ======================================================

function isSimilarWord(input, databaseWord) {

    const a =
        normalizeText(input);

    const b =
        normalizeText(databaseWord);


    if (!a || !b) {
        return false;
    }


    if (a === b) {
        return true;
    }


    // Very short words should not be fuzzy matched
    if (a.length <= 3 || b.length <= 3) {
        return false;
    }


    const distance =
        levenshtein(a, b);


    // Allow 1 typo for normal words
    if (Math.max(a.length, b.length) <= 8) {
        return distance <= 1;
    }


    // Allow up to 2 typos for longer words
    return distance <= 2;

}


// ======================================================
// FIND PRODUCT USING FUZZY WORD MATCH
// ======================================================

async function findFuzzyProduct(productText) {

    const products =
        await Product.find({
            ...activeProductFilter()
        })
        .select(
            "name category subcategory description price stock image rating reviews isNewArrival createdAt"
        );


    const inputWords =
        normalizeText(productText)
            .split(" ")
            .filter(Boolean);


    if (inputWords.length === 0) {
        return null;
    }


    let bestProduct = null;
    let bestScore = 0;


    for (const product of products) {

        const productWords =
            normalizeText(product.name)
                .split(" ")
                .filter(Boolean);


        let matchedWords = 0;


        for (const inputWord of inputWords) {

            const matched =
                productWords.some(
                    productWord =>
                        isSimilarWord(
                            inputWord,
                            productWord
                        )
                );


            if (matched) {
                matchedWords++;
            }

        }


        const score =
            matchedWords / inputWords.length;


        if (
            score > bestScore &&
            score >= 0.6
        ) {

            bestScore = score;
            bestProduct = product;

        }

    }


    if (bestProduct) {

        console.log(
            "FUZZY PRODUCT FOUND:",
            bestProduct.name,
            "PRICE:",
            bestProduct.price,
            "STOCK:",
            bestProduct.stock
        );

    }


    return bestProduct;

}


// ======================================================
// FIND PRODUCT FROM MESSAGE
// ======================================================

async function findProductFromMessage(message) {

    try {

        if (!message) {
            return null;
        }


        const cleanMessage =
            String(message)
                .replace(/\s+/g, " ")
                .trim();


        if (!cleanMessage) {
            return null;
        }


        console.log(
            "Trying to detect product from message:",
            cleanMessage
        );


        let productText =
            cleanMessage;


        // ==================================================
        // REMOVE QUESTION PHRASES
        // ==================================================

        productText =
            productText

                // Price
                .replace(
                    /\bwhat\s+is\s+the\s+price\s+of\b/gi,
                    " "
                )

                .replace(
                    /\bwhat\s+is\s+the\s+cost\s+of\b/gi,
                    " "
                )

                .replace(
                    /\bwhat's\s+the\s+price\s+of\b/gi,
                    " "
                )

                .replace(
                    /\bwhat's\s+the\s+cost\s+of\b/gi,
                    " "
                )

                .replace(
                    /\bprice\s+of\b/gi,
                    " "
                )

                .replace(
                    /\bcost\s+of\b/gi,
                    " "
                )

                .replace(
                    /\bhow\s+much\s+is\b/gi,
                    " "
                )

                .replace(
                    /\bhow\s+much\b/gi,
                    " ")


                // Availability
                .replace(
                    /\bis\s+available\b/gi,
                    " "
                )

                .replace(
                    /\bare\s+available\b/gi,
                    " "
                )

                .replace(
                    /\bis\s+it\s+available\b/gi,
                    " "
                )

                .replace(
                    /\bis\s+this\s+available\b/gi,
                    " "
                )

                .replace(
                    /\bavailable\b/gi,
                    " "
                )

                .replace(
                    /\bavailability\s+of\b/gi,
                    " "
                )

                .replace(
                    /\bin\s+stock\b/gi,
                    " "
                )

                .replace(
                    /\bstock\s+of\b/gi,
                    " "
                )

                .replace(
                    /\bdo\s+you\s+have\b/gi,
                    " "
                )

                .replace(
                    /\bdo\s+you\s+have\s+any\b/gi,
                    " ")


                // Details
                .replace(
                    /\btell\s+me\s+about\b/gi,
                    " "
                )

                .replace(
                    /\bgive\s+me\s+details\s+about\b/gi,
                    " "
                )

                .replace(
                    /\bshow\s+me\s+details\s+about\b/gi,
                    " "
                )

                .replace(
                    /\bdescription\s+of\b/gi,
                    " "
                )

                .replace(
                    /\bwhat\s+category\s+is\b/gi,
                    " "
                )

                .replace(
                    /\bwhat\s+subcategory\s+is\b/gi,
                    " "
                )

                .replace(
                    /\bwhat\s+is\b/gi,
                    " "
                )

                .replace(
                    /\bwhat's\b/gi,
                    " ");


        // ==================================================
        // REMOVE PUNCTUATION
        // ==================================================

        productText =
            productText
                .replace(/[?!.:,]/g, " ")
                .replace(/\s+/g, " ")
                .trim();


        console.log(
            "Possible product name:",
            productText
        );


        if (!productText) {
            return null;
        }


        // ==================================================
        // EXACT PRODUCT NAME
        // ==================================================

        let product =
            await Product.findOne({

                name: {
                    $regex:
                        `^${escapeRegex(productText)}$`,
                    $options: "i"
                },

                ...activeProductFilter()

            });


        if (product) {

            console.log(
                "EXACT PRODUCT FOUND:",
                product.name,
                "PRICE:",
                product.price,
                "STOCK:",
                product.stock
            );

            return product;

        }


        // ==================================================
        // WORD MATCH
        // ==================================================

        const words =
            normalizeText(productText)
                .split(" ")
                .filter(Boolean);


        if (words.length > 0) {

            const wordConditions =
                words.map(word => ({
                    name: {
                        $regex:
                            escapeRegex(word),
                        $options: "i"
                    }
                }));


            product =
                await Product.findOne({

                    $and: [

                        activeProductFilter(),

                        ...wordConditions

                    ]

                })
                .sort({
                    createdAt: -1,
                    _id: -1
                });


            if (product) {

                console.log(
                    "ALL-WORD PRODUCT FOUND:",
                    product.name,
                    "PRICE:",
                    product.price,
                    "STOCK:",
                    product.stock
                );

                return product;

            }

        }


        // ==================================================
        // FUZZY MATCH
        // Handles:
        //
        // avaitor -> aviator
        // sunglasess -> sunglasses
        // shrit -> shirt
        // ==================================================

        product =
            await findFuzzyProduct(
                productText
            );


        if (product) {

            return product;

        }


        console.log(
            "NO SPECIFIC PRODUCT FOUND"
        );


        return null;

    } catch (error) {

        console.error(
            "findProductFromMessage error:",
            error
        );

        return null;

    }

}


module.exports = {

    searchProducts,

    getProductDetails,

    findProductFromMessage

};