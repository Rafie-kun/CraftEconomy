import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. AI Advisor features will run in offline demo mode.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: process.env.NODE_ENV });
});

// Student Budget AI Advisor Endpoint
app.post("/api/advisor", async (req, res) => {
  try {
    const { profile, question } = req.body;
    const ai = getAiClient();

    if (!ai) {
      // Return a premium mock response if the key is missing so the app remains fully interactive
      return res.json({
        summary: "Welcome to CraftEconomy AI! In Offline Demo Mode, we've compiled a quick financial guide based on your profile. To activate real live AI tips, add your GEMINI_API_KEY in the Secrets menu.",
        recommendations: [
          {
            title: "Optimize Weekly Food Budget",
            description: "Cooking in batches and utilizing student meal prep hacks can cut grocery bills by up to 40%.",
            estimatedSavings: "$45/week",
            impact: "high"
          },
          {
            title: "Check Campus Tech Grants",
            description: "Universities often provide laptop grants or interest-free equipment loans for academic gear.",
            estimatedSavings: "Up to $800 (one-time)",
            impact: "high"
          }
        ],
        studentHacks: [
          "Always ask for student discounts at local coffee shops, public transit, and clothing stores.",
          "Use your university email address for free software subscriptions (Spotify, Notion, GitHub Developer pack).",
          "Borrow textbook PDFs or buy used editions from upperclassmen instead of new copies."
        ]
      });
    }

    // Prepare profile summary for the model
    const incomesStr = profile.incomes.map((i: any) => `- ${i.name}: ${profile.academic.currency}${i.amount} (${i.frequency})`).join("\n");
    const expensesStr = profile.expenses.map((e: any) => `- ${e.name}: ${profile.academic.currency}${e.amount} (${e.frequency})`).join("\n");

    const systemInstruction = `You are "CraftEconomy AI Advisor", a friendly, witty, and highly knowledgeable student financial mentor. 
Your goal is to help college/university students survive financially, save for big ticket items (like laptops, textbooks), optimize their spending (hanging out, coffee, rent), and make smart income choices. 
You are pragmatic, non-judgmental, and speak with a reassuring, empowering tone. Refer to real student tactics like cheap meal preps, public transit, side gigs, software discounts, and smart textbook rentals.`;

    let prompt = `Here is the student's current budget profile:
- Academic Term Length: ${profile.academic.termMonths} months
- Currency: ${profile.academic.currency}
- Initial Savings: ${profile.academic.currency}${profile.academic.initialSavings}

INCOMES:
${incomesStr || "None listed yet"}

EXPENSES:
${expensesStr || "None listed yet"}
`;

    if (question) {
      prompt += `\n\nSpecific Student Question: "${question}"\n\nPlease answer this question in your summary response and tailor recommendations to address it directly.`;
    } else {
      prompt += `\n\nPlease analyze this budget. Provide a summary audit, realistic recommendations with estimated savings and impact level, and a bulleted list of 3 actionable student survival hacks.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A friendly, detailed evaluation of the budget, direct answer to any user question, and general encouragement."
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Clear title of the savings or optimization idea" },
                  description: { type: Type.STRING, description: "Step-by-step description of how to execute this recommendation" },
                  estimatedSavings: { type: Type.STRING, description: "Approximate monetary savings (e.g. '$15/week' or '$200 one-time')" },
                  impact: { type: Type.STRING, description: "Can be 'high', 'medium', or 'low'" }
                },
                required: ["title", "description", "estimatedSavings", "impact"]
              },
              description: "List of 2-3 specific optimization recommendations tailored to their income and expenses."
            },
            studentHacks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 3 clever, fun, or cheeky student-specific money hacks."
            }
          },
          required: ["summary", "recommendations", "studentHacks"]
        }
      }
    });

    const advice = JSON.parse(response.text || "{}");
    res.json(advice);
  } catch (error: any) {
    console.error("AI Advisor error:", error);
    res.status(500).json({
      summary: "I had a bit of an issue running my calculations. Don't worry, your numbers look solid! Try asking again in a moment.",
      recommendations: [
        {
          title: "Meal Prep Like a Pro",
          description: "Cut dining out by making easy weekly meals like pasta bake, fried rice, and slow cooker stews.",
          estimatedSavings: "$30/week",
          impact: "high"
        }
      ],
      studentHacks: [
        "Sign up for Unidays and Student Beans for instant discounts.",
        "Take advantage of free food at campus networking events.",
        "Use university computer labs to save on printing and expensive software."
      ]
    });
  }
});

// Vite middleware setup or static production assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} under ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
