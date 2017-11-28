const maxBlocks = 11; //制定查询block的数量
const format = require("../../public/js/common.js");

function listData(obj) {
  let blockNum = parseInt(obj.length, 10);
  if (maxBlocks > blockNum) {
    maxBlocks = blockNum + 1;
  }
  // get latest maxBlocks blocks informations
  let blocks = [],
    data;
  for (var i = 0; i < maxBlocks; ++i) {
    data = obj[obj.length - 1 - i];
    // blocks.push(web3.eth.getBlock(blockNum - i));
    blocks.push({
      height: data.number,
      age: format.timeConversion(Math.ceil((new Date().getTime() - data.timestamp * 1000) / 60000)),
      txn: data.transactions.length,
      gasUsed: format.formatNum(data.gasUsed),
      size: data.size
    });
  }
  return Object.assign({
      breadcrumbs: {
        "BLOCKS": "/"
      }
  }, {blocks});
}

function blockData(block, result) {
  let formatData = {
    Height: block.number,
    TimeStamp: format.timeConversion(Math.ceil((new Date().getTime() - block.timestamp * 1000) / 60000)) + format.getUTC(block.timestamp * 1000),
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
      age: format.timeConversion(Math.ceil((new Date().getTime() - val.timestamp * 1000) / 60000)),
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
      "OVERVIEW FOR BLOCK": `/block/${block.number}`,
      ['#' + block.number]: "javascript:return false;"
    },
    formatData,
    transactionData
  }
}

function addressData(addrInfo, result, blockNum) {
  let addrTitle = {
    address: addrInfo.a_id,
    "wan balance": addrInfo.balance,
    "no of trans": addrInfo.received - addrInfo.sent + ' txn'
  };
  let transactionData = result.map((val, index) => {
    return {
      txhash: val.hash,
      age: format.timeConversion(Math.ceil((new Date().getTime() - val.timestamp * 1000) / 60000)),
      block: val.blockNumber,
      from: val.from,
      to: val.to,
      value: val.value + ' WAN',
      type: val.txtype
    }
  });
  return {
    breadcrumbs: {
      "HOME BLOCKS": "/",
      "OVERVIEW FOR BLOCK": `/block/${blockNum}`,
      "ADDRESS": "javascript:return false;"
    },
    addrTitle,
    transactionData
  }
}

function transData(transObj, blockNum) {
  // let timestamp=obj.eth.getBlock(blockNum).timestamp*1000;
  let transInfo = {
    TxHash: transObj.hash,
    Height: transObj.blockNumber,
    TimeStamp: format.timeConversion((Math.ceil((new Date().getTime() - transObj.timestamp) / 60000))) + format.getUTC(transObj.timestamp),
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

exports.listData = listData;
exports.blockData = blockData;
exports.addressData = addressData;
exports.transData = transData;
