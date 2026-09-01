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


        const result =
            await askShoppingAgent(message);


        if (
            result &&
            typeof result === "object"
        ) {

            return res.json(result);

        }


        res.json({

            response: result

        });

    }

    catch (error) {

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


module.exports = router;
