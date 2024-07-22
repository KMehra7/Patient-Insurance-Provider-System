const TokenService = require('../services/tokenService');
const express = require('express');
const router = express.Router();

// POST /token
router.post('/', function (req, res) {
    // This should be the user
    // from twilio docs - identity: identifies the user itself.
    const identity = req.body.identity;
    const token = TokenService.generate(identity)

    res.json({ identity: identity, token: token.toJwt(), });
});

// GET /token
router.get('/', function (req, res) {
    const identity = req.query.identity;
    const token = TokenService.generate(identity)

    res.json({ identity: identity, token: token.toJwt(), });
});


module.exports = router;