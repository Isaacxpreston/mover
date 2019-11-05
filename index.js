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
 * BUG when subcontainer has top/left properties target does not move correctly
 * moves correctly when target not in subcontainer
 * moves correctly when target in subcontainer and container set to window
 * does not move correctly when target in subcontainer and container set to parent container
 * noticeable most on bottom and right
 * possibly recurse through parent elements/get all spacing
 */