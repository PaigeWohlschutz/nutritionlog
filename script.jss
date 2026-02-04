// SECTION: State
let meals = [];
let weeklyVarieties = new Set();
const WEEKLY_VARIETY_GOAL = 30;

// SECTION: DOM Refs
const athleteViewBtn = document.getElementById('athleteViewBtn');
const coachViewBtn = document.getElementById('coachViewBtn');
const athleteView = document.getElementById('athleteView');
const coachView = document.getElementById('coachView');

const mealForm = document.getElementById('mealForm');
const mealDescriptionInput = document.getElementById('mealDescription');
const mealDescriptionSuggestions = document.getElementById('mealDescriptionSuggestions');
const weekSelect = document.getElementById('weekSelect');

const athleteMealList = document.getElementById('athleteMealList');
const athleteLogEmpty = document.getElementById('athleteLogEmpty');
const totalMealsSpan = document.getElementById('totalMeals');
const totalCaloriesSpan = document.getElementById('totalCalories');
const athleteVarietySpan = document.getElementById('athleteVarieties');

const coachBlockLabel = document.getElementById('coachBlockLabel');
const coachTotalMeals = document.getElementById('coachTotalMeals');
const coachTotalCalories = document.getElementById('coachTotalCalories');
const coachVarietySpan = document.getElementById('coachVarieties');
const coachMealTableBody = document.getElementById('coachMealTableBody');
const printReportBtn = document.getElementById('printReportBtn');

// SECTION: Helpers
function formatMealType(type) {
  if (!type) return '';
  return type
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatFeel(value) {
  const map = {
    'great-energy': 'Great energy',
    steady: 'Steady / normal',
    sluggish: 'Sluggish',
    'stomach-issues': 'Stomach issues',
    cramping: 'Cramping',
  };
  return map[value] || value || '';
}

// Nutrition API config
const NUTRITION_API_KEY = 'nzOFZY//JUeBXzKi6/NJ1w==ObfVXfCMvL8disMD';
const NUTRITION_API_URL = 'https://api.api-ninjas.com/v1/nutrition?query=';

async function fetchNutritionForDescription(description) {
  if (!description) return null;

  try {
    const response = await fetch(
      `${NUTRITION_API_URL}${encodeURIComponent(description)}`,
      {
        headers: {
          'X-Api-Key': NUTRITION_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error('Nutrition API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    if (!Array.isArray(data) || !data.length) return null;

    // Sum over all returned items
    return data.reduce(
      (acc, item) => {
        acc.calories += Number(item.calories) || 0;
        acc.carbs += Number(item.carbohydrates_total_g) || 0;
        acc.protein += Number(item.protein_g) || 0;
        acc.fat += Number(item.fat_total_g) || 0;
        return acc;
      },
      { calories: 0, carbs: 0, protein: 0, fat: 0 }
    );
  } catch (error) {
    console.error('Nutrition API request failed:', error);
    return null;
  }
}

// SECTION: Rendering - Athlete
function renderAthleteView() {
  // Empty state
  if (!meals.length) {
    athleteLogEmpty.hidden = false;
    athleteMealList.innerHTML = '';
    totalMealsSpan.textContent = '0 meals';
    totalCaloriesSpan.textContent = '0 kcal';
    if (athleteVarietySpan) {
      athleteVarietySpan.textContent = `0 / ${WEEKLY_VARIETY_GOAL} varieties`;
    }
    return;
  }

  athleteLogEmpty.hidden = true;

  let totalCalories = 0;
  athleteMealList.innerHTML = '';

  weeklyVarieties = new Set();

  meals.forEach((meal) => {
    if (Array.isArray(meal.varieties)) {
      meal.varieties.forEach((v) => weeklyVarieties.add(v));
    }
    const item = document.createElement('li');
    item.className = 'meal-item';

    const timePill = document.createElement('span');
    timePill.className = 'meal-time-pill';
    timePill.textContent = meal.time || '—';

    const main = document.createElement('div');
    main.className = 'meal-main';

    const titleRow = document.createElement('div');
    titleRow.className = 'meal-title-row';

    const desc = document.createElement('div');
    desc.className = 'meal-description';
    desc.textContent = meal.description;

    const type = document.createElement('div');
    type.className = 'meal-type';
    type.textContent = formatMealType(meal.type);

    titleRow.appendChild(desc);
    titleRow.appendChild(type);

    const macrosRow = document.createElement('div');
    macrosRow.className = 'meal-macros';

    if (meal.calories) {
      totalCalories += meal.calories;
      const pill = document.createElement('span');
      pill.className = 'macro-pill';
      pill.textContent = `${meal.calories} kcal${meal.estimated ? ' (est.)' : ''}`;
      macrosRow.appendChild(pill);
    }

    if (meal.carbs) {
      const pill = document.createElement('span');
      pill.className = 'macro-pill';
      pill.textContent = `${meal.carbs} g carbs`;
      macrosRow.appendChild(pill);
    }

    if (meal.protein) {
      const pill = document.createElement('span');
      pill.className = 'macro-pill';
      pill.textContent = `${meal.protein} g protein`;
      macrosRow.appendChild(pill);
    }

    if (meal.fat) {
      const pill = document.createElement('span');
      pill.className = 'macro-pill';
      pill.textContent = `${meal.fat} g fat`;
      macrosRow.appendChild(pill);
    }

    const feelRow = document.createElement('div');
    feelRow.className = 'meal-feel-row';

    const feel = document.createElement('div');
    feel.className = 'meal-feel';
    feel.textContent = formatFeel(meal.feel);

    feelRow.appendChild(feel);

    const notes = document.createElement('div');
    notes.className = 'meal-notes';
    notes.textContent = meal.notes || '';

    main.appendChild(titleRow);
    main.appendChild(macrosRow);
    main.appendChild(feelRow);
    if (meal.notes) {
      main.appendChild(notes);
    }

    item.appendChild(timePill);
    item.appendChild(main);
    athleteMealList.appendChild(item);
  });

  const mealLabel = meals.length === 1 ? 'meal' : 'meals';
  totalMealsSpan.textContent = `${meals.length} ${mealLabel}`;
  totalCaloriesSpan.textContent = `${totalCalories} kcal`;

  if (athleteVarietySpan) {
    athleteVarietySpan.textContent = `${weeklyVarieties.size} / ${WEEKLY_VARIETY_GOAL} varieties`;
  }
}

// SECTION: Rendering - Coach
function renderCoachView() {
  // Meta
  coachTotalMeals.textContent = meals.length.toString();
  if (coachVarietySpan) {
    coachVarietySpan.textContent = `${weeklyVarieties.size} / ${WEEKLY_VARIETY_GOAL}`;
  }

  let totalCalories = 0;
  coachMealTableBody.innerHTML = '';

  meals.forEach((meal) => {
    const row = document.createElement('tr');

    const timeCell = document.createElement('td');
    timeCell.textContent = meal.time || '';

    const descCell = document.createElement('td');
    descCell.textContent = meal.description;

    const typeCell = document.createElement('td');
    typeCell.textContent = formatMealType(meal.type);

    const caloriesCell = document.createElement('td');
    caloriesCell.textContent = meal.calories
      ? `${meal.calories}${meal.estimated ? ' (est.)' : ''}`
      : '';

    const carbsCell = document.createElement('td');
    carbsCell.textContent = meal.carbs ? `${meal.carbs}` : '';

    const proteinCell = document.createElement('td');
    proteinCell.textContent = meal.protein ? `${meal.protein}` : '';

    const fatCell = document.createElement('td');
    fatCell.textContent = meal.fat ? `${meal.fat}` : '';

    const feelCell = document.createElement('td');
    feelCell.textContent = formatFeel(meal.feel);

    const notesCell = document.createElement('td');
    notesCell.textContent = meal.notes || '';

    if (meal.calories) {
      totalCalories += meal.calories;
    }

    row.appendChild(timeCell);
    row.appendChild(descCell);
    row.appendChild(typeCell);
    row.appendChild(caloriesCell);
    row.appendChild(carbsCell);
    row.appendChild(proteinCell);
    row.appendChild(fatCell);
    row.appendChild(feelCell);
    row.appendChild(notesCell);

    coachMealTableBody.appendChild(row);
  });

  coachTotalCalories.textContent = `${totalCalories} kcal`;

  // Block label from selector
  const selectedOption = weekSelect.options[weekSelect.selectedIndex];
  coachBlockLabel.textContent = selectedOption ? selectedOption.textContent : '';
}

// SECTION: Event Handlers
if (mealForm) {
  mealForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(mealForm);
    const description = formData.get('description').trim();
    const type = formData.get('type');
    const time = formData.get('time');
    const category = formData.get('foodCategory');
    const portionSize = formData.get('portionSize');
    const varietiesRaw = formData.get('varieties') || '';
    const caloriesRaw = formData.get('calories');
    const carbsRaw = formData.get('carbs');
    const proteinRaw = formData.get('protein');
    const fatRaw = formData.get('fat');
    const feel = (formData.get('feel') || '').toString();
    const notes = (formData.get('notes') || '').toString().trim();
 
    if (!description || !type || !time || !category || !portionSize) {
      return;
    }

    // Try to fetch nutrition from API based on description
    const apiEstimate = await fetchNutritionForDescription(description);

    const calories = caloriesRaw
      ? Number(caloriesRaw)
      : apiEstimate
      ? Math.round(apiEstimate.calories)
      : null;
    const carbs = carbsRaw
      ? Number(carbsRaw)
      : apiEstimate
      ? Math.round(apiEstimate.carbs)
      : null;
    const protein = proteinRaw
      ? Number(proteinRaw)
      : apiEstimate
      ? Math.round(apiEstimate.protein)
      : null;
    const fat = fatRaw
      ? Number(fatRaw)
      : apiEstimate
      ? Math.round(apiEstimate.fat)
      : null;

    const varieties = varietiesRaw
      .split(',')
      .map((v) => v.trim().toLowerCase())
      .filter((v) => v);

    const meal = {
      description,
      type,
      time,
      category,
      portionSize: Number(portionSize),
      varieties,
      calories,
      carbs,
      protein,
      fat,
      feel,
      notes,
      estimated: Boolean(apiEstimate && !caloriesRaw && !carbsRaw && !proteinRaw && !fatRaw),
    };

    meals.push(meal);

    // Update weekly varieties set
    varieties.forEach((v) => weeklyVarieties.add(v));

    mealForm.reset();

    renderAthleteView();
    renderCoachView();
  });
}

// View toggle (defensive: ensure panels exist before toggling)
if (athleteViewBtn && coachViewBtn && athleteView && coachView) {
  athleteViewBtn.addEventListener('click', () => {
    athleteViewBtn.classList.add('chip-active');
    coachViewBtn.classList.remove('chip-active');

    athleteView.classList.add('panel-active');
    coachView.classList.remove('panel-active');

    athleteView.setAttribute('aria-hidden', 'false');
    coachView.setAttribute('aria-hidden', 'true');

    athleteViewBtn.setAttribute('aria-selected', 'true');
    coachViewBtn.setAttribute('aria-selected', 'false');
  });

  coachViewBtn.addEventListener('click', () => {
    coachViewBtn.classList.add('chip-active');
    athleteViewBtn.classList.remove('chip-active');

    coachView.classList.add('panel-active');
    athleteView.classList.remove('panel-active');

    coachView.setAttribute('aria-hidden', 'false');
    athleteView.setAttribute('aria-hidden', 'true');

    coachViewBtn.setAttribute('aria-selected', 'true');
    athleteViewBtn.setAttribute('aria-selected', 'false');

    // Ensure coach view content is up to date when toggled on
    try {
      renderCoachView();
    } catch (e) {
      console.error('Error rendering coach view on toggle:', e);
    }
  });
}

// Week selector to update block label
if (weekSelect) {
  weekSelect.addEventListener('change', () => {
    renderCoachView();
  });
}

// Print / PDF
if (printReportBtn) {
  printReportBtn.addEventListener('click', () => {
    // Browser print dialog; user can choose "Save as PDF"
    window.print();
  });
}

// Initial render (defensive checks for GitHub deployment / Safari)
if (typeof renderAthleteView === 'function') {
  try {
    renderAthleteView();
  } catch (e) {
    console.error('Error rendering athlete view:', e);
  }
}

if (typeof renderCoachView === 'function') {
  try {
    renderCoachView();
  } catch (e) {
    console.error('Error rendering coach view:', e);
  }
}
