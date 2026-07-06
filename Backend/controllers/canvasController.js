const Canvas = require('../models/canvasModel');

const getAllCanvas = async (req,res) => {
    const email = req.email;
    try{
        const canvases = await Canvas.getUserCanvas(email);
        res.status(200).json(canvases);
    }
    catch(error){
        res.status(400).json({message: error.message});
    }
};

const createCanvas = async (req,res) => {
    const email = req.email;
    const {name} = req.body;
    try {
        const newCanvas = await Canvas.createCanvas(email,name);
        if(!newCanvas){
            throw Error("Unable to create canvas");
        }
        res.status(200).json(newCanvas);
    } 
    catch (error) {
        res.status(400).json({message: error.message});
    }
};

const deleteCanvas = async (req,res) => {
    const email = req.email;
    const {name,canvasId} = req.body;
    try {
        const message = await Canvas.deleteCanvas(email,canvasId);
        res.status(200).json(message);
    } 
    catch (error) {
        res.status(400).json({message: error.message});
    }
}

const updateCanvas = async (req,res) => {
    const email = req.email;
    const {elements,canvasId} = req.body;

    try {
        const message = await Canvas.updateCanvas(email,canvasId,elements)
        res.status(200).json(message);
    } 
    catch (error) {
        res.status(400).json({message: error.message});
    }
}

const getCanvas = async (req,res) => {
    const { id } = req.params;
    
    try {
        const canvas = await Canvas.getCanvasById(id);
        res.status(200).json(canvas);    
    } 
    catch (error) {
        res.status(400).json({message: error.message});
    }
}

const shareCanvas = async (req,res) => {
    try {
       const {id} = req.params;
       const email = req.email;
       const {shareEmail} = req.body;
       console.log("hello");
       const message = await Canvas.shareCanvas(id,shareEmail,email);

       res.status(200).json(message);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}

module.exports = {getAllCanvas,createCanvas,deleteCanvas,updateCanvas,getCanvas,shareCanvas};
    