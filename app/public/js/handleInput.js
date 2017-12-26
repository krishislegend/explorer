const SolidityCoder = require('web3/lib/solidity/coder');

function decodeInput(input,fromWei) {
  let tokenTrans = [];
  if (input.slice(0, 10) === "0xa9059cbb") {
    let decodeArr = SolidityCoder.decodeParams([
      'address', 'uint256'
    ], input.slice(10));
    tokenTrans.push(decodeArr[0]);
    tokenTrans.push(fromWei(decodeArr[1].toString()));
    tokenTrans.push(formatInput(input));
  }
  return tokenTrans;
}

function formatInput(input) {
  let format = [];
  format.push(input.slice(0,10));
  format.push(input.slice(10,74));
  format.push(input.slice(74));
  return format;
}
exports.decodeInput = decodeInput;
