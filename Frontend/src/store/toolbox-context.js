import { createContext } from "react";

const toolboxContext = createContext({
    toolBoxState: {},
    changeStroke : ()=>{},
    changeFill : ()=>{},
    changeSize: ()=>{}
});

export default toolboxContext;
