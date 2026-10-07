(function(){
  "use strict";

  var form=document.getElementById("consultation-request-form");
  if(!form) return;

  var summary=document.getElementById("consultation-error-summary");
  var list=document.getElementById("consultation-error-list");
  var submit=document.getElementById("consultation-submit-button");

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
      "Best times to reach me: "+(availability || "Not provided"),
      "",
      "Please contact me to arrange a consultation."
    ].join("\n");

    var href="mailto:info@stonebridgepsychgroup.com?subject="+
      encodeURIComponent("Consultation request from "+name)+
      "&body="+encodeURIComponent(body);

    submit.disabled=true;
    window.location.href=href;
    window.setTimeout(function(){submit.disabled=false;},1000);
  });
})();