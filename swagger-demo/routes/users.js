var express = require('express');
var router = express.Router();

  /**
   * @swagger
   * definitions:
   *   login:
   *     type: "object"
   *     properties:
   *       username:
   *         type: "string"
   *       age:
   *         type: "integer"
   *
   */

  /**
   * @swagger
   * /users/login:
   *   post:
   *     description: "描述"
   *     tags:
   *     - "users"
   *     produces:
   *     - "application/json"
   *     parameters:
   *     - in: "body"
   *       name: "body"
   *       required: true
   *       schema:
   *         type: "object"
   *         properties:
   *            phone:
   *              type: "string"
   *              description: "电话号码"
   *            password:
   *              type: "string"
   *              description: "密码"
   *     responses:
   *       200:
   *         description: "登录成功，返回用户名和年龄"
   *         schema:
   *           $ref: "#/definitions/login"
   */
router.post('/login', function(req, res, next) {
      res.append('Content-Type','application/json')
      res.status(200)
      res.send({name:'Bob',age:18});
});

module.exports = router;
