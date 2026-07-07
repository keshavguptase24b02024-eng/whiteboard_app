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
Create a concise whiteboard flowchart for this request: "${prompt.trim()}".
Return only valid JSON with this shape:
{
  "title": "short title",
  "nodes": [
    { "id": "step-1", "label": "Short action step", "type": "step" }
  ],
  "connections": [
    { "from": "step-1", "to": "step-2", "label": "" }
  ],
  "notes": ["short practical note"]
}
Use 4 to 7 nodes. Use simple ids with lowercase letters, numbers, and hyphens.
Infer the user's intent from the prompt:
- If they ask for a real-world process, product flow, user journey, business workflow, or everyday task, use practical step-by-step actions.
- If they ask for software architecture, backend design, system design, or technical infrastructure, use technical components.
- If they ask for a concept, topic, or study explanation, use a learning flow from basics to outcome.
Do not force API/database/cache/service boxes unless the prompt explicitly asks for technical architecture.
Make node labels specific to the user's prompt, not generic placeholders.
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
