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

  function init(){
    var header=document.querySelector(".site-header.sb-global-header");
    if(!header) return;
    var toggle=header.querySelector(".mobile-toggle");
    var menuWrap=header.querySelector(".menu-wrap");
    if(!toggle || !menuWrap) return;
    function setOpen(open){
      header.classList.toggle("is-open",open);
      menuWrap.classList.toggle("open",open);
      toggle.setAttribute("aria-expanded",String(open));
      toggle.setAttribute("aria-label",open?"Close main menu":"Open main menu");
    }
    toggle.addEventListener("click",function(){
      setOpen(toggle.getAttribute("aria-expanded")!=="true");
    });
    document.addEventListener("keydown",function(event){
      if(event.key==="Escape" && toggle.getAttribute("aria-expanded")==="true"){
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener("click",function(event){
      if(toggle.getAttribute("aria-expanded")==="true" && !header.contains(event.target)) setOpen(false);
    });
    window.addEventListener("resize",function(){
      if(window.innerWidth>1080) setOpen(false);
    });
    preserveGoogleClickIdsForConsultation();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
  else init();
})();