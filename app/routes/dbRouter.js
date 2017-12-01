var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var web3Router = require('./web3Router');
const Wanblock = require('../../models/wanblock');
const Wantx = require('../../models/wantx');
const Wanaddress = require('../../models/wanaddress');

//breadcrumbs
const bc = {
  breadcrumbs: {
    "BLOCKS": "/"
  }
};

router.get('/', (req, res, next) => {
  console.log(req);
  let response = res,
    obj;
  //if cannot connect to DB,try to get data by web3
  if (Wanblock.collection.conn._readyState !== 1) {
    next();
  };
  Wanblock.find({}, (err, result, res) => {
    if (err || result.length === 0) {
      return console.log(err);
    }
    obj = require('../api/db/getData').listData(result);
    response.render('listInfo', obj);
  });
});

router.get('/block/:blockNum', (req, res, next) => {
  if (Wanblock.collection.conn._readyState !== 1) {
    next();
  };
  let response = res,
    obj;
  let request = req.params.blockNum;
  //Get Informations about some block
  Wanblock.find({
    number: request
  }, (err, result, res) => {
    if (err) {
      response.render('error', bc);
      return console.log(err);
    }
    if(result.length === 0){
        response.render('notfound', bc);
        return;
    }
    let resultBlock = result[0];
    //Get all the transaction Info about this block
    Wantx.find({
      blockNumber: request
    }, (err, result, res) => {
      if (err) {
        response.render('error', bc);
        return console.log(err);
      }
      obj = require('../api/db/getData').blockData(resultBlock, result);
      response.render('blockInfo', obj);
    })
  });
});

router.get('/block/addr/:addrHash', (req, res, next) => {
  if (Wanblock.collection.conn._readyState !== 1) {
    next();
  };
  let response = res;
  let txh = [],
    obj;
  Wanaddress.find({
    a_id: req.params.addrHash
  }, (err, result, res) => {
    if (err) {
      response.render('error', bc);
      return console.log(err);
    }
    if(result.length === 0){
      response.render('notfound', bc);
      return;
    }
    let addrInfo = result[0];
    addrInfo.txs.forEach((val, index) => {
      txh.push(val.txhash)
    });
    Wantx.find({
      hash: {
        $in: txh
      }
    }, (err, result, res) => {
      if (err || result.length === 0) {
        response.render('error', bc);
        return console.log(err);
      }
      obj = require('../api/db/getData').addressData(addrInfo, result, req.query.bnum,req.query.page);
      response.render('addressInfo', obj);
    });
  });
});

router.get('/block/trans/:transHash', (req, res, next) => {
  if (Wanblock.collection.conn._readyState !== 1) {
    next();
  };
  let response = res,
    obj;
  Wantx.find({
    hash: req.params.transHash
  }, (err, result, res) => {
    if (err) {
      response.render('error', bc);
      return console.log(err);
    }
    if(result.length === 0){
      response.render('notfound', bc);
      return;
    }
    obj = require('../api/db/getData').transData(result[0], req.query.bnum);
    response.render('transactionInfo', obj);
  });
});

router.get('/notfound',(req,res,next)=>{
  res.render('notfound',bc);
});

router.use('/', web3Router);

module.exports = router;
