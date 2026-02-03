// SECTION: State
let meals = [];
let recipes = [];
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
const recipeForm = document.getElementById('recipeForm');
const weekSelect = document.getElementById('weekSelect');

const athleteMealList = document.getElementById('athleteMealList');
const recipeList = document.getElementById('recipeList');
const recipeEmptyState = document.getElementById('recipeEmptyState');
const mealRecipeSelect = document.getElementById('mealRecipe');
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

// Simple Canada Food Guide style estimates per "plate" portion
// Values are rough training-friendly averages, not clinical nutrition data.
const CFG_ESTIMATES = {
  vegetables: {
    calories: 80,
    carbs: 18,
    protein: 3,
    fat: 0,
  },
  grains: {
    calories: 250,
    carbs: 50,
    protein: 9,
    fat: 3,
  },
  protein: {
    calories: 220,
    carbs: 5,
    protein: 30,
    fat: 8,
  },
  mixed: {
    calories: 450,
    carbs: 55,
    protein: 22,
    fat: 14,
  },
};

function estimateNutritionFromGuide(category, portionMultiplier) {
  const base = CFG_ESTIMATES[category];
  if (!base || !portionMultiplier) return null;

  const factor = Number(portionMultiplier) || 0;
  if (!factor) return null;

  return {
    calories: Math.round(base.calories * factor),
    carbs: Math.round(base.carbs * factor),
    protein: Math.round(base.protein * factor),
    fat: Math.round(base.fat * factor),
  };
}

function renderRecipeLibrary() {
  if (!recipeList || !recipeEmptyState) return;

  if (!recipes.length) {
    recipeEmptyState.hidden = false;
    recipeList.innerHTML = '';
    if (mealRecipeSelect) {
      mealRecipeSelect.innerHTML = '<option value="">No recipe</option>';
    }
    return;
  }

  recipeEmptyState.hidden = true;
  recipeList.innerHTML = '';

  recipes.forEach((recipe) => {
    const li = document.createElement('li');
    li.className = 'recipe-item';

    const link = document.createElement('a');
    link.href = recipe.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = recipe.name;
    link.className = 'recipe-name-link';

    li.appendChild(link);
    recipeList.appendChild(li);
  });

  if (mealRecipeSelect) {
    mealRecipeSelect.innerHTML = '<option value="">No recipe</option>';
    recipes.forEach((recipe) => {
      const option = document.createElement('option');
      option.value = recipe.id;
      option.textContent = recipe.name;
      mealRecipeSelect.appendChild(option);
    });
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

    // Linked recipe pill
    if (meal.recipeId) {
      const recipe = recipes.find((r) => r.id === meal.recipeId);
      if (recipe) {
        const recipeRow = document.createElement('div');
        recipeRow.className = 'meal-recipe-row';

        const link = document.createElement('a');
        link.href = recipe.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'macro-pill recipe-pill';
        link.textContent = recipe.name;

        recipeRow.appendChild(link);
        main.appendChild(recipeRow);
      }
    }

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

    const recipeCell = document.createElement('td');
    if (meal.recipeId) {
      const recipe = recipes.find((r) => r.id === meal.recipeId);
      if (recipe) {
        const link = document.createElement('a');
        link.href = recipe.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = recipe.name;
        recipeCell.appendChild(link);
      }
    }

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
    row.appendChild(recipeCell);
    row.appendChild(notesCell);

    coachMealTableBody.appendChild(row);
  });

  coachTotalCalories.textContent = `${totalCalories} kcal`;

  // Block label from selector
  const selectedOption = weekSelect.options[weekSelect.selectedIndex];
  coachBlockLabel.textContent = selectedOption ? selectedOption.textContent : '';
}

// SECTION: Event Handlers
// Meal description → recipe suggestions
if (mealDescriptionInput && mealDescriptionSuggestions) {
  mealDescriptionInput.addEventListener('input', () => {
    const query = mealDescriptionInput.value.trim().toLowerCase();

    // Clear suggestions when query is short or no recipes
    if (!query || recipes.length === 0) {
      mealDescriptionSuggestions.innerHTML = '';
      mealDescriptionSuggestions.hidden = true;
      return;
    }

    const matches = recipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(query)
    );

    mealDescriptionSuggestions.innerHTML = '';

    if (!matches.length) {
      mealDescriptionSuggestions.hidden = true;
      return;
    }

    matches.forEach((recipe) => {
      const li = document.createElement('li');
      li.className = 'suggestion-item';
      li.textContent = recipe.name;
      li.addEventListener('click', () => {
        mealDescriptionInput.value = recipe.name;
        // If there is a linked recipe select, sync it
        if (mealRecipeSelect) {
          mealRecipeSelect.value = recipe.id;
        }
        mealDescriptionSuggestions.innerHTML = '';
        mealDescriptionSuggestions.hidden = true;
      });
      mealDescriptionSuggestions.appendChild(li);
    });

    mealDescriptionSuggestions.hidden = false;
  });

  // Hide suggestions when input loses focus (with small delay to allow click)
  mealDescriptionInput.addEventListener('blur', () => {
    setTimeout(() => {
      mealDescriptionSuggestions.innerHTML = '';
      mealDescriptionSuggestions.hidden = true;
    }, 150);
  });
}


if (recipeForm) {
  recipeForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(recipeForm);
    const nameRaw = (formData.get('recipeName') || '').toString().trim();
    const urlRaw = (formData.get('recipeUrl') || '').toString().trim();

    if (!nameRaw || !urlRaw) {
      alert('Please enter both a recipe name and a valid URL.');
      return;
    }

    const recipe = {
      id: `r_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      name: nameRaw,
      url: urlRaw,
    };

    recipes.push(recipe);
    recipeForm.reset();
    renderRecipeLibrary();
  });
}

if (mealForm) {
  mealForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(mealForm);
    const description = formData.get('description').trim();
    const type = formData.get('type');
    const time = formData.get('time');
    const category = formData.get('foodCategory');
    const portionSize = formData.get('portionSize');
    const varietiesRaw = formData.get('varieties') || '';
    const recipeId = formData.get('mealRecipe') || '';
    const caloriesRaw = formData.get('calories');
    const carbsRaw = formData.get('carbs');
    const proteinRaw = formData.get('protein');
    const fatRaw = formData.get('fat');
    const feel = (formData.get('feel') || '').toString();
    const notes = (formData.get('notes') || '').toString().trim();
 
    if (!description || !type || !time || !category || !portionSize) {
      return;
    }

    // Auto-estimate from Canada Food Guide style rules
    const estimate = estimateNutritionFromGuide(category, portionSize);

    const calories = caloriesRaw
      ? Number(caloriesRaw)
      : estimate
      ? estimate.calories
      : null;
    const carbs = carbsRaw ? Number(carbsRaw) : estimate ? estimate.carbs : null;
    const protein = proteinRaw
      ? Number(proteinRaw)
      : estimate
      ? estimate.protein
      : null;
    const fat = fatRaw ? Number(fatRaw) : estimate ? estimate.fat : null;

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
      recipeId: recipeId || null,
      calories,
      carbs,
      protein,
      fat,
      feel,
      notes,
      estimated: Boolean(estimate && !caloriesRaw && !carbsRaw && !proteinRaw && !fatRaw),
    };

    meals.push(meal);

    // Update weekly varieties set
    varieties.forEach((v) => weeklyVarieties.add(v));

    mealForm.reset();

    renderAthleteView();
    renderCoachView();
  });
}

// View toggle
if (athleteViewBtn && coachViewBtn) {
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

// Initial render
renderRecipeLibrary();
renderAthleteView();
renderCoachView();
