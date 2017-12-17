var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var WanTxSchema = new Schema({
    hash: {
        type: String,
        lowercase: true,
        unique: true,
        index: true
    },
    blockNumber: {
        type: Number,
        default: 0
    },
    from: {
        type: String
    },
    to: {
        type: String
    },
    gas: {
        type: Number,
        default: 0
    },
    gasPrice: {
        type: String
    },
    input: {
        type: String
    },
    timestamp: {
        type: Number,
        default: 0
    },
    blockHash: {
        type: String
    },
    nonce: {
        type: Number,
        default: 0
    },
    value: {
        type: String
    },
    txtype: {
        type: String
    },
    transactionIndex: {
        type: Number,
        default: 0
    },
    },{id: false});

module.exports = mongoose.model('Wantx', WanTxSchema);
