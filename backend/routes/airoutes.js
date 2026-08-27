const express = require("express");
const { askShoppingAgent } = require("../agent/shoppingagent");

const router = express.Router();

router.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                message: "Message is required"
            });
        }

        const response = await askShoppingAgent(message);

        res.json({
            response
        });

    } catch (error) {
        console.error("AI Agent Error:", error);

        res.status(500).json({
            message: "Something went wrong with the AI agent"
        });
    }
});

module.exports = router;