const express = require('express');
const vacancyController = require('../controllers/vacancy.js');

const router = express.Router();

router.get('/', vacancyController.getVacancies);
router.get('/:id', vacancyController.getVacancy);
router.put('/:id', vacancyController.updateVacancy);


module.exports = router;