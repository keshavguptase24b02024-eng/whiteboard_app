import React, { useReducer } from 'react'
import toolboxContext from './toolbox-context'
import { COLORS, TOOL_ITEMS, TOOLBOX_ACTIONS } from '../constants';

const toolBoxReducer = (state,action)=>{
  switch (action.type) {
      case TOOLBOX_ACTIONS.CHANGE_STROKE:
          {
              const newState = {...state};
              newState[action.payload.tool].stroke = action.payload.stroke;
              return newState;
          }
      case TOOLBOX_ACTIONS.CHANGE_FILL:
          {
              const newState = {...state};
              newState[action.payload.tool].fill = action.payload.fill;
              return newState;
          }
      case TOOLBOX_ACTIONS.CHANGE_SIZE:
          {
              const newState = {...state};
              // console.log(action.payload.size);
              newState[action.payload.tool].size = action.payload.size;
              return newState;
          }
      default:
          break;
  }
};

const initialToolBoxState = {
    [TOOL_ITEMS.LINE] : {
        stroke: COLORS.BLACK,
        size: 1
    },
    [TOOL_ITEMS.RECTANGLE]:{
        stroke: COLORS.BLACK,
        size: 1,
        fill: null
    },
    [TOOL_ITEMS.CIRCLE]:{
        stroke: COLORS.BLACK,
        size: 1,
        fill: null
    },
    [TOOL_ITEMS.ARROW]:{
        stroke: COLORS.BLACK,
        size: 1,
    },
    [TOOL_ITEMS.BRUSH]:{
        stroke: COLORS.BLACK,
        size: 0.1,
        fill: null
    },
    [TOOL_ITEMS.TEXT]:{
        stroke: COLORS.BLACK,
        size: 32,
        
    }
};

const ToolboxProvider = ({children}) => {
    const [toolBoxState, dispatchToolBoxAction] = useReducer(toolBoxReducer,initialToolBoxState);

    const changeStrokeHandler = (tool,stroke)=>{
        dispatchToolBoxAction({
            type: TOOLBOX_ACTIONS.CHANGE_STROKE,
            payload:{
                tool,
                stroke
            }
        })
    };
    const changeFillHandler = (tool,fill)=>{
        dispatchToolBoxAction({
            type: TOOLBOX_ACTIONS.CHANGE_FILL,
            payload:{
                tool,
                fill
            }
        })
    };

    const changeSizehandler = (tool,size)=>{
        dispatchToolBoxAction({
            type: TOOLBOX_ACTIONS.CHANGE_SIZE,
            payload:{
                tool,
                size
            }
        })
    };

    const toolBoxContextValue = {
        toolBoxState,
        changeStroke : changeStrokeHandler,
        changeFill : changeFillHandler,
        changeSize : changeSizehandler
    };  

    return (
        <toolboxContext.Provider value={toolBoxContextValue}>
        {children}
    </toolboxContext.Provider>
  );
}

export default ToolboxProvider