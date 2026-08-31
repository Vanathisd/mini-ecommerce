const Product = require("../models/product");

// ======================================================
// ESCAPE REGEX
// ======================================================

function escapeRegex(text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ======================================================
// SEARCH PRODUCTS
// ======================================================

async function searchProducts({
    category,
    subcategory,
    minPrice,
    maxPrice,
    search
}) {
    try {

        const query = {
            $and: [
                {
                    $or: [
                        { isDeleted: false },
                        { isDeleted: { $exists: false } }
                    ]
                },
                {
                    stock: { $gt: 0 }
                }
            ]
        };

        // ==================================================
        // CATEGORY
        // ==================================================

        if (
            category !== undefined &&
            category !== null &&
            String(category).trim() !== ""
        ) {
            query.$and.push({
                category: {
                    $regex: `^${escapeRegex(String(category).trim())}$`,
                    $options: "i"
                }
            });
        }

        // ==================================================
        // SUBCATEGORY
        // ==================================================

        if (
            subcategory !== undefined &&
            subcategory !== null &&
            String(subcategory).trim() !== ""
        ) {
            query.$and.push({
                subcategory: {
                    $regex: `^${escapeRegex(String(subcategory).trim())}$`,
                    $options: "i"
                }
            });
        }

        // ==================================================
        // MIN PRICE
        // ==================================================

        if (
            minPrice !== undefined &&
            minPrice !== null &&
            !Number.isNaN(Number(minPrice))
        ) {
            query.$and.push({
                price: {
                    $gte: Number(minPrice)
                }
            });
        }

        // ==================================================
        // MAX PRICE
        // ==================================================

        if (
            maxPrice !== undefined &&
            maxPrice !== null &&
            !Number.isNaN(Number(maxPrice))
        ) {
            query.$and.push({
                price: {
                    $lte: Number(maxPrice)
                }
            });
        }

        // ==================================================
        // SEARCH KEYWORD
        // ==================================================

        if (
            search !== undefined &&
            search !== null &&
            String(search).trim() !== ""
        ) {

            const escapedSearch =
                escapeRegex(String(search).trim());

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

        const products =
            await Product.find(query)
                .select(
                    "name category subcategory description price stock image rating reviews"
                );

        console.log(
            "Products found count:",
            products.length
        );

        console.log(
            "Products found:",
            products.map(product => product.name)
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
            String(productName).trim();

        console.log(
            "Searching exact product:",
            cleanName
        );

        // ==================================================
        // EXACT NAME MATCH
        // ==================================================

        let product =
            await Product.findOne({

                name: {
                    $regex:
                        `^${escapeRegex(cleanName)}$`,
                    $options: "i"
                },

                $or: [
                    { isDeleted: false },
                    { isDeleted: { $exists: false } }
                ]

            });

        // ==================================================
        // PARTIAL NAME MATCH
        // ==================================================

        if (!product) {

            console.log(
                "Exact product not found. Trying partial search..."
            );

            product =
                await Product.findOne({

                    name: {
                        $regex:
                            escapeRegex(cleanName),
                        $options: "i"
                    },

                    $or: [
                        { isDeleted: false },
                        { isDeleted: { $exists: false } }
                    ]

                });
        }

        // ==================================================
        // FLEXIBLE WORD SEARCH
        // ==================================================

        if (!product) {

            const words =
                cleanName
                    .split(/\s+/)
                    .filter(Boolean)
                    .map(word => escapeRegex(word));

            if (words.length > 0) {

                const wordRegex =
                    words.join(".*");

                console.log(
                    "Trying flexible product search:",
                    wordRegex
                );

                product =
                    await Product.findOne({

                        name: {
                            $regex: wordRegex,
                            $options: "i"
                        },

                        $or: [
                            { isDeleted: false },
                            { isDeleted: { $exists: false } }
                        ]

                    });
            }
        }

        console.log(
            "Product detail result:",
            product
                ? product.name
                : "NOT FOUND"
        );

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
// FIND PRODUCT FROM USER MESSAGE
// ======================================================

async function findProductFromMessage(message) {

    try {

        if (!message) {
            return null;
        }

        const cleanMessage =
            String(message).trim();

        console.log(
            "Trying to detect product from message:",
            cleanMessage
        );

        // --------------------------------------------------
        // Remove common question words
        // --------------------------------------------------

        let productText =
            cleanMessage
                .replace(
                    /\b(how much|what is the price|what's the price|price of|cost of|how many|is|are|available|availability|in stock|stock of|stock|tell me about|give me details|show me details|describe|description of|what category|what subcategory)\b/gi,
                    " "
                )
                .replace(/[?!.]/g, " ")
                .replace(/\s+/g, " ")
                .trim();

        if (!productText) {
            return null;
        }

        console.log(
            "Possible product name:",
            productText
        );

        const product =
            await getProductDetails(productText);

        return product;

    } catch (error) {

        console.error(
            "findProductFromMessage error:",
            error
        );

        return null;
    }
}

// ======================================================
// EXPORT
// ======================================================

module.exports = {
    searchProducts,
    getProductDetails,
    findProductFromMessage
};