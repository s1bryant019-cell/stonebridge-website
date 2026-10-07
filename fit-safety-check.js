import { evaluateRouting } from "./lib/fit-safety-routing.mjs";

(function(){
  "use strict";

  function initStonebridgeHeader(){
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
    toggle.addEventListener("click",function(){setOpen(toggle.getAttribute("aria-expanded")!=="true");});
    document.addEventListener("keydown",function(event){
      if(event.key==="Escape" && toggle.getAttribute("aria-expanded")==="true"){
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener("click",function(event){
      if(toggle.getAttribute("aria-expanded")==="true" && !header.contains(event.target)) setOpen(false);
    });
    window.addEventListener("resize",function(){if(window.innerWidth>1080) setOpen(false);});
  }

  initStonebridgeHeader();

  var form=document.getElementById("fit-safety-form");
  if(!form) return;

  var sections=Array.prototype.slice.call(form.querySelectorAll("[data-screen-step]"));
  var back=document.getElementById("screen-back");
  var next=document.getElementById("screen-next");
  var submit=document.getElementById("screen-submit");
  var progressText=document.getElementById("screen-progress-text");
  var progressFill=document.getElementById("screen-progress-fill");
  var errorSummary=document.getElementById("screen-error-summary");
  var errorList=document.getElementById("screen-error-list");
  var result=document.getElementById("screen-result");
  var cssrsFollowups=document.getElementById("cssrs-active-followups");
  var cssrsRecent=document.getElementById("cssrs-recent-behavior");
  var currentIndex=0;

  function selected(name){
    var el=form.querySelector('[name="'+name+'"]:checked');
    return el ? el.value : "";
  }

  function checkedValues(name){
    return Array.prototype.slice.call(form.querySelectorAll('[name="'+name+'"]:checked')).map(function(el){return el.value;});
  }

  function service(){
    var el=document.getElementById("screen-service");
    return el ? el.value : "";
  }

  function visibleSections(){
    var selectedService=service();
    return sections.filter(function(section){
      var key=section.getAttribute("data-screen-step");
      if(key==="conjoint") return selectedService==="couples" || selectedService==="family";
      return true;
    });
  }

  function syncConditionalFields(){
    var active=selected("cssrsQ2")==="yes";
    cssrsFollowups.hidden=!active;
    if(!active){
      ["cssrsQ3","cssrsQ4","cssrsQ5"].forEach(function(name){
        form.querySelectorAll('[name="'+name+'"]').forEach(function(el){el.checked=false;});
      });
    }

    var recent=selected("cssrsQ6")==="yes";
    cssrsRecent.hidden=!recent;
    if(!recent){
      form.querySelectorAll('[name="cssrsQ6Recent"]').forEach(function(el){el.checked=false;});
    }
  }

  function clearErrors(){
    errorSummary.hidden=true;
    errorList.innerHTML="";
    form.querySelectorAll(".screen-field-error").forEach(function(el){
      el.hidden=true;
      el.textContent="";
    });
    form.querySelectorAll("[aria-invalid=true]").forEach(function(el){
      el.removeAttribute("aria-invalid");
    });
  }

  function showFieldError(key,message){
    var error=form.querySelector('[data-error-for="'+key+'"]');
    if(error){
      error.textContent=message;
      error.hidden=false;
    }
    var field=form.querySelector('[name="'+key+'"]');
    if(field) field.setAttribute("aria-invalid","true");
    return {key:key,message:message,field:field};
  }

  function requireRadio(errors,name,message){
    if(!selected(name)) errors.push(showFieldError(name,message));
  }

  function requireCheckbox(errors,name,message){
    if(!checkedValues(name).length) errors.push(showFieldError(name,message));
  }

  function validateSection(section){
    clearErrors();
    syncConditionalFields();
    var errors=[];
    var key=section.getAttribute("data-screen-step");

    if(key==="service"){
      if(!service()) errors.push(showFieldError("service","Choose a service."));
    }else if(key==="jurisdiction"){
      requireRadio(errors,"illinoisTelehealth","Choose an answer.");
    }else if(key==="acuity"){
      requireCheckbox(errors,"recentCare","Choose at least one answer.");
      requireRadio(errors,"immediateEmergency","Choose an answer.");
      requireRadio(errors,"currentAcuity","Choose an answer.");
    }else if(key==="administrative"){
      requireCheckbox(errors,"adminIssues","Choose at least one answer.");
    }else if(key==="cssrs"){
      requireRadio(errors,"cssrsQ1","Choose an answer.");
      requireRadio(errors,"cssrsQ2","Choose an answer.");
      if(selected("cssrsQ2")==="yes"){
        requireRadio(errors,"cssrsQ3","Choose an answer.");
        requireRadio(errors,"cssrsQ4","Choose an answer.");
        requireRadio(errors,"cssrsQ5","Choose an answer.");
      }
      requireRadio(errors,"cssrsQ6","Choose an answer.");
      if(selected("cssrsQ6")==="yes") requireRadio(errors,"cssrsQ6Recent","Choose an answer.");
    }else if(key==="risk-others"){
      requireCheckbox(errors,"riskOthers","Choose at least one answer.");
    }else if(key==="conjoint"){
      requireRadio(errors,"conjointSafety","Choose an answer.");
    }

    if(errors.length){
      errors.forEach(function(item){
        var li=document.createElement("li");
        li.textContent=item.message;
        errorList.appendChild(li);
      });
      errorSummary.hidden=false;
      errorSummary.focus();
      if(errors[0].field) errors[0].field.focus();
      return false;
    }

    return true;
  }

  function render(focusHeading){
    syncConditionalFields();
    var visible=visibleSections();
    if(currentIndex>=visible.length) currentIndex=visible.length-1;
    sections.forEach(function(section){section.hidden=true;});
    var current=visible[currentIndex];
    current.hidden=false;
    back.hidden=currentIndex===0;
    var final=currentIndex===visible.length-1;
    next.hidden=final;
    submit.hidden=!final;
    progressText.textContent="Step "+(currentIndex+1)+" of "+visible.length;
    progressFill.style.width=Math.round(((currentIndex+1)/visible.length)*100)+"%";
    clearErrors();

    var heading=current.querySelector("h2");
    if(heading){
      heading.setAttribute("tabindex","-1");
      if(focusHeading) heading.focus({preventScroll:true});
    }
  }

  form.querySelectorAll("[data-exclusive-group]").forEach(function(group){
    group.addEventListener("change",function(event){
      if(!event.target.matches('input[type="checkbox"]')) return;
      var boxes=Array.prototype.slice.call(group.querySelectorAll('input[type="checkbox"]'));
      var none=group.querySelector("[data-exclusive-none]");
      if(event.target===none && none.checked){
        boxes.forEach(function(box){if(box!==none) box.checked=false;});
      }else if(event.target.checked && none){
        none.checked=false;
      }
    });
  });

  form.addEventListener("change",function(event){
    if(event.target.name==="cssrsQ2" || event.target.name==="cssrsQ6") syncConditionalFields();
  });

  next.addEventListener("click",function(){
    var visible=visibleSections();
    if(!validateSection(visible[currentIndex])) return;
    currentIndex+=1;
    render(true);
    visibleSections()[currentIndex].scrollIntoView({behavior:"auto",block:"start"});
  });

  back.addEventListener("click",function(){
    currentIndex=Math.max(0,currentIndex-1);
    render(true);
    visibleSections()[currentIndex].scrollIntoView({behavior:"auto",block:"start"});
  });

  function routingInput(){
    return {
      service:service(),
      illinoisTelehealth:selected("illinoisTelehealth"),
      recentCare:checkedValues("recentCare"),
      immediateEmergency:selected("immediateEmergency"),
      currentAcuity:selected("currentAcuity"),
      adminIssues:checkedValues("adminIssues"),
      cssrs:{
        q1:selected("cssrsQ1"),
        q2:selected("cssrsQ2"),
        q3:selected("cssrsQ3"),
        q4:selected("cssrsQ4"),
        q5:selected("cssrsQ5"),
        q6:selected("cssrsQ6"),
        q6Recent:selected("cssrsQ6Recent")
      },
      riskOthers:checkedValues("riskOthers"),
      conjointSafety:selected("conjointSafety")
    };
  }

  function resultHtml(state){
    if(state==="direct_request_eligible"){
      return '<h2>You may request a first appointment.</h2>'+
        '<p>Nothing in this brief check indicates that Stonebridge needs to speak with you before you request an initial appointment. This is not a clinical clearance, acceptance for treatment, or confirmed appointment.</p>'+
        '<p>Continue to TherapyPortal to submit a pending first-appointment request. If TherapyPortal offers a message field, please enter <strong>Fit &amp; Safety Check completed</strong>. Stonebridge reviews pending requests before confirmation.</p>'+
        '<div class="screen-result-actions"><a class="access-btn" href="https://www.therapyportal.com/p/stonebridge60634/" target="_blank" rel="noopener noreferrer">Request an Appointment in TherapyPortal</a><a class="access-btn access-btn--secondary" href="tel:+17734171688">Call Stonebridge First</a></div>';
    }

    if(state==="administrative_resolution_required"){
      return '<h2>We need to clarify an administrative detail first.</h2>'+
        '<p>Your answers indicate that Stonebridge should clarify a service, jurisdiction, legal/forensic, consent, or similar administrative issue before an ordinary appointment request.</p>'+
        '<p>No screening answers have been sent to Stonebridge. Please call <a href="tel:+17734171688">(773) 417-1688</a> to discuss the next step.</p>'+
        '<div class="screen-result-actions"><a class="access-btn" href="tel:+17734171688">Call Stonebridge</a><a class="access-btn access-btn--secondary" href="new-clients.html">New Client Options</a></div>';
    }

    if(state==="clinical_review_required"){
      return '<h2>We would like to speak with you first.</h2>'+
        '<p>Your answers indicate that Stonebridge should use clinical judgment before an ordinary first-appointment request. This is not a diagnosis or rejection.</p>'+
        '<p>No screening answers have been sent to Stonebridge. Please call <a href="tel:+17734171688">(773) 417-1688</a> to discuss the next step.</p>'+
        '<div class="screen-result-actions"><a class="access-btn" href="tel:+17734171688">Call Stonebridge</a><a class="access-btn access-btn--secondary" href="new-clients.html">New Client Options</a></div>';
    }

    return '<div class="screen-result--urgent"><h2>Please use immediate crisis or emergency support.</h2>'+
      '<p>Your answers indicate a circumstance in which you should not wait for an ordinary Stonebridge consultation or appointment request. Stonebridge is not an emergency or crisis service and this website is not monitored in real time.</p>'+
      '<p><strong>Call 911 or go to the nearest emergency department for a medical or psychiatric emergency. If you believe you may harm yourself or someone else, or feel unable to remain safe, call 911, go to an emergency department, call or text 988, or use local crisis services.</strong></p>'+
      '<div class="screen-result-actions"><a class="access-btn" href="tel:988">Call 988</a><a class="access-btn access-btn--secondary" href="tel:911">Call 911</a></div></div>';
  }

  form.addEventListener("submit",function(event){
    event.preventDefault();
    var visible=visibleSections();
    if(!validateSection(visible[currentIndex])) return;

    clearErrors();

    var routing=evaluateRouting(routingInput());
    form.hidden=true;
    result.className="screen-result"+(routing.state==="urgent_pathway"?" screen-result--urgent":"");
    result.innerHTML=resultHtml(routing.state);
    result.hidden=false;
    result.focus();
  });

  render(false);
})();