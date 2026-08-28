const Product = require("../models/product");

async function searchProducts({
    category,
    subcategory,
    maxPrice,
    minPrice,
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

        if (category) {
            query.$and.push({
                category: new RegExp(`^${category}$`, "i")
            });
        }

        if (subcategory) {
            query.$and.push({
                subcategory: new RegExp(`^${subcategory}$`, "i")
            });
        }

        if (minPrice !== undefined) {
            query.$and.push({
                price: {
                    $gte: Number(minPrice)
                }
            });
        }

        if (maxPrice !== undefined) {
            query.$and.push({
                price: {
                    $lte: Number(maxPrice)
                }
            });
        }

        if (search) {
            query.$and.push({
                $or: [
                    { name: new RegExp(search, "i") },
                    { description: new RegExp(search, "i") }
                ]
            });
        }

        const products = await Product.find(query)
            .select(
                "name category subcategory description price stock image rating reviews"
            )
            .limit(10);

        console.log("MongoDB search query:", query);
        console.log("Products found:", products);

        return products;

    } catch (error) {

        console.error("Product search error:", error);
        throw error;

    }
}



module.exports = {
    searchProducts
};