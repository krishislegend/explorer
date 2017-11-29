/* var request = require('request')
  , Address = require('../models/address');

var base_url = 'http://127.0.0.1:' + settings.port + '/api/';


function coinbase_supply(cb) {
  Address.findOne({a_id: 'coinbase'}, function(err, address) {
    if (address) {
      return cb(address.sent);
    } else {
      return cb();
    }
  });
}
*/

module.exports = {

    // synchonous loop used to interate through an array,
    // avoid use unless absolutely neccessary
    syncLoop: function(iterations, process, exit) {
        var index = 0,
            done = false,
            shouldExit = false;
        //WZ
        console.log("Entering syncLoop");
        var loop = {
            next: function() {
                if (done) {
                    if (shouldExit && exit) {
                        exit(); // Exit if we're done
                    }
                    return; // Stop the loop if we're done
                }
                // If we're not finished
                if (index < iterations) {
                    index++; // Increment our index
                    if (index % 100 === 0) { //clear stack
                        setTimeout(function() {
                            process(loop); // Run our process, pass in the loop
                        }, 1);
                    } else {
                        process(loop); // Run our process, pass in the loop
                    }
                    // Otherwise we're done
                } else {
                    done = true; // Make sure we say we're done
                    if (exit) exit(); // Call the callback on exit
                }
            },
            iteration: function() {
                return index - 1; // Return the loop number we're on
            },
            break: function(end) {
                done = true; // End the loop
                shouldExit = end; // Passing end as true means we still call the exit callback
            }
        };
        loop.next();
        return loop;
    },


    is_unique: function(array, object, cb) {
        var unique = true;
        var index = null;
        module.exports.syncLoop(array.length, function(loop) {
            var i = loop.iteration();
            if (array[i].addresses == object) {
                unique = false;
                index = i;
                loop.break(true);
                loop.next();
            } else {
                loop.next();
            }
        }, function() {
            return cb(unique, index);
        });
    },

    calculate_total: function(vout, cb) {
        var total = 0;
        module.exports.syncLoop(vout.length, function(loop) {
            var i = loop.iteration();
            //module.exports.convert_to_satoshi(parseFloat(vout[i].amount), function(amount_sat){
            total = total + vout[i].amount;
            loop.next();
            //});
        }, function() {
            return cb(total);
        });
    },

    prepare_vout: function(vout, txid, vin, cb) {
        var arr_vout = [];
        var arr_vin = [];
        arr_vin = vin;
        module.exports.syncLoop(vout.length, function(loop) {
            var i = loop.iteration();
            // make sure vout has an address
            if (vout[i].scriptPubKey.type != 'nonstandard' && vout[i].scriptPubKey.type != 'nulldata') {
                // check if vout address is unique, if so add it array, if not add its amount to existing index
                //console.log('vout:' + i + ':' + txid);
                module.exports.is_unique(arr_vout, vout[i].scriptPubKey.addresses[0], function(unique, index) {
                    if (unique == true) {
                        // unique vout
                        module.exports.convert_to_satoshi(parseFloat(vout[i].value), function(amount_sat) {
                            arr_vout.push({
                                addresses: vout[i].scriptPubKey.addresses[0],
                                amount: amount_sat
                            });
                            loop.next();
                        });
                    } else {
                        // already exists
                        module.exports.convert_to_satoshi(parseFloat(vout[i].value), function(amount_sat) {
                            arr_vout[index].amount = arr_vout[index].amount + amount_sat;
                            loop.next();
                        });
                    }
                });
            } else {
                // no address, move to next vout
                loop.next();
            }
        }, function() {
            if (vout[0].scriptPubKey.type == 'nonstandard') {
                if (arr_vin.length > 0 && arr_vout.length > 0) {
                    if (arr_vin[0].addresses == arr_vout[0].addresses) {
                        //PoS
                        arr_vout[0].amount = arr_vout[0].amount - arr_vin[0].amount;
                        arr_vin.shift();
                        return cb(arr_vout, arr_vin);
                    } else {
                        return cb(arr_vout, arr_vin);
                    }
                } else {
                    return cb(arr_vout, arr_vin);
                }
            } else {
                return cb(arr_vout, arr_vin);
            }
        });
    },


};
