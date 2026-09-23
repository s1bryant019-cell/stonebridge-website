(function(){
  function currentAttribution(){
    var params=new URLSearchParams(window.location.search);
    var keys=["utm_source","utm_medium","utm_campaign","utm_term","utm_content","gclid","gbraid","wbraid"];
    var result={};
    keys.forEach(function(key){
      var value=params.get(key);
      if(value) result[key]=value;
    });
    return result;
  }

  function decorateLink(link,includeSource){
    if(!link) return;
    var href=link.getAttribute("href");
    if(!href) return;

    var url;
    try{
      url=new URL(href,window.location.href);
    }catch(error){
      return;
    }

    var source=document.body ? document.body.getAttribute("data-landing-source") : "";
    if(includeSource && source) url.searchParams.set("source",source);

    var attribution=currentAttribution();
    Object.keys(attribution).forEach(function(key){
      url.searchParams.set(key,attribution[key]);
    });

    link.setAttribute("href",url.pathname.replace(/^\//,"")+url.search+url.hash);
  }

  document.querySelectorAll("[data-consultation-link]").forEach(function(link){
    decorateLink(link,true);
  });

  document.querySelectorAll("[data-preserve-attribution]").forEach(function(link){
    decorateLink(link,false);
  });
})();
