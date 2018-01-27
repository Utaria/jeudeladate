const express = require('express');
const router = express.Router();
const config = require('../storage/config');

router.get('/', function(req, res, next) {
    res.render('boutique', { title: 'Boutique du jeu', socketurl: config.base + ':' + config.port });
});

module.exports = router;