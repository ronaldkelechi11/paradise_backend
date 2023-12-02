const express = require('express')
const User = require('../models/User');
const router = express.Router()

router.post('/', async (req, res) => {

    var user = req.body.user

    var username = user.username
    var email = user.email
    var telephone = user.telephone
    var password = user.password

    function generateRefferalCode() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomString = '';
        for (let i = 0; i < 12; i++) {
            randomString += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return randomString;
    }

    User.findOne({ email, username })
        .then((response) => {
            if (response == null) {
                const randomGenerator = generateRefferalCode();

                var user = new User({
                    username: username,
                    email: email,
                    telephone: telephone,
                    password: password,
                    balance: 5,
                    profit: 0,
                    refferalCode: randomGenerator,
                    refferals: []
                })

                user.save()
                    .then((result) => {
                        res.send(username)
                    }).catch((err) => {
                        console.log(err);
                    });
            }
            else {
                // user exists
                res.status(409).send()
                console.log(`${email} already exists`);
            }
        })
        // Couldnt search if user exist
        .catch((err) => {
            console.log("Couldn't search if user exist " + err),
                res.status(501).send()
        })
})

module.exports = router