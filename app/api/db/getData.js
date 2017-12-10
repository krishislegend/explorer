const Wanblock = require('../../../models/wanblock');
const format = require("../../public/js/common.js");

var listNum = 9; //define a number of displays on address page
var maxBlocks = 20; //define a number of list block

function listData(obj) {
  let len=obj.length;
  if (maxBlocks > len) {
    maxBlocks = len ;
  }
  // get latest maxBlocks blocks informations
  let blocks = [],
    data;
  for (var i = 0; i < maxBlocks; ++i) {
    data = obj[len - 1 - i];
    blocks.unshift({
      height: data.number,
      age: format.timeConversion(data.timestamp),
      txn: data.transactions.length,
      gasUsed: format.formatNum(data.gasUsed),
      size: data.size
    });
  }
  return {
    breadcrumbs: {
      "BLOCKS": "/"
    },
    blocks
  }
}

function blockData(block, result) {
  let formatData = {
    Height: block.number,
    TimeStamp: format.timeConversion(block.timestamp) + format.getUTC(block.timestamp * 1000),
    Transactions: `${block.transactions.length} transactions in this block`,
    Hash: block.hash,
    Size: block.size + ' bytes',
    "Gas Used": format.formatNum(block.gasUsed),
    "Gas Limit": format.formatNum(block.gasLimit),
    Nonce: block.nonce,
    Data: "s1 (Hex:0x7331)"
  };
  let transactionData = result.map((val, index) => {
    return {
      txhash: val.hash,
      age: format.timeConversion(val.timestamp),
      block: val.blockNumber,
      from: val.from,
      to: val.to,
      value: val.value + ' WAN',
      type: val.txtype
    }
  });
  return {
    breadcrumbs: {
      "HOME": "/",
      "OVERVIEW FOR BLOCK": "javascript:return false;",
      ['#' + block.number]: "javascript:return false;"
    },
    formatData,
    transactionData
  }
}

function addressData(addrInfo, result, blockNum, page) {

  var currPage = page || 1;
  let addrTitle = {
    address: addrInfo.a_id,
    "wan balance": addrInfo.balance,
    "no of trans": addrInfo.received - addrInfo.sent + ' txn'
  };
  //Packet processing for acquired data, corresponding to page paging data
  let transData = format.spiltArray(result.map((val, index) => {
    return {
      index:index+1,
      txhash: val.hash,
      age: val.timestamp,
      block: val.blockNumber,
      from: val.from,
      to: val.to,
      value: val.value + ' WAN',
      type: val.txtype,
      classFrom: val.from === addrTitle.address
        ? "tabOut"
        : "tabIn",
      outIn: val.from === addrTitle.address
        ? "OUT"
        : "IN"
    }
  }), listNum);
  var transactionData = transData[currPage - 1];
  return {
    breadcrumbs: {
      "HOME BLOCKS": "/",
      "OVERVIEW FOR BLOCK": `/block/${blockNum}`,
      "ADDRESS": "javascript:return false;"
    },
    transLen: transData.length,
    addrTitle,
    transactionData,
    currPage,
    blockNum
  }
}

function transData(transObj, blockNum) {
  let transInfo = {
    TxHash: transObj.hash,
    Height: transObj.blockNumber,
    TimeStamp: format.timeConversion(transObj.timestamp) + format.getUTC(transObj.timestamp),
    From: transObj.from,
    To: transObj.to,
    Value: transObj.value + ' WAN',
    "Gas Used": format.formatNum(transObj.gas),
    "Gas Price": format.formatNum(transObj.gasPrice),
    "Tx Fee": format.formatNum(transObj.gas * transObj.gasPrice),
    Nonce: transObj.nonce,
    "Input Data": "undefined"
  };
  return {
    breadcrumbs: {
      "HOME BLOCKS": "/",
      "OVERVIEW FOR BLOCK": `/block/${transObj.blockNumber}`,
      "TRANSACTIONS": "javascript:return false;"
    },
    transInfo
  }
}

exports.maxBlocks = maxBlocks;
exports.listData = listData;
exports.blockData = blockData;
exports.addressData = addressData;
exports.transData = transData;
