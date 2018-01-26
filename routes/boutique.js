const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.render('boutique', { title: 'Boutique du jeu' });
});

module.exports = router;