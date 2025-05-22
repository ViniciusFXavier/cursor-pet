(() => {
  if (window.cursorpetLoaded) {
    return true
  }

  window.cursorpetLoaded = true;

  const spriteSets = {
    idle: {
      positions: [[-3, -3]],
      speed: 1,
    },
    alert: {
      positions: [[-7, -3]],
      speed: 1,
    },
    scratchSelf: {
      positions: [
        [-5, 0],
        [-6, 0],
        [-7, 0],
      ],
      speed: 1,
    },
    scratchWallN: {
      positions: [
        [0, 0],
        [0, -1],
      ],
      speed: 1,
    },
    scratchWallS: {
      positions: [
        [-7, -1],
        [-6, -2],
      ],
      speed: 1,
    },
    scratchWallE: {
      positions: [
        [-2, -2],
        [-2, -3],
      ],
      speed: 1,
    },
    scratchWallW: {
      positions: [
        [-4, 0],
        [-4, -1],
      ],
      speed: 1,
    },
    tired: {
      positions: [[-3, -2]],
      speed: 1,
    },
    sleeping: {
      positions: [
        [-2, 0],
        [-2, -1],
      ],
      speed: 0.1,
    },
    N: {
      positions: [
        [-1, -2],
        [-1, -3],
      ],
      speed: 1,
    },
    NE: {
      positions: [
        [0, -2],
        [0, -3],
      ],
      speed: 1,
    },
    E: {
      positions: [
        [-3, 0],
        [-3, -1],
      ],
      speed: 1,
    },
    SE: {
      positions: [
        [-5, -1],
        [-5, -2],
      ],
      speed: 1,
    },
    S: {
      positions: [
        [-6, -3],
        [-7, -2],
      ],
      speed: 1,
    },
    SW: {
      positions: [
        [-5, -3],
        [-6, -1],
      ],
      speed: 1,
    },
    W: {
      positions: [
        [-4, -2],
        [-4, -3],
      ],
      speed: 1,
    },
    NW: {
      positions: [
        [-1, 0],
        [-1, -1],
      ],
      speed: 1,
    },
  };

  const cursorpetEl = document.createElement('div');
  cursorpetEl.id = 'cursorpet';
  document.body.appendChild(cursorpetEl);

  const heartEl = document.createElement('div');
  heartEl.id = 'cursorpet-heart';
  heartEl.classList.add('d-none');
  document.body.appendChild(heartEl);

  function getInitialPosition(max) {
    return Math.max(32, Math.floor(Math.random() * max));
  }

  let cursorpetPosX = getInitialPosition(window.innerWidth - 20);
  let cursorpetPosY = getInitialPosition(window.innerHeight - 50);
  cursorpetEl.style.left = `${cursorpetPosX}px`;
  cursorpetEl.style.top = `${cursorpetPosY}px`;
  heartEl.style.left = `${cursorpetPosX + 16}px`;
  heartEl.style.top = `${cursorpetPosY - 16}px`;

  let currentSprite = "sleeping";
  let mousePosX = cursorpetPosX;
  let mousePosY = cursorpetPosY;
  let frameCount = 0;
  const cursorpetSpeed = 10;
  let energy = 100;
  let itchiness = 0;

  const wordTargetTagBlacklist = ["SCRIPT", "STYLE", "TEXTAREA", "TITLE"];

  function findWordTargets() {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          return node.nodeValue?.trim() &&
            node.parentElement !== null &&
            !wordTargetTagBlacklist.includes(node.parentElement.tagName) &&
            node.parentElement.id !== 'cursorpet' &&
            node.parentElement.id !== 'cursorpet-heart'
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        },
      }
    );

    let textNodes = [];
    let currentNode;

    while ((currentNode = walker.nextNode())) {
      const text = currentNode.nodeValue.trim();
      if (text.length > 0) {
        textNodes.push(currentNode);
      }
    }

    if (textNodes.length === 0) {
      return [];
    }

    const targetCount = Math.floor(Math.random() * 6);
    const temporaryElements = [];

    for (let i = 0; i < targetCount && textNodes.length > 0; i++) {
      const randomNodeIndex = Math.floor(Math.random() * textNodes.length);
      const selectedNode = textNodes[randomNodeIndex];
      const text = selectedNode.nodeValue;

      textNodes.splice(randomNodeIndex, 1);

      const randomCharIndex = Math.floor(Math.random() * text.length);
      const selectedChar = text[randomCharIndex];

      const tempElement = document.createElement('span');
      tempElement.textContent = '';
      tempElement.style.cssText = `
          position: absolute;
          z-index: 0;
          color: #333;
          pointer-events: none;
        `;

      const range = document.createRange();
      range.setStart(selectedNode, randomCharIndex);
      range.setEnd(selectedNode, randomCharIndex + 1);
      const rect = range.getBoundingClientRect();

      const parentElement = selectedNode.parentElement;

      tempElement.style.cssText = `
          position: absolute;
          z-index: 0;
          pointer-events: none;
          left: ${rect.left + window.scrollX}px;
          top: ${rect.top + window.scrollY}px;
          width: ${rect.width}px;
          height: ${rect.height}px;
          display: flex;
          visibility: hidden;
          align-items: center;
          justify-content: center;
        `;

      document.body.appendChild(tempElement);

      tempElement.dataset.tempTarget = 'true';
      tempElement.dataset.originalChar = selectedChar;

      temporaryElements.push(tempElement);
    }

    return temporaryElements;
  }

  async function bonkNode(el) {
    for (let i = 1; i < 5; i += 0.5) {
      const arrived = await runToNode(el);

      if (!arrived) {
        setTimeout(() => { el.remove() }, 3000);
        return false
      }

      const rect = el.getBoundingClientRect();
      const diffX = rect.left + rect.width / 2 - cursorpetPosX;
      const diffY = rect.top + rect.height / 2 - cursorpetPosY;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          await tick(1, "scratchWallW");
        } else {
          await tick(1, "scratchWallE");
        }
      } else {
        if (diffY < 0) {
          await tick(1, "scratchWallN");
        } else {
          await tick(1, "scratchWallS");
        }
      }

      if (getComputedStyle(el).display === "inline") {
        el.style.display = "inline-block";
      }
      const mult = 1 + (Math.random() * 2 - 1) / 5;
      el.style.scale = `${Math.pow(1.03, i * mult)} ${Math.pow(0.95, i * mult)}`;
      el.style.rotate = `${Math.random() > 0.5 ? "" : "-"}${Math.random() * i}deg`;

      setTimeout(() => { el.remove() }, 3000);
    }
    await tick(10, "idle");
    return true;
  }

  async function tick(count, spriteName) {
    for (let i = 0; i < count; i++) {
      if (energy > 0) energy -= 1;
      itchiness += 1;

      frameCount += 1;
      const sprite =
        spriteSets[spriteName].positions[
        Math.floor(frameCount * spriteSets[spriteName].speed) % spriteSets[spriteName].positions.length
        ];
      cursorpetEl.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
      cursorpetPosX = Math.min(Math.max(16, cursorpetPosX), window.innerWidth - 16);
      cursorpetPosY = Math.min(Math.max(16, cursorpetPosY), window.innerHeight - 16);
      cursorpetEl.style.left = `${cursorpetPosX - 16}px`;
      cursorpetEl.style.top = `${cursorpetPosY - 16}px`;
      heartEl.style.left = `${cursorpetPosX}px`;
      heartEl.style.top = `${cursorpetPosY - 32}px`;

      await new Promise((res) => setTimeout(res, 100));
    }
  }

  async function runToPoint(getLocation, minDistance = 0) {
    while (true) {
      const [x, y] = getLocation();

      if (x < 0 || x > window.innerWidth || y < 0 || y > window.innerHeight) {
        return false;
      }

      const diffX = cursorpetPosX - x;
      const diffY = cursorpetPosY - y;
      const distance = Math.hypot(diffX, diffY);

      if (distance < cursorpetSpeed || distance < minDistance) {
        return true;
      }

      await stepInDirection(diffX, diffY);
    }
  }

  async function stepInDirection(diffX, diffY) {
    const distance = Math.hypot(diffX, diffY);

    let direction = diffY / distance > 0.5 ? "N" : "";
    direction += diffY / distance < -0.5 ? "S" : "";
    direction += diffX / distance > 0.5 ? "W" : "";
    direction += diffX / distance < -0.5 ? "E" : "";

    cursorpetPosX -= (diffX / distance) * cursorpetSpeed;
    cursorpetPosY -= (diffY / distance) * cursorpetSpeed;

    await tick(1, direction);
  }

  async function runToNode(node) {
    while (true) {
      const rect = node.getBoundingClientRect();

      if (rect.width === 0 || rect.height === 0) return false;

      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      if (x < 20 || x > window.innerWidth || y < 20 || y > window.innerHeight) {
        return false;
      }

      const diffX = cursorpetPosX - x;
      const diffY = cursorpetPosY - y;
      const distance = Math.hypot(diffX, diffY);

      if (distance < cursorpetSpeed || (Math.abs(diffX) < rect.width / 2 && Math.abs(diffY) < rect.height / 2)) {
        return true;
      }

      await stepInDirection(diffX, diffY);
    }
  }

  async function main() {
    mainloop: while (true) {
      const distanceToMouse = Math.hypot(cursorpetPosX - mousePosX, cursorpetPosY - mousePosY);

      if (distanceToMouse > 150) {
        await tick(10, "alert");
        await runToPoint(() => [mousePosX, mousePosY], 100);
        continue;
      }

      await tick(10, "idle");

      if (itchiness >= 100) {
        await tick(20, "scratchSelf");
        itchiness = 0;
        continue;
      }

      const bonkTargets = findWordTargets()

      let bonkedSomething = false;
      for (const node of bonkTargets) {
        const success = await bonkNode(node);
        bonkedSomething ||= success;
        node.dataset.bonked = success.toString();
      }
      if (bonkedSomething) {
        await runToPoint(() => [mousePosX, mousePosY], 150);
        continue;
      }

      if (Math.random() > 0.9) {
        let angleDiff = (Math.PI / 8) * (1 + (Math.random() * 2 - 1) / 3);
        let angle = 0;
        for (let i = 0; i < 40; i += 1) {
          angle += angleDiff;

          if (Math.random() < 0.1) {
            angleDiff *= -1;
          }
          let diffX = Math.sin(angle) + (cursorpetPosX - mousePosX) / 400;
          let diffY = Math.cos(angle) + (cursorpetPosY - mousePosY) / 400;
          await stepInDirection(diffX, diffY);
        }
        await tick(20, "idle");
        await runToPoint(() => [mousePosX, mousePosY], 100);
        continue;
      }

      if (energy <= 0) {
        await tick(10, "tired");
        while (energy < 100) {
          await tick(1, "sleeping");
          energy += 2;

          if (Math.hypot(mousePosX - cursorpetPosX, mousePosY - cursorpetPosY) > 150) {
            continue mainloop;
          }
        }
        continue;
      }
    }
  }

  document.addEventListener("click", (event) => {
    cursorpetEl.style.removeProperty("pointer-events");
    let elementClicked = document.elementFromPoint(event.clientX, event.clientY);
    if (elementClicked && elementClicked.id === cursorpetEl.id) {
      heartEl.classList.remove("d-none");
      setTimeout(() => {
        heartEl.classList.add("d-none");
      }, 2000);
    }
    cursorpetEl.style.pointerEvents = "auto";
  });

  document.addEventListener(
    "mousemove",
    (event) => {
      mousePosX = event.clientX;
      mousePosY = event.clientY;
    },
    { passive: true }
  );

  main();
})()
