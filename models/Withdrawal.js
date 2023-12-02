const mongoose = require('mongoose');

var withdrawalSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
        immutable: true
    },
    walletAddress: {
        type: String,
        required: true
    },
    coin: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        immutable: true
    },
    verified: {
        type: Boolean,
        required: true
    }
})
module.exports = mongoose.model("Withdrawal", withdrawalSchema)