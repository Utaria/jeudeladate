var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('jouer', { title: 'Jouer à notre jeu !' });
});

module.exports = router;
