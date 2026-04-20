const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');

if (toggle && menu) {
  toggle.addEventListener('click', () => {
    menu.classList.toggle('open');
  });
}

function submitDemoForm(event) {
  event.preventDefault();
  alert('This is still a demo form. Next, we can connect it to a real contact form service.');
  return false;
}
