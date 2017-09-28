var express = require('express');
var router = express.Router();

router.post('/login', function(req, res, next) {
      res.append('Content-Type','application/json')
      res.status(200)
      res.send({name:'Bob',age:18});
});

module.exports = router;
