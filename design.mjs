const slider=document.getElementById('reveal');
slider.addEventListener('input',()=>slider.parentElement.style.setProperty('--reveal',slider.value+'%'));
document.getElementById('hero-demo').addEventListener('click',()=>document.getElementById('demo').click());
