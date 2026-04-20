const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');

if (toggle && menu) {
  toggle.addEventListener('click', () => menu.classList.toggle('open'));
}

function submitDemoForm(event) {
  event.preventDefault();
  alert('This is a demo form for the mockup. When you are ready, this can be connected to a real contact form.');
  return false;
}
