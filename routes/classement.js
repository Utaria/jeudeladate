const express = require('express');
const router = express.Router();
const db = require('../server/db');

/* GET home page. */
router.get('/', function(req, res, next) {
    db.query('SELECT * FROM players WHERE name IS NOT NULL AND name != \'Flavian\' ORDER BY total_experience DESC LIMIT 0,10', function(err, rows) {
        if (err) rows = {};

        res.render('classement', { title: 'Classement du jeu', data: rows, i: 0 });
    });
});

module.exports = router;
