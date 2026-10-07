(function(){
  "use strict";
  var status=document.getElementById("review-status");
  var queue=document.getElementById("queue-results");
  var matches=document.getElementById("match-results");

  function esc(value){
    return String(value==null?"":value).replace(/[&<>"']/g,function(ch){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[ch];
    });
  }

  function when(value){
    if(!value) return "";
    var date=new Date(value);
    return Number.isNaN(date.getTime())?esc(value):esc(date.toLocaleString());
  }

  function item(record,includeResolve){
    var reasons=(record.routingReasonCodes||[]).map(esc).join(", ");
    return '<article class="review-item">'+
      '<strong>'+esc(record.type==="consultation"?"Consultation request":record.routingState||"Screening")+'</strong>'+
      '<div class="review-meta">'+
      esc(record.name)+' · '+esc(record.email)+' · DOB '+esc(record.dateOfBirth)+'<br>'+
      'Submitted '+when(record.submittedAt)+(record.expiresAt?' · Eligibility expires '+when(record.expiresAt):'')+'<br>'+
      (record.service?'Service: '+esc(record.service)+'<br>':'')+
      (reasons?'Routing reason: '+reasons+'<br>':'')+
      (record.preferredClinician?'Preferred clinician: '+esc(record.preferredClinician)+'<br>':'')+
      (record.reason?'Consultation note: '+esc(record.reason)+'<br>':'')+
      '</div>'+
      (includeResolve&&record.pathname?'<button class="access-btn access-btn--secondary" data-resolve="'+esc(record.pathname)+'" type="button">Mark resolved</button>':'')+
      '</article>';
  }

  async function api(url,options){
    var response=await fetch(url,Object.assign({headers:{"Content-Type":"application/json"}},options||{}));
    var data=await response.json().catch(function(){return {};});
    if(!response.ok) throw new Error(data.error||"Request failed.");
    return data;
  }

  async function loadQueue(){
    queue.innerHTML='<p>Loading…</p>';
    try{
      var data=await api("/api/intake-review?mode=queue");
      queue.innerHTML=data.queue.length?data.queue.map(function(r){return item(r,true);}).join(""):"<p>No pending review items.</p>";
    }catch(error){
      queue.innerHTML='<p class="review-error">'+esc(error.message)+'</p>';
    }
  }

  document.getElementById("match-form").addEventListener("submit",async function(event){
    event.preventDefault();
    matches.innerHTML='<p>Checking…</p>';
    try{
      var email=document.getElementById("match-email").value.trim();
      var dob=document.getElementById("match-dob").value;
      var data=await api("/api/intake-review?mode=match&email="+encodeURIComponent(email)+"&dateOfBirth="+encodeURIComponent(dob));
      matches.innerHTML=data.matches.length?data.matches.map(function(r){return item(r,false);}).join(""):"<p>No current direct-request eligibility match was found.</p>";
    }catch(error){
      matches.innerHTML='<p class="review-error">'+esc(error.message)+'</p>';
    }
  });

  document.getElementById("refresh-queue").addEventListener("click",loadQueue);

  queue.addEventListener("click",async function(event){
    var button=event.target.closest("[data-resolve]");
    if(!button) return;
    button.disabled=true;
    try{
      await api("/api/intake-review",{method:"POST",body:JSON.stringify({action:"resolve",pathname:button.getAttribute("data-resolve")})});
      await loadQueue();
    }catch(error){
      status.innerHTML='<p class="review-error">'+esc(error.message)+'</p>';
      button.disabled=false;
    }
  });

  if(!/\.vercel\.app$/i.test(location.hostname)){
    status.innerHTML='<p class="review-error">Use the protected Stonebridge Vercel project URL for staff review.</p>';
    return;
  }
  loadQueue();
})();