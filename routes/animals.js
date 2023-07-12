const express = require('express');

// controller modules
const animalController = require('../controllers/animalController');

const router = express.Router();

// list all animals
router.get('/', animalController.animalList);

module.exports = router;
