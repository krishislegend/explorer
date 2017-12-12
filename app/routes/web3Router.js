var Web3 = require("web3");
var express = require('express');
var router = express.Router();

const bc = {breadcrumbs: {
      "HOME": "/"
}};

router.get('/', (req, res, next) => {
  var obj = require('../api/web3/getData')("listData");
  res.render('listInfo', obj);
});
router.get('/block/:blockNum', (req, res, next) => {
  if(req.params.blockNum && isNaN(parseInt(req.params.blockNum))){
    res.render('notfound',bc);
    return;
  }
  var obj = require('../api/web3/getData')("blockData", req.params.blockNum);
  obj.next = parseInt(obj.formatData.Height)+1;
  obj.method = 'web3';
  res.render('blockInfo', obj);
});
router.get('/block/addr/:addrHash', (req, res, next) => {
  var obj = require('../api/web3/getData')("addressData", req.params.addrHash, req.query.bnum);
  res.render('notfound', bc);
});
router.get('/block/trans/:transHash', (req, res, next) => {
  if(req.params.transHash.length!==66){
    res.render('notfound',bc);
    return;
  };
  var obj = require('../api/web3/getData')("transData", req.params.transHash, req.query.bnum);
  obj.method = 'web3';
  res.render('transactionInfo', obj);
});
module.exports = router;
