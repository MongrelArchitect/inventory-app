const express = require('express');

const animalController = require('../controllers/animalController');

const router = express.Router();

// list all animals
router.get('/', animalController.animalList);

// new animal form GET
router.get('/new', animalController.getNewAnimalForm);

// individual animal detail
router.get('/:id', animalController.animalDetail);

module.exports = router;
