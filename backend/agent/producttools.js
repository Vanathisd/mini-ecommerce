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
    category = null,
    subcategory = null,
    minPrice = null,
    maxPrice = null,
    search = null,
    isNewArrival = null
}) {

    try {

        const query = {
            $and: [

                // Product must not be deleted
                {
                    $or: [
                        { isDeleted: false },
                        { isDeleted: { $exists: false } }
                    ]
                },

                // Only products currently available
                {
                    stock: { $gt: 0 }
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
        // NEW ARRIVAL FILTER
        // ==================================================

        if (isNewArrival === true) {

            query.$and.push({

                isNewArrival: true

            });

        }


        // ==================================================
        // MINIMUM PRICE
        // ==================================================

        if (
            minPrice !== null &&
            minPrice !== undefined &&
            !Number.isNaN(Number(minPrice))
        ) {

            query.$and.push({

                price: {
                    $gte: Number(minPrice)
                }

            });

        }


        // ==================================================
        // MAXIMUM PRICE
        // ==================================================

        if (
            maxPrice !== null &&
            maxPrice !== undefined &&
            !Number.isNaN(Number(maxPrice))
        ) {

            query.$and.push({

                price: {
                    $lte: Number(maxPrice)
                }

            });

        }


        // ==================================================
        // KEYWORD SEARCH
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
            "MongoDB search query:"
        );

        console.log(
            JSON.stringify(
                query,
                null,
                2
            )
        );


        // ==================================================
        // IMPORTANT:
        // SORT RESULTS
        // ==================================================
        //
        // createdAt descending gives newest products first.
        // _id descending makes the ordering deterministic
        // when createdAt is equal.
        //
        // NO random selection.
        // ==================================================

        const products =
            await Product.find(query)

                .select(
                    "name category subcategory description price stock image rating reviews isNewArrival createdAt"
                )

                .sort({
                    createdAt: -1,
                    _id: -1
                });


        console.log(
            "Products found count:",
            products.length
        );


        console.log(
            "Products found:",
            products.map(
                product => product.name
            )
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
                .trim();


        console.log(
            "Searching exact product:",
            cleanName
        );


        // ==================================================
        // 1. EXACT PRODUCT NAME
        // ==================================================

        let product =
            await Product.findOne({

                name: {

                    $regex:
                        `^${escapeRegex(cleanName)}$`,

                    $options: "i"

                },

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

            });


        // ==================================================
        // 2. PARTIAL PRODUCT NAME
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

                        {
                            isDeleted: false
                        },

                        {
                            isDeleted: {
                                $exists: false
                            }
                        }

                    ]

                })

                .sort({
                    createdAt: -1,
                    _id: -1
                });

        }


        // ==================================================
        // 3. WORD-BY-WORD SEARCH
        // ==================================================

        if (!product) {

            const words =
                cleanName
                    .split(/\s+/)
                    .filter(Boolean)
                    .map(
                        word =>
                            escapeRegex(word)
                    );


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

                            $regex:
                                wordRegex,

                            $options: "i"

                        },

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

                    })

                    .sort({
                        createdAt: -1,
                        _id: -1
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
            String(message)
                .trim();


        // ==================================================
        // IMPORTANT:
        // FIRST TRY TO FIND A PRODUCT BY THE ENTIRE MESSAGE
        // AFTER REMOVING QUESTION WORDS.
        // ==================================================

        let productText =
            cleanMessage

                .replace(
                    /\b(how much|what is the price|what's the price|price of|cost of|how many|is|are|available|availability|in stock|stock of|stock|tell me about|give me details|give details|show me details|show details|describe|description of|what category|what subcategory|what is|what's)\b/gi,
                    " "
                )

                .replace(
                    /[?!.]/g,
                    " "
                )

                .replace(
                    /\s+/g,
                    " "
                )

                .trim();


        if (!productText) {

            return null;

        }


        console.log(
            "Possible product name:",
            productText
        );


        const product =
            await getProductDetails(
                productText
            );


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