import { TOOL_ITEMS } from "../constants";
import { createRoughElement } from "./element";

const createText = (id, x, y, text, size = 24, stroke = "#4a1837") => ({
  id,
  x1: x,
  y1: y,
  x2: x,
  y2: y,
  type: TOOL_ITEMS.TEXT,
  stroke,
  fill: null,
  size,
  text,
});

const createSticky = (id, x, y, text = "Sticky note") => ({
  id,
  x1: x,
  y1: y,
  x2: x + 220,
  y2: y + 140,
  type: TOOL_ITEMS.STICKY_NOTE,
  stroke: "#9d174d",
  fill: "#fde68a",
  size: 2,
  text,
});

const createNode = (id, x, y, label, fill = "#fce7f3") => {
  const box = createRoughElement(id, x, y, x + 210, y + 86, {
    type: TOOL_ITEMS.RECTANGLE,
    stroke: "#be185d",
    fill,
    size: 2,
  });
  const text = createText(id + 1, x + 24, y + 27, label, 24);
  return [box, text];
};

const createArrow = (id, x1, y1, x2, y2) =>
  createRoughElement(id, x1, y1, x2, y2, {
    type: TOOL_ITEMS.ARROW,
    stroke: "#be185d",
    fill: null,
    size: 2,
  });

const chooseDiagram = (prompt) => {
  const normalized = prompt.toLowerCase();

  if (normalized.includes("url") || normalized.includes("shortener")) {
    return [
      "Client",
      "API Server",
      "Short Code Service",
      "Cache",
      "Database",
      "Redirect Service",
    ];
  }

  if (normalized.includes("chat") || normalized.includes("message")) {
    return ["Client", "Auth", "WebSocket Server", "Message Queue", "Database", "Notification Worker"];
  }

  if (normalized.includes("food") || normalized.includes("delivery") || normalized.includes("restaurant")) {
    return ["Browse restaurants", "Add food items", "Place order", "Restaurant accepts", "Driver pickup", "Deliver order"];
  }

  if (normalized.includes("ecommerce") || normalized.includes("shop")) {
    return ["Browse products", "Add to cart", "Checkout", "Payment", "Pack order", "Deliver order"];
  }

  return ["Start", "Choose option", "Submit request", "Process request", "Confirm result", "Finish"];
};

export const generateDiagramElements = (prompt, startId, origin) => {
  const labels = chooseDiagram(prompt);
  const x = origin.x;
  const y = origin.y;
  const positions = [
    { x, y },
    { x: x + 310, y },
    { x: x + 620, y },
    { x: x + 310, y: y + 170 },
    { x: x + 620, y: y + 170 },
    { x: x + 930, y: y + 85 },
  ];

  const elements = [
    createText(startId, x, y - 70, `AI diagram: ${prompt}`, 30, "#9d174d"),
  ];
  let id = startId + 1;

  labels.forEach((label, index) => {
    elements.push(...createNode(id, positions[index].x, positions[index].y, label));
    id += 2;
  });

  const arrowPairs = [
    [0, 1],
    [1, 2],
    [1, 3],
    [2, 4],
    [3, 4],
    [4, 5],
  ];

  arrowPairs.forEach(([from, to]) => {
    const source = positions[from];
    const target = positions[to];
    elements.push(createArrow(id, source.x + 210, source.y + 43, target.x, target.y + 43));
    id += 1;
  });

  elements.push(createSticky(id, x, y + 330, "Review scaling, failures, and ownership."));

  return elements;
};

export const generateStickyNoteElement = (id, origin, text) =>
  createSticky(id, origin.x, origin.y, text || "Sticky note");

export const generateDiagramElementsFromSpec = (diagram, startId, origin) => {
  const nodes = Array.isArray(diagram?.nodes) && diagram.nodes.length > 0
    ? diagram.nodes.slice(0, 8)
    : chooseDiagram(diagram?.title || "system").map((label, index) => ({
        id: `node-${index + 1}`,
        label,
      }));

  const columns = Math.min(4, Math.max(2, Math.ceil(nodes.length / 2)));
  const positions = {};
  const elements = [
    createText(startId, origin.x, origin.y - 70, diagram?.title || "AI generated diagram", 30, "#9d174d"),
  ];
  let id = startId + 1;

  nodes.forEach((node, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const x = origin.x + column * 300;
    const y = origin.y + row * 175;
    positions[node.id] = { x, y };
    elements.push(...createNode(id, x, y, node.label || node.id));
    id += 2;
  });

  const connections = Array.isArray(diagram?.connections) ? diagram.connections : [];
  connections.forEach((connection) => {
    const source = positions[connection.from];
    const target = positions[connection.to];
    if (!source || !target) return;

    elements.push(createArrow(id, source.x + 210, source.y + 43, target.x, target.y + 43));
    id += 1;

    if (connection.label) {
      elements.push(createText(
        id,
        (source.x + target.x) / 2 + 80,
        (source.y + target.y) / 2 + 8,
        connection.label,
        18,
        "#8b5a76"
      ));
      id += 1;
    }
  });

  const notes = Array.isArray(diagram?.notes) && diagram.notes.length > 0
    ? diagram.notes
    : ["Review reliability, scale, and failure paths."];

  notes.slice(0, 3).forEach((note, index) => {
    elements.push(createSticky(id, origin.x + index * 245, origin.y + 390, note));
    id += 1;
  });

  return elements;
};
