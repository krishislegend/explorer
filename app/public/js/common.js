const m = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Spt", "Oct", "Nov", "Dec")

function getUTC(time) {
  var current = new Date(time);
  var mon = m[current.getUTCMonth()];
  var date = current.getUTCDate();
  var year = current.getUTCFullYear();
  var hms = formatHMS(current);
  return `(${mon}-${date}-${year} ${hms} +UTC)`;
}

function formatHMS(cur) {
  var h = cur.getUTCHours();
  var m = cur.getMinutes();
  var s = cur.getSeconds();
  if (h < 10) {
    return '0' + h + ':' + m + ':' + s + ' AM';
  } else if (h >= 10 && h < 12) {
    return h + ':' + m + ':' + s + ' AM';
  } else if (h >= 12 && h < 22) {
    return '0' + (
    h - 12) + ':' + m + ':' + s + ' PM';
  } else if (h >= 22) {
    return (h - 12) + ':' + m + ':' + s + ' PM';
  }
}

//将位数较多的每三位用逗号分割
function formatNum(n) {
  var b = parseInt(n).toString();
  var len = b.length;
  if (len <= 3) {
    return b;
  }
  var r = len % 3;
  return r > 0
    ? b.slice(0, r) + "," + b.slice(r, len).match(/\d{3}/g).join(",")
    : b.slice(r, len).match(/\d{3}/g).join(",");
}

function timeConversion(time) {
  if(time<=60){
    return time+'mins ago';
  }
  if(time<1440){
    return parseInt(time/60)+' hrs '+time%60+' mins ago';
  }
  return parseInt(time/1440)+' days '+timeConversion(time%1440);
}

//将数组拆分成固定长度
function spiltArray(arr,subArrayLen){
  if(arr.length<=subArrayLen) return [arr];
  var index=0,newArray=[];
  while(index < arr.length) {
       newArray.push(arr.slice(index, index += subArrayLen));
  }
  return newArray;
}

exports.getUTC= getUTC;
exports.formatNum= formatNum;
exports.timeConversion= timeConversion;
exports.spiltArray= spiltArray;
