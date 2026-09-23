(function(){
  var params = window.location.search;
  if (!params) return;
  document.querySelectorAll('a.offer-link').forEach(function(link){
    try {
      var url = new URL(link.href, window.location.href);
      var incoming = new URLSearchParams(params);
      incoming.forEach(function(value,key){
        if(!url.searchParams.has(key)) url.searchParams.set(key,value);
      });
      link.href = url.toString();
    } catch(e) {}
  });
})();
