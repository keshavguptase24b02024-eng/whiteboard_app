const mongoose = require('mongoose');
const { collection } = require('./userModel');
const userModel = require('./userModel');

const canvasSchema = new mongoose.Schema({
    owner : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required : true
    },
    shared_with : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }],
    elements : [{ 
        type: mongoose.Schema.Types.Mixed
    }],
    name : {
        type: String,
        required : true,
        trim: true,
    }
},{
    timestamps: true,
});

canvasSchema.statics.getUserCanvas = async function(email){
    const user = await userModel.getUser(email);
    try {
        if(!user){
            throw new Error('User not found');
        }
        const canvases = await this.find({ $or : [{owner : user._id}, {shared_with : user._id}]});
        return canvases;    
    } 
    catch (error) {
        throw Error('Error getting canvases');
    }
    
}

canvasSchema.statics.createCanvas = async function(email,name){
    try {
        const user = await userModel.getUser(email);
        if(!user){
            throw new Error("User not found");
        }
        const canvas = new this({
            owner : user._id,
            shared_with: [],
            elements : [],
            name
        })
        const newCanvas = await canvas.save()
        return newCanvas;
    } 
    catch (error) {
        throw Error('Error creating canvas ' + error.message);
    }
}

canvasSchema.statics.deleteCanvas = async function(email,canvasId){
    try {
        const user = await userModel.getUser(email); 
        if(!user){
            throw new Error("User not found");
        }

        const canvas = await this.findOne({_id: canvasId, owner : user._id});
        if(!canvas){
            throw new Error("canvas not found");
        }

        await canvas.deleteOne();
        return {message: "Canvas deleted successfully"};
    } 
    catch (error) {
        throw new Error("Error deleting canvas : " + error.message);
    }
}

canvasSchema.statics.updateCanvas = async function(email,canvasId,elements){
    try {
        const user = await userModel.getUser(email);
        if(!user){
            throw new Error("User not found");
        }

        const canvas = await this.findOne({
            _id: canvasId, 
            $or: [{ owner: user._id }, { shared_with: user._id }]
        });
        
        if(!canvas){
            throw new Error("Canvas not found or you do not have permission to edit it");
        }

        canvas.elements = elements;
        const updatedCanvas = await canvas.save();
        return updatedCanvas;
    } 
    catch (error) {
        throw new Error("Error saving canvas: " + error.message);
    }
}

canvasSchema.statics.getCanvasById = async function(canvasId){
    try{
        const canvas = await this.findOne({_id: canvasId});
        if(!canvas){
            throw new Error("Canvas not found");
        }
        return canvas;
    }
    catch(error){
        throw new Error("Error loading canvas " + error.message);
    }
}

canvasSchema.statics.shareCanvas = async function(canvasId,shareEmail,email){
    try {
        const User = await userModel.getUser(email);
        const sharedUser = await userModel.getUser(shareEmail);

        if(!sharedUser){
            throw new Error("User does not exist");
        }
        
        const canvas = await this.findOne({_id: canvasId, owner : User._id});
        if(!canvas){
            throw new Error("Canvas not found or you don't have permission to share");
        }

        canvas.shared_with.addToSet(sharedUser._id);
        await canvas.save(); 
        
        return canvas;

    } catch (error) {
        throw new Error("Error sharing canvas: " + error.message);
    }
}

const Canvas = mongoose.model('Canvas',canvasSchema);

module.exports = Canvas;