function range(hi, lo = 1) {
  return [ ...Array(hi - lo + 1).keys() ].map(k => k + lo);
}

function norm(die) {
  let totalWeight = 0;
  for (let val in die) {
    totalWeight += die[val];
  }

  const norm = {};
  for (let val in die) {
    norm[val] = die[val] / totalWeight;
  }

  return norm;
}

function die(n) {
  const idxs = range(n);
  const die = idxs.reduce((a, c) => ({ ...a, [c]: 1 }), {});
  return norm(die);
}

function multiple(n, die) {
  return Array(n).fill(die);
}

function rolls(die) {
  const rolls = [];
  for (let val in die) {
    rolls.push({ vals: [ Number.parseInt(val) ], weight: die[val] });
  }
  return rolls;
}

function* combineDice(dice, prefix = { vals: [], weight: 1 }) {
  if (dice.length === 0) {
    yield prefix;
    return;
  }

  const [ first, ...rest ] = dice;

  const firstRolls = rolls(first);

  for (let f of firstRolls) {
    const weight = prefix.weight * f.weight;
    if (weight < 10e-8) {
      continue;
    }

    const newPrefix = {
      vals: [ ...prefix.vals, ...f.vals ],
      weight,
    };

    yield* combineDice(rest, newPrefix);
  }
}

function* flattenValues(rollCombos, drop = false) {
  for ({ vals, weight } of rollCombos) {
    let subTotal = vals.reduce((a, c) => a + c, 0);
    if (drop) {
      subTotal -= Math.min(...vals);
    }
    yield { val: subTotal, weight };
  }
}

function flattenWeights(rolls) {
  const combined = [ ...rolls ].reduce((acc, { val: cv, weight: cw }) => {
    return {
      ...acc,
      [cv]: cv in acc ? acc[cv] + cw : cw, // add weights for matching values
    };
  }, {});

  return combined;
}

function rerollones(die) {
  const { '1': ones, ...rest } = die;
  return norm(rest);
}

const d6 = die(6);
const d6r1 = rerollones(d6);

const rolls3d6 = combineDice(multiple(3, d6));
const x3d6 = flattenWeights(flattenValues(rolls3d6));

const rolls4d6 = combineDice(multiple(4, d6r1));
const x4d6dl = flattenWeights(flattenValues(rolls4d6, true));

const rolls6x3d6 = combineDice(multiple(6, x3d6));
const x6x3d6 = flattenWeights(flattenValues(rolls6x3d6));

const rolls7x4d6dldl = combineDice(multiple(7, x4d6dl));
const x7x4d6dldl = flattenWeights(flattenValues(rolls7x4d6dldl, true));

console.log({ x3d6, x4d6dl, x6x3d6,x7x4d6dldl });
