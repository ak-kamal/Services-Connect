import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROK_API_KEY
});

export const chatWithAI = async (req, res) => {
  try {

    const { message } = req.body;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
You are the AI assistant for ServiceConnect, a platform that connects customers with service providers.

Your responsibilities:
- Help users find services such as plumbing, electrical work, cleaning, tutoring, etc.
- Guide users on how to book a service.
- Answer questions about pricing, scheduling, and providers.
- Be concise and friendly.

Important rules:
- Do not talk about being a large language model.
- Do not answer unrelated questions.
- If the question is unrelated to services on this platform, politely redirect the user back to services.
`
        },
        {
          role: "user",
          content: message
        }
      ],
      model: "llama-3.3-70b-versatile"
    });

    const reply = completion.choices[0].message.content;

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI request failed" });
  }
};