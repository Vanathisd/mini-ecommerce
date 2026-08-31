
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
// FIND SPECIFIC PRODUCT FROM USER MESSAGE
// ======================================================

async function findProductFromMessage(message) {

    try {

        if (!message) {
            return null;
        }

        const cleanMessage =
            String(message)
                .trim();

        if (!cleanMessage) {
            return null;
        }

        console.log(
            "Trying to detect product from message:",
            cleanMessage
        );


        // ==================================================
        // STEP 1: REMOVE QUESTION PHRASES
        // ==================================================

        let productText =
            cleanMessage;


        productText =
            productText

                // price questions
                .replace(
                    /\bwhat\s+is\s+the\s+price\s+of\b/gi,
                    " "
                )

                .replace(
                    /\bwhat\s+is\s+price\s+of\b/gi,
                    " "
                )

                .replace(
                    /\bwhat's\s+the\s+price\s+of\b/gi,
                    " "
                )

                .replace(
                    /\bwhat\s+is\s+the\s+cost\s+of\b/gi,
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

                // stock questions
                .replace(
                    /\bhow\s+many\b/gi,
                    " "
                )

                .replace(
                    /\bis\s+available\b/gi,
                    " "
                )

                .replace(
                    /\bare\s+available\b/gi,
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

                // general detail questions
                .replace(
                    /\btell\s+me\s+about\b/gi,
                    " "
                )

                .replace(
                    /\bgive\s+me\s+details\s+about\b/gi,
                    " "
                )

                .replace(
                    /\bgive\s+me\s+details\b/gi,
                    " "
                )

                .replace(
                    /\bshow\s+me\s+details\s+about\b/gi,
                    " "
                )

                .replace(
                    /\bshow\s+me\s+details\b/gi,
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

                // remove common question words
                .replace(
                    /\bwhat\s+is\b/gi,
                    " "
                )

                .replace(
                    /\bwhat's\b/gi,
                    " ");


        // ==================================================
        // STEP 2: REMOVE PUNCTUATION
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
        // STEP 3: EXACT PRODUCT NAME
        // ==================================================

        let product =
            await Product.findOne({

                name: {
                    $regex:
                        `^${escapeRegex(productText)}$`,
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
        // STEP 4: ALL WORDS MUST EXIST IN PRODUCT NAME
        // ==================================================

        const words =
            productText
                .split(/\s+/)
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

                        {
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
                        },

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
                    product.name
                );

                return product;

            }

        }


        // ==================================================
        // STEP 5: FLEXIBLE PRODUCT NAME SEARCH
        // ==================================================

        if (words.length > 0) {

            const wordRegex =
                words
                    .map(word =>
                        escapeRegex(word)
                    )
                    .join(".*");


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


            if (product) {

                console.log(
                    "FLEXIBLE PRODUCT FOUND:",
                    product.name
                );

                return product;

            }

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

