
"use strict";

/*
 * Движок боя с монстрами.
 * После каждого хода вызывающий код обязан сохранить изменённое состояние боя.
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

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeEnemy(name) {
  return name === "Лягушка" ? "Жаба" : (name || "Утопленник");
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

  if (!state.monster_cds || typeof state.monster_cds !== "object") {
    state.monster_cds = {};
  }

  if (!state.player_effects || typeof state.player_effects !== "object") {
    state.player_effects = {};
  }

  state.player_hp = clamp(state.player_hp, 0, Math.max(1, state.player_max_hp));
  state.enemy_hp = clamp(state.enemy_hp, 0, Math.max(1, state.enemy_max_hp));
  state.player_madness = clamp(state.player_madness, 0, 100);

  return state;
}

function tickMonsterCooldowns(state) {
  for (const id of Object.keys(state.monster_cds)) {
    state.monster_cds[id] = Math.max(
      0,
      Number(state.monster_cds[id] || 0) - 1
    );
  }
}

function applyPlayerEffects(state) {
  const logs = [];
  const effects = state.player_effects;

  if (effects.poison && effects.poison.turns > 0 && state.player_hp > 0) {
    const damage = Math.min(
      state.player_hp,
      Math.max(1, Number(effects.poison.damage || 1))
    );

    state.player_hp = Math.max(0, state.player_hp - damage);
    effects.poison.turns -= 1;

    logs.push({
      kind: "bad",
      text: "Яд наносит " + damage +
        " урона. Осталось ходов: " + effects.poison.turns + "."
    });

    if (effects.poison.turns <= 0) {
      delete effects.poison;
    }
  }

  return logs;
}

function runMonsterTurn(rawState) {
  const state = ensureBattleState(rawState);

  if (state.player_hp <= 0 || state.enemy_hp <= 0) {
    return {
      damage: 0,
      skill_used: null,
      e_log: state.enemy + " больше не может продолжать бой.",
      logs: []
    };
  }

  const effects = state.player_effects;

  if (Number(effects.stun_turns || 0) > 0) {
    effects.stun_turns = Number(effects.stun_turns) - 1;

    const text = state.enemy + " оглушил тебя. Ты не можешь двигаться!";

    return {
      damage: 0,
      skill_used: null,
      e_log: text,
      logs: [{ kind: "bad", text }]
    };
  }

  tickMonsterCooldowns(state);

  const skills = MONSTER_SKILLS[state.enemy] || [];
  const available = skills.filter(
    skill => Number(state.monster_cds[skill.id] || 0) <= 0
  );

  let usedSkill = null;

  for (const skill of available) {
    if (Math.random() < skill.chance) {
      usedSkill = skill;
      break;
    }
  }

  let damage;
  let logText;

  if (!usedSkill) {
    damage = randomInt(3, 7);
    logText = state.enemy +
      " атакует обычным ударом и наносит " + damage + " урона.";
  } else {
    if (usedSkill.minDamage != null) {
      damage = randomInt(usedSkill.minDamage, usedSkill.maxDamage);
    } else {
      damage = Math.max(
        1,
        Math.floor(randomInt(3, 7) * (usedSkill.multiplier || 1))
      );
    }

    state.monster_cds[usedSkill.id] = usedSkill.cooldown;
    logText = usedSkill.text;

    if (usedSkill.stun) {
      state.player_effects.stun_turns = Math.max(
        Number(state.player_effects.stun_turns || 0),
        usedSkill.stun
      );
    }

    if (usedSkill.poisonPercent) {
      const poisonDamage = Math.max(
        1,
        Math.ceil(state.player_max_hp * usedSkill.poisonPercent)
      );

      state.player_effects.poison = {
        damage: poisonDamage,
        turns: usedSkill.poisonTurns || 2
      };

      logText += " Яд будет наносить " +
        poisonDamage + " урона за ход.";
    }
  }

  damage = Math.min(state.player_hp, damage);
  state.player_hp = Math.max(0, state.player_hp - damage);

  logText += " Получено урона: " + damage + ".";

  const result = {
    damage,
    skill_used: usedSkill ? usedSkill.id : null,
    enemy_skill: usedSkill
      ? {
          id: usedSkill.id,
          name: usedSkill.name,
          damage,
          cooldown: usedSkill.cooldown
        }
      : null,
    e_log: logText,
    logs: [{ kind: "bad", text: logText }]
  };

  return result;
}

function makeResponse(state, extra) {
  return {
    ...extra,
    hp: state.player_hp,
    max_hp: state.player_max_hp,
    enemy_hp: state.enemy_hp,
    enemy_max_hp: state.enemy_max_hp,
    enemy: state.enemy,
    round: state.round,
    player_madness: state.player_madness,
    monster_cds: { ...state.monster_cds },
    player_effects: { ...state.player_effects },
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

    return makeResponse(state, {
      ok: true,
      escaped: true,
      log: text,
      e_log: "",
      logs: [{ kind: "info", text }]
    });
  }

  // Базовая атака игрока. Навыки путей подключим отдельно.
  const playerDamage = randomInt(5, 10);

  state.enemy_hp = Math.max(0, state.enemy_hp - playerDamage);
  state.round += 1;

  logs.push({
    kind: "good",
    text: "Ты наносишь " + playerDamage + " урона противнику."
  });

  if (state.enemy_hp <= 0) {
    state.ended = true;

    return makeResponse(state, {
      ok: true,
      won: true,
      log: logs[0].text,
      e_log: "",
      logs
    });
  }

  logs.push(...applyPlayerEffects(state));

  if (state.player_hp > 0) {
    const enemyTurn = runMonsterTurn(state);

    if (enemyTurn.logs) {
      logs.push(...enemyTurn.logs);
    }
  }

  if (state.player_hp <= 0 || state.enemy_hp <= 0) {
    state.ended = true;
  }

  return makeResponse(state, {
    ok: true,
    won: state.enemy_hp <= 0,
    lost: state.player_hp <= 0,
    log: logs
      .filter(item => item.kind === "good" || item.kind === "info")
      .map(item => item.text)
      .join("\n"),
    e_log: logs
      .filter(item => item.kind === "bad")
      .map(item => item.text)
      .join("\n"),
    logs
  });
}

module.exports = {
  MONSTER_SKILLS,
  ensureBattleState,
  runMonsterTurn,
  handleBattleMove
};
