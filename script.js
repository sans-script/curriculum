document.addEventListener("DOMContentLoaded", function () {
  if (!isMobile()) {
    var gbControls = document.getElementById("gameboy-controls");
    if (gbControls) gbControls.parentNode.removeChild(gbControls);
  }
});
document.addEventListener("mousedown", function (e) {
  if (
    e.button === 0 &&
    gameActive &&
    !isMobile() &&
    !e.target.closest(
      ".lang-switch, .print-btn, .destroy-btn, #exitGame, #gameboy-controls, .gb-btn, .gb-dpad"
    )
  ) {
    e.preventDefault();
    document.body.classList.add("shooting-cursor");
    shoot();
  }
});

document.addEventListener("mouseup", function (e) {
  document.body.classList.remove("shooting-cursor");
});

function showGameboyControls(show) {
  const el = document.getElementById("gameboy-controls");
  if (!el) return;
  el.style.display = show ? "flex" : "none";
}

function isMobile() {
  return (
    window.innerWidth <= 800 &&
    /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
      navigator.userAgent
    )
  );
}

if (isMobile()) {
  document
    .getElementById("gb-left")
    .addEventListener("touchstart", function (e) {
      e.preventDefault();
      keys["a"] = true;
    });
  document.getElementById("gb-left").addEventListener("touchend", function (e) {
    e.preventDefault();
    keys["a"] = false;
  });
  document
    .getElementById("gb-right")
    .addEventListener("touchstart", function (e) {
      e.preventDefault();
      keys["d"] = true;
    });
  document
    .getElementById("gb-right")
    .addEventListener("touchend", function (e) {
      e.preventDefault();
      keys["d"] = false;
    });
  document.getElementById("gb-up").addEventListener("touchstart", function (e) {
    e.preventDefault();
    window.scrollBy({ top: -60, behavior: "smooth" });
  });
  document
    .getElementById("gb-down")
    .addEventListener("touchstart", function (e) {
      e.preventDefault();
      window.scrollBy({ top: 60, behavior: "smooth" });
    });
  document
    .getElementById("gb-fire")
    .addEventListener("touchstart", function (e) {
      e.preventDefault();
      shoot();
    });
}

const oldStartGame = startGame;
startGame = function () {
  oldStartGame.apply(this, arguments);
  if (isMobile()) showGameboyControls(true);
};
const oldExitGame = exitGame;
exitGame = function () {
  oldExitGame.apply(this, arguments);
  if (isMobile()) showGameboyControls(false);
};

let gameActive = false;
let shipX = window.innerWidth / 2;
let bullets = [];
let characters = [];
let score = 0;
let words = [];
let canShoot = true;
let shootCooldown = 150;
const keys = {};
function createHeader({ name, location }) {
  return `
          <div class="header">
            <h1>${name}</h1>
            <div class="profession">${arguments[0].profession || ""}</div>
            <div class="location">${location}</div>
          </div>
        `;
}
function createContacts(contacts) {
  const left = contacts
    .filter((c) => c.side === "left")
    .map(
      (c) =>
        `<p><strong>${c.label}:</strong> <a href="${c.href}">${c.value}</a></p>`
    )
    .join("");
  const right = contacts
    .filter((c) => c.side === "right")
    .map(
      (c) =>
        `<p><strong>${c.label}:</strong> <a href="${c.href}">${c.value}</a></p>`
    )
    .join("");
  return `
          <div class="contact-info">
            <div class="contact-left">${left}</div>
            <div class="contact-right">${right}</div>
          </div>
        `;
}
function createDivider() {
  return `<div class="divider"></div>`;
}
function createSection(title, content) {
  return `
          <div class="section">
            <h2 class="section-title">${title}</h2>
            ${content}
          </div>
        `;
}
function createSummary(summary) {
  return `<div class="summary">${summary
    .map((p) => `<p>${p}</p>`)
    .join("")}</div>`;
}
function createExperience(experiences) {
  return `
          <div class="experience">
            ${experiences
              .map(
                (exp) => `
              <div class="experience-item">
                <div class="job-title"><span class="job-title-span">${exp.title}</span>, ${
                  exp.period
                }</div>
                <div class="company"><span class="company-name">${exp.company}</span>, ${
                  exp.location
                }</div>
                <div class="job-description">
                  <p>${exp.description}</p>
                  <ul class="bullet-points">
                    ${exp.bullets.map((b) => `<li>${b}</li>`).join("")}
                  </ul>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        `;
}
function createEducation(education) {
  return `
          <div class="education">
            ${education
              .map(
                (edu) => `
              <div class="education-item">
                <div class="degree">${edu.degree}</div>
                <div class="institution">${edu.institution}</div>
                <div class="period">${edu.period}</div>
              </div>
            `
              )
              .join("")}
          </div>
        `;
}
function createLanguages(languages) {
  return `
          <div class="languages">
            ${languages
              .map(
                (lang) => `<p><strong>${lang.name}</strong> ${lang.level}</p>`
              )
              .join("")}
          </div>
        `;
}
let currentLang = "pt";
function renderCurriculum(lang) {
  const data = lang === "en" ? curriculumEN : curriculumPT;
  document.documentElement.lang = lang === "en" ? "en-US" : "pt-BR";
  const root = document.getElementById("curriculum-root");
  root.innerHTML = `
          ${createHeader(data)}
          ${createContacts(data.contacts)}
          ${createDivider()}
          ${createSection(
            data.sectionTitles.summary,
            createSummary(data.summary)
          )}
          ${createDivider()}
          ${createSection(
            data.sectionTitles.experience,
            createExperience(data.experience)
          )}
          ${createDivider()}
          ${createSection(
            data.sectionTitles.education,
            createEducation(data.education)
          )}
          ${createDivider()}
          ${createSection(
            data.sectionTitles.languages,
            createLanguages(data.languages)
          )}
        `;
  document.getElementById("lang-switch").textContent =
    lang === "en" ? "PT" : "EN";
}
function wrapTextInWords() {
  if (words.length) return;
  const roots = [
    document.getElementById("curriculum-root"),
    document.querySelector(".instructions"),
  ].filter(Boolean);
  words = [];
  roots.forEach((root) => {
    if (!root) return;
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent.trim()) textNodes.push(node);
    }
    textNodes.forEach((textNode) => {
      const wordsArray = textNode.textContent.split(/(\s+)/);
      const fragment = document.createDocumentFragment();
      wordsArray.forEach((word) => {
        if (word.trim()) {
          const wordSpan = document.createElement("span");
          wordSpan.className = "word";
          wordSpan.textContent = word;
          wordSpan.id = `word-${words.length}`;
          fragment.appendChild(wordSpan);
          words.push({
            element: wordSpan,
            text: word,
            destroyed: false,
          });
        } else {
          fragment.appendChild(document.createTextNode(word));
        }
      });
      textNode.parentNode.replaceChild(fragment, textNode);
    });
  });
  console.log(`Found ${words.length} words for targeting`);
}
function startGame() {
  document.body.classList.add("game-mode");
  document.getElementById("ship").style.display = "block";
  document.getElementById("gameUI").style.display = "block";
  document.getElementById("exitGame").style.display = "block";
  document.getElementById("destroy-btn").style.display = "none";
  document.getElementById("exitGame").textContent = "Quit Game";

  wrapTextInWords();

  gameActive = true;
  shipX = window.innerWidth / 2;
  score = 0;
  const scoreValue = document.getElementById("score-value");
  if (scoreValue) {
    scoreValue.textContent = "0";
  } else {
    document.getElementById("score").innerHTML =
      '<span class="score-label">Score:</span> <span id="score-value">0</span>';
  }

  setTimeout(() => {
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    window.scrollTo({
      top: documentHeight,
      behavior: "smooth",
    });

    const ship = document.getElementById("ship");
    ship.style.bottom = "10px";
  }, 1000);

  gameLoop();
}
function exitGame() {
  gameActive = false;
  document.body.classList.remove("game-mode");
  document.getElementById("ship").style.display = "none";
  document.getElementById("gameUI").style.display = "none";
  document.getElementById("exitGame").style.display = "none";
  document.getElementById("destroy-btn").style.display = "block";
  bullets.forEach((bullet) => bullet.element.remove());
  characters.forEach((character) => character.element.remove());
  bullets = [];
  characters = [];
  words = [];

  window.scrollTo(0, 0);

  renderCurriculum(currentLang);
}
function updateShip() {
  if (!gameActive) return;
  if (keys["a"] || keys["A"] || keys["ArrowLeft"]) {
    shipX -= 5;
  }
  if (keys["d"] || keys["D"] || keys["ArrowRight"]) {
    shipX += 5;
  }

  shipX = Math.max(10, Math.min(window.innerWidth - 10, shipX));

  const ship = document.getElementById("ship");
  ship.style.left = shipX + "px";
}
function shoot() {
  if (!canShoot || !gameActive) return;
  const ship = document.getElementById("ship");
  const shipRect = ship.getBoundingClientRect();
  const BULLET_H = 8;
  const bulletX = shipRect.left + shipRect.width / 2;
  const bulletTop = shipRect.top - BULLET_H;
  const bullet = document.createElement("div");
  bullet.className = "bullet";
  bullet.style.position = "fixed";
  bullet.style.left = bulletX - 1 + "px";
  bullet.style.top = bulletTop + "px";
  bullet.style.bottom = "";
  document.body.appendChild(bullet);
  bullets.push({
    element: bullet,
    x: bulletX,
    y: bulletTop,
    h: BULLET_H,
  });
  canShoot = false;
  setTimeout(() => {
    canShoot = true;
  }, shootCooldown);
}
function fragmentWord(word, hitX, hitY) {
  const rect = word.element.getBoundingClientRect();
  const text = word.text;
  word.element.style.visibility = "hidden";
  word.destroyed = true;
  for (let i = 0; i < text.length; i++) {
    const char = document.createElement("div");
    char.className = "character";
    char.textContent = text[i];
    char.style.position = "fixed";
    char.style.left = rect.left + i * 8 + "px";
    char.style.top = rect.top + "px";
    char.style.fontSize = "11pt";
    char.style.color = "black";
    char.style.pointerEvents = "none";
    char.style.zIndex = "998";
    document.body.appendChild(char);
    const distanceFromHit = rect.left + i * 8 - hitX;
    const explosionForce = 15;
    const baseVx = (distanceFromHit > 0 ? 1 : -1) * explosionForce;
    const randomVx = (Math.random() - 0.5) * 10;
    characters.push({
      element: char,
      x: rect.left + i * 8,
      y: rect.top,
      vx: baseVx + randomVx,
      vy: Math.random() * -15 - 8,
      gravity: 0.6,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 20,
      scale: 1,
      scaleSpeed: Math.random() * 0.02 + 0.01,
      life: 120,
    });
  }
  score += text.length * 10;
  console.log("Score: ", score);
  const scoreValue = document.getElementById("score-value");
  if (scoreValue) {
    scoreValue.textContent = score;
  } else {
    document.getElementById("score").innerHTML =
      '<span class="score-label">Score:</span> <span id="score-value">' +
      score +
      "</span>";
  }
}
function checkCollisions() {
  if (!gameActive) return;
  for (let bi = bullets.length - 1; bi >= 0; bi--) {
    const bullet = bullets[bi];
    const bulletX = bullet.x;
    const bulletCenterY = bullet.y + bullet.h / 2;
    let bulletDestroyed = false;
    for (let wi = 0; wi < words.length && !bulletDestroyed; wi++) {
      const word = words[wi];
      if (!word.destroyed && word.element.style.visibility !== "hidden") {
        const rect = word.element.getBoundingClientRect();
        const horizontalHit =
          bulletX >= rect.left - 10 && bulletX <= rect.right + 10;
        const verticalHit =
          bulletCenterY >= rect.top - 10 && bulletCenterY <= rect.bottom + 10;
        if (horizontalHit && verticalHit) {
          console.log(`Hit detected! Word: "${word.text}"`);
          fragmentWord(word, bulletX, bulletCenterY);
          bullet.element.remove();
          bullets.splice(bi, 1);
          bulletDestroyed = true;
        }
      }
    }
  }
}
function updateBullets() {
  if (!gameActive) return;
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    bullet.y -= 8;
    bullet.element.style.top = bullet.y + "px";
    if (bullet.y + bullet.h < 0) {
      bullet.element.remove();
      bullets.splice(i, 1);
    }
  }
}
function updateCharacters() {
  if (!gameActive) return;
  characters.forEach((character, index) => {
    character.x += character.vx;
    character.y += character.vy;
    character.vy += character.gravity;
    character.rotation += character.rotationSpeed;
    character.scale += character.scaleSpeed;
    character.life--;
    character.vx *= 0.99;
    character.element.style.left = character.x + "px";
    character.element.style.top = character.y + "px";
    character.element.style.transform = `rotate(${character.rotation}deg) scale(${character.scale})`;
    character.element.style.opacity = Math.max(0, character.life / 180);
    if (character.life <= 0 || character.y > window.innerHeight) {
      character.element.remove();
      characters.splice(index, 1);
    }
  });
}
function gameLoop() {
  if (!gameActive) return;
  updateShip();
  updateBullets();
  updateCharacters();
  checkCollisions();
  requestAnimationFrame(gameLoop);
}
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === " " && gameActive) {
    e.preventDefault();
    shoot();
  }
  if ((e.key === "Escape" || e.key === "Esc") && gameActive) {
    e.preventDefault();
    exitGame();
  }
  // W/S para scroll
  if (e.key.toLowerCase() === "w") {
    window.scrollBy({ top: -60, behavior: "smooth" });
  }
  if (e.key.toLowerCase() === "s") {
    window.scrollBy({ top: 60, behavior: "smooth" });
  }
});
document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});
document.getElementById("lang-switch").onclick = function () {
  if (gameActive) return;
  currentLang = currentLang === "pt" ? "en" : "pt";
  renderCurriculum(currentLang);
};
document.getElementById("print-btn").onclick = function () {
  if (gameActive) return;
  window.print();
};
document.getElementById("destroy-btn").onclick = startGame;
document.getElementById("exitGame").onclick = exitGame;

renderCurriculum(currentLang);
