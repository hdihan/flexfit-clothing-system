const { GoogleGenAI } = require('@google/genai');
const Product = require('../models/Product');

// Predefined logical responses for common queries
const logicalResponses = {
    "hello": "Hello! I am FlexFit Assistant. How can I help you today?",
    "hi": "Hi there! Welcome to FlexFit. What can I do for you?",
    "shipping": "We offer standard (3-5 days) and express (1-2 days) shipping. Free shipping on orders over LKR 10,000!",
    "delivery": "We offer standard (3-5 days) and express (1-2 days) shipping. Free shipping on orders over LKR 10,000!",
    "return": "You can return products within 14 days of purchase. Please visit our returns page for more details.",
    "refund": "You can return products within 14 days of purchase. Please visit our returns page for more details.",
    "contact": "You can reach our support team at support@flexfit.com or call us at +94 11 234 5678.",
    "support": "You can reach our support team at support@flexfit.com or call us at +94 11 234 5678.",
    "payment": "We accept Visa, MasterCard, AMEX, and Cash on Delivery (COD).",
    "track": "You can track your order by navigating to your profile and clicking on 'Orders', then 'Track'."
};

exports.handleChat = async (req, res, next) => {
    try {
        const { message, history } = req.body;

        // 1. Logical Chatbot Check
        const lowerMessage = message.toLowerCase();
        let logicalMatch = null;
        for (const [key, response] of Object.entries(logicalResponses)) {
            if (lowerMessage.includes(key)) {
                logicalMatch = response;
                break;
            }
        }

        // If a logical rule matched, return immediately
        if (logicalMatch) {
            return res.json({
                success: true,
                response: logicalMatch,
                products: []
            });
        }

        // 2. AI Chatbot Fallback
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                message: "Gemini API Key is missing. Please add GEMINI_API_KEY to your .env file."
            });
        }

        // Initialize the new SDK client
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // Fetch products to give as context to the AI
        const products = await Product.find({ isActive: true })
            .select('name category price description')
            .limit(50);

        const productContext = products.map(p =>
            `ID: ${p._id} | Name: ${p.name} | Category: ${p.category} | Price: LKR ${p.price}`
        ).join('\n');

        const systemPrompt = `
You are FlexFit AI, a helpful, enthusiastic fashion assistant for the FlexFit Clothing store.
Your goal is to help users find the perfect outfit, give styling advice, and answer questions.
Always be polite, conversational, and fashion-forward.

Here is the current inventory of our store:
${productContext}

When recommending products, you MUST strictly use the exact IDs provided above. 
To show a product card to the user, include the tag [PRODUCT:id] in your response, replacing "id" with the actual ID of the product.
Example: "I highly recommend the Red Hoodie [PRODUCT:60d5ec493...]"
Do NOT make up product IDs. If we don't have what they are looking for, politely let them know and suggest an alternative from the list.
Keep your responses concise and readable.
`;

        // Convert history to the new SDK format
        const formattedHistory = (history || []).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        // Model fallback pool ordered by current availability & performance
        const candidateModels = [
            'gemini-3.6-flash',
            'gemini-3.5-flash-lite',
            'gemini-flash-latest',
            'gemini-3.7-flash',
            'gemini-3.8-flash'
        ];

        let result = null;
        let lastErr = null;

        for (const modelName of candidateModels) {
            try {
                const chat = ai.chats.create({
                    model: modelName,
                    config: {
                        systemInstruction: systemPrompt
                    },
                    history: formattedHistory
                });

                result = await chat.sendMessage({ message });
                if (result && result.text) break;
            } catch (err) {
                lastErr = err;
                console.warn(`Model ${modelName} encountered error (${err.status || err.message}), attempting fallback...`);
            }
        }

        if (!result || !result.text) {
            throw lastErr || new Error('No AI models available');
        }

        const textResponse = result.text;

        // Extract product IDs from the response
        const productRegex = /\[PRODUCT:([a-zA-Z0-9]+)\]/g;
        let match;
        const recommendedIds = [];
        while ((match = productRegex.exec(textResponse)) !== null) {
            recommendedIds.push(match[1]);
        }

        let recommendedProducts = [];
        if (recommendedIds.length > 0) {
            recommendedProducts = await Product.find({ _id: { $in: recommendedIds } })
                .populate('vendor', 'storeName logo');
        }

        // Clean up the text response
        const cleanText = textResponse.replace(productRegex, '').trim();

        res.json({
            success: true,
            response: cleanText,
            products: recommendedProducts
        });
    } catch (err) {
        console.error('Chatbot error:', err);
        let errorMsg = 'Failed to process chat';
        let statusCode = 500;
        if (err.status === 503) {
            errorMsg = "The AI model is currently experiencing high demand. Please try again in a few moments.";
            statusCode = 503;
        }
        res.status(statusCode).json({ success: false, message: errorMsg });
    }
};