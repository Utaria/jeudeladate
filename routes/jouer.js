const express = require('express');
const router = express.Router();
const Model = require('../server/Model');
const config = require('../storage/config');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('jouer', { title: 'Jouer à notre jeu !', socketurl: config.base + ":" + config.port });
});

router.get('/inviter', function(req, res, next) {
    res.render('inviter', { title: 'Invitez vos amis !' })
});

router.get('/inviter/lien', function(req, res, next) {
    const token = req.query.token;

    if (token) {
        Model.getRefererKey(token, function(key) {
            if (key) {
                res.send('https://jeu.utaria.fr/?rfKey=' + key);
            } else
                res.send('Aucun lien lié à votre compte.');
        });
    } else {
        res.send('Compte invalide');
    }
});

router.get('/erreur', function(req, res, next) {
    res.status(500);
    res.render('erreurserveur', { title: 'Erreur du serveur !' })
});

module.exports = router;
