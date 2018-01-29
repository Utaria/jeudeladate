const express = require('express');
const router = express.Router();
const db = require('../server/db');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('date', { title: 'Découvrez la date d\'ouverture !' });
});

router.get('/data', function(req, res, next) {
    db.query("SELECT total_experience as exp from players where total_experience != 0", function(err, rows) {
        let total = 0;

        if (!err && rows && rows.length > 0)
            for (let row of rows)
                total += Math.min(row.exp, 2000000);

        db.query("SELECT * FROM date_breakpoints WHERE experience_needed > ? ORDER BY experience_needed ASC LIMIT 1", [total], function(err, rows2) {
            if (err || rows2.length === 0) {
                res.json({exp_remaining: 0, percent: 100});
                return;
            }

            const expNeeded = rows2[0].experience_needed;

            res.json({
                point_id: rows2[0].id,
                exp_remaining: expNeeded - total,
                percent: (total / expNeeded) * 100
            });
        });
    });
});

router.get('/openingdate', function(req, res, next) {
    db.query("SELECT total_experience as exp from players where total_experience != 0", function(err, rows) {
        let total = 0;

        if (!err && rows && rows.length > 0)
            for (let row of rows)
                total += Math.min(row.exp, 2000000);

        db.query("SELECT * FROM date_breakpoints WHERE experience_needed <= ? ORDER BY experience_needed DESC LIMIT 1", [total], function(err, rows2) {
            if (err || rows2.length === 0) {
                res.json({date: ['X', 'X', 'X', 'X']});
                return;
            }

            res.json({date: rows2[0].date.split('')});
        });
    });
});

module.exports = router;
