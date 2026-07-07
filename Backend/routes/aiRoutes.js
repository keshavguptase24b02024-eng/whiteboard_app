const express = require("express");

const router = express.Router();

const cleanJsonText = (text = "") =>
  text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

const normalizeDiagram = (diagram) => {
  const nodes = Array.isArray(diagram?.nodes) ? diagram.nodes.slice(0, 8) : [];
  const connections = Array.isArray(diagram?.connections) ? diagram.connections.slice(0, 10) : [];
  const notes = Array.isArray(diagram?.notes) ? diagram.notes.slice(0, 3) : [];

  return {
    title: String(diagram?.title || "AI generated diagram").slice(0, 80),
    nodes: nodes.map((node, index) => ({
      id: String(node?.id || `node-${index + 1}`).slice(0, 32),
      label: String(node?.label || `Node ${index + 1}`).slice(0, 34),
      type: String(node?.type || "service").slice(0, 24),
    })),
    connections: connections.map((connection) => ({
      from: String(connection?.from || "").slice(0, 32),
      to: String(connection?.to || "").slice(0, 32),
      label: String(connection?.label || "").slice(0, 32),
    })),
    notes: notes.map((note) => String(note || "").slice(0, 120)),
  };
};

router.post("/diagram", async (req, res) => {
  try {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

    if (!apiKey) {
      return res.status(501).json({ error: "GEMINI_API_KEY is not configured." });
    }

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const instruction = `
Create a concise system-design whiteboard diagram for this request: "${prompt.trim()}".
Return only valid JSON with this shape:
{
  "title": "short title",
  "nodes": [
    { "id": "client", "label": "Client", "type": "client" }
  ],
  "connections": [
    { "from": "client", "to": "api", "label": "request" }
  ],
  "notes": ["short design note"]
}
Use 4 to 7 nodes. Use simple ids with lowercase letters, numbers, and hyphens.
Include common infrastructure when relevant: API server, database, cache, queue, workers, CDN, auth.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: instruction }] }],
          generationConfig: {
            temperature: 0.25,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Gemini request failed.",
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join("") || "";
    const parsed = JSON.parse(cleanJsonText(text));

    res.json(normalizeDiagram(parsed));
  } catch (error) {
    res.status(500).json({ error: error.message || "Unable to generate diagram." });
  }
});

module.exports = router;
