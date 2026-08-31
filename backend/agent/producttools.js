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

        // Category filter
        if (
            category !== undefined &&
            category !== null &&
            category.trim() !== ""
        ) {
            query.$and.push({
                category: new RegExp(`^${category.trim()}$`, "i")
            });
        }

        // Subcategory filter
        if (
            subcategory !== undefined &&
            subcategory !== null &&
            subcategory.trim() !== ""
        ) {
            query.$and.push({
                subcategory: new RegExp(`^${subcategory.trim()}$`, "i")
            });
        }

        // Minimum price filter
        if (minPrice !== undefined && minPrice !== null) {
            query.$and.push({
                price: {
                    $gte: Number(minPrice)
                }
            });
        }

        // Maximum price filter
        if (maxPrice !== undefined && maxPrice !== null) {
            query.$and.push({
                price: {
                    $lte: Number(maxPrice)
                }
            });
        }

        // Keyword search
        if (
            search !== undefined &&
            search !== null &&
            search.trim() !== ""
        ) {
            const escapedSearch = search
                .trim()
                .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

            query.$and.push({
                $or: [
                    {
                        name: new RegExp(escapedSearch, "i")
                    },
                    {
                        description: new RegExp(escapedSearch, "i")
                    }
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
        console.log("Products found count:", products.length);

        return products;

    } catch (error) {

        console.error("Product search error:", error);
        throw error;

    }
}

module.exports = {
    searchProducts
};