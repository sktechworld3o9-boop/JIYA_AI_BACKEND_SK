const express = require("express"); const cors = require("cors"); const app = express();
app.use(cors()); app.use(express.json());
app.get("/", (req, res) => { res.json({ success: true, app: "Jiya AI Companion", message: "Jiya backend is running!" }); });
app.get("/health", (req, res) => { res.json({ success: true, status: "online" }); });
app.post("/chat", async (req, res) => { try { const message = req.body.message;
if (!message || typeof message !== "string") {
  return res.status(400).json({
    success: false,
    error: "Please enter a message."
  });
}

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  return res.status(503).json({
    success: false,
    error: "OpenAI API key is not configured."
  });
}

const response = await fetch(
  "https://api.openai.com/v1/responses",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      instructions: "You are Jiya, a helpful AI companion. Reply clearly and politely. Respond in the language used by the user.",
      input: message
    })
  }
);

const data = await response.json();

if (!response.ok) {
  console.error("OpenAI API error:", data);
  return res.status(502).json({
    success: false,
    error: "AI service request failed. Check your API key and API billing."
  });
}

const reply = (data.output || [])
  .flatMap(item => item.content || [])
  .filter(item => item.type === "output_text")
  .map(item => item.text)
  .join("\n");

res.json({
  success: true,
  reply: reply || "I could not generate a reply. Please try again."
});
} catch (error) { console.error("Server error:", error); res.status(500).json({ success: false, error: "Something went wrong on the server." }); } });
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => { console.log(Jiya backend running on port ${PORT}); });
