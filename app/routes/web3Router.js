var Web3 = require("web3");
var express = require('express');
var router = express.Router();


router.get('/', (req, res, next) => {
  var obj = require('../api/web3/getData')("listData");
  res.render('listInfo', obj);
});
router.get('/block/:blockNum', (req, res, next) => {
  var obj = require('../api/web3/getData')("blockData", req.params.blockNum);
  res.render('blockInfo', obj);
});
router.get('/block/addr/:addrHash', (req, res, next) => {
  var obj = require('../api/web3/getData')("addressData", req.params.addrHash, req.query.bnum);
  res.render('addressInfo', obj);
});
router.get('/block/trans/:transHash', (req, res, next) => {
  var obj = require('../api/web3/getData')("transData", req.params.transHash, req.query.bnum);
  res.render('transactionInfo', obj);
});
module.exports = router;
