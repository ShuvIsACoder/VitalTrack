import * as THREE from "three";

const goals = {
  "fat-loss": {
    label: "Fat loss",
    calories: 2300,
    protein: 165,
    carbs: 230,
    fat: 70,
    fiber: 32,
    cardio: 150,
    strength: 3,
  },
  "muscle-gain": {
    label: "Muscle gain",
    calories: 2900,
    protein: 175,
    carbs: 360,
    fat: 85,
    fiber: 34,
    cardio: 90,
    strength: 4,
  },
  performance: {
    label: "Performance",
    calories: 3100,
    protein: 170,
    carbs: 410,
    fat: 90,
    fiber: 36,
    cardio: 180,
    strength: 3,
  },
  recomposition: {
    label: "Recomposition",
    calories: 2600,
    protein: 180,
    carbs: 285,
    fat: 80,
    fiber: 34,
    cardio: 120,
    strength: 4,
  },
};

const defaultState = {
  goal: "fat-loss",
  theme: "night",
  weight: 82,
  height: 181,
  waist: 86,
  bp: "118/74",
  connected: {
    apple: false,
    garmin: false,
    healthConnect: false,
    fitbit: false,
  },
  lastImport: "No Apple Health export imported yet.",
  meals: [
    { food: "Protein oats, berries", calories: 520, protein: 42, carbs: 66, fat: 12, fiber: 12, iron: 3.1, magnesium: 115 },
    { food: "Chicken quinoa bowl", calories: 690, protein: 58, carbs: 72, fat: 18, fiber: 10, iron: 4.5, magnesium: 138 },
    { food: "Salmon, potatoes, greens", calories: 720, protein: 49, carbs: 68, fat: 27, fiber: 8, iron: 3.8, magnesium: 112 },
    { food: "Skyr with walnuts", calories: 250, protein: 28, carbs: 18, fat: 9, fiber: 3, iron: 0.8, magnesium: 65 },
  ],
  workouts: [
    { type: "Strength", name: "Upper body strength", volume: 6400, minutes: 50, effort: 8 },
    { type: "Cardio", name: "Zone 2 bike", volume: 0, minutes: 35, effort: 5 },
    { type: "Strength", name: "Lower body strength", volume: 7600, minutes: 58, effort: 8 },
    { type: "Mobility", name: "Hips and T-spine", volume: 0, minutes: 22, effort: 3 },
  ],
  biomarkers: {
    steps: { label: "Steps", value: 8420, unit: "avg/day", trend: "+6% vs last week" },
    sleep: { label: "Sleep", value: 7.56, unit: "hours", trend: "steady" },
    hrv: { label: "HRV", value: 64, unit: "ms", trend: "+4 ms" },
    rhr: { label: "Resting HR", value: 58, unit: "bpm", trend: "-2 bpm" },
    vo2: { label: "VO2 max", value: 47, unit: "ml/kg/min", trend: "+1" },
    stress: { label: "Stress", value: 31, unit: "score", trend: "moderate" },
  },
};

let state = loadState();
let sceneApi;

const recipes = {
  "fat-loss": [
    {
      name: "Lemon chicken lentil salad",
      detail: "High-protein, high-fiber lunch with iron, folate, potassium, and magnesium.",
      macros: "520 kcal - 48P - 46C - 16F",
      micros: ["Iron 6.2 mg", "Magnesium 145 mg", "Fiber 15 g"],
    },
    {
      name: "Cod, roasted vegetables, yogurt herb sauce",
      detail: "Lean dinner that keeps calories controlled while covering iodine, selenium, and vitamin C.",
      macros: "470 kcal - 43P - 38C - 14F",
      micros: ["Selenium 58 mcg", "Vitamin C 82 mg", "Potassium 980 mg"],
    },
  ],
  "muscle-gain": [
    {
      name: "Steak rice bowl with avocado",
      detail: "Energy-dense meal for a surplus with creatine-rich meat, carbs, zinc, and B vitamins.",
      macros: "820 kcal - 55P - 92C - 26F",
      micros: ["Zinc 8.5 mg", "Iron 5.1 mg", "Magnesium 132 mg"],
    },
    {
      name: "Peanut banana protein smoothie",
      detail: "Fast post-training calories with calcium, potassium, magnesium, and complete protein.",
      macros: "610 kcal - 46P - 72C - 18F",
      micros: ["Calcium 470 mg", "Potassium 1,120 mg", "Magnesium 165 mg"],
    },
  ],
  performance: [
    {
      name: "Turkey sweet potato power plate",
      detail: "Carb-forward meal for training output with vitamin A, potassium, and lean protein.",
      macros: "760 kcal - 52P - 108C - 14F",
      micros: ["Vitamin A 920 mcg", "Potassium 1,340 mg", "Fiber 13 g"],
    },
    {
      name: "Soba salmon recovery bowl",
      detail: "Carbs plus omega-3-rich fish for hard training days.",
      macros: "790 kcal - 50P - 96C - 24F",
      micros: ["Omega-3 1.8 g", "Vitamin D 12 mcg", "Magnesium 154 mg"],
    },
  ],
  recomposition: [
    {
      name: "Egg white shakshuka with chickpeas",
      detail: "High protein with slow carbs and a broad micronutrient spread.",
      macros: "610 kcal - 52P - 58C - 17F",
      micros: ["Iron 5.8 mg", "Folate 260 mcg", "Fiber 14 g"],
    },
    {
      name: "Tofu edamame stir-fry",
      detail: "Plant-forward protein with calcium, magnesium, fiber, and lower saturated fat.",
      macros: "650 kcal - 49P - 64C - 22F",
      micros: ["Calcium 520 mg", "Magnesium 182 mg", "Fiber 16 g"],
    },
  ],
};

const supplements = [
  {
    title: "Vitamin D",
    applies: (totals) => totals.calories > 0,
    text: "Consider checking blood levels if sun exposure or dietary vitamin D is low. Avoid high-dose use without clinician guidance.",
  },
  {
    title: "Omega-3",
    applies: () => true,
    text: "Useful to discuss when fatty fish intake is low. Food options include salmon, sardines, trout, chia, flax, and walnuts.",
  },
  {
    title: "Magnesium",
    applies: (totals, target) => totals.magnesium < 0.8 * 400 || totals.fiber < target.fiber,
    text: "Prioritize legumes, nuts, seeds, whole grains, and leafy greens. Supplements can interact with some medications.",
  },
  {
    title: "Creatine monohydrate",
    applies: (_totals, _target, goal) => goal === "muscle-gain" || goal === "performance" || goal === "recomposition",
    text: "Often used for strength and power training. People with kidney disease or medical conditions should ask a clinician first.",
  },
];

const exerciseCues = {
  squat: ["Tripod foot pressure", "Knees track over toes", "Ribs stacked over pelvis"],
  hinge: ["Push hips back", "Keep lats engaged", "Shins mostly vertical"],
  pushup: ["Straight line shoulder to heel", "Elbows about 30-45 degrees", "Press floor away at the top"],
};

const providers = [
  {
    id: "apple",
    name: "Apple Health",
    icon: "heart-pulse",
    copy: "Direct live sync needs an iOS companion app with HealthKit permissions. This web version can import an Apple Health `export.xml` file now.",
    action: "Import export",
  },
  {
    id: "garmin",
    name: "Garmin",
    icon: "watch",
    copy: "Live Garmin sync needs Garmin developer/API approval, a backend callback URL, and OAuth token storage.",
    action: "Setup needed",
  },
  {
    id: "healthConnect",
    name: "Health Connect",
    icon: "smartphone",
    copy: "Health Connect data is exposed to Android apps with user-controlled permissions, not directly to a plain website.",
    action: "Needs Android app",
  },
  {
    id: "fitbit",
    name: "Fitbit",
    icon: "activity",
    copy: "Fitbit can use OAuth from a web app, but production sync still needs an app registration and backend token handling.",
    action: "Setup needed",
  },
];

function loadState() {
  const saved = localStorage.getItem("vitaltrack-state");
  if (!saved) return structuredClone(defaultState);
  try {
    return { ...structuredClone(defaultState), ...JSON.parse(saved) };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem("vitaltrack-state", JSON.stringify(state));
}

function renderTheme() {
  document.documentElement.dataset.theme = state.theme;
  const icon = state.theme === "night" ? "sun" : "moon";
  const label = state.theme === "night" ? "Switch to day mode" : "Switch to night mode";
  document.querySelector("#themeToggle").innerHTML = `<i data-lucide="${icon}"></i>`;
  document.querySelector("#themeToggle").title = label;
}

function totals() {
  return state.meals.reduce(
    (sum, meal) => {
      Object.keys(sum).forEach((key) => {
        sum[key] += Number(meal[key]) || 0;
      });
      return sum;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, iron: 0, magnesium: 0 },
  );
}

function trainingTotals() {
  return state.workouts.reduce(
    (sum, workout) => {
      if (workout.type === "Strength") sum.strength += 1;
      if (workout.type === "Cardio") sum.cardio += Number(workout.minutes) || 0;
      sum.minutes += Number(workout.minutes) || 0;
      sum.volume += Number(workout.volume) || 0;
      return sum;
    },
    { strength: 0, cardio: 0, minutes: 0, volume: 0 },
  );
}

function pct(value, target) {
  if (!target) return 0;
  return Math.max(0, Math.min(120, Math.round((value / target) * 100)));
}

function formatSleep(hours) {
  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);
  return `${whole}h ${minutes}m`;
}

function parseAppleDate(value) {
  if (!value) return null;
  const normalized = value.replace(
    /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) ([+-]\d{2})(\d{2})$/,
    "$1T$2$3:$4",
  );
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function average(values) {
  const clean = values.filter((value) => Number.isFinite(value));
  if (!clean.length) return null;
  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function latestByType(records, type) {
  return records
    .filter((record) => record.type === type && Number.isFinite(record.value))
    .sort((a, b) => b.endDate - a.endDate)[0];
}

function averageRecent(records, type, latestDate, days = 14) {
  const cutoff = new Date(latestDate);
  cutoff.setDate(cutoff.getDate() - days);
  return average(
    records
      .filter((record) => record.type === type && record.endDate >= cutoff && Number.isFinite(record.value))
      .map((record) => record.value),
  );
}

function convertLength(value, unit) {
  if (unit === "m") return value * 100;
  if (unit === "in") return value * 2.54;
  if (unit === "ft") return value * 30.48;
  return value;
}

function convertWeight(value, unit) {
  if (unit === "lb") return value * 0.453592;
  if (unit === "st") return value * 6.35029;
  return value;
}

function summarizeAppleHealthExport(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  if (doc.querySelector("parsererror")) {
    throw new Error("That file is not valid XML. If you exported a zip from Apple Health, unzip it and choose `export.xml`.");
  }

  const records = Array.from(doc.querySelectorAll("Record"))
    .map((node) => {
      const type = node.getAttribute("type");
      const value = Number(node.getAttribute("value"));
      const unit = node.getAttribute("unit") || "";
      const startDate = parseAppleDate(node.getAttribute("startDate"));
      const endDate = parseAppleDate(node.getAttribute("endDate")) || startDate;
      return { type, value, unit, startDate, endDate, rawValue: node.getAttribute("value") || "" };
    })
    .filter((record) => record.type && record.endDate);

  if (!records.length) {
    throw new Error("I could not find Apple Health records in that XML file.");
  }

  const latestDate = new Date(Math.max(...records.map((record) => record.endDate.getTime())));
  const cutoff = new Date(latestDate);
  cutoff.setDate(cutoff.getDate() - 14);

  const dailySteps = new Map();
  records
    .filter((record) => record.type === "HKQuantityTypeIdentifierStepCount" && record.endDate >= cutoff)
    .forEach((record) => {
      const day = record.endDate.toISOString().slice(0, 10);
      dailySteps.set(day, (dailySteps.get(day) || 0) + record.value);
    });

  const sleepByDay = new Map();
  records
    .filter(
      (record) =>
        record.type === "HKCategoryTypeIdentifierSleepAnalysis" &&
        record.endDate >= cutoff &&
        record.startDate &&
        record.rawValue.includes("Asleep"),
    )
    .forEach((record) => {
      const day = record.startDate.toISOString().slice(0, 10);
      const hours = (record.endDate - record.startDate) / 36e5;
      sleepByDay.set(day, (sleepByDay.get(day) || 0) + hours);
    });

  const next = {};
  const stepAverage = average(Array.from(dailySteps.values()));
  const sleepAverage = average(Array.from(sleepByDay.values()));
  const rhrAverage = averageRecent(records, "HKQuantityTypeIdentifierRestingHeartRate", latestDate);
  const hrvAverage = averageRecent(records, "HKQuantityTypeIdentifierHeartRateVariabilitySDNN", latestDate);
  const vo2Average = averageRecent(records, "HKQuantityTypeIdentifierVO2Max", latestDate, 60);
  const weightRecord = latestByType(records, "HKQuantityTypeIdentifierBodyMass");
  const heightRecord = latestByType(records, "HKQuantityTypeIdentifierHeight");

  if (stepAverage) next.steps = Math.round(stepAverage);
  if (sleepAverage) next.sleep = Number(sleepAverage.toFixed(2));
  if (rhrAverage) next.rhr = Math.round(rhrAverage);
  if (hrvAverage) next.hrv = Math.round(hrvAverage);
  if (vo2Average) next.vo2 = Math.round(vo2Average);
  if (weightRecord) next.weight = Number(convertWeight(weightRecord.value, weightRecord.unit).toFixed(1));
  if (heightRecord) next.height = Math.round(convertLength(heightRecord.value, heightRecord.unit));

  return {
    next,
    count: records.length,
    latestDate,
  };
}

function applyAppleHealthImport(summary) {
  const imported = [];
  if (summary.next.steps) {
    state.biomarkers.steps.value = summary.next.steps;
    state.biomarkers.steps.trend = "from Apple Health export";
    imported.push("steps");
  }
  if (summary.next.sleep) {
    state.biomarkers.sleep.value = summary.next.sleep;
    state.biomarkers.sleep.trend = "from Apple Health export";
    imported.push("sleep");
  }
  if (summary.next.rhr) {
    state.biomarkers.rhr.value = summary.next.rhr;
    state.biomarkers.rhr.trend = "from Apple Health export";
    imported.push("resting HR");
  }
  if (summary.next.hrv) {
    state.biomarkers.hrv.value = summary.next.hrv;
    state.biomarkers.hrv.trend = "from Apple Health export";
    imported.push("HRV");
  }
  if (summary.next.vo2) {
    state.biomarkers.vo2.value = summary.next.vo2;
    state.biomarkers.vo2.trend = "from Apple Health export";
    imported.push("VO2 max");
  }
  if (summary.next.weight) {
    state.weight = summary.next.weight;
    imported.push("weight");
  }
  if (summary.next.height) {
    state.height = summary.next.height;
    imported.push("height");
  }

  state.connected.apple = true;
  state.lastImport = imported.length
    ? `Imported ${imported.join(", ")} from ${summary.count.toLocaleString()} Apple Health records. Latest record: ${summary.latestDate.toLocaleDateString()}.`
    : `Read ${summary.count.toLocaleString()} Apple Health records, but none matched the dashboard metrics yet.`;
}

function currentTarget() {
  return goals[state.goal];
}

function coachModel() {
  const target = currentTarget();
  const food = totals();
  const train = trainingTotals();
  const calorieGap = food.calories - target.calories;
  const cardioGap = target.cardio - train.cardio;
  const strengthGap = target.strength - train.strength;
  const readiness =
    40 +
    Math.min(18, pct(food.protein, target.protein) * 0.15) +
    Math.min(16, pct(train.cardio, target.cardio) * 0.13) +
    Math.min(14, pct(train.strength, target.strength) * 0.11) +
    Math.min(12, Math.max(0, (state.biomarkers.sleep.value - 6) * 7));

  const actions = [];
  if (cardioGap > 20) {
    actions.push({
      icon: "bike",
      title: "Add one Zone 2 cardio session",
      copy: `${Math.round(cardioGap)} more weekly minutes would better match the ${target.label.toLowerCase()} plan.`,
    });
  }
  if (strengthGap > 0) {
    actions.push({
      icon: "dumbbell",
      title: `Add ${strengthGap} strength session${strengthGap > 1 ? "s" : ""}`,
      copy: "Prioritize compound lifts and keep one to two reps in reserve on most working sets.",
    });
  }
  if (food.protein < target.protein * 0.9) {
    actions.push({
      icon: "beef",
      title: "Raise protein earlier in the day",
      copy: `You are ${Math.round(target.protein - food.protein)} g below target. Add lean protein to breakfast or lunch.`,
    });
  }
  if (calorieGap > 250 && state.goal === "fat-loss") {
    actions.push({
      icon: "scale",
      title: "Tighten the calorie deficit",
      copy: "Swap one calorie-dense snack for a higher-fiber option and review cooking oils or liquid calories.",
    });
  }
  if (state.biomarkers.sleep.value < 7) {
    actions.push({
      icon: "moon",
      title: "Protect sleep before adding intensity",
      copy: "Recovery is the limiting signal this week. Keep hard sessions hard, but avoid stacking them back-to-back.",
    });
  }
  if (!actions.length) {
    actions.push({
      icon: "check-circle-2",
      title: "Hold the plan steady",
      copy: "Nutrition, training, and recovery are aligned. Progress by adding small overloads, not more complexity.",
    });
  }

  return {
    readiness: Math.round(Math.min(96, readiness)),
    calorieGap,
    actions,
    signals: [
      `${food.calories} kcal logged vs ${target.calories} target`,
      `${train.strength}/${target.strength} strength sessions completed`,
      `${train.cardio}/${target.cardio} cardio minutes completed`,
      `${formatSleep(state.biomarkers.sleep.value)} average sleep`,
      `${state.biomarkers.rhr.value} bpm resting heart rate`,
    ],
  };
}

function renderAll() {
  renderTheme();
  renderProfile();
  renderOverview();
  renderNutrition();
  renderTraining();
  renderBiomarkers();
  renderCoach();
  saveState();
  if (window.lucide) window.lucide.createIcons();
}

function renderProfile() {
  document.querySelector("#goalSelect").value = state.goal;
  document.querySelector("#weightInput").value = state.weight;
  document.querySelector("#heightInput").value = state.height;
  const heightM = state.height / 100;
  document.querySelector("#bmiValue").textContent = (state.weight / (heightM * heightM)).toFixed(1);
}

function renderOverview() {
  const target = currentTarget();
  const food = totals();
  const coach = coachModel();
  const calorieDelta = target.calories - food.calories;
  const label = coach.readiness > 84 ? "strong" : coach.readiness > 68 ? "steady" : "strained";

  document.querySelector("#readinessLabel").textContent = label;
  document.querySelector("#readinessScore").textContent = coach.readiness;
  document.querySelector("#readinessCopy").textContent =
    label === "strong"
      ? "You are recovering well and the core habits are lined up with your goal."
      : label === "steady"
        ? "Your plan is broadly on track. A small adjustment this week should move the trend."
        : "Recovery or consistency is lagging. Keep the next move simple and measurable.";

  document.querySelector("#calorieStat").textContent = food.calories.toLocaleString();
  document.querySelector("#calorieDelta").textContent =
    calorieDelta >= 0 ? `${calorieDelta} under target` : `${Math.abs(calorieDelta)} over target`;
  document.querySelector("#proteinStat").textContent = `${food.protein} g`;
  document.querySelector("#rhrStat").textContent = `${state.biomarkers.rhr.value} bpm`;
  document.querySelector("#rhrDelta").textContent = state.biomarkers.rhr.trend;
  document.querySelector("#sleepStat").textContent = formatSleep(state.biomarkers.sleep.value);

  const train = trainingTotals();
  const progressRows = [
    ["Calories", food.calories, target.calories, "var(--green)"],
    ["Protein", food.protein, target.protein, "var(--blue)"],
    ["Fiber", food.fiber, target.fiber, "var(--amber)"],
    ["Strength", train.strength, target.strength, "var(--coral)"],
    ["Cardio minutes", train.cardio, target.cardio, "var(--violet)"],
  ];
  document.querySelector("#progressList").innerHTML = progressRows
    .map(([name, value, goal, color]) => {
      const percent = pct(value, goal);
      return `<div class="progress-row">
        <span>${name}</span>
        <div class="progress-track"><div class="progress-fill" style="width:${Math.min(percent, 100)}%;background:${color}"></div></div>
        <strong>${percent}%</strong>
      </div>`;
    })
    .join("");

  const note = coach.actions[0];
  document.querySelector("#overviewCoachNote").innerHTML = `<strong>${note.title}</strong><p>${note.copy}</p>`;
}

function renderNutrition() {
  const target = currentTarget();
  const food = totals();
  document.querySelector("#dailyCalories").textContent = food.calories;
  document.querySelector(".macro-ring").style.setProperty("--value", Math.min(100, pct(food.calories, target.calories)));

  const barData = [
    ["Protein", food.protein, target.protein, "g", "var(--blue)"],
    ["Carbs", food.carbs, target.carbs, "g", "var(--green)"],
    ["Fat", food.fat, target.fat, "g", "var(--coral)"],
    ["Fiber", food.fiber, target.fiber, "g", "var(--amber)"],
    ["Iron", food.iron.toFixed(1), 18, "mg", "var(--violet)"],
    ["Magnesium", food.magnesium, 400, "mg", "var(--green)"],
  ];
  document.querySelector("#macroBars").innerHTML = barData
    .map(([name, value, goal, unit, color]) => `<div>
      <div class="bar-label"><strong>${name}</strong><span>${value}${unit} / ${goal}${unit}</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, pct(Number(value), goal))}%;background:${color}"></div></div>
    </div>`)
    .join("");

  document.querySelector("#mealTable").innerHTML = state.meals
    .map(
      (meal) => `<tr>
        <td>${meal.food}</td>
        <td>${meal.calories}</td>
        <td>${meal.protein}g</td>
        <td>${meal.carbs}g</td>
        <td>${meal.fat}g</td>
        <td>${meal.fiber}g</td>
        <td>${meal.iron}mg</td>
        <td>${meal.magnesium}mg</td>
      </tr>`,
    )
    .join("");

  document.querySelector("#recipeList").innerHTML = recipes[state.goal]
    .map(
      (recipe) => `<article class="recipe-card">
        <strong>${recipe.name}</strong>
        <p>${recipe.detail}</p>
        <div class="recipe-tags">
          <span class="tag">${recipe.macros}</span>
          ${recipe.micros.map((micro) => `<span class="tag">${micro}</span>`).join("")}
        </div>
      </article>`,
    )
    .join("");

  document.querySelector("#supplementGrid").innerHTML = supplements
    .filter((item) => item.applies(food, target, state.goal))
    .map(
      (item) => `<article class="supplement-card">
        <strong>${item.title}</strong>
        <p>${item.text}</p>
      </article>`,
    )
    .join("");
}

function renderTraining() {
  document.querySelector("#workoutList").innerHTML = state.workouts
    .map(
      (workout) => `<article class="workout-item">
        <strong>${workout.name}</strong>
        <p>${workout.type} - ${workout.minutes} min - ${workout.volume ? `${workout.volume.toLocaleString()} kg volume - ` : ""}RPE ${workout.effort}</p>
      </article>`,
    )
    .join("");

  const maxVolume = Math.max(...state.workouts.map((w) => Number(w.volume) || Number(w.minutes) * 100), 1);
  document.querySelector("#trainingChart").innerHTML = state.workouts
    .map((workout, index) => {
      const value = Number(workout.volume) || Number(workout.minutes) * 100;
      const height = Math.max(12, Math.round((value / maxVolume) * 100));
      return `<div class="chart-bar"><span style="height:${height}%"></span><small>W${index + 1}</small></div>`;
    })
    .join("");
}

function renderBiomarkers() {
  document.querySelector("#connectionGrid").innerHTML = providers
    .map((provider) => {
      const isConnected = state.connected[provider.id];
      return `<article class="connection-card">
        <strong><i data-lucide="${provider.icon}"></i> ${provider.name}</strong>
        <p>${provider.copy}</p>
        <div class="connection-actions">
          <span class="tag">${isConnected ? "Connected" : "Not connected"}</span>
          <button data-provider="${provider.id}" type="button">${isConnected ? "Disconnect" : provider.action}</button>
        </div>
      </article>`;
    })
    .join("");

  document.querySelector("#importStatus").textContent = state.lastImport || defaultState.lastImport;

  document.querySelector("#biomarkerGrid").innerHTML = Object.values(state.biomarkers)
    .map(
      (marker) => `<article class="biomarker-card">
        <small>${marker.label}</small>
        <strong>${marker.label === "Sleep" ? formatSleep(marker.value) : marker.value}</strong>
        <p>${marker.unit} - ${marker.trend}</p>
      </article>`,
    )
    .join("");
}

function renderCoach() {
  const coach = coachModel();
  document.querySelector("#weeklyHeadline").textContent = coach.actions[0].title;
  document.querySelector("#weeklySummary").textContent = coach.actions[0].copy;
  document.querySelector("#actionList").innerHTML = coach.actions
    .map(
      (action) => `<article class="action-item">
        <span class="action-icon"><i data-lucide="${action.icon}"></i></span>
        <div><strong>${action.title}</strong><p>${action.copy}</p></div>
      </article>`,
    )
    .join("");
  document.querySelector("#signalList").innerHTML = coach.signals
    .map((signal) => `<article class="signal-item"><span>Signal</span><strong>${signal}</strong></article>`)
    .join("");
}

function setTab(tabId) {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabId);
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === tabId);
  });
  document.querySelector("#pageTitle").textContent =
    tabId === "coach" ? "Weekly Coach" : tabId.charAt(0).toUpperCase() + tabId.slice(1);
  if (tabId === "training" && sceneApi) sceneApi.resize();
}

function addEventListeners() {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => setTab(button.dataset.tab));
  });

  document.querySelector("#goalSelect").addEventListener("change", (event) => {
    state.goal = event.target.value;
    renderAll();
  });

  document.querySelector("#weightInput").addEventListener("input", (event) => {
    state.weight = Number(event.target.value) || state.weight;
    renderAll();
  });

  document.querySelector("#heightInput").addEventListener("input", (event) => {
    state.height = Number(event.target.value) || state.height;
    renderAll();
  });

  document.querySelector("#mealForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    state.meals.unshift({
      food: data.get("food"),
      calories: Number(data.get("calories")) || 0,
      protein: Number(data.get("protein")) || 0,
      carbs: Number(data.get("carbs")) || 0,
      fat: Number(data.get("fat")) || 0,
      fiber: Number(data.get("fiber")) || 0,
      iron: Number(data.get("iron")) || 0,
      magnesium: Number(data.get("magnesium")) || 0,
    });
    renderAll();
  });

  document.querySelector("#workoutForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    state.workouts.unshift({
      type: data.get("type"),
      name: data.get("name"),
      volume: Number(data.get("volume")) || 0,
      minutes: Number(data.get("minutes")) || 0,
      effort: Number(data.get("effort")) || 1,
    });
    renderAll();
  });

  document.querySelector("#bodyForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    state.weight = Number(data.get("weight")) || state.weight;
    state.waist = Number(data.get("waist")) || state.waist;
    state.bp = data.get("bp") || state.bp;
    renderAll();
  });

  document.querySelector("#connectionGrid").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-provider]");
    if (!button) return;
    const provider = button.dataset.provider;
    if (provider === "apple" && !state.connected.apple) {
      document.querySelector("#appleHealthFile").click();
      return;
    }
    if (provider === "apple") {
      state.connected.apple = false;
      state.lastImport = "Apple Health export disconnected from this browser. Imported data remains until you reset or import again.";
      renderAll();
      return;
    }
    state.lastImport =
      provider === "healthConnect"
        ? "Health Connect requires an Android companion app. A website cannot directly request those device permissions."
        : `${providers.find((item) => item.id === provider).name} live sync needs app registration, OAuth, and a backend token store.`;
    renderAll();
  });

  document.querySelector("#appleHealthFile").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    state.lastImport = `Reading ${file.name} locally in your browser...`;
    renderAll();
    try {
      const text = await file.text();
      const summary = summarizeAppleHealthExport(text);
      applyAppleHealthImport(summary);
    } catch (error) {
      state.lastImport = error.message;
    } finally {
      event.target.value = "";
      renderAll();
    }
  });

  document.querySelector("#importWearable").addEventListener("click", () => {
    state.biomarkers.steps.value += 420;
    state.biomarkers.sleep.value = Math.min(8.6, Number((state.biomarkers.sleep.value + 0.08).toFixed(2)));
    state.biomarkers.hrv.value += 2;
    state.biomarkers.rhr.value = Math.max(50, state.biomarkers.rhr.value - 1);
    state.biomarkers.vo2.value += 1;
    state.biomarkers.stress.value = Math.max(15, state.biomarkers.stress.value - 2);
    renderAll();
  });

  document.querySelector("#simulateWeek").addEventListener("click", () => {
    state.workouts.push({ type: "Cardio", name: "Zone 2 incline walk", volume: 0, minutes: 45, effort: 5 });
    state.workouts.push({ type: "Strength", name: "Full body strength", volume: 6900, minutes: 52, effort: 7 });
    state.meals.push({ food: "Turkey chili with beans", calories: 610, protein: 54, carbs: 58, fat: 16, fiber: 15, iron: 6.4, magnesium: 155 });
    state.biomarkers.steps.value += 900;
    renderAll();
  });

  document.querySelector("#refreshCoach").addEventListener("click", renderAll);

  document.querySelector("#resetDemo").addEventListener("click", () => {
    state = structuredClone(defaultState);
    localStorage.removeItem("vitaltrack-state");
    renderAll();
  });

  document.querySelector("#themeToggle").addEventListener("click", () => {
    state.theme = state.theme === "night" ? "day" : "night";
    renderAll();
  });
}

function createExerciseScene() {
  const canvas = document.querySelector("#exerciseCanvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x101816, 9, 22);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(4.5, 3.1, 7.5);
  camera.lookAt(0, 1.4, 0);

  const ambient = new THREE.HemisphereLight(0xe6fff2, 0x17231f, 2.4);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.position.set(3, 6, 4);
  scene.add(key);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(4.2, 80),
    new THREE.MeshStandardMaterial({ color: 0x20352e, roughness: 0.85 }),
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const grid = new THREE.GridHelper(8, 16, 0x456a5c, 0x283f36);
  grid.position.y = 0.01;
  scene.add(grid);

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xd9a06f, roughness: 0.58 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0x4ee28e, roughness: 0.52 });
  const shortMat = new THREE.MeshStandardMaterial({ color: 0x1f6f52, roughness: 0.56 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0xf2f7f2, roughness: 0.42 });
  const guideMat = new THREE.MeshBasicMaterial({ color: 0x8cd7ff, transparent: true, opacity: 0.42 });

  const figure = new THREE.Group();
  scene.add(figure);

  const joints = {};
  const jointNames = ["head", "neck", "chest", "hip", "lKnee", "rKnee", "lAnkle", "rAnkle", "lElbow", "rElbow", "lHand", "rHand"];
  jointNames.forEach((name) => {
    joints[name] = new THREE.Object3D();
    figure.add(joints[name]);
  });

  function capsule(radius, material) {
    return new THREE.Mesh(new THREE.CapsuleGeometry(radius, 1, 18, 32), material);
  }

  const segments = [
    { mesh: capsule(0.14, skinMat), a: "neck", b: "head" },
    { mesh: capsule(0.12, skinMat), a: "chest", b: "lElbow" },
    { mesh: capsule(0.1, skinMat), a: "lElbow", b: "lHand" },
    { mesh: capsule(0.12, skinMat), a: "chest", b: "rElbow" },
    { mesh: capsule(0.1, skinMat), a: "rElbow", b: "rHand" },
    { mesh: capsule(0.15, shortMat), a: "hip", b: "lKnee" },
    { mesh: capsule(0.13, skinMat), a: "lKnee", b: "lAnkle" },
    { mesh: capsule(0.15, shortMat), a: "hip", b: "rKnee" },
    { mesh: capsule(0.13, skinMat), a: "rKnee", b: "rAnkle" },
  ];

  segments.forEach((segment) => figure.add(segment.mesh));

  const torso = new THREE.Mesh(new THREE.SphereGeometry(1, 36, 24), shirtMat);
  torso.scale.set(0.42, 0.62, 0.28);
  figure.add(torso);

  const pelvis = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 18), shortMat);
  pelvis.scale.set(0.36, 0.24, 0.32);
  figure.add(pelvis);

  const shoulderBar = capsule(0.08, shirtMat);
  shoulderBar.scale.set(1, 0.72, 1);
  figure.add(shoulderBar);

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 36, 24), skinMat);
  headMesh.scale.set(0.9, 1.16, 0.92);
  figure.add(headMesh);

  const hands = ["lHand", "rHand"].map((name) => {
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.105, 22, 16), skinMat);
    hand.userData = { name };
    figure.add(hand);
    return hand;
  });

  const feet = ["lAnkle", "rAnkle"].map((name) => {
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.12, 0.19), shoeMat);
    foot.userData = { name };
    figure.add(foot);
    return foot;
  });

  const ghost = new THREE.Mesh(
    new THREE.TorusGeometry(1.2, 0.012, 8, 80),
    guideMat,
  );
  ghost.rotation.x = Math.PI / 2;
  ghost.position.y = 1.05;
  scene.add(ghost);

  const tmp = new THREE.Vector3();
  const mid = new THREE.Vector3();
  const axis = new THREE.Vector3(0, 1, 0);

  function setJoint(name, x, y, z) {
    joints[name].position.set(x, y, z);
  }

  function poseSquat(t) {
    const depth = (Math.sin(t) + 1) / 2;
    const hipY = 1.62 - depth * 0.74;
    const chestY = hipY + 0.83;
    const chestX = -depth * 0.18;
    setJoint("hip", 0, hipY, 0);
    setJoint("chest", chestX, chestY, 0);
    setJoint("neck", chestX - 0.03, chestY + 0.36, 0);
    setJoint("head", chestX - 0.05, chestY + 0.6, 0);
    setJoint("lKnee", -0.42, 0.88 - depth * 0.15, 0.36);
    setJoint("rKnee", -0.42, 0.88 - depth * 0.15, -0.36);
    setJoint("lAnkle", 0.34, 0.12, 0.42);
    setJoint("rAnkle", 0.34, 0.12, -0.42);
    setJoint("lElbow", -0.58, chestY + 0.08, 0.52);
    setJoint("rElbow", -0.58, chestY + 0.08, -0.52);
    setJoint("lHand", -0.86, chestY - 0.08, 0.5);
    setJoint("rHand", -0.86, chestY - 0.08, -0.5);
  }

  function poseHinge(t) {
    const fold = (Math.sin(t) + 1) / 2;
    setJoint("hip", 0.1, 1.28, 0);
    setJoint("chest", -0.18 - fold * 0.82, 2.08 - fold * 0.48, 0);
    setJoint("neck", -0.26 - fold * 0.88, 2.43 - fold * 0.48, 0);
    setJoint("head", -0.36 - fold * 0.96, 2.66 - fold * 0.5, 0);
    setJoint("lKnee", -0.18, 0.92, 0.35);
    setJoint("rKnee", -0.18, 0.92, -0.35);
    setJoint("lAnkle", 0.22, 0.12, 0.38);
    setJoint("rAnkle", 0.22, 0.12, -0.38);
    setJoint("lElbow", -0.38 - fold * 0.88, 1.78 - fold * 0.44, 0.48);
    setJoint("rElbow", -0.38 - fold * 0.88, 1.78 - fold * 0.44, -0.48);
    setJoint("lHand", -0.36 - fold * 0.82, 1.26 - fold * 0.38, 0.46);
    setJoint("rHand", -0.36 - fold * 0.82, 1.26 - fold * 0.38, -0.46);
  }

  function posePushup(t) {
    const bend = (Math.sin(t) + 1) / 2;
    setJoint("head", -1.32, 0.88 - bend * 0.32, 0);
    setJoint("neck", -1.08, 0.82 - bend * 0.3, 0);
    setJoint("chest", -0.58, 0.72 - bend * 0.28, 0);
    setJoint("hip", 0.45, 0.62 - bend * 0.2, 0);
    setJoint("lKnee", 1.18, 0.39, 0.26);
    setJoint("rKnee", 1.18, 0.39, -0.26);
    setJoint("lAnkle", 1.86, 0.14, 0.28);
    setJoint("rAnkle", 1.86, 0.14, -0.28);
    setJoint("lElbow", -0.75, 0.42 + bend * 0.08, 0.54);
    setJoint("rElbow", -0.75, 0.42 + bend * 0.08, -0.54);
    setJoint("lHand", -1.02, 0.12, 0.62);
    setJoint("rHand", -1.02, 0.12, -0.62);
  }

  function alignBetween(mesh, a, b) {
      mid.copy(a).add(b).multiplyScalar(0.5);
      tmp.copy(b).sub(a);
      mesh.position.copy(mid);
      mesh.scale.y = Math.max(0.08, tmp.length());
      mesh.quaternion.setFromUnitVectors(axis, tmp.normalize());
  }

  function updateModel() {
    segments.forEach((segment) => {
      alignBetween(segment.mesh, joints[segment.a].position, joints[segment.b].position);
    });

    alignBetween(shoulderBar, joints.lElbow.position, joints.rElbow.position);
    shoulderBar.scale.y *= 0.38;

    torso.position.copy(joints.chest.position).lerp(joints.hip.position, 0.43);
    tmp.copy(joints.chest.position).sub(joints.hip.position);
    torso.quaternion.setFromUnitVectors(axis, tmp.normalize());

    pelvis.position.copy(joints.hip.position);
    pelvis.position.y += 0.02;
    tmp.copy(joints.chest.position).sub(joints.hip.position);
    pelvis.quaternion.setFromUnitVectors(axis, tmp.normalize());

    headMesh.position.copy(joints.head.position);
    tmp.copy(joints.head.position).sub(joints.neck.position);
    headMesh.quaternion.setFromUnitVectors(axis, tmp.normalize());

    hands.forEach((hand) => {
      hand.position.copy(joints[hand.userData.name].position);
    });

    feet.forEach((foot) => {
      const ankle = joints[foot.userData.name].position;
      foot.position.copy(ankle);
      foot.position.x += 0.18;
      foot.position.y -= 0.03;
      foot.rotation.set(0, 0.2, 0);
    });
  }

  function updateCues() {
    const selected = document.querySelector("#exerciseSelect").value;
    document.querySelector("#formCues").innerHTML = exerciseCues[selected]
      .map((cue) => `<div class="cue">${cue}</div>`)
      .join("");
  }

  function render(time) {
    const selected = document.querySelector("#exerciseSelect").value;
    const t = time * 0.0021;
    if (selected === "squat") poseSquat(t);
    if (selected === "hinge") poseHinge(t);
    if (selected === "pushup") posePushup(t);
    updateModel();
    figure.rotation.y = Math.sin(time * 0.00045) * 0.18;
    ghost.rotation.z += 0.003;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  document.querySelector("#exerciseSelect").addEventListener("change", updateCues);
  window.addEventListener("resize", resize);
  updateCues();
  resize();
  requestAnimationFrame(render);

  return { resize };
}

addEventListeners();
renderAll();
sceneApi = createExerciseScene();

const initialTab = new URLSearchParams(window.location.search).get("tab") || window.location.hash.slice(1);
if (initialTab && document.getElementById(initialTab)) {
  setTab(initialTab);
}
