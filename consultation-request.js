(function(){
  "use strict";

  var form=document.getElementById("consultation-request-form");
  if(!form) return;

  // Preserve only this approved, non-clinical inquiry context.
  var service=new URLSearchParams(window.location.search).get("service")==="teen-group" ? "teen-group" : "";
  var serviceInput=document.getElementById("consultation-service");
  if(serviceInput) serviceInput.value=service;
  if(service==="teen-group"){
    var pageTitle=document.getElementById("contact-page-title");
    var formTitle=document.getElementById("consultation-request-title");
    var intro=document.getElementById("consultation-hero-intro");
    if(pageTitle) pageTitle.textContent="Consultation for The Lobby";
    if(formTitle) formTitle.textContent="Request a consultation about The Lobby.";
    if(intro) intro.textContent="The Lobby is a teen telehealth group. Request a brief consultation to discuss fit and possible enrollment. An inquiry does not guarantee placement.";
  }

  var summary=document.getElementById("consultation-error-summary");
  var list=document.getElementById("consultation-error-list");
  var submit=document.getElementById("consultation-submit-button");
  var content=form.querySelector(".contact-form-content");
  var success=document.getElementById("consultation-success");
  var inFlight=false;
  var completed=false;

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

  function clickIds(){
    var result={};
    var params=new URLSearchParams(window.location.search);
    ["gclid","gbraid","wbraid"].forEach(function(key){
      result[key]=params.get(key)||"";
    });
    return result;
  }

  function fireGoogleAdsConsultationConversion(){
    if(window.__stonebridgeConsultationConversionSent) return;
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
      send_page_view:false,
      page_location:sanitizedMeasurementLocation(),
      page_referrer:""
    });
    // Never pass form contents, user_data, or enhanced-conversion fields to Google.
    window.gtag("event","conversion",{send_to:GOOGLE_ADS_SEND_TO});
  }

  function clearErrors(){
    summary.hidden=true;
    summary.querySelector("h3").textContent="Review the highlighted fields.";
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

  function showSubmissionError(){
    summary.querySelector("h3").textContent="Request not confirmed.";
    var li=document.createElement("li");
    li.textContent="We could not confirm delivery. Please try again or call Stonebridge at (773) 417-1688.";
    list.appendChild(li);
    summary.hidden=false;
    summary.focus();
  }

  form.addEventListener("submit",async function(event){
    event.preventDefault();
    if(inFlight || completed) return;
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

    inFlight=true;
    submit.disabled=true;
    submit.textContent="Sending request…";

    try{
      var response=await fetch("/api/consultation-request",{
        method:"POST",
        credentials:"same-origin",
        cache:"no-store",
        headers:{"Content-Type":"application/json","Accept":"application/json"},
        body:JSON.stringify({
          fullName:name,
          email:email,
          phone:phone,
          preferredContact:preferred,
          preferredClinician:clinician,
          availability:availability,
          service:service,
          website:form.elements.website.value,
          ...clickIds()
        })
      });
      var receipt=await response.json();
      if(!response.ok || receipt.delivered!==true) throw new Error("Unconfirmed delivery");

      completed=true;
      content.hidden=true;
      success.hidden=false;
      success.focus();
      fireGoogleAdsConsultationConversion();
    }catch(error){
      showSubmissionError();
    }finally{
      inFlight=false;
      if(!completed){
        submit.disabled=false;
        submit.textContent="Send Consultation Request";
      }
    }
  });
})();