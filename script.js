
document.addEventListener('DOMContentLoaded',()=>{
  const toggle=document.querySelector('.mobile-toggle');
  const menu=document.querySelector('.menu');
  if(toggle && menu){toggle.addEventListener('click',()=>menu.classList.toggle('open'));}
});
