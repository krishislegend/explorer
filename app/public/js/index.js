window.onload = function() {
  var go = document.getElementById("goSearch");
  var form = document.getElementById("search_bar");
  go.addEventListener('click', function(e) {
    var inp = document.getElementById('input_text');
    var val = trim(inp.value);
    if (/^[0-9]{1,10}$/.test(val)) {
      window.open("/block/" + val);
    } else if (val.length === 66 && /^[0][x]/.test(val)) {
      window.open(`/block/trans/${val}`);
    } else if (val.length === 42 && /^[0][x]/.test(val)) {
      window.open(`/block/addr/${val}`);
    } else {
      trigger('invalid', inp);
    }
    inp.value = "";
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
  })
}
function trigger(type, doc) {
  var eventObj = document.createEvent('HTMLEvents');
  eventObj.initEvent(type, true, true);
  doc.dispatchEvent(eventObj);
}
function trim(s){
    return s.replace(/(^\s*)|(\s*$)/g, "");
}
