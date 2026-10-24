
"use strict";

/*
 * Движок боя «Повелитель тайн».
 *
 * Экспортируется для подключения к серверу через require("./battle-handler").
 * Сервер должен сохранять возвращённое состояние боя после каждого хода.
 */

const MONSTER_SKILLS = {
  "Утопленник": [
    {
      id: "drowned_strike",
      name: "Тяжёлый удар",
      chance: 0.30,
      cooldown: 2,
      multiplier: 1.5,
      text: "Утопленник обрушивает тяжёлый удар!"
    },
    {
      id: "deadly_embrace",
      name: "Мёртвая хватка",
      chance: 0.22,
      cooldown: 3,
      minDamage: 5,
      maxDamage: 10,
      stun: 1,
      text: "Утопленник хватает тебя ледяными руками!"
    },
    {
      id: "drowning_poison",
      name: "Гнилая вода",
      chance: 0.18,
      cooldown: 3,
      poisonPercent: 0.05,
      poisonTurns: 2,
      text: "Утопленник выплёскивает заражённую воду!"
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
      text: "Жаба выпускает мощную струю воды!"
    },
    {
      id: "leap_attack",
      name: "Прыжок из тумана",
      chance: 0.25,
      cooldown: 3,
      multiplier: 1.6,
      text: "Жаба выскакивает из тумана и наносит удар!"
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
      text: "Лягушка выпускает мощную струю воды!"
    },
    {
      id: "leap_attack",
      name: "Прыжок из тумана",
      chance: 0.25,
      cooldown: 3,
      multiplier: 1.6,
      text: "Лягушка выскакивает из тумана и наносит удар!"
    }
  ]
};

/*
 * ВАЖНО:
 * Ключи ниже совпадают с теми, которые отправляет интерфейс:
 * sailor_hit, sailor_drink, sailor_pray,
 * hunter_dagger, hunter_trap, hunter_boost.
 */

const PLAYER_SKILLS = {
  tyrant: {
    sailor_hit: {
      name: "Сильный удар",
      cooldown: 2,
      damage: state =>
        Math.max(1, Math.floor(10 + getStat(state, "strength") * 0.4))
    },

    sailor_drink: {
      name: "Перепить",
      cooldown: 3,
      stun: 1
    },

    sailor_pray: {
      name: "Гнев",
      cooldown: 2,
      multiplier: 2
    }
  },

  hunter: {
    hunter_dagger: {
      name: "Берсерк",
      cooldown: 2,
      costHp: 5,
      multiplier: 2
    },

    hunter_trap: {
      name: "Ловушка",
      cooldown: 3,
      stun: 1
    },

    hunter_boost: {
      name: "Провокация",
      cooldown: 2,
      accuracyDebuff: 35
    }
  },

  fool: {
    divination: {
      name: "Гадание",
      cooldown: 2,
      accuracyDebuff: 20
    },

    boomerang: {
      name: "Бумеранг",
      cooldown: 2,
      multiplier: 1.5
    },

    acting: {
      name: "Актёрство",
      cooldown: 3,
      healPercent: 0.10
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
    value.includes("моряк") ||
    value.includes("море")
  ) {
    return "tyrant";
  }

  if (
    value.includes("hunter") ||
    value.includes("охотник") ||
    value.includes("жрец") ||
    value.includes("priest") ||
    value.includes("красный")
  ) {
    return "hunter";
  }

  if (
    value.includes("fool") ||
    value.includes("шут") ||
    value.includes("дурак")
  ) {
    return "fool";
  }

  return "";
}

function getStat(state, name) {
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

  state.path = state.path || state.player_path || "";
  state.round = Number(state.round || 0);
  state.ended = Boolean(state.ended);

  state.player_madness = Number(
    state.player_madness ?? state.madness ?? 0
  );

  state.player_cds ||= {};
  state.monster_cds ||= {};
  state.player_effects ||= {};
  state.enemy_effects ||= {};

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

function addLog(logs, kind, text) {
  logs.push({ kind, text });
}

function tickCooldowns(cooldowns) {
  for (const key of Object.keys(cooldowns)) {
    cooldowns[key] = Math.max(0, Number(cooldowns[key] || 0) - 1);
  }
}

function getSkillCooldown(state, move) {
  const aliases = {
    sailor_hit: ["sailor_hit", "hit"],
    sailor_drink: ["sailor_drink", "drink"],
    sailor_pray: ["sailor_pray", "pray"],
    hunter_dagger: ["hunter_dagger", "dagger"],
    hunter_trap: ["hunter_trap", "trap"],
    hunter_boost: ["hunter_boost", "boost"],
    divination: ["divination"],
    boomerang: ["boomerang"],
    acting: ["acting"],
    basic: ["basic"]
  };

  const keys = aliases[move] || [move];

  for (const key of keys) {
    if (state.player_cds[key] != null) {
      return Number(state.player_cds[key]) || 0;
    }
  }

  return 0;
}

function setSkillCooldown(state, move, value) {
  state.player_cds[move] = value;

  const aliases = {
    sailor_hit: "hit",
    sailor_drink: "drink",
    sailor_pray: "pray",
    hunter_dagger: "dagger",
    hunter_trap: "trap",
    hunter_boost: "boost"
  };

  const alias = aliases[move];
  if (alias) state.player_cds[alias] = value;
}

function getFrontendCooldowns(state) {
  return {
    ...state.player_cds,
    hit: state.player_cds.sailor_hit || state.player_cds.hit || 0,
    drink: state.player_cds.sailor_drink || state.player_cds.drink || 0,
    pray: state.player_cds.sailor_pray || state.player_cds.pray || 0,
    dagger: state.player_cds.hunter_dagger || state.player_cds.dagger || 0,
    trap: state.player_cds.hunter_trap || state.player_cds.trap || 0,
    boost: state.player_cds.hunter_boost || state.player_cds.boost || 0
  };
}

function chooseMonsterSkill(state) {
  const skills = MONSTER_SKILLS[state.enemy] || [];

  const available = skills.filter(
    skill => Number(state.monster_cds[skill.id] || 0) <= 0
  );

  for (const skill of available) {
    if (Math.random() < skill.chance) return skill;
  }

  return null;
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
      "Яд наносит " + damage + " урона."
    );

    if (effects.poison.turns <= 0) {
      delete effects.poison;
      addLog(logs, "info", "Действие яда заканчивается.");
    }
  }

  if (effects.accuracy_debuff && effects.accuracy_debuff.turns > 0) {
    effects.accuracy_debuff.turns -= 1;

    if (effects.accuracy_debuff.turns <= 0) {
      delete effects.accuracy_debuff;
    }
  }
}

function runMonsterTurn(rawState) {
  const state = ensureBattleState(rawState);
  const logs = [];

  if (state.player_hp <= 0 || state.enemy_hp <= 0) {
    return {
      damage: 0,
      skill_used: null,
      e_log: "",
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
      text += " Ты оглушён!";
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

      text += " Наложено отравление.";
    }
  }

  if (state.player_effects.accuracy_debuff) {
    const chance = clamp(
      Number(state.player_effects.accuracy_debuff.amount || 0),
      0,
      90
    );

    if (Math.random() < chance / 100) {
      damage = 0;
      text += " Ты уклоняешься от атаки благодаря эффекту.";
    }
  }

  damage = Math.min(state.player_hp, damage);
  state.player_hp = Math.max(0, state.player_hp - damage);

  if (damage > 0) {
    text += " Получено урона: " + damage + ".";
  }

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
  const skills = PLAYER_SKILLS[path] || {};
  const skill = skills[move];

  if (!skill) return null;

  const cooldown = getSkillCooldown(state, move);

  if (cooldown > 0) {
    addLog(
      logs,
      "info",
      "Навык «" + skill.name + "» перезаряжается. Осталось ходов: " +
        cooldown + "."
    );

    return { error: "cooldown", skill };
  }

  if (skill.costHp && state.player_hp <= skill.costHp) {
    addLog(
      logs,
      "info",
      "Недостаточно здоровья для навыка «" + skill.name + "»."
    );

    return { error: "health", skill };
  }

  setSkillCooldown(state, move, skill.cooldown);

  if (skill.costHp) {
    state.player_hp -= skill.costHp;
    addLog(
      logs,
      "bad",
      "Навык «" + skill.name + "»: потрачено " + skill.costHp + " HP."
    );
  }

  if (skill.healPercent) {
    const heal = Math.min(
      state.player_max_hp - state.player_hp,
      Math.max(1, Math.floor(state.player_max_hp * skill.healPercent))
    );

    state.player_hp += heal;

    addLog(
      logs,
      "good",
      "Ты используешь «" + skill.name + "» и восстанавливаешь " + heal + " HP."
    );

    return { damage: 0, skill_used: move };
  }

  if (skill.stun) {
    state.enemy_effects.stun_turns = Math.max(
      Number(state.enemy_effects.stun_turns || 0),
      skill.stun
    );

    addLog(
      logs,
      "good",
      "Ты используешь «" + skill.name + "». Противник оглушён!"
    );

    return {
      damage: 0,
      skill_used: move,
      skipEnemyTurn: true
    };
  }

  if (skill.accuracyDebuff) {
    state.enemy_effects.accuracy_debuff = {
      amount: skill.accuracyDebuff,
      turns: 2
    };

    addLog(
      logs,
      "good",
      "Ты используешь «" + skill.name +
        "». Меткость противника снижена на " +
        skill.accuracyDebuff + "%."
    );

    return { damage: 0, skill_used: move };
  }

  let damage;

  if (skill.damage) {
    damage = skill.damage(state);
  } else if (skill.multiplier) {
    damage = Math.floor(randomInt(5, 10) * skill.multiplier);
  } else {
    damage = randomInt(5, 10);
  }

  damage = Math.max(1, Math.min(state.enemy_hp, damage));
  state.enemy_hp = Math.max(0, state.enemy_hp - damage);

  addLog(
    logs,
    "good",
    "Ты используешь «" + skill.name + "» и наносишь " +
      damage + " урона."
  );

  return {
    damage,
    skill_used: move,
    skipEnemyTurn: state.enemy_hp <= 0
  };
}

function makeResponse(state, extra = {}) {
  return {
    ...extra,
    hp: state.player_hp,
    max_hp: state.player_max_hp,
    player_hp: state.player_hp,
    player_max_hp: state.player_max_hp,
    enemy: state.enemy,
    enemy_hp: state.enemy_hp,
    enemy_max: state.enemy_max_hp,
    enemy_max_hp: state.enemy_max_hp,
    round: state.round,
    cds: getFrontendCooldowns(state),
    player_cds: { ...state.player_cds },
    monster_cds: { ...state.monster_cds },
    player_effects: { ...state.player_effects },
    enemy_effects: { ...state.enemy_effects },
    player_madness: state.player_madness,
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
      error: "dead",
      text: "Этот бой уже завершён.",
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
      type: "flee",
      escaped: true,
      log: text,
      e_log: "",
      logs
    });
  }

  const path = normalizePath(state.path);
  const knownMoves = [
    "basic",
    ...Object.keys(PLAYER_SKILLS.tyrant),
    ...Object.keys(PLAYER_SKILLS.hunter),
    ...Object.keys(PLAYER_SKILLS.fool)
  ];

  if (!knownMoves.includes(move)) {
    return makeResponse(state, {
      ok: false,
      error: "unknown_move",
      text: "Неизвестное действие: " + String(move),
      log: "",
      e_log: "",
      logs
    });
  }

  const skillMap = PLAYER_SKILLS[path] || {};

  if (move !== "basic" && !skillMap[move]) {
    return makeResponse(state, {
      ok: false,
      error: "wrong_path",
      text: "Этот навык недоступен для твоего пути.",
      log: "",
      e_log: "",
      logs
    });
  }

  if (move !== "basic" && getSkillCooldown(state, move) > 0) {
    const skill = skillMap[move];

    return makeResponse(state, {
      ok: false,
      error: "cooldown",
      text: "Навык «" + skill.name + "» ещё перезаряжается.",
      log: "",
      e_log: "",
      logs
    });
  }

  state.round += 1;

  // Перезарядка уменьшается после проверки, чтобы ход не обходил cooldown.
  tickCooldowns(state.player_cds);
  tickCooldowns(state.enemy_effects);

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
      type: state.player_hp <= 0 ? "defeat" : "battle",
      lost: state.player_hp <= 0,
      log: logs.filter(x => x.kind !== "bad").map(x => x.text).join("\n"),
      e_log: logs.filter(x => x.kind === "bad").map(x => x.text).join("\n"),
      logs
    });
  }

  let skillResult;

  if (move === "basic") {
    const damage = Math.min(state.enemy_hp, randomInt(5, 10));
    state.enemy_hp = Math.max(0, state.enemy_hp - damage);

    addLog(
      logs,
      "good",
      "Ты наносишь обычной атакой " + damage + " урона."
    );

    skillResult = {
      damage,
      skill_used: "basic",
      skipEnemyTurn: state.enemy_hp <= 0
    };
  } else {
    skillResult = usePlayerSkill(state, move, logs);

    if (skillResult && skillResult.error) {
      state.round -= 1;

      return makeResponse(state, {
        ok: false,
        error: skillResult.error,
        text: logs.map(x => x.text).join("\n"),
        log: "",
        e_log: "",
        logs
      });
    }
  }

  if (state.enemy_hp <= 0) {
    state.ended = true;

    return makeResponse(state, {
      ok: true,
      type: "victory",
      won: true,
      log: logs.filter(x => x.kind === "good").map(x => x.text).join("\n"),
      e_log: "",
      logs
    });
  }

  if (Number(state.enemy_effects.stun_turns || 0) > 0) {
    state.enemy_effects.stun_turns -= 1;
    addLog(logs, "good", state.enemy + " оглушён и пропускает ход.");
  } else if (!(skillResult && skillResult.skipEnemyTurn)) {
    const enemyTurn = runMonsterTurn(state);
    logs.push(...enemyTurn.logs);
  }

  applyPlayerEffects(state, logs);

  if (state.player_hp <= 0) {
    state.ended = true;

    return makeResponse(state, {
      ok: true,
      type: "defeat",
      lost: true,
      text: "Здоровье закончилось. Сражение окончено.",
      log: logs.filter(x => x.kind === "good").map(x => x.text).join("\n"),
      e_log: logs.filter(x => x.kind === "bad").map(x => x.text).join("\n"),
      logs
    });
  }

  if (state.enemy_hp <= 0) {
    state.ended = true;

    return makeResponse(state, {
      ok: true,
      type: "victory",
      won: true,
      log: logs.filter(x => x.kind === "good").map(x => x.text).join("\n"),
      e_log: logs.filter(x => x.kind === "bad").map(x => x.text).join("\n"),
      logs
    });
  }

  return makeResponse(state, {
    ok: true,
    type: "battle",
    won: false,
    lost: false,
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
