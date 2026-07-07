import  { createContext } from 'react'

const boardContext = createContext(
    {
        activeToolItem: " ",
        toolActionType : "",
        handleActiveToolItemClick: () => {},
        boardMouseDownhandler : ()=>{},
        elements : [],
        history:[[]],
        index:0,
        loadSavedCanvas: ()=>{},
        boardMouseMoveHandler : ()=>{},
        textAreaBlur : ()=>{},
        undo : ()=>{},
        redo: ()=>{},
        viewport: { x: 0, y: 0, zoom: 1 },
        panViewport: () => {},
        zoomViewport: () => {},
        worldToScreen: () => ({ x: 0, y: 0 }),
        generateDiagram: () => {},
        addStickyNote: () => {},
        moveElement: () => {},
        updateElementText: () => {}
    }
)

export default boardContext
