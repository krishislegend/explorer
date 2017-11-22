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

console.time("synctime");
var count = 1;
var block_num_db = 0;
var mode = 'update';
var database = 'index';

var Web3 = require('web3');
var web3 = new Web3();
var eth_node_url = 'http://121.42.8.74:8545'; // for local host mode
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
console.log("count="+count);

if (process.argv.length >3) {
console.log("start=");
var startNumber_in = process.argv[3];
if (isNaN(startNumber_in)) {
   usage();
   }
block_num_db = parseInt(startNumber_in);
}

console.log("count="+count+", start Block num="+block_num_db);
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
    console.timeEnd("synctime");
    remove_lock(function() {
        mongoose.disconnect();
        process.exit(0);
    });
}

var dbString = 'mongodb://' + settings.dbsettings.user;
dbString = dbString + ':' + settings.dbsettings.password;
dbString = dbString + '@' + settings.dbsettings.address;
dbString = dbString + ':' + settings.dbsettings.port;
dbString = dbString + '/' + settings.dbsettings.database;

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
				    if(block_num_db < 1) {
                                    	block_num_db = block_top_db[0].number;
				    }
                                    console.log("block num node:" + block_num_node);
                                    if (block_num_db < block_num_node) {
                                        // var count = 1;
                                        lib.syncLoop(count, function(loop) {
                                            var i = loop.iteration();
                                            update_block_from_node(block_num_db+i+1, function() {
                                            // update_block_from_node(299105, function() {
                                                console.log("return from node_call 2");
                                                loop.next();
                                            });
                                        }, function() {
                                            console.log("Done with iteration");
                                            exit();

                                        });

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

function update_block_from_node(number, cb) {
    console.log("inside from_node 0");
    console.log("last block:" + web3.eth.blockNumber);
    web3.eth.getBlock(number, 1, function(error, result) {
        console.log("inside from_node");
        if (!error) {
            console.log(result);
            console.log(number);
            db2.update_block(number, result, function(err, updateRes) {
                if (!err) {
                    console.log("update completed");
                    return cb(updateRes);
                } else {
                    console.log("err:" + err);
                    return cb(err);
                }
            });
            //XXX return cb(result);
        } else {
            console.error(error);
            return cb(error);
        }
    })
}
