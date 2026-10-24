
"use strict";

/*
 * Движок боя «Повелитель тайн».
 * Важно: вызывающий серверный обработчик должен сохранить возвращённое
 * состояние боя в хранилище после каждого хода.
 */

const MONSTER_SKILLS = {
  "Утопленник": [
    {
      id: "drowned_strike",
      name: "Тяжёлый удар",
      chance: 0.30,
      cooldown: 2,
      multiplier: 1.5,
      text: "Утопленник обрушил тяжёлый удар!"
    },
    {
      id: "deadly_embrace",
      name: "Мёртвая хватка",
      chance: 0.22,
      cooldown: 3,
      minDamage: 5,
      maxDamage: 10,
      stun: 1,
      text: "Утопленник схватил тебя ледяными руками!"
    },
    {
      id: "drowning_poison",
      name: "Гнилая вода",
      chance: 0.18,
      cooldown: 3,
      poisonPercent: 0.05,
      poisonTurns: 2,
      text: "Утопленник выплеснул на тебя заражённую воду!"
    }
  ],

  "Жаба": [
    {
      id: "water_jet",
      name: "Водяная струя",
      chance: 0.30,
      cooldown: 2,
      minDamage: 10,
      maxDamage: 20,
      text: "Жаба выпустила мощную струю воды!"
    },
    {
      id: "leap_attack",
      name: "Прыжок из тумана",
      chance: 0.25,
      cooldown: 3,
      multiplier: 1.6,
      text: "Жаба выскочила из тумана и ударила!"
    }
  ],

  "Лягушка": [
    {
      id: "water_jet",
      name: "Водяная струя",
      chance: 0.30,
      cooldown: 2,
      minDamage: 10,
      maxDamage: 20,
      text: "Лягушка выпустила мощную струю воды!"
    },
    {
      id: "leap_attack",
      name: "Прыжок из тумана",
      chance: 0.25,
      cooldown: 3,
      multiplier: 1.6,
      text: "Лягушка выскочила из тумана и ударила!"
    }
  ]
};

const PLAYER_SKILLS = {
  tyrant: {
    strong_strike: {
      name: "Сильный удар",
      cooldown: 2,
      damage: state =>
        Math.max(1, Math.floor(10 + getPlayerStat(state, "strength") * 0.4))
    },
    drink: {
      name: "Перепить",
      cooldown: 3,
      stun: 2
    },
    rage: {
      name: "Гнев",
      cooldown: 2,
      multiplier: 2
    }
  },

  priest: {
    berserk: {
      name: "Берсерк",
      cooldown: 2,
      costHp: 25,
      damage: state =>
        Math.max(1, Math.floor(getPlayerStat(state, "strength")))
    },
    trap: {
      name: "Ловушка",
      cooldown: 3,
      stun: 2
    },
    provoke: {
      name: "Провокация",
      cooldown: 1,
      accuracyDebuff: 25
    }
  }
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeEnemy(name) {
  if (name === "Лягушка") return "Жаба";
  return name || "Утопленник";
}

function normalizePath(path) {
  const value = String(path || "").toLowerCase();

  if (
    value.includes("tyrant") ||
    value.includes("sailor") ||
    value.includes("тиран") ||
    value.includes("море") ||
    value.includes("моряк")
  ) {
    return "tyrant";
  }

  if (
    value.includes("priest") ||
    value.includes("hunter") ||
    value.includes("жрец") ||
    value.includes("охотник")
  ) {
    return "priest";
  }

  return "";
}

function getPlayerStat(state, name) {
  const stats = state.player_stats || state.stats || {};
  const aliases = {
    strength: ["strength", "str", "сила"],
    agility: ["agility", "agi", "ловкость", "ловк"],
    accuracy: ["accuracy", "aim", "меткость", "метк"]
  };

  for (const key of aliases[name] || [name]) {
    if (stats[key] != null && Number.isFinite(Number(stats[key]))) {
      return Number(stats[key]);
    }

    if (state[key] != null && Number.isFinite(Number(state[key]))) {
      return Number(state[key]);
    }
  }

  return 10;
}

function ensureBattleState(state) {
  if (!state || typeof state !== "object") {
    throw new Error("Не передано состояние боя.");
  }

  state.enemy = normalizeEnemy(state.enemy || state.enemy_name);

  state.player_hp = Number(state.player_hp ?? state.hp ?? 100);
  state.player_max_hp = Number(
    state.player_max_hp ?? state.max_hp ?? state.player_hp
  );

  state.enemy_hp = Number(state.enemy_hp ?? state.monster_hp ?? 50);
  state.enemy_max_hp = Number(
    state.enemy_max_hp ?? state.monster_max_hp ?? state.enemy_hp
  );

  state.player_madness = Number(
    state.player_madness ?? state.madness ?? 0
  );

  state.round = Number(state.round || 0);

  state.path = state.path || state.player_path || "";

  if (!state.monster_cds || typeof state.monster_cds !== "object") {
    state.monster_cds = {};
  }

  if (!state.player_cds || typeof state.player_cds !== "object") {
    state.player_cds = {};
  }

  if (!state.player_effects || typeof state.player_effects !== "object") {
    state.player_effects = {};
  }

  if (!state.enemy_effects || typeof state.enemy_effects !== "object") {
    state.enemy_effects = {};
  }

  state.player_hp = clamp(
    state.player_hp,
    0,
    Math.max(1, state.player_max_hp)
  );

  state.enemy_hp = clamp(
    state.enemy_hp,
    0,
    Math.max(1, state.enemy_max_hp)
  );

  state.player_madness = clamp(state.player_madness, 0, 100);

  return state;
}

function tickCooldowns(cooldowns) {
  for (const id of Object.keys(cooldowns)) {
    cooldowns[id] = Math.max(0, Number(cooldowns[id] || 0) - 1);
  }
}

function addLog(logs, kind, text) {
  logs.push({ kind, text });
}

function applyPlayerEffects(state, logs) {
  const effects = state.player_effects;

  if (effects.poison && Number(effects.poison.turns) > 0) {
    const damage = Math.min(
      state.player_hp,
      Math.max(1, Number(effects.poison.damage || 1))
    );

    state.player_hp = Math.max(0, state.player_hp - damage);
    effects.poison.turns -= 1;

    addLog(
      logs,
      "bad",
      "Яд наносит " + damage + " урона. Осталось ходов: " +
        effects.poison.turns + "."
    );

    if (effects.poison.turns <= 0) {
      delete effects.poison;
    }
  }
}

function chooseMonsterSkill(state) {
  const skills = MONSTER_SKILLS[state.enemy] || [];

  const available = skills.filter(
    skill => Number(state.monster_cds[skill.id] || 0) <= 0
  );

  for (const skill of available) {
    if (Math.random() < skill.chance) {
      return skill;
    }
  }

  return null;
}

function runMonsterTurn(rawState) {
  const state = ensureBattleState(rawState);
  const logs = [];

  if (state.player_hp <= 0 || state.enemy_hp <= 0) {
    return {
      damage: 0,
      skill_used: null,
      e_log: state.enemy + " больше не может продолжать бой.",
      logs
    };
  }

  tickCooldowns(state.monster_cds);

  const skill = chooseMonsterSkill(state);
  let damage;
  let text;

  if (!skill) {
    damage = randomInt(3, 7);
    text = state.enemy + " атакует обычным ударом.";
  } else {
    if (skill.minDamage != null) {
      damage = randomInt(skill.minDamage, skill.maxDamage);
    } else {
      damage = Math.max(
        1,
        Math.floor(randomInt(3, 7) * (skill.multiplier || 1))
      );
    }

    state.monster_cds[skill.id] = skill.cooldown;
    text = skill.text;

    if (skill.stun) {
      state.player_effects.stun_turns = Math.max(
        Number(state.player_effects.stun_turns || 0),
        skill.stun
      );
    }

    if (skill.poisonPercent) {
      const poisonDamage = Math.max(
        1,
        Math.ceil(state.player_max_hp * skill.poisonPercent)
      );

      state.player_effects.poison = {
        damage: poisonDamage,
        turns: skill.poisonTurns || 2
      };

      text += " Яд наносит " + poisonDamage + " урона за ход.";
    }
  }

  damage = Math.min(state.player_hp, damage);
  state.player_hp = Math.max(0, state.player_hp - damage);

  text += " Получено урона: " + damage + ".";

  addLog(logs, "bad", text);

  return {
    damage,
    skill_used: skill ? skill.id : null,
    enemy_skill: skill
      ? {
          id: skill.id,
          name: skill.name,
          damage,
          cooldown: skill.cooldown
        }
      : null,
    e_log: text,
    logs
  };
}

function usePlayerSkill(state, move, logs) {
  const path = normalizePath(state.path);
  const skills = PLAYER_SKILLS[path];

  if (!skills) {
    addLog(
      logs,
      "info",
      "Путь персонажа не определён. Выполнена обычная атака."
    );
    return { damage: randomInt(5, 10), skill_used: null };
  }

  const skill = skills[move];

  if (!skill) {
    return null;
  }

  if (Number(state.player_cds[move] || 0) > 0) {
    addLog(
      logs,
      "info",
      "Навык «" + skill.name + "» перезаряжается: " +
        state.player_cds[move] + " ход."
    );
    return { error: true };
  }

  if (skill.costHp && state.player_hp <= skill.costHp) {
    addLog(logs, "info", "Недостаточно здоровья для навыка «" + skill.name + "».");
    return { error: true };
  }

  state.player_cds[move] = skill.cooldown;

  if (skill.costHp) {
    state.player_hp -= skill.costHp;
    addLog(logs, "bad", "Берсерк: потрачено " + skill.costHp + " HP.");
  }

  if (skill.stun) {
    state.enemy_effects.stun_turns = Math.max(
      Number(state.enemy_effects.stun_turns || 0),
      skill.stun
    );

    addLog(logs, "good", "Ты применяешь «" + skill.name + "». Противник оглушён.");
    return { damage: 0, skill_used: move, skipEnemyTurn: true };
  }

  if (skill.accuracyDebuff) {
    state.enemy_effects.accuracy_debuff = {
      amount: skill.accuracyDebuff,
      turns: 2
    };

    addLog(
      logs,
      "good",
      "Ты применяешь «" + skill.name +
        "». Меткость противника снижена на " + skill.accuracyDebuff + "% на 2 хода."
    );

    return { damage: 0, skill_used: move };
  }

  let damage;

  if (skill.damage) {
    damage = skill.damage(state);
  } else if (skill.multiplier) {
    damage = Math.max(
      1,
      Math.floor(
        randomInt(5, 10) *
          skill.multiplier
      )
    );
  } else {
    damage = randomInt(5, 10);
  }

  damage = Math.min(state.enemy_hp, damage);
  state.enemy_hp = Math.max(0, state.enemy_hp - damage);

  addLog(
    logs,
    "good",
    "Ты применяешь «" + skill.name + "» и наносишь " + damage + " урона."
  );

  return {
    damage,
    skill_used: move,
    skipEnemyTurn: state.enemy_hp <= 0
  };
}

function makeResponse(state, extra) {
  return {
    ...extra,
    hp: state.player_hp,
    max_hp: state.player_max_hp,
    player_hp: state.player_hp,
    player_max_hp: state.player_max_hp,
    enemy_hp: state.enemy_hp,
    enemy_max_hp: state.enemy_max_hp,
    enemy: state.enemy,
    round: state.round,
    player_madness: state.player_madness,
    monster_cds: { ...state.monster_cds },
    player_cds: { ...state.player_cds },
    player_effects: { ...state.player_effects },
    enemy_effects: { ...state.enemy_effects },
    ended: Boolean(state.ended)
  };
}

function handleBattleMove(rawState, move) {
  const state = ensureBattleState(rawState);
  const logs = [];

  if (state.ended || state.player_hp <= 0 || state.enemy_hp <= 0) {
    state.ended = true;

    return makeResponse(state, {
      ok: false,
      error: "Этот бой уже завершён.",
      log: "",
      e_log: "",
      logs
    });
  }

  if (move === "flee") {
    state.ended = true;
    const text = "Ты отступаешь и покидаешь поле боя.";

    addLog(logs, "info", text);

    return makeResponse(state, {
      ok: true,
      escaped: true,
      log: text,
      e_log: "",
      logs
    });
  }

  state.round += 1;
  tickCooldowns(state.player_cds);

  // Оглушённый игрок теряет действие, но монстр всё равно ходит.
  if (Number(state.player_effects.stun_turns || 0) > 0) {
    state.player_effects.stun_turns -= 1;

    addLog(logs, "bad", "Ты оглушён и пропускаешь ход!");

    applyPlayerEffects(state, logs);

    if (state.player_hp > 0) {
      const enemyTurn = runMonsterTurn(state);
      logs.push(...enemyTurn.logs);
    }

    if (state.player_hp <= 0) state.ended = true;

    return makeResponse(state, {
      ok: true,
      lost: state.player_hp <= 0,
      log: "",
      e_log: logs.filter(x => x.kind === "bad").map(x => x.text).join("\n"),
      logs
    });
  }

  const skillResult = usePlayerSkill(state, move, logs);

  if (skillResult && skillResult.error) {
    state.round -= 1;

    return makeResponse(state, {
      ok: false,
      log: "",
      e_log: "",
      logs
    });
  }

  const isSkill = Boolean(skillResult);

  if (!isSkill) {
    const damage = Math.min(state.enemy_hp, randomInt(5, 10));
    state.enemy_hp = Math.max(0, state.enemy_hp - damage);

    addLog(
      logs,
      "good",
      "Ты наносишь " + damage + " урона противнику."
    );
  }

  if (state.enemy_hp <= 0) {
    state.ended = true;

    return makeResponse(state, {
      ok: true,
      won: true,
      log: logs.filter(x => x.kind === "good").map(x => x.text).join("\n"),
      e_log: "",
      logs
    });
  }

  // Оглушение монстра блокирует его ближайшее действие.
  if (Number(state.enemy_effects.stun_turns || 0) > 0) {
    state.enemy_effects.stun_turns -= 1;
    addLog(logs, "good", state.enemy + " оглушён и пропускает ход.");
  } else if (!(skillResult && skillResult.skipEnemyTurn)) {
    const enemyTurn = runMonsterTurn(state);
    logs.push(...enemyTurn.logs);
  }

  applyPlayerEffects(state, logs);

  if (state.player_hp <= 0 || state.enemy_hp <= 0) {
    state.ended = true;
  }

  return makeResponse(state, {
    ok: true,
    won: state.enemy_hp <= 0,
    lost: state.player_hp <= 0,
    log: logs
      .filter(x => x.kind === "good" || x.kind === "info")
      .map(x => x.text)
      .join("\n"),
    e_log: logs
      .filter(x => x.kind === "bad")
      .map(x => x.text)
      .join("\n"),
    logs
  });
}

module.exports = {
  MONSTER_SKILLS,
  PLAYER_SKILLS,
  ensureBattleState,
  runMonsterTurn,
  handleBattleMove
};
