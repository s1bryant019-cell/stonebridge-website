import { evaluateRouting } from "./lib/fit-safety-routing.mjs";

(function(){
  "use strict";



  var form=document.getElementById("fit-safety-form");
  if(!form) return;

  var sections=Array.prototype.slice.call(form.querySelectorAll("[data-screen-step]"));
  var back=document.getElementById("screen-back");
  var next=document.getElementById("screen-next");
  var progressText=document.getElementById("screen-progress-text");
  var progressFill=document.getElementById("screen-progress-fill");
  var errorSummary=document.getElementById("screen-error-summary");
  var errorList=document.getElementById("screen-error-list");
  var result=document.getElementById("screen-result");
  var cssrsFollowups=document.getElementById("cssrs-active-followups");
  var cssrsRecent=document.getElementById("cssrs-recent-behavior");
  var safetySection=form.querySelector('[data-screen-step="safety"]');
  var layout=document.querySelector(".screen-template-layout");
  var currentIndex=0;
  var completed=false;

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

  function syncSafetyQuestionNumbers(){
    if(!safetySection || safetySection.hidden) return;
    var visibleQuestions=Array.prototype.slice.call(
      safetySection.querySelectorAll("[data-safety-question]")
    ).filter(function(fieldset){
      return !fieldset.closest("[hidden]");
    });

    visibleQuestions.forEach(function(fieldset,index){
      var number=fieldset.querySelector(".safety-question-number");
      if(number) number.textContent=(index+1)+". ";
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
    syncSafetyQuestionNumbers();
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
    }else if(key==="safety"){
      requireRadio(errors,"cssrsQ1","Choose an answer.");
      requireRadio(errors,"cssrsQ2","Choose an answer.");
      if(selected("cssrsQ2")==="yes"){
        requireRadio(errors,"cssrsQ3","Choose an answer.");
        requireRadio(errors,"cssrsQ4","Choose an answer.");
        requireRadio(errors,"cssrsQ5","Choose an answer.");
      }
      requireRadio(errors,"cssrsQ6","Choose an answer.");
      if(selected("cssrsQ6")==="yes") requireRadio(errors,"cssrsQ6Recent","Choose an answer.");
      requireRadio(errors,"riskOthers","Choose an answer.");
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

  function sectionComplete(section){
    syncConditionalFields();
    var key=section.getAttribute("data-screen-step");
    if(key==="service") return Boolean(service());
    if(key==="jurisdiction") return Boolean(selected("illinoisTelehealth"));
    if(key==="acuity") return checkedValues("recentCare").length>0 && Boolean(selected("immediateEmergency")) && Boolean(selected("currentAcuity"));
    if(key==="administrative") return checkedValues("adminIssues").length>0;
    if(key==="conjoint") return Boolean(selected("conjointSafety"));
    if(key==="safety"){
      if(!selected("cssrsQ1") || !selected("cssrsQ2") || !selected("cssrsQ6")) return false;
      if(selected("cssrsQ2")==="yes" && (!selected("cssrsQ3") || !selected("cssrsQ4") || !selected("cssrsQ5"))) return false;
      if(selected("cssrsQ6")==="yes" && !selected("cssrsQ6Recent")) return false;
      if(!selected("riskOthers")) return false;
      return true;
    }
    return false;
  }

  function render(focusHeading){
    syncConditionalFields();
    var visible=visibleSections();
    if(currentIndex>=visible.length) currentIndex=visible.length-1;
    sections.forEach(function(section){section.hidden=true;});
    var current=visible[currentIndex];
    current.hidden=false;
    back.hidden=currentIndex===0;
    next.hidden=currentIndex===visible.length-1;
    progressText.textContent="Step "+(currentIndex+1)+" of "+visible.length;
    progressFill.style.width=Math.round(((currentIndex+1)/visible.length)*100)+"%";
    clearErrors();
    syncSafetyQuestionNumbers();

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
      riskOthers:selected("riskOthers") ? [selected("riskOthers")] : [],
      conjointSafety:selected("conjointSafety")
    };
  }

  function resultHtml(state){
    if(state==="direct_request_eligible"){
      return '<div class="screen-result-label">Next step</div>'+
        '<h2>You can request an appointment.</h2>'+
        '<p>Continue to TherapyPortal to choose an available intake time. Your request will remain pending until Stonebridge reviews it.</p>'+
        '<p class="screen-result-note">If TherapyPortal offers a message field, enter <strong>Stonebridge new-client check completed</strong>.</p>'+
        '<div class="screen-result-actions"><a class="access-btn" href="https://www.therapyportal.com/p/stonebridge60634/" target="_blank" rel="noopener noreferrer">Request an Appointment</a><a class="access-btn access-btn--secondary" href="contact.html#inquiry-form">Speak With Stonebridge First</a></div>';
    }

    if(state==="administrative_resolution_required"){
      return '<div class="screen-result-label">Next step</div>'+
        '<h2>One quick clarification first.</h2>'+
        '<p>Stonebridge would like to clarify one administrative detail before you request an appointment. This does not mean you cannot receive care here.</p>'+
        '<div class="screen-result-actions"><a class="access-btn" href="contact.html#inquiry-form">Schedule a Consultation</a><a class="access-btn access-btn--secondary" href="new-clients.html">New Client Options</a></div>';
    }

    if(state==="clinical_review_required"){
      return '<div class="screen-result-label">Next step</div>'+
        '<h2>Let’s talk first.</h2>'+
        '<p>Based on your answers, we’d like a brief conversation before you request a first appointment. This does not mean Stonebridge cannot provide care.</p>'+
        '<div class="screen-result-actions"><a class="access-btn" href="contact.html#inquiry-form">Schedule a Consultation</a><a class="access-btn access-btn--secondary" href="new-clients.html">New Client Options</a></div>';
    }

    return '<div class="screen-result--urgent"><div class="screen-result-label">Immediate support</div><h2>Please use immediate crisis or emergency support.</h2>'+
      '<p>Your answers indicate a circumstance in which you should not wait for an ordinary Stonebridge consultation or appointment request. Stonebridge is not an emergency or crisis service and this website is not monitored in real time.</p>'+
      '<p><strong>Call 911 or go to the nearest emergency department for a medical or psychiatric emergency. If you believe you may harm yourself or someone else, or feel unable to remain safe, call 911, go to an emergency department, call or text 988, or use local crisis services.</strong></p>'+
      '<div class="screen-result-actions"><a class="access-btn" href="tel:988">Call 988</a><a class="access-btn access-btn--secondary" href="tel:911">Call 911</a></div></div>';
  }

  function completeCheck(){
    if(completed) return;
    completed=true;
    clearErrors();
    var routing=evaluateRouting(routingInput());
    form.hidden=true;
    if(layout) layout.classList.add("is-complete");
    result.className="screen-result"+(routing.state==="urgent_pathway"?" screen-result--urgent":"");
    result.innerHTML=resultHtml(routing.state);
    result.hidden=false;
    result.focus();
    result.scrollIntoView({behavior:"auto",block:"center"});
  }

  form.addEventListener("change",function(event){
    if(event.target.name==="cssrsQ2" || event.target.name==="cssrsQ6") syncConditionalFields();

    window.setTimeout(function(){
      var visible=visibleSections();
      var current=visible[currentIndex];
      var isFinal=currentIndex===visible.length-1;
      if(isFinal && sectionComplete(current)) completeCheck();
    },0);
  });

  form.addEventListener("submit",function(event){
    event.preventDefault();
    var visible=visibleSections();
    var current=visible[currentIndex];
    if(!validateSection(current)) return;
    completeCheck();
  });

  render(false);
})();