import OpenAI from "openai";
import UserModel from "../models/User.js";
import Slot from "../models/Slot.js";

const client = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: "https://api.x.ai/v1"
});

export const chatWithBot = async (req, res) => {

  const { message } = req.body;

  try {

    const completion = await client.chat.completions.create({
      model: "llama3-8b-8192",

      messages: [
        {
          role: "system",
          content:
            "You are an assistant for a home service platform. You can search providers and check slot availability."
        },
        {
          role: "user",
          content: message
        }
      ],

      tools: [
        {
          type: "function",
          function: {
            name: "searchProviders",
            description: "Search providers by role like electrician, plumber, carpenter",
            parameters: {
              type: "object",
              properties: {
                role: {
                  type: "string"
                }
              },
              required: ["role"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "checkSlots",
            description: "Check available time slots for a provider",
            parameters: {
              type: "object",
              properties: {
                providerId: {
                  type: "string"
                }
              },
              required: ["providerId"]
            }
          }
        }
      ]
    });

    const toolCall = completion.choices[0].message.tool_calls;

    if (!toolCall) {
      return res.json({ reply: completion.choices[0].message.content });
    }

    const tool = toolCall[0];
    const args = JSON.parse(tool.function.arguments);

    let result;

    if (tool.function.name === "searchProviders") {

      const providers = await UserModel.find({ role: args.role });

      result = providers.map(p => ({
        id: p._id,
        name: p.name,
        role: p.role
      }));

    }

    if (tool.function.name === "checkSlots") {

      const slots = await Slot.find({
        providerId: args.providerId,
        booked: false
      });

      result = slots.map(s => s.time);

    }

    return res.json({ data: result });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Chatbot failed" });
  }
};