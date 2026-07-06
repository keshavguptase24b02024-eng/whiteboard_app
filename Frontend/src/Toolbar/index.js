import React, { useContext } from 'react';
import classes from './index.module.css';
import cx from 'classnames';
import { LuRectangleHorizontal } from "react-icons/lu"
import { FaRegCircle } from "react-icons/fa";
import { FaSlash } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";
import { FaPaintBrush } from "react-icons/fa";
import boardContext from '../store/board-context';
import { FaEraser } from "react-icons/fa";
import { TOOL_ITEMS } from '../constants';
import { FaPenAlt } from "react-icons/fa";
import { IoIosUndo } from "react-icons/io";
import { IoIosRedo } from "react-icons/io";
import { FaDownload } from "react-icons/fa";
const Toolbar = () => {

  const {activeToolItem,handleActiveToolItemClick,undo,redo} = useContext(boardContext);

   const handleDownload = () => {
     const canvas = document.getElementById("canvas");
     const ctx = canvas.getContext("2d");

     // Save current drawing
     const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

     // Draw white background
     ctx.globalCompositeOperation = "destination-over";
     ctx.fillStyle = "white";
     ctx.fillRect(0, 0, canvas.width, canvas.height);

     // Get data URL (JPEG or PNG)
     const data = canvas.toDataURL("image/jpeg", 0.9);

     // Trigger download
     const anchor = document.createElement("a");
     anchor.href = data;
     anchor.download = "board.jpg";
     anchor.click();

     // Restore original drawing with transparency
     ctx.clearRect(0, 0, canvas.width, canvas.height);
     ctx.putImageData(imageData, 0, 0);
   };

  return (
    <div className={classes.container}>
      <div title='Brush'
        className={cx(classes.toolItem,{[classes.active]:activeToolItem ===TOOL_ITEMS.BRUSH})}
        onClick={()=>handleActiveToolItemClick(TOOL_ITEMS.BRUSH)}><FaPaintBrush/>
       </div>
      <div title='line'
        className={cx(classes.toolItem,{[classes.active]:activeToolItem ===TOOL_ITEMS.LINE})}
        onClick={()=>handleActiveToolItemClick(TOOL_ITEMS.LINE)}><FaSlash/>
       </div>
      <div title='Rectangle'
         className={cx(classes.toolItem,{[classes.active]:activeToolItem === TOOL_ITEMS.RECTANGLE})}
         onClick={()=>handleActiveToolItemClick(TOOL_ITEMS.RECTANGLE)}><LuRectangleHorizontal/>
      </div>
      <div title='Circle'
         className={cx(classes.toolItem,{[classes.active]:activeToolItem === TOOL_ITEMS.CIRCLE})}
         onClick={()=>handleActiveToolItemClick(TOOL_ITEMS.CIRCLE)}><FaRegCircle/>
      </div>
      <div title='arrow'
         className={cx(classes.toolItem,{[classes.active]:activeToolItem === TOOL_ITEMS.ARROW})}
         onClick={()=>handleActiveToolItemClick(TOOL_ITEMS.ARROW)}><FaArrowRight/>
      </div>
      <div title='Eraser'
         className={cx(classes.toolItem,{[classes.active]:activeToolItem === TOOL_ITEMS.ERASER})}
         onClick={()=>handleActiveToolItemClick(TOOL_ITEMS.ERASER)}><FaEraser />
      </div>
      <div title='Text'
         className={cx(classes.toolItem,{[classes.active]:activeToolItem === TOOL_ITEMS.TEXT})}
         onClick={()=>handleActiveToolItemClick(TOOL_ITEMS.TEXT)}><FaPenAlt />
      </div>
      <div title='Undo'
         className={classes.toolItem}
         onClick={()=> undo()}><IoIosUndo  />
      </div>
      <div title='Redo'
         className={classes.toolItem}
         onClick={()=> redo()}><IoIosRedo  />
      </div>
      <div title='Download'
         className={classes.toolItem}
         onClick={()=> handleDownload()}><FaDownload  />
      </div>
       
    </div>
  );
};

export default Toolbar