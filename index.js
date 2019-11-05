// initialize mover
window.onload = function (e) {
  mover('elem', 'contaiaaaaner');


  const createBottomDiv = () => {
    var div = document.createElement('div');
    div.textContent = "bottom test";
    div.setAttribute('class', 'bottomDiv');
    div.style.height = '24px'
    div.style.top = window.innerHeight - 24 + 'px'
    document.body.appendChild(div);
  }

  createBottomDiv();

}

/**
 * todo
 * ghost element underneath for resize + move?
 * placeholder element to force relative to absolute + hold previous space
 * watch placeholder size if returned to original position or on resize
 * mouse boundaries + regular boundaries
 * moveable containers/nested moveable elements
 */