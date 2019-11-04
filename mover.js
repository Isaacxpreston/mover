const mover = function (target, container) {

  // get object
  const getDomObject = (query) => {

    const options = [
      document.querySelector(query),
      document.getElementById(query),
      document.getElementsByClassName(query)[0]
    ]

    return options.reduce((acc, cur) => {
      return cur ? cur : acc;
    }, false);

  };

  const controls = {

    // move target
    move: function (target, position, animate) {
      if (animate) {

        // animate target to position (not done, using css class right now)
        // create coordinate objects for x and y axis
        const positionObject = function (target, endPosition, axis, cur, dist) {

          // get current position
          const getCurrentPosition = function (el, axis) {
            return parseInt(el.style[axis].replace('px', ''), 10)
          }

          // get distance to endpoint
          const getDistance = function (current, end) {
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

        var makeNewCoordinates = (coordinates, cur, dist) => {
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

        var animateToEnd = (coordinates, cur, dist) => {
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

        setTimeout(() => {
          target.classList.remove('transition-1')
        }, 500);

      } else {

        // set new coordinates without animating
        target.style.left = position.x + 'px';
        target.style.top = position.y + 'px';
      };
    },

    // make sure target does not go outside container
    checkTargetBoundaries: (pos, target, container) => {
      let x = pos.x,
        y = pos.y;

      if (!container.isWindow) {
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x + target.width > container.width) x = container.width - target.width;
        if (y + target.height > container.height) y = container.height - target.height;
      };

      return {
        x,
        y
      };
    },

    // make sure target does not go outside window
    checkWindowBoundaries: (target) => {
      const clientRect = target.element.getBoundingClientRect(),
        innerHeight = window.innerHeight,
        innerWidth = window.innerWidth,
        space = 3,
        conditions = [
          clientRect.y < -target.height / space,
          clientRect.y > innerHeight - target.height / space,
          clientRect.x < -target.width / space,
          clientRect.x > innerWidth - target.width / space,
        ];
      
      // code is reused here and in checkMouseBoundaries
      // todo: possibly refactor into parent function
      let flags = conditions.filter((condition) => {
        return condition
      });
      if (flags.length) controls.stopMoving();
      return !flags.length;
    },

    // stop moving target if mouse is beyond range outside container
    checkMouseBoundaries: (mouse, container, range) => {
      const space = range || 0,
        conditions = [
          mouse.y < container.top - space,
          mouse.y > container.height + container.top + space,
          mouse.x < container.left - space,
          mouse.x > container.width + container.left + space
        ];

      const flags = conditions.filter((condition) => {
        return condition
      });
      if (flags.length) controls.stopMoving();
      return !flags.length;
    },

    // start moving target
    startMoving: (target, container, initialPos, evt) => {

      //todo: refactor targetEl and containerEl objects to function
      const targetEl = {
          top: target.offsetTop,
          left: target.offsetLeft,
          width: target.clientWidth,
          height: target.clientHeight,
          element: target,
          // isWindow: 
        },
        containerEl = {
          top: container.offsetTop,
          left: container.offsetLeft,
          width: container.clientWidth,
          height: container.clientHeight,
          isWindow: container === window.document,
          // element 
        },
        offset = {
          x: evt.clientX - targetEl.left,
          y: evt.clientY - targetEl.top,
        };

      document.onmousemove = (evt) => {

        const mouse = {
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
      document.onmouseup = () => {
        controls.stopMoving()
      }
    },

    // stop moving target
    stopMoving: () => {
      document.onmousemove = false;
    },
  };

  // define target and container, initialize if target found
  const containerFound = getDomObject(container) || window.document
  const targetFound = getDomObject(target)

  if (targetFound) {

    // initial position
    const initialPosition = {
      x: targetFound.offsetLeft,
      y: targetFound.offsetTop,
    };

    targetFound.addEventListener('mousedown', function (evt) {
      controls.startMoving(targetFound, containerFound, initialPosition, evt);
    });
  }

  return;

};

// initialize mover
window.onload = function (e) {
  mover('elem', 'container');
}