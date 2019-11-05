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

  // move object
  const moveTarget = (target, position, animate) => {

    // set new coordinates without animating
    target.style.left = position.x + 'px';
    target.style.top = position.y + 'px';

  };

  // make sure object does not go outside container
  // todo: replace with clientrect
  const checkTargetBoundaries = (pos, target, container, initialPos, initialContainerPos) => {
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

    const containerRect = container.element.getBoundingClientRect()
    const targetRect = target.element.getBoundingClientRect()
    const targetStyle = target.element.style
    const space = 20
    const conditions = [
      targetRect.left < containerRect.left - space,
      targetRect.right > containerRect.right + space,
      targetRect.top < containerRect.top - space,
      targetRect.bottom > containerRect.bottom + space
    ];
    const leftBorder = (initialPos.x - initialPos.rect.x) + initialContainerPos.rect.x;
    const rightBorder = leftBorder + (containerRect.width - targetRect.width);
    const topBorder = (initialPos.y - initialPos.rect.y) + initialContainerPos.rect.y;
    const bottomBorder = topBorder + (containerRect.height - targetRect.height);
    const resolutions = [
      () => {
        moveBack(target.element, leftBorder, targetStyle.top)
      },
      () => {
        moveBack(target.element, rightBorder, targetStyle.top)
      },
      () => {
        moveBack(target.element, targetStyle.left, topBorder)
      },
      () => {
        moveBack(target.element, targetStyle.left, bottomBorder)
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
      stopMoving();
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
  const startMoving = (target, container, initialPos, initialContainerPos, evt) => {

    const targetElem = getElProperties(target),
      containerElem = getElProperties(container),
      // offset from mouse to target element borders
      offset = {
        x: evt.clientX - targetElem.left,
        y: evt.clientY - targetElem.top,
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
      // checkMouseBoundaries(mouse, containerElem, 100);

      // check mouse is within window
      if (checkWindowBoundaries(targetElem, initialPos)) {
        // moveTarget if within window
        moveTarget(target, checkTargetBoundaries(targetPos, targetElem, containerElem, initialPos, initialContainerPos), false);
        // moveTarget(target, targetPos, false);
      }

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

    // initial container position (testing to see if fixes nested container bug)
    const initialContainerPosition = {
      x: containerFound.offsetLeft,
      y: containerFound.offsetTop,
      rect: containerFound.getBoundingClientRect()
    }

    targetFound.addEventListener('mousedown', function (evt) {
      startMoving(targetFound, containerFound, initialPosition, initialContainerPosition, evt);
    });
  }

  return;

};