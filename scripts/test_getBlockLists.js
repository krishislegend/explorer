var mongoose = require('mongoose'),
    db2 = require('../lib/explorerdb'),
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
    console.log('Usage: node scripts/get_BlockLists.js count blockNumber');
    console.log('count: number of records to show');
    console.log('blockNumber: max block index to show from database');
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
                db2.get_blocklist(block_num_db, count, function(err, result) {
                if (!err) {
                    console.log("update completed");
                    // return cb(result);
                    exit();
                } else {
                    console.log("err:" + err);
                    exit();
                }
            });
	    }
        });
        });
    }
});

