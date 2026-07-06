import { ARROW_Length, TOOL_ITEMS } from "../constants";
import rough from "roughjs/bin/rough"
import { getArrorheadCorodinates } from "./math"; 
import getStroke from "perfect-freehand";
import { isPointCloseToLine } from "./math";
const gen = rough.generator();

export const createRoughElement = (id,x1,y1,x2,y2,{type,stroke,fill,size})=> {
    const element = {
        id,x1,y1,x2,y2,type,fill,stroke,size
    };

    let options = {
        seed: id + 1,
    }

    if(stroke) options.stroke = stroke;
    if(fill) options.fill = fill;
    if(size) options.strokeWidth = size;

    switch (type) {
        case TOOL_ITEMS.BRUSH:{
            const brushSize = size || 4; 
            const points = [{ x: x1, y: y1 }];
                
            const strokePoints = getStroke(points, {
                size: brushSize,
                thinning: 0, 
                smoothing: 0.2, 
                streamline: 0.5, 
            });
            const brushElement = {
                id,
                points: [{x:x1,y:y1}],
                path: new Path2D(getSvgPathFromStroke(strokePoints)),
                type,
                stroke,
                fill,
                size
            }
            return brushElement
        }

        case TOOL_ITEMS.LINE:
            element.roughElement = gen.line(x1,y1,x2,y2,options);
            return element;

        case TOOL_ITEMS.RECTANGLE:
            element.roughElement = gen.rectangle(x1,y1,x2-x1,y2-y1,options);
            return element;

        case TOOL_ITEMS.CIRCLE:
            const cx = (x1 + x2)/2, cy = (y1 + y2)/2;
            const height = y2 - y1;
            const width = x2 - x1;
            element.roughElement = gen.ellipse(cx, cy, width, height,options);
            return element;

        case TOOL_ITEMS.ARROW:
            const {x3,y3,x4,y4} = getArrorheadCorodinates(x1,y1,x2,y2,ARROW_Length);
            const points = [
                [x1,y1],
                [x2,y2],
                [x3,y3],
                [x2,y2],
                [x4,y4],
            ];
            element.roughElement = gen.linearPath(points,options);
            return element;

        case TOOL_ITEMS.TEXT:
            element.text = "";
            return element;

        default:
            throw new Error("Type not recognized");
    }
};

export const isPointNearElement = (element, {pointX, pointY}) =>{
    const {x1, y1,x2,y2,type} = element;
    switch(type){
        case TOOL_ITEMS.LINE:
        case TOOL_ITEMS.ARROW:
            return isPointCloseToLine(x1, y1, x2, y2, pointX, pointY);
        case TOOL_ITEMS.RECTANGLE:
            return(
                isPointCloseToLine(x1,y1,x2,y1,pointX,pointY) ||
                isPointCloseToLine(x2,y1,x2,y2,pointX,pointY)||
                isPointCloseToLine(x2,y2,x1,y2,pointX,pointY)||
                isPointCloseToLine(x1,y2,x1,y1,pointX,pointY)
            );

        case TOOL_ITEMS.CIRCLE:
            const minX = Math.min(x1, x2);
            const maxX = Math.max(x1, x2);
            const minY = Math.min(y1, y2);
            const maxY = Math.max(y1, y2);

            return (
                isPointCloseToLine(minX, minY, maxX, minY, pointX, pointY) || 
                isPointCloseToLine(maxX, minY, maxX, maxY, pointX, pointY) || 
                isPointCloseToLine(maxX, maxY, minX, maxY, pointX, pointY) || 
                isPointCloseToLine(minX, maxY, minX, minY, pointX, pointY)    
            );

        case TOOL_ITEMS.BRUSH:
            {
                const context = document.getElementById("canvas").getContext('2d');
                return context.isPointInPath(element.path,pointX, pointY)
            }
        case TOOL_ITEMS.TEXT:
            const context = document.getElementById("canvas").getContext('2d');
            context.font = `${element.size}px Caveat`;
            context.fillStyle = element.stroke;
            const textWidth = context.measureText(element.text).width;
            const textHeight = parseInt(element.size);
            context.restore(); 
            return(
                isPointCloseToLine(x1, y1, x1+ textWidth, y1, pointX, pointY) ||
                isPointCloseToLine(x1 + textWidth, y1, x1 + textWidth, y1 + textHeight, pointX, pointY) ||
                isPointCloseToLine(x1 + textWidth, y1 + textHeight, x1, y1 + textHeight, pointX, pointY)||
                isPointCloseToLine(x1, y1 + textHeight, x1, y1, pointX, pointY)
            );

        default: return false;
    }
}

export function getSvgPathFromStroke(stroke) {
  if (!stroke.length) return ""

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length]
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
      return acc
    },
    ["M", ...stroke[0], "Q"]
  )

  d.push("Z")
  return d.join(" ")
}