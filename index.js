// initialize mover
window.onload = function (e) {
  mover('elem', 'subContainer');


  const createBottomDiv = () => {
    var div = document.createElement('div');
    div.textContent = "BOTTOM TEST";
    div.setAttribute('class', 'bottomDiv');
    div.style.height = '24px'
    div.style.top = window.innerHeight - 24 + 'px'
    document.body.appendChild(div);
    // window.addEventListener('resize', () => {
    //   createBottomDiv();
    // })
  }

  createBottomDiv();

}

/**
 * todo
 * ghost element underneath for resize + move?
 * placeholder element to force relative to absolute + hold previous space
 * watch placeholder size if returned to original position or on resize
 * mouse boundaries + regular boundaries
 */