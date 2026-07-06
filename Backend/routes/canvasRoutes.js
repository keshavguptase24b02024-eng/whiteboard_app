const express = require('express');
const { getAllCanvas, createCanvas, deleteCanvas, updateCanvas, getCanvas, shareCanvas } = require('../controllers/canvasController');
const authenticationMiddleware = require('../middlewares/authorization');
const router = express.Router();

router.get('/', authenticationMiddleware, getAllCanvas);

router.post('/create', authenticationMiddleware, createCanvas);

router.delete('/delete', authenticationMiddleware, deleteCanvas);

router.put('/update', authenticationMiddleware, updateCanvas);

router.get("/:id", authenticationMiddleware, getCanvas);

router.post("/share/:id", authenticationMiddleware, shareCanvas);

module.exports = router;