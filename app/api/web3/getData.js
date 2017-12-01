const Web3 = require("web3");
const maxBlocks = 11; //define a number of query block
const format=require("../../public/js/common.js");

//Get information about the current block list，and format the data
function listData(obj, maxBlocks) {
  let blockNum = parseInt(obj.eth.blockNumber, 10);
  if (maxBlocks > blockNum) {
    maxBlocks = blockNum + 1;
  }
  // get latest maxBlocks blocks informations
  let blocks = [],
    data;
  for (var i = 0; i < maxBlocks; ++i) {
    data = obj.eth.getBlock(blockNum - i);
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

//Get information about the current block，and format the data
function blockData(obj, blockNum) {
  let info = obj.eth.getBlock(blockNum,true);
  let formatData = {
    Height: blockNum,
    TimeStamp: format.timeConversion((Math.ceil((new Date().getTime() - info.timestamp * 1000) / 60000))) + format.getUTC(info.timestamp*1000),
    Transactions: `${info.transactions.length} transactions in this block`,
    Hash: info.hash,
    Size: info.size + ' bytes',
    "Gas Used": format.formatNum(info.gasUsed),
    "Gas Limit": format.formatNum(info.gasLimit),
    Nonce: info.nonce,
    Data: "s1 (Hex:0x7331)"
  };
  let transactionData=info.transactions.map((val,index)=>{
    return {
      txhash:val.hash,
      age: format.timeConversion((Math.ceil((new Date().getTime() - info.timestamp * 1000) / 60000))),
      block:blockNum,
      from:val.from,
      to:val.to,
      value:obj.fromWei(val.value,'ether')+' WAN',
      type:val.type
    }
  });
  return {
    breadcrumbs: {
      "HOME": "/",
      "OVERVIEW FOR BLOCK": `/block/${blockNum}`,
      ['#' + blockNum]: "javascript:return false;"
    },
    formatData,
    transactionData
  }
}

//Get information about the specified addressHash
function addressData(obj,addr,blockNum) {

  return {
    breadcrumbs: {
      "HOME BLOCKS": "/",
      "OVERVIEW FOR BLOCK": `/block/${blockNum}`,
      "ADDRESS": "javascript:return false;"
    }
  }
}

//Get information about the specified transHash
function transData(obj,trans,blockNum){
  let info = obj.eth.getTransaction(trans);
  let timestamp=obj.eth.getBlock(blockNum).timestamp*1000;
  let transInfo={
    TxHash:trans,
    Height:info.blockNumber,
    TimeStamp:format.timeConversion((Math.ceil((new Date().getTime() - timestamp) / 60000))) + format.getUTC(timestamp),
    From:info.from,
    To:info.to,
    Value:obj.fromWei(info.value,'ether')+' WAN',
    "Gas Used":format.formatNum(info.gas),
    "Gas Price":format.formatNum(info.gasPrice),
    "Tx Fee":format.formatNum(info.gas*info.gasPrice),
    Nonce:info.nonce,
    "Input Data":info.input.substr(0,10)
  };
  return {
    breadcrumbs: {
      "HOME BLOCKS": "/",
      "OVERVIEW FOR BLOCK": `/block/${blockNum}`,
      "TRANSACTIONS": "javascript:return false;"
    },
    transInfo
  }
}

//Create an instance of Web3 and get the required data
function createWeb3(func) {
  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
  } else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }
  if (func === "listData") {
    return listData(web3, maxBlocks);
  } else if (func === "blockData") {
    return blockData(web3, arguments[1]);
  } else if(func==="addressData"){
    return addressData(web3,arguments[1],arguments[2]);
  } else if(func==="transData"){
    return transData(web3,arguments[1],arguments[2]);
  }
}


module.exports = createWeb3;
