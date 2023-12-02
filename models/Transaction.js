const mongoose = require('mongoose');

var transactionSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
        immutable: true
    },
    category: {
        type: String,
        required: true
    },
    coin: {
        type: String,
        required: true
    },
    file: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User"
    },
    verified: {
        type: Boolean,
        required: true
    }
})
module.exports = mongoose.model("Transaction", transactionSchema)