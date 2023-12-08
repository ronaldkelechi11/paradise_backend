const mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        min: 3,
        max: 64
    },
    telephone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        min: 8,
        max: 64,
        immutable: true
    },
    balance: {
        type: Number,
        required: true,
        maxLength: 7,
        minLength: 1
    },
    profit: {
        type: Number,
        required: true,
        maxLength: 7,
        minLength: 1
    },
    refferalCode: {
        type: String,
        required: true
    },
    transactions: [
        {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Transaction"
        }
    ],
    withdrawals: [
        {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Withdrawal"
        }
    ],
    refferals: [
        {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "User"
        }
    ],
    messages: [
        {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Message"
        }
    ]
})

module.exports = mongoose.model("User", userSchema)