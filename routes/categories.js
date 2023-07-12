const express = require('express');

const categoryController = require('../controllers/categoryController');

const router = express.Router();

// list all categories
router.get('/', categoryController.categoryList);

// individual category detail
router.get('/:id', categoryController.categoryDetail);

module.exports = router;
