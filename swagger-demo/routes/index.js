var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.append('Content-Type','text/palain')
    res.status(200)
    res.send('hello swagger');
});

module.exports = router;