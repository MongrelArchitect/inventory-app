const express = require('express');

const animalController = require('../controllers/animalController');

const router = express.Router();

// list all animals
router.get('/', animalController.animalList);

// new animal form GET
router.get('/new', animalController.getNewAnimalForm);

// new animal form POST
router.post('/new', animalController.postNewAnimalForm);

// individual animal detail
router.get('/:id', animalController.animalDetail);

// delete animal detail GET
router.get('/:id/delete', animalController.getDeleteAnimal);

// delete animal detail POST
router.post('/:id/delete', animalController.postDeleteAnimal);

// edit animal detail GET
router.get('/:id/edit', animalController.getEditAnimal);

// edit animal detail POST
router.post('/:id/edit', animalController.postEditAnimal);

module.exports = router;
