import { useEffect, useRef ,useContext, useLayoutEffect} from 'react';
import { useNavigate,useParams } from "react-router-dom";

import rough from 'roughjs/bundled/rough.esm.js';
import boardContext from '../../store/board-context';
import { TOOL_ACTION_TYPES, TOOL_ITEMS } from '../../constants';
import toolboxContext from '../../store/toolbox-context';
import classNames from './index.module.css';
import { updateCanvas } from '../../utils/api';
import AIDiagramPanel from '../AIDiagramPanel';

const drawWrappedText = (context, text, x, y, maxWidth, lineHeight) => {
  const words = String(text || "").split(" ");
  let line = "";
  let offsetY = 0;

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (context.measureText(testLine).width > maxWidth && line) {
      context.fillText(line, x, y + offsetY);
      line = word;
      offsetY += lineHeight;
    } else {
      line = testLine;
    }
  });

  if (line) context.fillText(line, x, y + offsetY);
};

function Board() {
  const canvasRef = useRef(null);
  const textAreaRef = useRef();
  const isPanningRef = useRef(false);
  const draggingElementRef = useRef(null);
  const movedElementRef = useRef(false);
  const lastPanPointRef = useRef({ x: 0, y: 0 });
  const lastDragPointRef = useRef({ x: 0, y: 0 });
  const spacePressedRef = useRef(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { toolBoxState } = useContext(toolboxContext);
  const {
    elements,
    handleMouseDown,
    handleMouseMove,
    toolActionType,
    handleMouseUp,
    textAreaBlur,
    undo,
    redo,
    viewport,
    panViewport,
    zoomViewport,
    worldToScreen,
    moveElement,
  } = useContext(boardContext);

  useLayoutEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      canvas.height = window.innerHeight;
      canvas.width = window.innerWidth;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      const tagName = event.target?.tagName;
      const isTyping = tagName === "INPUT" || tagName === "TEXTAREA";

      if (event.code === "Space" && !isTyping) {
        event.preventDefault();
        spacePressedRef.current = true;
      }

      if (event.ctrlKey && event.key === "z") {
        undo();
      } else if (event.ctrlKey && event.key === "y") {
        redo();
      }
    }

    function handleKeyUp(event) {
      if (event.code === "Space") {
        spacePressedRef.current = false;
        isPanningRef.current = false;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [undo, redo]);

  useEffect(() => {
    const textarea = textAreaRef.current;
    if (toolActionType === TOOL_ACTION_TYPES.WRITING) {
      setTimeout(() => {
        textarea.focus();
      }, 0);
    }
  }, [toolActionType]);

  useEffect(() => {
    if (toolActionType === TOOL_ACTION_TYPES.NONE && elements.length > 0) {
      updateCanvas(id, elements);
    }
  }, [elements, toolActionType, id]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    try {
      context.save();
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.setTransform(
        viewport.zoom,
        0,
        0,
        viewport.zoom,
        -viewport.x * viewport.zoom,
        -viewport.y * viewport.zoom
      );

      const roughCanvas = rough.canvas(canvas);

      elements.forEach((element) => {
        try {
          if (element.type === TOOL_ITEMS.BRUSH) {
            const points = element.points || [];
            if (points.length === 0) return;

            context.beginPath();
            context.strokeStyle = element.stroke;
            context.lineWidth = element.size || 1;
            context.lineCap = "round";
            context.lineJoin = "round";
            context.moveTo(points[0].x, points[0].y);
            points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
            context.stroke();
          } else if (element.type === TOOL_ITEMS.TEXT) {
            context.save(); 
            context.textBaseline = "top";
            context.font = `${element.size}px Caveat`;
            context.fillStyle = element.stroke;
            context.fillText(element.text, element.x1, element.y1);
            context.restore();
          } else if (element.type === TOOL_ITEMS.STICKY_NOTE) {
            context.save();
            const width = element.x2 - element.x1;
            const height = element.y2 - element.y1;
            context.fillStyle = element.fill || "#fde68a";
            context.strokeStyle = element.stroke || "#9d174d";
            context.lineWidth = element.size || 2;
            context.shadowColor = "rgba(157, 23, 77, 0.16)";
            context.shadowBlur = 18;
            context.shadowOffsetY = 8;
            context.beginPath();
            context.roundRect(element.x1, element.y1, width, height, 14);
            context.fill();
            context.shadowColor = "transparent";
            context.stroke();
            context.fillStyle = "#4a1837";
            context.font = "24px Caveat";
            context.textBaseline = "top";
            drawWrappedText(context, element.text, element.x1 + 18, element.y1 + 18, Math.abs(width) - 36, 28);
            context.restore();
          } else if (element.roughElement) {
            roughCanvas.draw(element.roughElement);
          }
        } catch (err) {
          console.error("Failed to draw element:", err, element);
        }
      });
    } catch (err) {
      console.error("Failed to render board:", err);
    } finally {
      context.restore();
    }
  }, [elements, viewport]);

  const boardMouseDownhandler = (event) => {
    if (event.button === 1 || spacePressedRef.current) {
      event.preventDefault();
      isPanningRef.current = true;
      lastPanPointRef.current = { x: event.clientX, y: event.clientY };
      return;
    }

    const worldPoint = {
      x: viewport.x + event.clientX / viewport.zoom,
      y: viewport.y + event.clientY / viewport.zoom,
    };
    const movableElement = [...elements].reverse().find((element) => {
      if (element.type === TOOL_ITEMS.STICKY_NOTE) {
        return worldPoint.x >= Math.min(element.x1, element.x2)
          && worldPoint.x <= Math.max(element.x1, element.x2)
          && worldPoint.y >= Math.min(element.y1, element.y2)
          && worldPoint.y <= Math.max(element.y1, element.y2);
      }

      if (element.type === TOOL_ITEMS.TEXT && element.text) {
        const width = Math.max(String(element.text).length * (element.size || 24) * 0.55, 36);
        const height = element.size || 24;
        return worldPoint.x >= element.x1
          && worldPoint.x <= element.x1 + width
          && worldPoint.y >= element.y1
          && worldPoint.y <= element.y1 + height;
      }

      return false;
    });

    if (movableElement) {
      draggingElementRef.current = movableElement.id;
      movedElementRef.current = false;
      lastDragPointRef.current = worldPoint;
      return;
    }

    handleMouseDown(event, toolBoxState);
  };

  const boardMouseMoveHandler = (event) => {
    if (draggingElementRef.current !== null) {
      const worldPoint = {
        x: viewport.x + event.clientX / viewport.zoom,
        y: viewport.y + event.clientY / viewport.zoom,
      };
      moveElement(
        draggingElementRef.current,
        worldPoint.x - lastDragPointRef.current.x,
        worldPoint.y - lastDragPointRef.current.y
      );
      movedElementRef.current = true;
      lastDragPointRef.current = worldPoint;
      return;
    }

    if (isPanningRef.current) {
      const deltaX = event.clientX - lastPanPointRef.current.x;
      const deltaY = event.clientY - lastPanPointRef.current.y;
      panViewport(deltaX, deltaY);
      lastPanPointRef.current = { x: event.clientX, y: event.clientY };
      return;
    }

    handleMouseMove(event);
  };

  const boardMouseUphandler = (event) => {
    if (draggingElementRef.current !== null) {
      draggingElementRef.current = null;
      movedElementRef.current = false;
      return;
    }

    if (isPanningRef.current) {
      isPanningRef.current = false;
      return;
    }

    handleMouseUp(event);
  };

  const boardWheelHandler = (event) => {
    event.preventDefault();
    const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
    zoomViewport(event.clientX, event.clientY, viewport.zoom * zoomFactor);
  };

  const currentTextElement = elements[elements.length - 1];
  const textScreenPoint = currentTextElement
    ? worldToScreen({ x: currentTextElement.x1, y: currentTextElement.y1 })
    : { x: 0, y: 0 };

  return (
    <> 
      <button 
        onClick={() => navigate(id ? "/dashboard" : "/auth")} 
        className={classNames.backButton}
      >
        ⬅ Back
      </button>

      <AIDiagramPanel />

      {toolActionType === TOOL_ACTION_TYPES.WRITING && (
        <textarea
          ref={textAreaRef}
          id={elements[elements.length - 1]?.id} 
          type="text"
          className={classNames.textElementBox}
          style={{
            top: textScreenPoint.y,
            left: textScreenPoint.x,
            fontSize: `${currentTextElement?.size * viewport.zoom}px`,
            color: currentTextElement?.stroke,
          }}
          onBlur={(event) => textAreaBlur(event.target.value, toolBoxState)}
          placeholder="Type here"
        />
      )}
      <canvas
        onMouseDown={boardMouseDownhandler}
        ref={canvasRef}
        onMouseMove={boardMouseMoveHandler}
        onMouseUp={boardMouseUphandler}
        onMouseLeave={boardMouseUphandler}
        onWheel={boardWheelHandler}
        onContextMenu={(event) => event.preventDefault()}
        id="canvas"
      />
    </>
  );
}

export default Board;
