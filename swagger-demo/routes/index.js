var express = require('express');
var router = express.Router();
/**
 * @swagger
 * /:
 *    get:
 *        description: "描述"
 *        tags:
 *        - "index"
 *        produces:
 *        - "text/palin"
 *        responses:
 *          200:
 *            description: "返回hello swager"
 *            schema:
 *              type: "string"
 */        
router.get('/', function(req, res, next) {
    res.append('Content-Type','text/palain')
    res.status(200)
    res.send('hello swagger');
});

module.exports = router;