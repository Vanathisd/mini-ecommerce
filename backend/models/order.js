const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        products: [
            {
                productId: {
                    type: String,
                    required: true,
                },

                name: {
                    type: String,
                    required: true,
                },

                image: {
                    type: String,
                },

                price: {
                    type: Number,
                    required: true,
                },

                quantity: {
                    type: Number,
                    required: true,
                },
            },
        ],

        deliveryAddress: {
            fullName: {
                type: String,
                required: true,
            },

            mobile: {
                type: String,
                required: true,
            },

            address: {
                type: String,
                required: true,
            },

            country: {
                type: String,
                required: true,
            },

            state: {
                type: String,
                required: true,
            },

            district: {
                type: String,
                required: true,
            },

            city: {
                type: String,
                required: true,
            },

            pincode: {
                type: String,
                required: true,
            },
        },

        paymentMethod: {
            type: String,
            enum: ["upi", "card", "cod"],
            required: true,
        },

        totalAmount: {
            type: Number,
            required: true,
        },

        orderStatus: {
            type: String,
            enum: [
                "Placed",
                "Processing",
                "Shipped",
                "Out for Delivery",
                "Delivered",
                "Cancelled",
            ],
            default: "Placed",
        },
            isArchived: {
            type: Boolean,
            default: false
        },
    },

    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Order", orderSchema);