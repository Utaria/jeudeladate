const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('jouer', { title: 'Jouer à notre jeu !' });
});

router.get('/erreur', function(req, res, next) {
    res.status(500);
    res.render('erreurserveur', { title: 'Erreur du serveur !' })
});

module.exports = router;
