const mover = function(target, container){

  // get object
  const getDomObject = function(query) {
      var options = {
          querySelector: document.querySelector(query),
          getElementById: document.getElementById(query),
          getElementByClassName: document.getElementsByClassName(query)[0]
      }

      for (var option in options) {
          if(options[option]) {
              return options[option]
          }
      }

      return false;
  }

  const controls = function () {
      return {
          // move target
          move: function(target, position, animate){
              if (animate) {

                  // animate target to position (not done, using css class right now)

                  // create coordinate objects for x and y axis
                  const positionObject = function (target, endPosition, axis, cur, dist) {

                      // get current position
                      const getCurrentPosition = function(el, axis) {
                          return parseInt(el.style[axis].replace('px', ''), 10)
                      }

                      // get distance to endpoint
                      const getDistance = function(current, end) {
                          var distance = Math.abs(current - end),
                              plusOrMinus = current > end ? -1 : 1;
                          return plusOrMinus * distance;
                      };

                      // return results
                      const current = getCurrentPosition(target, axis);
                      const distance = getDistance(current, endPosition);

                      return {
                          [cur]: current,
                          [dist]: distance,
                      }
                  }

                  var makeNewCoordinates = function (coordinates, cur, dist) {
                      var newCoordinates = {};

                      // newCoordinates.x.currentPosition = coodinates.x.currentPosition + ((distanceToEnd / distanceToEnd) * int)
                      for (var i in coordinates) {
                          if (coordinates[i][dist] === 0) {
                              newCoordinates[i] = coordinates[i];
                          } else {
                              var amount = coordinates[i][dist] < 0 ? -1 : 1;

                              newCoordinates[i] = {
                                  [cur]: coordinates[i][cur] + amount,
                                  [dist]: coordinates[i][dist] - amount,
                              };
                          };
                      };

                      return newCoordinates;
                  };

                  var animateToEnd = function (coordinates, cur, dist) {
                      var newCoordinates = makeNewCoordinates(coordinates, cur, dist)
                      return newCoordinates
                  };

                  var labels = ['currentPosition', 'distanceToEnd'];

                  var targetCoordinates = {
                      x: positionObject(target, position.x, 'left', ...labels),
                      y: positionObject(target, position.y, 'top', ...labels)
                  };

                  // console.log(targetCoordinates)
                  // console.log(animateToEnd(targetCoordinates, ...labels))

                  target.style.left = position.x + 'px';
                  target.style.top = position.y + 'px';

                  // temp, replace with animate

                  target.classList.add('transition-1');

                  setTimeout(function() {
                      target.classList.remove('transition-1')
                  }, 500);

              } else {

                  // set new coordinates without animating

                  target.style.left = position.x + 'px';
                  target.style.top = position.y + 'px';
              }
          },

          // make sure target does not go outside container
          checkTargetBoundaries: function(pos, target, container) {
              let x = pos.x,
                  y = pos.y;
              
              if (!container.isWindow) {
                  if (x < 0 ) x = 0;
                  if (y < 0) y = 0;
                  if (x + target.width > container.width) x = container.width - target.width;
                  if (y + target.height > container.height) y = container.height -target.height;
              };

              return {x, y};
          },

          // make sure target does not go outside window
          checkWindowBoundaries: function(target) {
              const clientRect = target.element.getBoundingClientRect(),
                  innerHeight = window.innerHeight,
                  innerWidth = window.innerWidth,
                  space = 3;

              const conditions = {
                  'top': clientRect.y < -target.height/space,
                  'bottom':  clientRect.y > innerHeight - target.height/space,
                  'left': clientRect.x < -target.width/space,
                  'right': clientRect.x > innerWidth - target.width/space,
              };

              for (const condition in conditions) {
                  if (conditions[condition]) {
                      controls.stopMoving();
                      return false;
                  };
              };

              return true;
          },

          // stop moving target if mouse is beyond range outside container
          checkMouseBoundaries: function (mouse, container, range) {
                  var space = range || 0;

                  var conditions = {
                      'top':  (mouse.y < container.top - space),
                      'bottom': (mouse.y > container.height + container.top + space),
                      'left': (mouse.x < container.left - space),
                      'right': mouse.x > container.width + container.left + space
                  };
                  
                  for (var condition in conditions) {
                      if (conditions[condition]) {  
                          controls.stopMoving();
                      };
                  };
          },

          // start moving target
          startMoving: function(target, container, initialPos, evt) {

              var targetEl = {
                      top: target.offsetTop,
                      left: target.offsetLeft,
                      width: target.clientWidth,
                      height: target.clientHeight,
                      element: target
                  },
                  containerEl = {
                      top: container.offsetTop,
                      left: container.offsetLeft,
                      width: container.clientWidth,
                      height: container.clientHeight,
                      isWindow: container === window.document,
                  },
                  offset = {
                      x: evt.clientX - targetEl.left,
                      y: evt.clientY - targetEl.top,
                  };

              document.onmousemove = function(evt){
                  
                  var mouse = {
                          x: evt.clientX,
                          y: evt.clientY,
                      },
                      targetPos = {
                          x: mouse.x - offset.x,
                          y: mouse.y - offset.y,
                      };
                  
                  // check mouse is within container range
                  controls.checkMouseBoundaries(mouse, containerEl, 100)

                  // check mouse is within window
                  if (controls.checkWindowBoundaries(targetEl)) {
                      // move if within window
                      controls.move(target, controls.checkTargetBoundaries(targetPos, targetEl, containerEl), false);
                  } else {
                      // return to starting position if outside window
                      controls.move(target, initialPos, true);
                  }

              }

              // stop on mouse up
              document.onmouseup = function() {
                  controls.stopMoving()
              }
          },

          // stop moving target
          stopMoving: function() {
              document.onmousemove = function(){}
          },
      }
  }();

  // define target and container, initialize if target found
  const containerFound = getDomObject(container) || window.document
  const targetFound = getDomObject(target)

  if (targetFound) {

      // initial position
      targetFound.initialPosition = {
          x: targetFound.offsetLeft,
          y: targetFound.offsetTop,
      }
  
      targetFound.addEventListener('mousedown', function(event) {
          controls.startMoving(targetFound, containerFound, targetFound.initialPosition, event);
      })
  }

  return;

};

// initialize mover
window.onload = function (e) {
  mover('elem', 'containerR');
}
