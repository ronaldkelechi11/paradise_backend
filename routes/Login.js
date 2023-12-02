const express = require('express')
const User = require('../models/User');
const router = express.Router()

router.post('/', async (req, res) => {
    var loggingUser = req.body.user

    var email = loggingUser.email
    var password = loggingUser.password

    if (email == "admin@globaltechnologyservices.web.app") {
        res.status(203).send()
        console.log("Admin logged In")
        return true;
    }
    else {
        const user = await User.findOne({ email: email })
        if (user) {
            user.password = ""
            res.status(200).send(user)
            console.log(`${user.email} just logged in`);
        }
        else {
            res.status(501).send()
            console.log("User doesn't exist");
        }
    }
})

module.exports = router