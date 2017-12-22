var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var WanblockSchema = new Schema({
    number: {
        type: Number,
        unique: true,
        index: true
    },
    difficulty: {
        type: Number
    },
    extraData: {
        type: String
    },
    gasLimit: {
        type: Number
    },
    gasUsed: {
        type: Number
    },
    hash: {
        type: String
    },
    logsBloom: {
        type: String
    },
    miner: {
        type: String
    },
    mixHash: {
        type: String
    },
    nonce: {
        type: String
    },
    parentHash: {
        type: String
    },
    receiptsRoot: {
        type: String
    },
    sha3Uncles: {
        type: String
    },
    size: {
        type: Number,
        default: 0
    },
    stateRoot: {
        type: String
    },
    timestamp: {
        type: Number,
        default: 0
    },
    totalDifficulty: {
        type: Number
    },
    txn: {
        type: Number,
        default: 0
    },
    transactions: {
        type: Array,
        default: []
    },
    transactionsRoot: {
        type: String
    },
    uncles: {
        type: Array,
        default: []
    }

}, {
    id: false
});

module.exports = mongoose.model('wanblock', WanblockSchema);
