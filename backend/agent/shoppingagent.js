const { GoogleGenAI, Type } = require("@google/genai");
const { searchProducts } = require("./producttools");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const searchProductsTool = {
    functionDeclarations: [
        {
            name: "searchProducts",
            description:
                "Search VELORA products using category, subcategory, price range, or keywords. Use this when the customer is looking for products.",
            parameters: {
                type: Type.OBJECT,
                properties: {
                    category: {
                        type: Type.STRING,
                        description:
                            "Product category such as Women, Men, or Accessories."
                    },
                    subcategory: {
                        type: Type.STRING,
                        description:
                            "Product subcategory such as Dresses, Tops, Bottoms, Ethnic Wear, or Outerwear."
                    },
                    minPrice: {
                        type: Type.NUMBER,
                        description:
                            "Minimum price in Indian Rupees."
                    },
                    maxPrice: {
                        type: Type.NUMBER,
                        description:
                            "Maximum price in Indian Rupees."
                    },
                    search: {
                        type: Type.STRING,
                        description:
                            "Keyword to search in product name or description."
                    }
                }
            }
        }
    ]
};

async function askShoppingAgent(message) {

    const contents = [
        {
            role: "user",
            parts: [
                {
                    text: message
                }
            ]
        }
    ];

    // First request: ask Gemini what to do
    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents,
        config: {
            systemInstruction: `
                You are the VELORA Shopping Assistant.

                VELORA is a fashion and lifestyle e-commerce website.

                Help customers find products from the VELORA catalog.

                When a customer asks to find or recommend products,
                use the searchProducts tool.

                Never invent products.

                Only describe products returned by the tool.
            `,
            tools: [searchProductsTool]
        }
    });

    // Check whether Gemini requested a tool
    if (response.functionCalls && response.functionCalls.length > 0) {

        const functionCall = response.functionCalls[0];

        console.log("AI requested tool:", functionCall.name);
        console.log("Tool arguments:", functionCall.args);

        let toolResult;

        if (functionCall.name === "searchProducts") {

            toolResult = await searchProducts(functionCall.args);

            console.log("Search products result:", toolResult);

        } else {

            throw new Error(
                `Unknown tool requested: ${functionCall.name}`
            );
        }

        // Add Gemini's tool request to the conversation
        contents.push(response.candidates[0].content);

        // Convert MongoDB/Mongoose documents
        // into plain JavaScript objects for Gemini
        const toolResponse = toolResult.map(product => ({
            name: product.name,
            category: product.category,
            subcategory: product.subcategory,
            description: product.description,
            price: product.price,
            stock: product.stock,
            rating: product.rating,
            reviews: product.reviews
        }));

        // Send MongoDB results back to Gemini
        contents.push({
            role: "user",
            parts: [
                {
                    functionResponse: {
                        name: functionCall.name,
                        response: {
                            products: toolResponse
                        }
                    }
                }
            ]
        });

        // Second request: Gemini creates the final answer
        const finalResponse = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents,
            config: {
                systemInstruction: `
                    You are the VELORA Shopping Assistant.

                    Use the product information returned by the tool
                    to answer the customer's question.

                    Do not invent products or prices.

                    If products are found, clearly mention:
                    - Product name
                    - Price
                    - Category
                    - Availability

                    Be friendly and concise.

                    If no products are found, clearly tell the customer
                    that no matching products are currently available.
                `,
                tools: [searchProductsTool]
            }
        });

        return finalResponse.text;
    }

    // Normal conversation without a tool
    return response.text;
}

module.exports = { askShoppingAgent };