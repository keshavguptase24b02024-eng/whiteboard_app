import { useContext, useState } from "react";
import { FaMagic } from "react-icons/fa";
import boardContext from "../../store/board-context";
import classes from "./index.module.css";

function AIDiagramPanel() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { generateDiagram } = useContext(boardContext);

  const handleGenerate = async () => {
    const value = prompt.trim();
    if (!value || loading) return;
    setLoading(true);
    setError("");
    try {
      await generateDiagram(value);
      setPrompt("");
    } catch (err) {
      setError(err.message || "AI diagram failed. Check Gemini setup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.panel}>
      <div className={classes.label}>
        <FaMagic />
        AI diagram
      </div>
      <div className={classes.row}>
        <input
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleGenerate();
          }}
          placeholder="Hospital workflow, food delivery flow, login architecture..."
        />
        <button onClick={handleGenerate} disabled={loading}>
          {loading ? "Thinking..." : "Generate"}
        </button>
      </div>
      {error && <p className={classes.error}>{error}</p>}
    </div>
  );
}

export default AIDiagramPanel;
