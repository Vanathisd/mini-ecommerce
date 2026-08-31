const Product = require("../models/product");



function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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


        // ==================================================
        // DEBUG QUERY
        // ==================================================

        console.log(
            "MongoDB search query:",
            JSON.stringify(
                query,
                null,
                2
            )
        );


        // ==================================================
        // DATABASE SEARCH
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
                product => ({
                    name: product.name,
                    stock: product.stock
                })
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
                .replace(/\s+/g, " ")
                .trim();


        console.log(
            "Searching specific product:",
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

                ...activeProductFilter()

            });


        if (product) {

            console.log(
                "EXACT PRODUCT FOUND:",
                product.name,
                "STOCK:",
                product.stock
            );

            return product;

        }


        // ==================================================
        // FLEXIBLE WORD MATCH
        // ==================================================

        const words =
            cleanName
                .split(/\s+/)
                .filter(Boolean)
                .map(
                    word =>
                        escapeRegex(word)
                );


        if (words.length > 0) {

            const wordConditions =
                words.map(word => ({

                    name: {
                        $regex: word,
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


        console.log(
            "Product detail result:",
            product
                ? `${product.name} | STOCK: ${product.stock}`
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
        // REMOVE PRICE QUESTION WORDS
        // ==================================================

        productText =
            productText

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

                .replace(
                    /\bhow\s+much\b/gi,
                    " "
                );


        // ==================================================
        // REMOVE STOCK QUESTION WORDS
        // ==================================================

        productText =
            productText

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
                    /\bis\s+it\s+available\b/gi,
                    " "
                )

                .replace(
                    /\bis\s+this\s+available\b/gi,
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
                    " "
                );


        // ==================================================
        // REMOVE DETAIL QUESTION WORDS
        // ==================================================

        productText =
            productText

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

        const exactProduct =
            await Product.findOne({

                name: {
                    $regex:
                        `^${escapeRegex(productText)}$`,
                    $options: "i"
                },

                ...activeProductFilter()

            });


        if (exactProduct) {

            console.log(
                "EXACT PRODUCT FOUND:",
                exactProduct.name,
                "STOCK:",
                exactProduct.stock
            );

            return exactProduct;

        }


        // ==================================================
        // ALL WORDS MUST EXIST IN PRODUCT NAME
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


            const product =
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
                    "STOCK:",
                    product.stock
                );

                return product;

            }

        }


        // ==================================================
        // NO SPECIFIC PRODUCT FOUND
        // ==================================================

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