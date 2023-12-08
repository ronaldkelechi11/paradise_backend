const express = require('express')
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Message = require('../models/Message');
const Withdrawal = require('../models/Withdrawal');
const router = express.Router()


// Get all important values
router.get('/', async (req, res) => {

    var data = {
        users: [{}],
        transactions: [{}],
        withdrawals: [{}],
        totalProfit: 0,// total profit from users accounts
        totalVerified: 0, // Total verified Deposits
        pendingWithdrawals: 0,
    }

    await User.find({})
        .then((result) => {
            result.forEach(user => {
                user.password = ''
            })
            data.users = result
        }).catch((err) => {
            console.log(err);
        });

    const transaction = await Transaction.find({}).populate('user')
    const withdrawals = await Withdrawal.find({}).populate('user')

    // now to get username just use user.username from both transaction and withdrawals
    data.transactions = transaction
    data.withdrawals = withdrawals

    transaction.forEach(element => {
        if (element.verified) {
            parseFloat(data.totalProfit += element.amount)
        }
    });

    transaction.forEach(element => {
        if (element.verified) {
            parseFloat(data.totalVerified++)
        }
    });

    withdrawals.forEach(element => {
        if (!element.verified) {
            parseFloat(data.pendingWithdrawals++)
        }
    });

    res.status(200).send(data)
})



// edit a user balance or profit
router.put('/edit/:id', async (req, res) => {
    var userId = req.params.id
    var newBalance = req.body.balance
    var newProfit = req.body.profit

    const user = await User.findOneAndUpdate(
        { _id: userId },
        { balance: newBalance, profit: newProfit }
    ).then((result) => {
        res.status(200).send()
    }).catch((err) => {
        console.log(err);
    });
})

// delete a user
router.post('/edit/delete/:id', async (req, res) => {
    var userId = req.params.id

    const user = await User.deleteOne({ _id: userId })
        .then((result) => {
            res.status(200).send()
        }).catch((err) => {
            console.log(err);
        });
})



//Withdrawal Verification
router.put('/withdrawal/verified/:id', (req, res) => {
    var withdrawalId = req.params.id

    var withdrawal = Withdrawal.findOneAndUpdate(
        { _id: withdrawalId }, { verified: true })
        .then(async (result) => {
            const user = await User.findOne({ _id: result.user })
            if (user) {
                var newBalance = parseFloat(user.balance - result.amount)
                User.findOneAndUpdate({ _id: result.user }, { balance: newBalance })
                    .then((result) => {
                        res.status(200).send()
                    }).catch((err) => {
                        res.status(403).send()
                    });
            }
        }).catch((err) => {
            console.log(err);
            res.send(503)
        });
})


// Transaction verified (update)
router.put("/transaction/verified/:id", (req, res) => {
    var transactionId = req.params.id
    var oneDay = 1000 * 60 * 60 * 24

    var transaction = Transaction.findOneAndUpdate
        ({ _id: transactionId }, { verified: true }
        ).then(async (result) => {
            const user = await User.findOne({ _id: result.user })
            if (user) {
                var newBalance = parseFloat(result.amount + user.balance)
                User.findOneAndUpdate({ _id: result.user }, { balance: newBalance }).then((result) => {
                    res.status(200).send()

                    // UPDATE DAILY
                    setInterval(updateUserBalance, oneDay);
                }).catch((err) => {
                    res.send(501).send(err)
                });
            }
            else {
                res.status(409).send()
            }
        }).catch((err) => {
            console.log(err);
        });


    // Update profit daily code
    function updateUserBalance() {
        var transaction = Transaction.findOneAndUpdate({ _id: transactionId }, { verified: true })
        console.log(transaction);
    }
})


// Get all messages linked to a particular user and admin
router.get('/messages/:username', async (req, res) => {

    var username = req.params.username

    var user = User.findOne({ username: username })
    user.populate('messages').then((result) => {
        res.status(200).send(result.messages)
    }).catch((err) => {
        console.log(err);
    });
})

// Post new message to that user
router.post('/messages/:username', async (req, res) => {
    var sender = req.body.sender
    var receiver = req.body.receiver
    var text = req.body.text

    var newMessage = new Message({
        text: text,
        sender: sender,
        receiver: receiver
    })
    var user = await User.findOne({ username: receiver })
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


module.exports = router