const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    let link = "";
    let btnText = null;

    // From a friend link! :-)
    if (req.query.rfKey) {
        link = "?rfKey=" + req.query.rfKey;
        btnText = "Jouer avec mon ami";
    }

    res.render('index', {title: 'Le jeu de la date !', fLink: link, btnText: btnText});
});

module.exports = router;
