import { API_BASE_URL } from "../config";

export const serializeElements = (elements = []) =>
  elements.map(({ path, roughElement, ...element }) => element);

export const updateCanvas = async(canvasId, elements)=>{
  const token = localStorage.getItem("token");
  if (!canvasId || !token) return;
  try {
    await fetch(`${API_BASE_URL}/canvas/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        canvasId,
        elements: serializeElements(elements),
      }),
    });
    console.log("Canvas auto-saved");
  } catch (err) {
    console.error("Error auto-saving canvas:", err);
  }
}
