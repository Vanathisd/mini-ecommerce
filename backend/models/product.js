const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

    name: String,

    category: String,

    subcategory: String,

    description: String,

    price: Number,

    stock: Number,

    image: String,

    isNewArrival: {
        type: Boolean,
        default: false
    },

    rating: {
        type: Number,
        default: 0
    },

    isDeleted: {
        type: Boolean,
        default: false
    },

    reviews: {
        type: Number,
        default: 0
    },

    baseRating: {
        type: Number,
        default: 0
    },

    baseReviews: {
        type: Number,
        default: 0
    },

    ratings: [

        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },

            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5
            }
        }

    ]

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "Product",
    productSchema
);