const mover = function (target, container) {

  // check list for truthy flags
  const flagCheck = (list, cb) => {
    let index = false
    let flags = list.filter((condition, i) => {
      if (condition) index = i
      return condition
    });
    if (flags.length && typeof cb === 'function') cb(index) // stopMoving();

    return !flags.length
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

  const removePx = (input) => {
    return typeof input === 'string' ? parseInt(input.replace('px', ''), 10) : input
  }

  const moveBack = (target, x, y) => {
    target.style.left = removePx(x) + 'px';
    target.style.top = removePx(y) + 'px';
    target.classList.add('transition-2', 'red');
    setTimeout(() => {
      target.classList.remove('transition-2', 'red');
    }, 250);
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
      y = pos.y;

    // space = range || 0;

    // UNCOMMENT LATER
    // if (!container.isWindow) {
    //   if (x < 0 - space) x = 0;
    //   if (y < 0 - space) y = 0;
    //   if (x + target.width - space > container.width) x = container.width - target.width;
    //   if (y + target.height - space > container.height) y = container.height - target.height;
    // };

    // --

    if (container.isWindow) return {
      x,
      y
    };

    const containerEl = container.element.getBoundingClientRect()
    const targetEl = target.element.getBoundingClientRect()
    const classList = target.element.classList
    const space = 20
    const conditions = [
      targetEl.left < containerEl.left - space,
      targetEl.right > containerEl.right + space,
      targetEl.top < containerEl.top - space,
      targetEl.bottom > containerEl.bottom + space
    ];
    const errors = [
      'left boundary',
      'right boundary',
      'top boundary',
      'bottom boundary'
    ];
    const resolutions = [
      () => {
        moveBack(target.element, 0, targetEl.top - containerEl.top)
      },
      () => {
        moveBack(target.element, containerEl.width - targetEl.width, targetEl.top - containerEl.top)
      },
      () => {
        moveBack(target.element, targetEl.left - containerEl.left, 0)
      },
      () => {
        moveBack(target.element, targetEl.left - containerEl.left, containerEl.height - targetEl.height)
      },
    ];

    flagCheck(conditions, (ind) => {
      stopMoving();
      resolutions[ind]();
    });

    // --

    // refactor later!
    if (flagCheck(conditions)) {
      return {
        x,
        y
      };
    } else {
      return false
    }



  };

  // make sure object does not go outside window
  const checkWindowBoundaries = (target, initialPos, range) => {
    const targetRect = target.element.getBoundingClientRect(),
      targetStyle = target.element.style,
      innerHeight = window.innerHeight,
      innerWidth = window.innerWidth,
      space = range || 3,
      conditions = [
        targetRect.y < -target.height / space,
        targetRect.y > innerHeight - target.height / space,
        targetRect.x < -target.width / space,
        targetRect.x > innerWidth - target.width / space,
      ],
      errors = [
        'top boundary',
        'bottom boundary',
        'left boundary',
        'right boundary'
      ],
      resolutions = [
        () => {
          moveBack(target.element, targetStyle.left, initialPos.rect.y - initialPos.y - targetRect.height)
        },
        () => {
          moveBack(target.element, targetStyle.left, innerHeight - targetRect.height - (initialPos.rect.y - initialPos.y))
        },
        () => {
          moveBack(target.element, -(initialPos.rect.x - initialPos.x), targetStyle.top)
        },
        () => {
          moveBack(target.element, innerWidth - targetRect.width - (initialPos.rect.x - initialPos.x), targetStyle.top)
        },
      ]

    return flagCheck(conditions, (ind) => {
      console.log('window boundaries reached');
      stopMoving();
      console.log(errors[ind]);
      resolutions[ind]();
    });
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

      // console.log(initialPos.rect)

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
      if (checkWindowBoundaries(targetEl, initialPos)) {
        // moveTarget if within window
        moveTarget(target, checkTargetBoundaries(targetPos, targetEl, containerEl), false);
        // moveTarget(target, targetPos, false);
      }
      // else {
      // return to starting position if outside window
      // moveTarget(target, initialPos, true);
      // };

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
      rect: targetFound.getBoundingClientRect()
    };

    targetFound.addEventListener('mousedown', function (evt) {
      startMoving(targetFound, containerFound, initialPosition, evt);
    });
  }

  return;

};

// todo: handle any number of container and parent elements , while still confining target element to SPECIFIED container OR window