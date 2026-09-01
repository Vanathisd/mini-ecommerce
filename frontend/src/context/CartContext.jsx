const express = require("express");

const {
    askShoppingAgent
} = require("../agent/shoppingagent");

const {
    findProductFromMessage,
    getProductDetails
} = require("../agent/producttools");

const router = express.Router();


router.post("/chat", async (req, res) => {

    try {

        const { message } = req.body;

        if (!message) {

            return res.status(400).json({
                message: "Message is required"
            });

        }

        const response =
            await askShoppingAgent(message);

        res.json({
            response
        });

    } catch (error) {

        console.error(
            "AI Agent Error:",
            error
        );

        res.status(500).json({
            message:
                "Something went wrong with the AI agent"
        });

    }

});



router.post("/cart-action", async (req, res) => {

    try {

        const { message } = req.body;

        if (!message) {

            return res.status(400).json({
                message: "Message is required"
            });

        }


        const text =
            String(message)
                .toLowerCase()
                .trim();


        const isAddToCart =
            /\b(add|put|place)\b/i.test(text) &&
            /\b(cart|basket)\b/i.test(text);


        if (!isAddToCart) {

            return res.json({
                action: "none"
            });

        }


        const detectedProduct =
            await findProductFromMessage(message);


        if (!detectedProduct) {

            return res.json({

                action: "none",

                message:
                    "Sorry, I couldn't find that product in VELORA."

            });

        }


        const latestProduct =
            await getProductDetails(
                detectedProduct.name
            );


        if (!latestProduct) {

            return res.json({

                action: "none",

                message:
                    "Sorry, I couldn't find that product in VELORA."

            });

        }


        // Check stock

        const stock =
            Number(latestProduct.stock);


        if (
            !Number.isFinite(stock) ||
            stock <= 0
        ) {

            return res.json({

                action: "none",

                message:
                    `${latestProduct.name} is currently out of stock.`

            });

        }



        return res.json({

            action: "add_to_cart",

            product: latestProduct,

            message:
                `${latestProduct.name} has been added to your cart.`

        });


    } catch (error) {

        console.error(
            "Cart Action Error:",
            error
        );

        res.status(500).json({

            message:
                "Unable to process cart action."

        });

    }

});


module.exports = router;