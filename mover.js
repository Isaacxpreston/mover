const mover = function (target, container) {

  // check list for truthy flags
  const flagCheck = (list, cb) => {
    let flags = list.filter((condition) => {
      return condition
    });
    if (flags.length && typeof cb === 'function') cb() // stopMoving();
    return !flags.length;
  };

  // get object
  const getDomObject = (query) => {

    const options = [
      document.querySelector(query),
      document.getElementById(query),
      document.getElementsByClassName(query)[0]
    ];

    return options.reduce((acc, cur) => {
      return cur ? cur : acc;
    }, false);

  };

  // return properties of dom object
  const getElProperties = (el) => {
    return {
      top: el.offsetTop,
      left: el.offsetLeft,
      width: el.clientWidth,
      height: el.clientHeight,
      element: el,
      isWindow: el === window.document,
    }
  };



  // animate target to position (not done, using css class right now)
  // create coordinate objects for x and y cssAxis
  const makeCoordinates = (target, endPosition, cssAxis, cur, dist, css) => {

    // get current position
    const getCurrentPosition = function (el, cssAxis) {
      return parseInt(el.style[cssAxis].replace('px', ''), 10)
    }

    // get distance to endpoint
    const getDistance = function (current, end) {
      var distance = Math.abs(current - end),
        plusOrMinus = current > end ? -1 : 1;
      return plusOrMinus * distance;
    };

    // return results
    const current = getCurrentPosition(target, cssAxis);
    const distance = getDistance(current, endPosition);

    return {
      [cur]: current,
      [dist]: distance,
      [css]: cssAxis,
    }
  }

  const changeCoordinates = (coordinates, cur, dist) => {
    const newCoordinates = {};
    // todo: be able to change amount

    for (let i in coordinates) {
      if (coordinates[i][dist] === 0) {
        newCoordinates[i] = coordinates[i];
      } else {
        const amount = coordinates[i][dist] < 0 ? -10 : 10;

        newCoordinates[i] = {
          ...coordinates[i],
          [cur]: coordinates[i][cur] + amount,
          [dist]: coordinates[i][dist] - amount,
        };
      };
    };

    return newCoordinates;
  };

  const animateToEnd = (targetEl, coordinates, cur, dist, css) => {
    const newCoordinates = changeCoordinates(coordinates, cur, dist);

    for (let key in newCoordinates) {
      targetEl.style[newCoordinates[key][css]] = newCoordinates[key][cur] + 'px';
    };

    return newCoordinates;

  };

  // move object
  const moveTarget = (target, position, animate) => {
    if (animate) {

      // UNCOMMENT LATER
      /*
      const labels = ['currentPosition', 'distanceToEnd', 'cssProperty'],
        initialCoordinates = {
          x: makeCoordinates(target, position.x, 'left', ...labels),
          y: makeCoordinates(target, position.y, 'top', ...labels),
        };

      
      // animateToEnd(target, initialCoordinates, ...labels)
      */

      // temp, replace with animate
      target.style.left = position.x + 'px';
      target.style.top = position.y + 'px';
      target.classList.add('transition-1');
      setTimeout(() => {
        target.classList.remove('transition-1')
      }, 500);

    } else {

      // set new coordinates without animating
      target.style.left = position.x + 'px';
      target.style.top = position.y + 'px';
    };
  };

  // make sure object does not go outside container
  // todo: replace with clientrect
  const checkTargetBoundaries = (pos, target, container, range) => {
    let x = pos.x,
      y = pos.y,
      space = range || 0;

    // UNCOMMENT LATER
    // if (!container.isWindow) {
    //   if (x < 0 - space) x = 0;
    //   if (y < 0 - space) y = 0;
    //   if (x + target.width - space > container.width) x = container.width - target.width;
    //   if (y + target.height - space > container.height) y = container.height - target.height;
    // };

    // --

    const containerEl = container.element.getBoundingClientRect()
    const targetEl = target.element.getBoundingClientRect()
    const classList = target.element.classList
    const conditions = [
      targetEl.left < containerEl.left,
      targetEl.right > containerEl.right,
      targetEl.top < containerEl.top,
      targetEl.bottom > containerEl.bottom
    ];

    !flagCheck(conditions) ? classList.add('red') : classList.remove('red')

    // --


    return {
      x,
      y
    };

  };

  // make sure object does not go outside window
  const checkWindowBoundaries = (target, range) => {
    const clientRect = target.element.getBoundingClientRect(),
      innerHeight = window.innerHeight,
      innerWidth = window.innerWidth,
      space = range || 3,
      conditions = [
        clientRect.y < -target.height / space,
        clientRect.y > innerHeight - target.height / space,
        clientRect.x < -target.width / space,
        clientRect.x > innerWidth - target.width / space,
      ];

    return flagCheck(conditions, stopMoving);
  };

  // stop moving object if mouse is beyond range outside container
  // todo: make this optional, toggle with checkTargetBoundaries
  //       make checkTargetBoundaries behave like windowBoundaries and animate target back into container
  const checkMouseBoundaries = (mouse, container, range) => {
    const space = range || 0,
      conditions = [
        mouse.y < container.top - space,
        mouse.y > container.height + container.top + space,
        mouse.x < container.left - space,
        mouse.x > container.width + container.left + space
      ];

    return flagCheck(conditions, stopMoving);
  };

  // start moving object
  const startMoving = (target, container, initialPos, evt) => {

    const targetEl = getElProperties(target),
      containerEl = getElProperties(container),
      // offset from mouse to target element borders
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

      // check mouse is within container borders + additional range in px
      // UNCOMMENT LATER
      // checkMouseBoundaries(mouse, containerEl, 100);

      // check mouse is within window
      if (checkWindowBoundaries(targetEl)) {
        // moveTarget if within window
        moveTarget(target, checkTargetBoundaries(targetPos, targetEl, containerEl), false);
        // moveTarget(target, targetPos, false);
      } else {
        // return to starting position if outside window
        moveTarget(target, initialPos, true);
      };

    };

    // stop on mouse up
    document.onmouseup = () => {
      stopMoving();
    };
  };

  // stop moving object
  const stopMoving = () => {
    document.onmousemove = false;
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
      startMoving(targetFound, containerFound, initialPosition, evt);
    });
  }

  return;

};