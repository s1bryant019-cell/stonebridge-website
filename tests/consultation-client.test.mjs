import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const script = readFileSync(new URL("../consultation-request.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../contact.html", import.meta.url), "utf8");

function setup(group = false) {
  let submitHandler;
  let copyHandler;
  const copied=[];
  const copyButton={addEventListener(type,fn){if(type==="click")copyHandler=fn;}};
  const copyResult={hidden:true};
  const copyMessage={value:"",focus(){this.focused=true;},select(){this.selected=true;}};
  const copyStatus={textContent:""};
  const errors=[];
  const summaryHeading={textContent:""};
  const summary={hidden:true,querySelector(){return summaryHeading;},focus(){this.focused=true;}};
  const list={innerHTML:"",appendChild(el){errors.push(el.textContent);}};
  const values={
    "consultation-name":{value:"Example Person",focus(){this.focused=true;},setAttribute(){this.invalid=true;}},
    "consultation-email":{value:"example@example.test",focus(){this.focused=true;},setAttribute(){this.invalid=true;}},
    "consultation-phone":{value:""},
    "consultation-preferred-contact":{value:""},
    "consultation-clinician":{value:""},
    "consultation-availability":{value:""},
    "consultation-service":{value:""}
  };
  const form={querySelectorAll(){return [];},addEventListener(type,fn){if(type==="submit")submitHandler=fn;}};
  const elements={
    "consultation-request-form":form,
    "consultation-error-summary":summary,
    "consultation-error-list":list,
    "consultation-copy-button":copyButton,
    "consultation-copy-result":copyResult,
    "consultation-copy-message":copyMessage,
    "consultation-copy-status":copyStatus,
    "contact-page-title":{textContent:"Schedule a consultation"},
    "consultation-request-title":{textContent:"Reach out to schedule a brief conversation."},
    "consultation-hero-intro":{textContent:""},
    ...values
  };
  const document={
    getElementById(id){return elements[id]||null;},
    createElement(){return {textContent:""};}
  };
  const window={location:{
    href:"https://stonebridgepsychgroup.com/contact.html",
    search: group ? "?service=teen-group&gclid=test-click" : "?gclid=test-click",
    origin:"https://stonebridgepsychgroup.com",pathname:"/contact.html"
  }};
  const navigator={clipboard:{writeText:async function(text){copied.push(text);}}};
  runInNewContext(script,{document,window,navigator,URLSearchParams,encodeURIComponent});
  return {
    submit(){submitHandler({preventDefault(){}});},
    copy(){return copyHandler();},
    copyResult,copyMessage,copyStatus,copied,
    window,elements,summary,errors
  };
}

test("valid consultation opens an addressed email draft without contacting a server",()=>{
  const ui=setup();
  ui.submit();
  const draft=new URL(ui.window.location.href);
  assert.equal(draft.protocol,"mailto:");
  assert.equal(draft.pathname,"info@stonebridgepsychgroup.com");
  assert.match(draft.searchParams.get("subject"),/Consultation request from Example Person/);
  assert.match(draft.searchParams.get("body"),/Name: Example Person/);
  assert.match(draft.searchParams.get("body"),/Email: example@example.test/);
  assert.ok(!ui.window.location.href.includes("gclid"));
});

test("The Lobby inquiry is preserved in the email subject and body",()=>{
  const ui=setup(true);
  assert.equal(ui.elements["contact-page-title"].textContent,"Consultation for The Lobby");
  assert.equal(ui.elements["consultation-request-title"].textContent,"Request a consultation about The Lobby.");
  ui.submit();
  const draft=new URL(ui.window.location.href);
  assert.equal(draft.searchParams.get("subject"),"The Lobby consultation request");
  assert.match(draft.searchParams.get("body"),/about The Lobby/);
  assert.ok(!ui.window.location.href.includes("test-click"));
});

test("invalid address is blocked with an accessible error",()=>{
  const ui=setup();
  ui.elements["consultation-email"].value="invalid";
  ui.submit();
  assert.equal(ui.summary.hidden,false);
  assert.equal(ui.errors.length,1);
  assert.ok(ui.elements["consultation-email"].focused);
  assert.ok(ui.elements["consultation-email"].invalid);
  assert.equal(ui.window.location.href,"https://stonebridgepsychgroup.com/contact.html");
});

test("draft is explicitly manual, not a confirmed website submission",()=>{
  assert.match(html,/id="consultation-submit-button" type="submit">Open Email Draft/);
  assert.match(html,/Review and send the draft yourself/);
  assert.match(html,/Ordinary email is not a secure clinical intake channel/);
  assert.doesNotMatch(script,/fetch\s*\(|gtag\s*\(|googletagmanager|\/api\/consultation-request/);
});

test("copied consultation is a manual unsent draft and does not navigate or post data",async()=>{
  const ui=setup();
  await ui.copy();
  assert.equal(ui.copyResult.hidden,false);
  assert.equal(ui.copyMessage.focused,true);
  assert.equal(ui.copyMessage.selected,true);
  assert.match(ui.copyMessage.value,/To: info@stonebridgepsychgroup.com/);
  assert.match(ui.copyMessage.value,/Name: Example Person/);
  assert.match(ui.copyMessage.value,/Email: example@example.test/);
  assert.equal(ui.copied[0],ui.copyMessage.value);
  assert.match(ui.copyStatus.textContent,/Draft copied/);
  assert.equal(ui.window.location.href,"https://stonebridgepsychgroup.com/contact.html");
  assert.ok(!ui.copyMessage.value.includes("gclid"));
});

test("invalid consultation details cannot be copied as a ready request",async()=>{
  const ui=setup();
  ui.elements["consultation-email"].value="invalid";
  await ui.copy();
  assert.equal(ui.copyResult.hidden,true);
  assert.equal(ui.copyMessage.value,"");
  assert.equal(ui.copied.length,0);
  assert.equal(ui.summary.hidden,false);
});
