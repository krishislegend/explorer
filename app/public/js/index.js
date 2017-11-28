window.onload=function() {
  var go=document.getElementById("go_search");
  go.addEventListener('click',function() {
    var val=document.getElementById('input_text').value;
    if(val.length===0){
      return false;
    }else if(val.length<=12){
      window.open("/block/"+val);
    }else if(val.length===66){
      window.open(`/block/trans/${val}`);
    }else if(val.length===42){
      window.open(`/block/addr/${val}`);
    }else{
      window.open("/error");
    }
  });
}
