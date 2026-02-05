const classes = [
  {
    id: "vanguard",
    name: "Ion Vanguard",
    description: "Frontline shield knight who converts impact into power.",
    stats: { hp: 28, attack: 6, tech: 2, resolve: 5 },
    passive: "First hit each floor is reduced by 2.",
  },
  {
    id: "cipher",
    name: "Cipher Duelist",
    description: "Blade hacker who rewrites security scripts in real time.",
    stats: { hp: 22, attack: 5, tech: 6, resolve: 4 },
    passive: "Gains bonus choice options in logic encounters.",
  },
  {
    id: "starseer",
    name: "Starseer Templar",
    description: "Mystic space paladin hearing echoes from dead satellites.",
    stats: { hp: 24, attack: 4, tech: 4, resolve: 7 },
    passive: "Restores 1 HP after each successful event.",
  },
];

const aims = [
  {
    id: "core",
    name: "Core Heist",
    description: "Steal resonance cores from the labyrinth's heart.",
    rewardBias: "cores",
  },
  {
    id: "pilgrim",
    name: "Pilgrim Rescue",
    description: "Find stranded pilgrims inside the orbital catacombs.",
    rewardBias: "resolve",
  },
  {
    id: "sovereign",
    name: "Sovereign Hunt",
    description: "Track down a rogue machine king and take its crown.",
    rewardBias: "combat",
  },
];

const entrances = [
  "Shattered Dock 09",
  "Solar Choir Transit Gate",
  "Forgotten Repair Spine",
  "Moonshadow Cargo Shaft",
  "Crimson Debris Lock",
  "Aurora Relay Aperture",
];

const asciiScenes = {
  start: String.raw`
       /\
  ____/==\____         ORBITAL SATELLITE: LABYRINTH-PRIME
 /___/====\___\        STATUS: RITUALIZED COLLAPSE + ACTIVE DEFENSE
 |  |[][]|  |          KNIGHT LINK: STABLE
 |__|_[]_|__|          ENTRY VECTOR: UNKNOWN
   /  ||  \
  /___||___\
`,
  combat: String.raw`
      .----.
   .-'      '-.
  /  .-''-.    \      HOSTILE UNIT DETECTED
 |  /  []  \   |      WEAPONS LIVE
 |  |  --  |   |
  \  '-..-'   /
   '-._____.-'
`,
  vault: String.raw`
  +------------------+
  | [] [] [] [] []   |   RESONANCE VAULT
  | [] [][] [] [][]  |   ENCRYPTION LAYERS: 7
  | [] [] [] [] []   |   SECURITY: SENTIENT
  +------------------+
`,
  shrine: String.raw`
        /\
       /::\
      /::::\
     /::/\::\      STAR SHRINE
    /::/  \::\     "THE SKY REMEMBERS"
   /__/    \__\
`,
  extract: String.raw`
   ___       ___
  / _ \_____/ _ \      EXTRACTION GATE OPEN
 | | |  ___  | | |     RUN COMPLETE
 | |_| |   | |_| |
  \___/_____|___/
`,
};

const eventDeck = [
  {
    id: "sentinel",
    title: "A Bronze Sentinel Awakens",
    scene: "combat",
    text:
      "A relic guardian unfolds from the wall plating and demands your command glyph. Its halberd hums with plasma static.",
    choices: [
      {
        label: "Meet it blade-to-blade",
        effect: (state) => resolveCombat(state, 12, 3),
      },
      {
        label: "Trigger a side-thruster burst and flank",
        effect: (state) => techCheck(state, 5, "You rocket behind the sentinel and strike exposed joints.", { cores: 1, hp: -1 }),
      },
      {
        label: "Recite ancient knight protocol",
        requirement: (state) => state.resolve >= 7,
        effect: (state) => {
          log("Your voice resonates through cathedral steel. The sentinel kneels and grants passage.", "success");
          state.cores += 2;
        },
      },
    ],
  },
  {
    id: "echo_market",
    title: "Ghost Market of Circuit Monks",
    scene: "vault",
    text:
      "Holographic monks barter memories for upgrades. They offer an illegal overclock or a map fragment at a price.",
    choices: [
      {
        label: "Trade blood for overclock (+attack, -hp)",
        effect: (state) => {
          state.attack += 2;
          state.hp -= 3;
          log("Pain floods your nerves, but your blade now screams at impossible frequencies.", "warning");
        },
      },
      {
        label: "Purchase map fragment with 1 core",
        requirement: (state) => state.cores >= 1,
        effect: (state) => {
          state.cores -= 1;
          state.depth += 1;
          log("You skip a collapsing corridor and descend deeper immediately.", "success");
        },
      },
      {
        label: "Refuse all temptations and meditate",
        effect: (state) => {
          state.resolve += 1;
          log("Discipline hardens your will. Resolve increased.", "system");
        },
      },
    ],
  },
  {
    id: "pilgrims",
    title: "Distress Beacon: Pilgrims in Stasis",
    scene: "shrine",
    text:
      "Three cryo-pods flicker beside a shattered chapel. Saving them drains your reserves, ignoring them leaves an echo in your suit AI.",
    choices: [
      {
        label: "Restore power to all pods (-2 hp, +2 resolve)",
        effect: (state) => {
          state.hp -= 2;
          state.resolve += 2;
          state.pilgrimsSaved += 3;
          log("The pilgrims breathe again. Their gratitude strengthens your spirit.", "success");
        },
      },
      {
        label: "Wake one guide to reveal safe routes (+1 depth)",
        effect: (state) => {
          state.pilgrimsSaved += 1;
          state.depth += 1;
          log("A dazed pilgrim marks hidden stairs toward the lower sanctum.", "system");
        },
      },
      {
        label: "Harvest their cryo-cells for combat stims (+2 attack)",
        effect: (state) => {
          state.attack += 2;
          log("The chamber falls silent. Power rises; so does the moral cost.", "warning");
        },
      },
    ],
  },
  {
    id: "fracture",
    title: "Reality Fracture Corridor",
    scene: "start",
    text:
      "Hallways mirror infinitely. Your visor reports contradictory gravity vectors and multiple versions of yourself moving ahead.",
    choices: [
      {
        label: "Trust instinct and leap through the brightest fracture",
        effect: (state) => resolveCheck(state, 6, "You land safely in a cache room.", { cores: 2 }),
      },
      {
        label: "Anchor with mag-hooks and analyze field",
        effect: (state) => techCheck(state, 6, "You solve the geometry and chart a stable route.", { depth: 1 }),
      },
      {
        label: "Charge forward and brute force through",
        effect: (state) => {
          state.hp -= 4;
          state.depth += 1;
          log("You emerge bleeding but alive. Sometimes violence is navigation.", "warning");
        },
      },
    ],
  },
  {
    id: "throne",
    title: "The Machine Sovereign Appears",
    scene: "combat",
    text:
      "At the central nexus, a crown of drones assembles around a towering warform. It offers you command of the labyrinth in exchange for your humanity.",
    choices: [
      {
        label: "Duel the sovereign for the crown",
        effect: (state) => resolveCombat(state, 16, 4, { cores: 3 }),
      },
      {
        label: "Attempt to hack the drone crown",
        effect: (state) => techCheck(state, 8, "You seize the crown signal and force the sovereign to stand down.", { cores: 4 }),
      },
      {
        label: "Accept the pact and transcend",
        requirement: (state) => state.resolve >= 8,
        effect: (state) => {
          state.cores += 5;
          state.humanityLost = true;
          log("You become something luminous and terrifying. Earth will whisper your new title.", "warning");
        },
      },
    ],
  },
  {
    id: "wraith_train",
    title: "Zero-G Wraith Train",
    scene: "start",
    text:
      "A phantom mag-rail carriage drifts through vacuum tunnels. Its passengers are dead knights repeating their final boarding call.",
    choices: [
      {
        label: "Board and duel the conductor's shade",
        effect: (state) => resolveCombat(state, 14, 4, { cores: 2, resolve: 1 }),
      },
      {
        label: "Sync your suit beacon to the route AI",
        effect: (state) => techCheck(state, 7, "You inherit hidden rail vectors and bypass two kill-zones.", { depth: 1, cores: 1 }),
      },
      {
        label: "Honor the dead; offer a memory shard",
        effect: (state) => {
          state.resolve += 2;
          state.attack -= 1;
          log("The ghosts salute. Your certainty strengthens as aggression cools.", "system");
        },
      },
    ],
  },
  {
    id: "forge",
    title: "The Proto-Forge of Saint Argon",
    scene: "vault",
    text:
      "An automated forge requests a litany from old Earth orders. It can reforge your armament once, but the process is unstable.",
    choices: [
      {
        label: "Reforge into a phase-lance (+3 attack, -1 resolve)",
        effect: (state) => {
          state.attack += 3;
          state.resolve = Math.max(1, state.resolve - 1);
          log("Your weapon refracts through dimensions and thirsts for decisive conflict.", "warning");
        },
      },
      {
        label: "Install guardian runes (+3 max hp, heal 2)",
        effect: (state) => {
          state.maxHp += 3;
          state.hp = Math.min(state.maxHp, state.hp + 2);
          log("Runic plating seals over your armor seams.", "success");
        },
      },
      {
        label: "Donate cores to bless future incarnations (-2 run cores, +legacy)",
        requirement: (state) => state.cores >= 2,
        effect: (state) => {
          state.cores -= 2;
          state.bonusLegacy += 2;
          log("The forge brands your lineage. Future runs will remember this sacrifice.", "success");
        },
      },
    ],
  },
];

const eventMap = Object.fromEntries(eventDeck.map((event) => [event.id, event]));

const metaDefaults = {
  runs: 0,
  cores: 0,
  powerTier: 1,
  bestDepth: 0,
};

const metaKey = "space-labyrinth-meta";
const form = document.getElementById("start-form");
const classSelect = document.getElementById("class-select");
const aimSelect = document.getElementById("aim-select");
const artScreen = document.getElementById("art-screen");
const statsNode = document.getElementById("stats");
const logNode = document.getElementById("log");
const choiceNode = document.getElementById("choices");

let meta = loadMeta();
let runState = null;

populateSelects();
renderMeta();
renderIdleState();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  startRun(classSelect.value, aimSelect.value);
});

function populateSelects() {
  classSelect.innerHTML = classes
    .map((rpgClass) => `<option value="${rpgClass.id}">${rpgClass.name} — ${rpgClass.description}</option>`)
    .join("");

  aimSelect.innerHTML = aims
    .map((aim) => `<option value="${aim.id}">${aim.name} — ${aim.description}</option>`)
    .join("");
}

function loadMeta() {
  try {
    const parsed = JSON.parse(localStorage.getItem(metaKey) || "null");
    return { ...metaDefaults, ...(parsed || {}) };
  } catch {
    return { ...metaDefaults };
  }
}

function saveMeta() {
  try {
    localStorage.setItem(metaKey, JSON.stringify(meta));
  } catch {
    log("Unable to persist metaprogression in this browser session.", "warning");
  }
}

function renderMeta() {
  document.getElementById("meta-runs").textContent = meta.runs;
  document.getElementById("meta-cores").textContent = meta.cores;
  document.getElementById("meta-tier").textContent = meta.powerTier;
}

function renderIdleState() {
  runState = null;
  artScreen.textContent = asciiScenes.start;
  statsNode.innerHTML = "<p>Select a class and mission aim to begin a new incursion.</p>";
  choiceNode.innerHTML = "";
}

function startRun(classId, aimId) {
  const selectedClass = classes.find((rpgClass) => rpgClass.id === classId);
  const selectedAim = aims.find((aim) => aim.id === aimId);
  if (!selectedClass || !selectedAim) {
    log("Invalid launch parameters. Select a class and mission and try again.", "danger");
    return;
  }

  const entrance = entrances[Math.floor(Math.random() * entrances.length)];
  const tierBonus = Math.max(0, meta.powerTier - 1);

  runState = {
    classId,
    aimId,
    className: selectedClass.name,
    aimName: selectedAim.name,
    entrance,
    hp: selectedClass.stats.hp + tierBonus * 2,
    maxHp: selectedClass.stats.hp + tierBonus * 2,
    attack: selectedClass.stats.attack + tierBonus,
    tech: selectedClass.stats.tech + Math.floor(tierBonus / 2),
    resolve: selectedClass.stats.resolve + Math.floor(tierBonus / 2),
    depth: 1,
    cores: 0,
    pilgrimsSaved: 0,
    humanityLost: false,
    bonusLegacy: 0,
    shieldReady: selectedClass.id === "vanguard",
    canForkChoice: selectedClass.id === "cipher",
    regen: selectedClass.id === "starseer",
    complete: false,
  };

  logNode.innerHTML = "";
  log(`Run initialized: ${runState.className} entering through ${entrance}.`, "system");
  log(`Mission Aim: ${runState.aimName}.`, "system");
  log(`Class Passive: ${selectedClass.passive}`, "system");

  artScreen.textContent = asciiScenes.start;
  renderStats();
  nextEvent();
}

function nextEvent() {
  if (!runState || runState.complete) {
    return;
  }

  if (runState.hp <= 0) {
    concludeRun(false, "Your suit life-signs flatline. The labyrinth claims another challenger.");
    return;
  }

  if (runState.depth >= 7) {
    concludeRun(true, "You reach extraction with relic fire in your hands and legends in your wake.");
    return;
  }

  runState.depth += 1;
  if (runState.classId === "vanguard") {
    runState.shieldReady = true;
  }

  const weightedEvents = [...eventDeck];
  if (runState.aimId === "sovereign" && eventMap.throne) {
    weightedEvents.push(eventMap.throne);
  }
  if (runState.aimId === "pilgrim" && eventMap.pilgrims) {
    weightedEvents.push(eventMap.pilgrims);
  }
  if (runState.aimId === "core" && eventMap.echo_market) {
    weightedEvents.push(eventMap.echo_market);
  }

  const event = weightedEvents[Math.floor(Math.random() * weightedEvents.length)];
  showEvent(event);
}

function showEvent(event) {
  artScreen.textContent = asciiScenes[event.scene] || asciiScenes.start;
  log(`== ${event.title} ==`, "system");
  log(event.text);

  const availableChoices = event.choices.filter((choice) => !choice.requirement || choice.requirement(runState));
  if (runState.canForkChoice && availableChoices.length >= 2) {
    availableChoices.push({
      label: "Cipher Override: execute first two options sequentially",
      effect: (state) => {
        availableChoices[0].effect(state);
        if (state.hp > 0) {
          availableChoices[1].effect(state);
        }
      },
    });
  }

  choiceNode.innerHTML = "";
  availableChoices.forEach((choice, index) => {
    const btn = document.createElement("button");
    btn.textContent = `${index + 1}. ${choice.label}`;
    btn.addEventListener("click", () => {
      lockChoices();
      choice.effect(runState);
      normalizeState(runState);
      if (runState.regen && runState.hp > 0) {
        runState.hp = Math.min(runState.maxHp, runState.hp + 1);
        log("Starseer grace restores 1 HP.", "success");
      }
      renderStats();
      nextEvent();
    });
    choiceNode.appendChild(btn);
  });

  renderStats();
}

function lockChoices() {
  choiceNode.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
  });
}

function normalizeState(state) {
  state.hp = Math.min(state.maxHp, state.hp);
  state.cores = Math.max(0, state.cores);
  state.attack = Math.max(1, state.attack);
  state.tech = Math.max(1, state.tech);
  state.resolve = Math.max(1, state.resolve);
}

function resolveCombat(state, enemyHp, enemyDamage, reward = { cores: 2 }) {
  let effectiveDamage = enemyDamage;
  if (state.shieldReady) {
    effectiveDamage = Math.max(0, enemyDamage - 2);
    state.shieldReady = false;
    log("Ion Vanguard shield protocol absorbs initial impact.", "success");
  }

  const playerPower = state.attack + roll(6);
  const enemyPower = enemyHp + roll(4);

  if (playerPower >= enemyPower) {
    applyRewards(state, reward);
    log("You overwhelm the hostile with decisive strikes.", "success");
  } else {
    state.hp -= effectiveDamage;
    log(`The enemy lands critical damage (-${effectiveDamage} HP).`, "danger");
  }
}

function techCheck(state, difficulty, successMessage, successRewards = {}) {
  const score = state.tech + roll(6);
  if (score >= difficulty) {
    applyRewards(state, successRewards);
    log(successMessage, "success");
  } else {
    state.hp -= 2;
    log("Your hack backfires and burns your neural link (-2 HP).", "danger");
  }
}

function resolveCheck(state, difficulty, successMessage, successRewards = {}) {
  const score = state.resolve + roll(6);
  if (score >= difficulty) {
    applyRewards(state, successRewards);
    log(successMessage, "success");
  } else {
    state.hp -= 2;
    log("Doubt fractures your timing. You suffer backlash (-2 HP).", "danger");
  }
}

function applyRewards(state, rewards) {
  Object.entries(rewards).forEach(([key, value]) => {
    state[key] = (state[key] || 0) + value;
  });
}

function concludeRun(victory, narrative) {
  runState.complete = true;
  artScreen.textContent = asciiScenes.extract;
  log(narrative, victory ? "success" : "danger");

  let coreReward = runState.cores + Math.floor(runState.depth / 2) + (victory ? 3 : 1) + runState.bonusLegacy;
  if (runState.aimId === "core") {
    coreReward += 2;
  }
  if (runState.aimId === "pilgrim") {
    coreReward += Math.floor(runState.pilgrimsSaved / 2);
  }
  if (runState.aimId === "sovereign" && runState.humanityLost) {
    coreReward += 2;
  }
  coreReward = Math.max(1, coreReward);

  meta.runs += 1;
  meta.cores += coreReward;
  meta.bestDepth = Math.max(meta.bestDepth, runState.depth);
  meta.powerTier = 1 + Math.floor(meta.cores / 10);
  saveMeta();
  renderMeta();

  log(
    `Run concluded. You earned ${coreReward} Legacy Cores. Pilgrims saved: ${runState.pilgrimsSaved}.`,
    "system",
  );
  if (runState.humanityLost) {
    log("Your next incarnation begins with machine whispers in its dreams.", "warning");
  }

  choiceNode.innerHTML = "";
  const restart = document.createElement("button");
  restart.textContent = "Prepare Another Run";
  restart.addEventListener("click", () => renderIdleState());
  choiceNode.appendChild(restart);

  renderStats();
}

function renderStats() {
  if (!runState) {
    return;
  }
  statsNode.innerHTML = [
    stat("Class", runState.className),
    stat("Aim", runState.aimName),
    stat("Entrance", runState.entrance),
    stat("Depth", runState.depth),
    stat("HP", `${Math.max(0, runState.hp)} / ${runState.maxHp}`),
    stat("Attack", runState.attack),
    stat("Tech", runState.tech),
    stat("Resolve", runState.resolve),
    stat("Run Cores", runState.cores),
    stat("Pilgrims Saved", runState.pilgrimsSaved),
  ].join("");
}

function stat(label, value) {
  return `<div class="stat-line"><span>${label}</span><strong>${value}</strong></div>`;
}

function log(text, tone = "") {
  const p = document.createElement("p");
  p.textContent = text;
  if (tone) {
    p.classList.add(tone);
  }
  logNode.appendChild(p);
  logNode.scrollTop = logNode.scrollHeight;
}

function roll(sides) {
  return Math.floor(Math.random() * sides) + 1;
}
