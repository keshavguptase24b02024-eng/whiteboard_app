import { useEffect, useRef ,useContext, useLayoutEffect} from 'react';
import { useNavigate,useParams } from "react-router-dom";

import rough from 'roughjs/bundled/rough.esm.js';
import boardContext from '../../store/board-context';
import { TOOL_ACTION_TYPES, TOOL_ITEMS } from '../../constants';
import toolboxContext from '../../store/toolbox-context';
import classNames from './index.module.css';
import { updateCanvas } from '../../utils/api';

function Board() {
  const canvasRef = useRef(null);
  const textAreaRef = useRef();
  const isPanningRef = useRef(false);
  const lastPanPointRef = useRef({ x: 0, y: 0 });
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

    handleMouseDown(event, toolBoxState);
  };

  const boardMouseMoveHandler = (event) => {
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
        onClick={() => navigate("/dashboard")} 
        className={classNames.backButton}
      >
        ⬅ Back
      </button>

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
