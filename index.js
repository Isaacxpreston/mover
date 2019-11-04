// initialize mover
window.onload = function (e) {
  mover('elem', 'container');



  var div = document.createElement('div');
  div.textContent = "BOTTOM TEST";
  div.setAttribute('class', 'bottomDiv');
  div.style.height = '24px'
  div.style.top = window.innerHeight - 24 + 'px'
  document.body.appendChild(div);
}