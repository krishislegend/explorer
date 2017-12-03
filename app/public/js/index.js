window.onload=function() {
  var go=document.getElementById("goSearch");
  go.addEventListener('click',function(e) {
    var inp=document.getElementById('input_text');
    var val=inp.value;
    if(/^[0-9]{1,10}$/.test(val)){
      window.open("/block/"+val);
    }else if(val.length===66&&/^[0][x]/.test(val)){
      window.open(`/block/trans/${val}`);
    }else if(val.length===42&&/^[0][x]/.test(val)){
      window.open(`/block/addr/${val}`);
    }else{
      trigger('invalid',inp);
    }
  });
}
function trigger(type,doc) {
  var eventObj=document.createEvent('HTMLEvents');
  eventObj.initEvent(type,true,true);
  doc.dispatchEvent(eventObj);
}
