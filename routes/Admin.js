const express = require('express')
const User = require('../models/User');
const Transaction = require('../models/Transaction');
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



// edit a user balance or password
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




module.exports = router