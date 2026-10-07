(function(){
  "use strict";
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
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
  else init();
})();