(function(){
  "use strict";

  function preserveGoogleClickIdsForConsultation(){
    var params=new URLSearchParams(window.location.search);
    var allowed=["gclid","gbraid","wbraid"];
    var values={};

    allowed.forEach(function(key){
      var value=params.get(key);
      if(value) values[key]=value;
    });

    if(!Object.keys(values).length) return;

    document.querySelectorAll('a[href^="contact.html"]').forEach(function(link){
      var url=new URL(link.getAttribute("href"),window.location.href);
      Object.keys(values).forEach(function(key){url.searchParams.set(key,values[key]);});
      link.setAttribute("href",url.pathname.replace(/^\//,"")+url.search+url.hash);
    });
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",preserveGoogleClickIdsForConsultation);
  }else{
    preserveGoogleClickIdsForConsultation();
  }
})();