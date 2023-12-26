const express = require('express')
const multer = require('multer');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Message = require('../models/Message');
const router = express.Router()
const path = require('path');
const Withdrawal = require('../models/Withdrawal');

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    },
    destination: (req, file, cb) => {
        cb(null, "public/images");
    }
})
const upload = multer({ storage: storage })


// Return user details
router.get('/:username', async (req, res) => {
    var username = req.params.username

    try {
        const user = await User.findOne({ username: username })
        if (user) {
            user.password = ""
            res.status(200).send(user)
        }
        else {
            res.status(501).send()
        }
    } catch (error) {
        console.log(error);
    }
})


//  Make a Deposit(Transaction)
router.post("/:username/deposit",
    upload.single('file'),
    async (req, res) => {
        var username = req.params.username

        const transaction = new Transaction({
            amount: req.body.amount,
            category: req.body.category,
            coin: req.body.coin,
            file: req.file.filename,
            user: 0,
            verified: false
        })

        const user = await User.findOne({ username: username })
        if (user) {
            transaction.user = user._id
        }

        await transaction.save()
            .then(async (result) => {
                var newTransaction = result._id
                const user = await User.findOne({ username: username })
                if (user) {
                    user.transactions.push(newTransaction)
                    user.updateOne({ transactions: user.transactions })
                        .then((result) => {
                            res.status(200).send()
                            updateProfitAuto()
                        }).catch((err) => {
                            console.log(err);
                        });
                }
            }).catch((err) => {
                console.log(err);
            });

    })



// Making a withdrawal
router.post('/:username/withdrawal', async (req, res) => {
    var username = req.params.username

    var walletAddress = req.body.walletAddress
    var amount = req.body.amount
    var coin = req.body.coin
    var verified = false

    var user = await User.findOne({ username: username })
    try {
        var newWithdrawal = {
            amount: amount,
            walletAddress: walletAddress,
            coin: coin,
            user: '',
            verified: verified
        }
        newWithdrawal.user = user._id

        var withdrawal = new Withdrawal(newWithdrawal)
        withdrawal.save().then(async (result) => {
            user.withdrawals.push(result._id)
            await user.save();
            res.status(200).send()
        }).catch((err) => {
            res.status(404).send()
        });
    } catch (error) {
        console.log(error);
    }

})


// Return a list of all withdrawals from a particular user
router.get('/:username/withdrawals', async (req, res) => {
    const username = req.params.username

    const user = await User.findOne({ username: username })
    if (user) {
        user.password = ""
        user.populate("withdrawals")
            .then((result) => {
                res.status(200).send(user)
            }).catch((err) => {
                res.status(501).send()
            });
    }
    else {
        res.status(409).send()
    }
})


// Returns a list of all deposits from a given user
router.get("/:username/transactions", async (req, res) => {
    const username = req.params.username

    const user = await User.findOne({ username: username })

    if (user) {
        user.password = ""
        user.populate("transactions")
            .then((result) => {
                res.status(200).send(user)
            }).catch((err) => {
                res.status(501).send()
            });
    }
    else {
        res.status(409).send()
    }

})



// Send a message
router.post('/:username/livesupport', async (req, res) => {
    var sender = req.body.sender
    var receiver = req.body.receiver
    var text = req.body.text

    var newMessage = new Message({
        sender: sender,
        receiver: receiver,
        text: text
    })

    var user = await User.findOne({ username: sender })
    newMessage.save()
        .then(async (result) => {
            user.messages.push(result._id)
            user.updateOne({ messages: user.messages })
                .then((result) => {
                    res.status(200).send()
                }).catch((err) => {
                    console.log(err);
                });
        }).catch((err) => {
            console.log(err);
        });
})


// Get all messages
router.get('/:username/livesupport', async (req, res) => {

    const username = req.params.username

    const user = User.findOne({ username: username })
    user.populate('messages')
        .then((result) => {
            res.status(200).send(result.messages)
        }).catch((err) => {
            console.log(err);
        });
})

module.exports = router