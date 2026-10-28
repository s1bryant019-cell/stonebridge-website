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

  // Restore the previous browser-to-email workflow until the approved
  // on-site delivery gateway is configured and verified.
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

    var isLobby=service==="teen-group";
    var subject=isLobby ? "The Lobby consultation request" : "Consultation request from "+name;
    var body=[
      "Hello Stonebridge,",
      "",
      isLobby ? "I would like to request a brief consultation about The Lobby." : "I would like to schedule a brief consultation.",
      "",
      "Name: "+name,
      "Email: "+email,
      "Phone: "+(phone||"Not provided"),
      "Preferred contact: "+(preferred||"No preference"),
      "Clinician preference: "+(clinician||"No preference — help me determine fit"),
      "Best times to reach me: "+(availability||"Not provided"),
      "",
      "Please contact me to arrange a consultation."
    ].join("\\n");

    // Do not include marketing identifiers, clinical data, or conversion events.
    // Opening a mail draft does not prove the visitor sent it.
    window.location.href="mailto:info@stonebridgepsychgroup.com?subject="+
      encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
  });

})();