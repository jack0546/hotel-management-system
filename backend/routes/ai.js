const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    // In production, fetch current room availability from DB and inject into context
    const context = `You are the AI Hotel Assistant for Smart AI Hotel. You help users book rooms, answer questions, and recommend services. 
    We have Single, Double, Deluxe, Executive, Suite, and Presidential Suites. 
    Answer concisely and politely.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: context },
        { role: "user", content: message }
      ],
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error('AI Error:', error);
    // Fallback if no API key
    res.json({ reply: "Hello! I am the Smart AI Hotel Assistant. How can I help you with your booking today? (Note: OpenAI API key missing)"});
  }
});

module.exports = router;
