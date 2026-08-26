const express = require("express");
const Order = require("../models/order");
const authMiddleware = require("../middleware/authmiddleware");
const adminMiddleware = require("../middleware/adminmiddleware");

const router = express.Router();

router.post("/create", authMiddleware, async (req, res) => {
    try {

        const {
            products,
            deliveryAddress,
            paymentMethod,
            totalAmount
        } = req.body;


        if (
            !products ||
            products.length === 0 ||
            !deliveryAddress ||
            !paymentMethod ||
            !totalAmount
        ) {
            return res.status(400).json({
                message: "All order details are required"
            });
        }


        const order = new Order({

            user: req.user.userId,

            products,

            deliveryAddress,

            paymentMethod,

            totalAmount

        });


        await order.save();


        res.status(201).json({

            message: "Order placed successfully",

            order

        });


    } catch (error) {

        console.error("Create order error:", error);

        res.status(500).json({
            message: "Failed to place order"
        });

    }
});

router.get("/myorders", authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user.userId
        }).sort({ createdAt: -1 });

        res.status(200).json({
            orders
        });

    } catch (error) {
        console.error("Get my orders error:", error);

        res.status(500).json({
            message: "Failed to fetch orders"
        });
    }
});

router.patch("/:id/cancel", authMiddleware, async (req, res) => {
    try {

        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }


        if (
            order.orderStatus !== "Placed" &&
            order.orderStatus !== "Processing"
        ) {
            return res.status(400).json({
                message: "This order cannot be cancelled"
            });
        }


        order.orderStatus = "Cancelled";

        await order.save();


        res.status(200).json({
            message: "Order cancelled successfully",
            order
        });

    } catch (error) {

        console.error(
            "Cancel order error:",
            error
        );

        res.status(500).json({
            message: "Failed to cancel order"
        });
    }
});

router.get(
    "/admin/all",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {

            const orders = await Order.find()
                .populate("user", "name email mobile")
                .sort({ createdAt: -1 });

            res.status(200).json({
                orders
            });

        } catch (error) {

            console.error(
                "Fetch all orders error:",
                error
            );

            res.status(500).json({
                message: "Failed to fetch orders"
            });

        }
    }
);

router.patch(
    "/admin/:orderId/status",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {

        try {

            const { orderId } = req.params;
            const { orderStatus } = req.body;

            const allowedStatuses = [
                "Placed",
                "Processing",
                "Shipped",
                "Out for Delivery",
                "Delivered",
                "Cancelled"
            ];

            if (!allowedStatuses.includes(orderStatus)) {
                return res.status(400).json({
                    message: "Invalid order status"
                });
            }
     
            const order = await Order.findById(orderId);

            if (!order) {
                return res.status(404).json({
                    message: "Order not found"
                });
            }

            if (
                order.orderStatus === "Delivered" ||
                order.orderStatus === "Cancelled"
            ) {
                return res.status(400).json({
                    message: `Order is already ${order.orderStatus} and cannot be changed`
                });
            }

            order.orderStatus = orderStatus;

            await order.save();

            res.status(200).json({
                message: "Order status updated successfully",
                order
            });

        } catch (error) {

            console.error(
                "Update order status error:",
                error
            );

            res.status(500).json({
                message: "Failed to update order status"
            });

        }

    }
);


module.exports = router;