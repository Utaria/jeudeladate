const express = require('express');
const router = express.Router();

router.get('/prix', function(req, res, next) {
    res.render('prix', { title: 'Les prix à gagner !' });
});

module.exports = router;