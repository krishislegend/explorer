var mongoose = require('mongoose'),
  //    db = require('../lib/database'),
  db2 = require('../lib/explorerdb'),
  //    Tx = require('../models/tx'),
  //    Address = require('../models/address'),
  //    Richlist = require('../models/richlist'),
  //    Stats = require('../models/stats'),
  settings = require('../lib/settings'),
  lib = require('../lib/explorerwan'),
  fs = require('fs');

var count = 1;
var block_num_db = -1;
var mode = 'update';
var database = 'index';

var Web3 = require('web3');
var web3 = new Web3();
var eth_node_url = 'http://localhost:8545'; // for local host mode
console.log("eth_node_url: " + eth_node_url);
web3.setProvider(new web3.providers.HttpProvider(eth_node_url));

// displays usage and exits
function usage() {
  console.log('Usage: node scripts/sync.js count startNumber');
  console.log('count: number of records to update');
  console.log('startNumber: starting block number to update from database');
  console.log('');
  process.exit(0);
}

// check options
if (process.argv.length < 2) {
  usage();
}
var count_in = process.argv[2];
if (isNaN(count_in)) {
  usage();
}
count = parseInt(count_in);
console.log("count=" + count);

if (process.argv.length > 3) {
  var startNumber_in = process.argv[3];
  if (isNaN(startNumber_in)) {
    usage();
  }
  block_num_db = parseInt(startNumber_in);
}

console.log("count=" + count + ", start Block num=" + block_num_db);
// return;

function create_lock(cb) {
  if (database == 'index') {
    var fname = '/tmp/' + database + '.pid';
    fs.appendFile(fname, process.pid, function(err) {
      if (err) {
        console.log("Error: unable to create %s", fname);
        process.exit(1);
      } else {
        return cb();
      }
    });
  } else {
    return cb();
  }
}

sync_main();

function remove_lock(cb) {
  if (database == 'index') {
    var fname = '/tmp/' + database + '.pid';
    fs.unlink(fname, function(err) {
      if (err) {
        console.log("unable to remove lock: %s", fname);
        process.exit(1);
      } else {
        return cb();
      }
    });
  } else {
    return cb();
  }
}

function is_locked(cb) {
  if (database == 'index') {
    var fname = './tmp/' + database + '.pid';
    fs.exists(fname, function(exists) {
      if (exists) {
        console.log("is_lock exists:" + fname);
        return cb(true);
      } else {
        console.log("is_lock not exists:" + fname);
        return cb(false);
      }
    });
  } else {
    return cb();
  }
}

function exit() {
  console.log("disconnect");
  console.timeEnd("synctime-perloop");
  console.log("Wait for next run...");
  block_num_db = -1;
  var datetime = new Date();
  console.log(datetime);
  remove_lock(function() {
    mongoose.disconnect();
    // process.exit(0);  comment this to make to loop
    setTimeout(function() {
      sync_main();
    }, 20000);
  });
}

function sync_main() {
  var dbString = 'mongodb://' + settings.dbsettings.user;
  dbString = dbString + ':' + settings.dbsettings.password;
  dbString = dbString + '@' + settings.dbsettings.address;
  dbString = dbString + ':' + settings.dbsettings.port;
  dbString = dbString + '/' + settings.dbsettings.database;
  console.log(dbString);
  console.time("synctime-perloop");
  is_locked(function(exists) {
    if (exists) {
      console.log("Script already running..");
      process.exit(0);
    } else {
      create_lock(function() {
        console.log("script launched with pid: " + process.pid);
        mongoose.connect(dbString, function(err) {
          if (err) {
            console.log('Unable to connect to database');
            console.log('Aborting');
            exit();
          } else {
            //WZ
            console.log('able to connect to database');
            web3.eth.getBlockNumber(function(error, block_num_node) {
              if (error) {
                console.error(error);
                exit();
              } else {
                console.log(block_num_node);
                db2.find_block_top(function(block_top_db) {
                  if (block_top_db) {
                    console.log(block_top_db);
                    //compare block numbers from db and node.  If different, update db
                    if (block_num_db < 1) {
                      if (block_top_db[0]) {
                        block_num_db = block_top_db[0].number;
                      } else {
                        block_num_db = -1;
                      }
                    }
                    console.log("block num node:" + block_num_node);
                    if (block_num_db < block_num_node) {
                      // var count = 1;
                      lib.syncLoop(count, function(loop) {
                        var i = loop.iteration();
                        update_block_from_node(block_num_db + i + 1, function() {
                          console.log("return from node_call 2");
                          loop.next();
                        });
                      }, function() {
                        console.log("Done with iteration");
                        exit();

                      });

                    } else {
                      console.log("Start number is larger than the block last number. exit");
                      exit();
                    }
                  }

                });
              }
            })

          }
          //WZ mongoose connect end
        });
      });
    }
  });
}

function update_block_from_node(number, cb) {
  console.log("inside from_node 0");
  console.log("last block:" + web3.eth.blockNumber);
  web3.eth.getBlock(number, 1, function(error, result) {
    console.log("inside from_node");
    if (!error) {
      console.log(result);
      console.log(number);
      var balances = get_balance_from_block(result);
      var isContracts = is_contract_from_block(result);
      console.log("Return from getBalance:");
      console.log(balances);
      console.log("Return from isContract:");
      console.log(isContracts);
      // console.log(balances["0xdb05642eabc8347ec78e21bdf0d906ba579d423a"]);
      db2.update_block(number, result, balances,isContracts, function(err, updateRes) {
        if (!err) {
          console.log("update completed");
          return cb(updateRes);
        } else {
          console.log("err:" + err);
          return cb(err);
        }
      });
    } else {
      console.error(error);
      return cb(error);
    }
  })
}

//adding balance check
function get_balance_from_block(block) {
  console.log("in get_balance");
  var Balance_one = function(address, amount) {
    this.address = address,
    this.amount = amount.toString(10);
  }
  var balances_tx = [];
  if (!block)
    return null;
  if (block.transactions) {
    var block_txs = block.transactions;
    lib.syncLoop(block_txs.length, function(loop) {
      var i = loop.iteration();
      console.log(block_txs[i]);
      console.log(block_txs[i].from);
      var balance_amount_from = web3.eth.getBalance(block_txs[i].from);
      // balances_tx.push(new Balance_one(block_txs[i].from, balance_amount_from));
      balances_tx[block_txs[i].from] = balance_amount_from.toString(10);
      // balances_tx.push(block_txs[i].from, balance_amount_from);
      if (block_txs[i].to) {
        var balance_amount_to = web3.eth.getBalance(block_txs[i].to);
        // balances_tx.push(new Balance_one(block_txs[i].to, balance_amount_to));
        // balances_tx.push(block_txs[i].to, balance_amount_to);
        balances_tx[block_txs[i].to] = balance_amount_to.toString(10);
      } else {
        // block_txs[i].to = "smart contract";
        balances_tx[block_txs[i].to] = "0";
      }
      console.log(balances_tx);
      //  return balances_tx;
    }, function() {
      // return balances_tx;
      // return null;
    });
    return balances_tx;
  }
}

//adding contract check
function is_contract_from_block(block) {
  console.log("in is_contract");
  let isContract_tx = [];
  if (!block)
    return null;
  if (block.transactions) {
    let block_txs = block.transactions;
    lib.syncLoop(block_txs.length, (loop)=>{
      let i = loop.iteration();
      console.log(block_txs[i]);
      console.log(block_txs[i].to);
      if (block_txs[i].to === null) {
        let contract_addr_to = web3.eth.getTransactionReceipt(block_txs[i].hash).contractAddress;
        isContract_tx[block_txs[i].hash] = [contract_addr_to, true];
      } else {
        let bool = web3.eth.getCode(block_txs[i].to) === "0x"
          ? false
          : true;
        isContract_tx[block_txs[i].hash] = [
          block_txs[i].to,
          bool
        ];
      }
      loop.next();
    }, ()=>{});
    return isContract_tx;
  }
}
