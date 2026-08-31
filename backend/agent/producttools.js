
const Product = require("../models/product");


// ======================================================
// ESCAPE REGEX
// ======================================================

function escapeRegex(text) {

    return String(text)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

}


// ======================================================
// ACTIVE PRODUCT FILTER
// ======================================================

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

    isNewArrival = false

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
        // MIN PRICE
        // ==================================================

        if (

            minPrice !== null &&

            minPrice !== undefined &&

            !Number.isNaN(
                Number(minPrice)
            )

        ) {

            query.$and.push({

                price: {

                    $gte:
                        Number(minPrice)

                }

            });

        }


        // ==================================================
        // MAX PRICE
        // ==================================================

        if (

            maxPrice !== null &&

            maxPrice !== undefined &&

            !Number.isNaN(
                Number(maxPrice)
            )

        ) {

            query.$and.push({

                price: {

                    $lte:
                        Number(maxPrice)

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

                            $regex:
                                escapedSearch,

                            $options: "i"

                        }

                    },

                    {

                        description: {

                            $regex:
                                escapedSearch,

                            $options: "i"

                        }

                    }

                ]

            });

        }


        console.log(
            "MongoDB search query:",
            JSON.stringify(
                query,
                null,
                2
            )
        );


        // ==================================================
        // DETERMINISTIC RESULT ORDER
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
            "Products found:",
            products.length
        );


        console.log(

            "Products:",

            products.map(
                product =>
                    product.name
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

                .replace(
                    /\s+/g,
                    " "
                )

                .trim();


        console.log(
            "Searching product case-insensitively:",
            cleanName
        );


        // ==================================================
        // 1. EXACT NAME MATCH
        // ==================================================
        //
        // IMPORTANT:
        //
        // $options: "i"
        //
        // means:
        //
        // Premium Formal Shirt
        // premium formal shirt
        // PREMIUM FORMAL SHIRT
        //
        // are all treated as the same name.
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


        if (product) {

            console.log(
                "EXACT PRODUCT FOUND:",
                product.name
            );

            return product;

        }


        // ==================================================
        // 2. FLEXIBLE WORD MATCH
        // ==================================================
        //
        // This is only used if exact name doesn't exist.
        //
        // Example:
        //
        // "premium formal shirt"
        //
        // can match:
        //
        // "Premium Formal Shirt for Men"
        //
        // But the exact match above always gets priority.
        // ==================================================

        const words =
            cleanName

                .split(/\s+/)

                .filter(
                    word =>
                        word.length > 0
                )

                .map(
                    word =>
                        escapeRegex(word)
                );


        if (
            words.length > 0
        ) {

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

        console.log(
            "Trying to detect product from message:",
            cleanMessage
        );


        // ================================================
        // REMOVE QUESTION WORDS
        // ================================================

        let productText =
            cleanMessage

                .replace(
                    /\b(what\s+is\s+the\s+price|what\s+is\s+price|what's\s+the\s+price|what\s+is\s+the\s+cost|what's\s+the\s+cost|price\s+of|cost\s+of|how\s+much|how\s+many|tell\s+me\s+about|give\s+me\s+details|give\s+details|show\s+me\s+details|show\s+details|description\s+of|what\s+category|what\s+subcategory|describe|description|available|availability|in\s+stock|stock\s+of|stock)\b/gi,

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


        // ================================================
        // REMOVE "IS" AND "ARE" ONLY WHEN THEY ARE
        // STANDALONE WORDS
        // ================================================

        productText =
            productText
                .replace(
                    /^(is|are)\s+/i,
                    ""
                )
                .trim();


        if (!productText) {

            return null;

        }


        console.log(
            "Possible product name:",
            productText
        );


        // ================================================
        // SEARCH DATABASE
        // ================================================

        const product =
            await getProductDetails(
                productText
            );


        console.log(
            "Detected product:",
            product
                ? product.name
                : "NONE"
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

