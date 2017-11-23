var mongoose = require('mongoose'),
    Wanblock = require('../models/wanblock'),
    Wantx = require('../models/wantx'),
    Wanaddress = require('../models/wanaddress'),
    lib = require('./explorerwan'),
    settings = require('./settings');

function find_wanaddress(hash, cb) {
    Wanaddress.findOne({
        a_id: hash
    }, function(err, address) {
        if (address) {
            return cb(address);
        } else {
            return cb();
        }
    });
}

function find_block(blocknum, cb) {
    console.log("find block:" + blocknum);
    Wanblock.findOne({
        number: blocknum
    }, function(err, block) {
        console.log("finding block");
        if (block) {
            console.log("found block");
            console.log(block);
            return cb(block);
        } else {
            console.log("No block");
            console.log(err);
            return cb();
        }
    });
}



function update_wanaddress(hash, txid, amount, type, cb) {
    // Check if address exists
    console.log("updating address infor:" + hash);
    find_wanaddress(hash, function(address) {
        if (address) {
            console.log("address found:" + hash);
            // ensure tx doesnt already exist in address.txs
            lib.is_unique(address.txs, txid, function(unique, index) {
                var tx_array = address.txs;
                var received = address.received;
                var sent = address.sent;
                if (type == 'send') { //WZ replace vin with send
                    sent = sent + amount;
                } else {
                    received = received + amount;
                }
                if (unique == true) {
                    tx_array.push({
                        txhash: txid,
                        type: type
                    });
                    if (tx_array.length > settings.txcount) {
                        tx_array.shift();
                    }
                    Wanaddress.update({
                        a_id: hash
                    }, {
                        txs: tx_array,
                        received: received,
                        sent: sent,
                        balance: received - sent
                    }, function() {
                        return cb();
                    });
                } else {
                    if (type == tx_array[index].type) {
                        return cb(); //duplicate
                    } else {
                        Wanaddress.update({
                            a_id: hash
                        }, {
                            txs: tx_array,
                            received: received,
                            sent: sent,
                            balance: received - sent
                        }, function() {
                            return cb();
                        });
                    }
                }
            });
            // }
        } else {
            console.log("new address:" + hash);
            //new address
            if (type == 'send') {
                var newAddress = new Wanaddress({
                    a_id: hash,
                    txs: [{
                        txhash: txid,
                        type: 'send'
                    }],
                    sent: amount,
                    balance: amount,
                });
            } else {
                var newAddress = new Wanaddress({
                    a_id: hash,
                    txs: [{
                        txhash: txid,
                        type: 'receive'
                    }],
                    received: amount,
                    balance: amount,
                });
            }

            newAddress.save(function(err) {
                if (err) {
                    console.log(err);
                    return cb(err);
                } else {
                    console.log('address saved: %s', hash);
                    //console.log(newAddress);
                    return cb();
                }
            });
        }
    });
}

function update_block(number, block, cb) {
    // Check if address exists
    console.log("inside update_block");
    find_block(number, function(block_db) {
        if (block_db) {
            // WZ block found in db already. Skip
            console.log("Block:" + number + " found in db. Skip");
            return cb();
        } else {
            //new block 
            console.log("Generate block:" + number);
            var newBlock = new Wanblock({
                number: block.number,
                // txs: [ {addresses: txid, type: 'vin'} ],
                miner: block.miner,
                size: block.size,
                hash: block.hash,
                transactions: block.transaction,
                uncles: block.uncles,
                gasLimit: block.gasLimit,
                gasUsed: block.gasUsed,
                mixHash: block.mixHash,
                nounce: block.nounce,
                timestamp: block.timestamp,
                parentHash: block.parentHash,
                receiptRoot: block.receiptRoot,
                sha3Uncles: block.sha3Uncles,
                totalDifficulty: block.totalDifficulty,
                transactionsRoot: block.transactionsRoot,
            });

            console.log("aving block:" + number);
            console.log(block.transactions);
            if (block.transactions) {
                module.exports.create_wantxs(block.transactions, function(err) {
                    if (err) {
                        console.log(err);
                        return cb(err);
                    } else {
                        console.log('block saved: %s', number);
                        //console.log(newAddress);
                        newBlock.save(function(err) {
                            if (err) {
                                console.log(err);
                                return cb(err);
                            } else {
                                console.log('block saved: %s', number);
                                //console.log(newAddress);
                                return cb(number);
                            }
                        });
                        // return cb(number);
                    }
                });
            }

            /*
            newBlock.save(function(err) {
              if (err) {
                console.log(err);
                return cb(err);
              } else {
                console.log('block saved: %s', number);
                //console.log(newAddress);
                return cb(number);
              }
            }); */
        }
    });
}




//WZ update transactions
function save_wantx(tx, cb) {
    // Check if address exists
    console.log("inside save_wantx");
    find_tx(tx.hash, function(tx_db) {
        if (tx_db) {
            // WZ tx found in db already. Skip
            console.log("tx:" + tx.hash + " found in db. Skip");
            return cb();
        } else {
            //new block 
            console.log("Generate tx");
	    var to =  tx.to;
	    if (!to|| 0===to.length) {
		tx.to = "0xunknown532bb4803f4e1776F35b5b461C9bED289";
	    }
            var newtx = new Wantx({
                blockHash: tx.blockHash,
                blockNumber: tx.blockNumber,
                from: tx.from,
                to: tx.to,
                hash: tx.hash,
                gas: tx.gas,
                gasPrice: tx.gasPrice,
                input: tx.input,
                nonce: tx.nonce,
                value: tx.value,
                transactionIndex: tx.transactionIndex,
                txtype: "public",
            });

            console.log("saving tx");
            console.log(newtx);

            newtx.save(function(err) {
                if (err) {
                    console.log(err);
                    return cb(err);
                } else {
                    console.log('tx saved: %s', tx.hash);
                    //console.log("update wanaddress");
                    // update_wanaddress(tx.from, tx.hash, tx.value, 'send', function(err){
                    update_wanaddress(tx.from, tx.hash, 1, 'send', function(err) {
                        console.log(err);
                        if (err) {
                            return cb(err);
                        } else {
                            console.log("save addredd from");
                            //update_wanaddress(tx.to, tx.hash, tx.value, 'receive', function(err){
                            update_wanaddress(tx.to, tx.hash, 1, 'receive', function(err) {
                                if (err) {
                                    return cb(err);
                                } else {
                                    console.log("save addredd to");
                                    return cb(tx.hash);
                                }
                            });
                        }
                    });

                }
            });
        }
    });
}


function find_tx(txid, cb) {
    Wantx.findOne({
        hash: txid
    }, function(err, tx) {
        if (tx) {
            return cb(tx);
        } else {
            return cb(null);
        }
    });
}



module.exports = {
    // initialize DB
    connect: function(database, cb) {
        mongoose.connect(database, function(err) {
            if (err) {
                console.log('Unable to connect to database: %s', database);
                console.log('Aborting');
                process.exit(1);

            }
            //console.log('Successfully connected to MongoDB');
            return cb();
        });
    },

 // gets blocklists for given page
  get_blocklist: function(blockIndex, pageSize, cb) {
     Wanblock.find({}).where('number').lt(blockIndex).sort({number: 'desc'}).limit(pageSize).exec(function(err, data){
      if(data) {
	console.log(data);
        return cb(data);
      } else {
	console.log("error:"+err);
        return cb(null);
      }
    });
  },


    update_block: function(number, block, cb) {
        console.log("calling update_block");
        update_block(number, block, function(outblock) {
            return cb(outblock);
        });
    },


    //WZ
    create_wantx: function(tx, cb) {
        save_wantx(tx, function(err) {
            if (err) {
                return cb(err);
            } else {
                console.log('tx stored: %s', tx);
                return cb();
            }
        });
    },
    create_wantxs: function(block_txs, cb) {
        lib.syncLoop(block_txs.length, function(loop) {
            var i = loop.iteration();
            save_wantx(block_txs[i], function(err) {
                if (err) {
                    loop.next();
                } else {
                    console.log('tx stored: %s', block_txs[i]);
                    loop.next();
                }
            });
        }, function() {
            return cb();
        });
    },


    //WZ adding finding top block
    find_block_top: function(cb) {
        console.log("find block top");
        Wanblock.find().sort({
            "number": -1
        }).limit(1).exec(function(err, lastblock) {
            console.log("Last block:" + lastblock);
            return cb(lastblock);
        })

    }
};
