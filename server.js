import express from "express";

const app = express();
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 10000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "NEXUS Infinity Gateway"
  });
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    nexus: "online"
  });
});

app.post("/v1/nexus", async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured"
      });
    }

    const input = req.body?.input;

    if (!input) {
      return res.status(400).json({
        error: "Missing input"
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-5.6-luna",
          input
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "OpenAI request failed",
        details: data
      });
    }

    res.json(data);

  } catch (error) {
    console.error("NEXUS Gateway error:", error);

    res.status(500).json({
      error: "NEXUS Gateway internal error"
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`NEXUS Infinity Gateway online on port ${PORT}`);
});
