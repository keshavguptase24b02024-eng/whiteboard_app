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

const getCandidateModels = () => {
  const configured = process.env.GEMINI_MODEL;
  return [
    configured,
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-flash-latest",
  ].filter(Boolean).filter((model, index, models) => models.indexOf(model) === index);
};

router.post("/diagram", async (req, res) => {
  try {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(501).json({ error: "GEMINI_API_KEY is not configured." });
    }

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const instruction = `
Create a concise, useful whiteboard flowchart for this request: "${prompt.trim()}".
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
- If they give a short domain prompt such as "hospital", "food delivery", "bank", or "college", assume they want a real-world workflow for that domain.
- If they ask for a real-world process, product flow, user journey, business workflow, or everyday task, use practical step-by-step actions with domain-specific labels.
- If they ask for software architecture, backend design, system design, or technical infrastructure, use technical components.
- If they ask for a concept, topic, or study explanation, use a learning flow from basics to outcome.
Do not use generic software boxes like User, Frontend, API, Service, Cache, or Database unless the prompt explicitly asks for technical architecture.
Make node labels specific to the user's prompt, not generic placeholders.
`;

    let data = null;
    let modelUsed = "";
    let lastError = "";

    for (const model of getCandidateModels()) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: instruction }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      data = await response.json();

      if (response.ok) {
        modelUsed = model;
        break;
      }

      lastError = data?.error?.message || "Gemini request failed.";

      if (!/not found|not supported|not available/i.test(lastError)) {
        return res.status(response.status).json({ error: lastError });
      }
    }

    if (!modelUsed) {
      return res.status(502).json({
        error: `${lastError} Try GEMINI_MODEL=gemini-2.5-flash.`,
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join("") || "";
    const parsed = JSON.parse(cleanJsonText(text));

    res.json({ ...normalizeDiagram(parsed), model: modelUsed });
  } catch (error) {
    res.status(500).json({ error: error.message || "Unable to generate diagram." });
  }
});

module.exports = router;
