(function(){
  "use strict";

  var form=document.getElementById("consultation-request-form");
  if(!form) return;

  var summary=document.getElementById("consultation-error-summary");
  var list=document.getElementById("consultation-error-list");
  var submit=document.getElementById("consultation-submit-button");

  var GOOGLE_ADS_ID="AW-18474959338";
  var GOOGLE_ADS_SEND_TO="AW-18474959338/oiH4CNOsuYYdEOqDxulE";

  function sanitizedMeasurementLocation(){
    try{
      var url=new URL(window.location.href);
      var allowed=["gclid","gbraid","wbraid"];
      Array.from(url.searchParams.keys()).forEach(function(key){
        if(allowed.indexOf(key)===-1) url.searchParams.delete(key);
      });
      url.hash="";
      return url.toString();
    }catch(error){
      return window.location.origin+window.location.pathname;
    }
  }

  function fireGoogleAdsConsultationConversion(callback){
    if(window.__stonebridgeConsultationConversionSent){
      if(typeof callback==="function") callback();
      return;
    }
    window.__stonebridgeConsultationConversionSent=true;

    window.dataLayer=window.dataLayer||[];
    window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};

    if(!document.getElementById("stonebridge-google-ads-tag")){
      var tag=document.createElement("script");
      tag.id="stonebridge-google-ads-tag";
      tag.async=true;
      tag.referrerPolicy="no-referrer";
      tag.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(GOOGLE_ADS_ID);
      document.head.appendChild(tag);
    }

    window.gtag("set","allow_ad_personalization_signals",false);
    window.gtag("js",new Date());
    window.gtag("config",GOOGLE_ADS_ID,{
      page_location:sanitizedMeasurementLocation(),
      page_referrer:""
    });
    window.gtag("event","conversion",{
      send_to:GOOGLE_ADS_SEND_TO,
      event_callback:callback,
      event_timeout:800
    });
  }

  function clearErrors(){
    summary.hidden=true;
    list.innerHTML="";
    form.querySelectorAll(".field-error").forEach(function(el){
      el.hidden=true;
      el.textContent="";
    });
    form.querySelectorAll("[aria-invalid=true]").forEach(function(el){
      el.removeAttribute("aria-invalid");
    });
  }

  function fieldError(id,message){
    var input=document.getElementById(id);
    var error=document.getElementById(id+"-error");
    if(input) input.setAttribute("aria-invalid","true");
    if(error){
      error.textContent=message;
      error.hidden=false;
    }
    return {input:input,message:message};
  }

  function validEmail(value){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  form.addEventListener("submit",function(event){
    event.preventDefault();
    clearErrors();

    var name=document.getElementById("consultation-name").value.trim();
    var email=document.getElementById("consultation-email").value.trim();
    var phone=document.getElementById("consultation-phone").value.trim();
    var preferred=document.getElementById("consultation-preferred-contact").value;
    var clinician=document.getElementById("consultation-clinician").value;
    var availability=document.getElementById("consultation-availability").value.trim();
    var errors=[];

    if(!name) errors.push(fieldError("consultation-name","Enter your full name."));
    if(!email || !validEmail(email)) errors.push(fieldError("consultation-email","Enter a valid email address."));

    if(errors.length){
      errors.forEach(function(item){
        var li=document.createElement("li");
        li.textContent=item.message;
        list.appendChild(li);
      });
      summary.hidden=false;
      summary.focus();
      if(errors[0].input) errors[0].input.focus();
      return;
    }

    var body=[
      "Hello Stonebridge,",
      "",
      "I'd like to schedule a brief consultation.",
      "",
      "Name: "+name,
      "Email: "+email,
      "Phone: "+(phone || "Not provided"),
      "Preferred contact: "+(preferred || "No preference"),
      "Clinician preference: "+(clinician || "No preference — help me determine fit"),
      "Best times to reach me: "+(availability || "Not provided"),
      "",
      "Please contact me to arrange a consultation."
    ].join("\n");

    var href="mailto:info@stonebridgepsychgroup.com?subject="+
      encodeURIComponent("Consultation request from "+name)+
      "&body="+encodeURIComponent(body);

    submit.disabled=true;
    var launched=false;
    function launchEmail(){
      if(launched) return;
      launched=true;
      window.location.href=href;
      submit.disabled=false;
    }
    fireGoogleAdsConsultationConversion(launchEmail);
    window.setTimeout(launchEmail,900);
  });
})();