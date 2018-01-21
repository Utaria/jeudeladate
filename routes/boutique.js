const express = require('express');
const router = express.Router();
const Model = require('../server/Model');

router.get('/', function(req, res, next) {
    res.render('boutique', { title: 'Boutique du jeu' });
});

module.exports = router;