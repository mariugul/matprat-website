/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
// Globals -> Loaded only once and after the html page has rendered
// ----------------------------------------------------------------------

// The deault amount of portions defined for the recipe. This value is
// used to scale the recipes accurately.
const DEFAULT_PORTIONS = document.getElementById('nr-of-portions').value;

// The default amount of each ingredient defined for the recipe. This
// value is used to scale the recipes accurately.
const DEFAULT_AMOUNTS = (function setDefaultIngredients(nr) {
  let defaultNumbers = [];

  const table = document.getElementsByClassName('amounts');
  for (let index = 0; index < table.length; index += 1) {
    defaultNumbers += parseInt(table[index].innerHTML, 10);
  }

  return defaultNumbers;
}());

const MAX_PORTIONS = 99;
const MIN_PORTIONS = 1;

// Functions
// ----------------------------------------------------------------------

// Scales the amount of each ingredient proportional to the chosen portions.
function updateIngredientValues(portion) {
  // Enable plus and minus button in case they were diabled previously
  document.getElementById('plus-button').disabled = false;
  document.getElementById('minus-button').disabled = false;

  // Reset portions on invalid number input
  if (portion === '' || portion === '0') portion = DEFAULT_PORTIONS; // Reset values to default on invalid input

  // Limit portions to MAX_PORTIONS and disable plus button
  if (portion >= MAX_PORTIONS) {
    portion = MAX_PORTIONS;
    document.getElementById('plus-button').disabled = true;
  }

  // Limit portions to MIN_PORTIONS and disable minus button
  if (portion <= MIN_PORTIONS) {
    portion = MIN_PORTIONS;
    document.getElementById('minus-button').disabled = true;
  }

  // Update portions number
  document.getElementById('nr-of-portions').value = portion;

  // Get all 'td's of ingredient-amounts from the table
  const tableTd = document.getElementsByClassName('amounts');

  // Loop over every ingredient and scale the value
  for (let index = 0; index < tableTd.length; index += 1) {
    const scaledAmount = (portion / DEFAULT_PORTIONS) * DEFAULT_AMOUNTS[index];
    tableTd[index].innerHTML = Math.round((scaledAmount + Number.EPSILON) * 10) / 10;
  }
}

function getPortionsObject() {
  return document.getElementById('nr-of-portions');
}

// Steps up the number of portions when the plus button is clicked
function stepUpPortions() {
  const portions = getPortionsObject();
  portions.stepUp();
  updateIngredientValues(parseInt(portions.value, 10));
}

// Steps down the number of portions when the minus button in clicked
function stepDownPortions() {
  const portions = getPortionsObject();
  portions.stepDown();
  updateIngredientValues(parseInt(portions.value, 10));
}

// Toggle step completion by clicking anywhere on the card
function toggleStepByCard(stepCard, textId) {
  const stepText = document.getElementById(textId);
  const completionIndicator = stepCard.querySelector('.completion-indicator');
  const stepNumber = stepCard.querySelector('.step-number');
  
  // Check if currently completed
  const isCompleted = stepCard.classList.contains('bg-success');
  
  if (isCompleted) {
    // Mark as incomplete
    stepText.style.textDecoration = 'none';
    stepText.style.opacity = '1';
    stepCard.classList.remove('bg-success', 'bg-opacity-10', 'border-success');
    stepCard.classList.add('bg-light', 'bg-opacity-25', 'border-primary-subtle');
    stepNumber.classList.remove('bg-success');
    stepNumber.classList.add('bg-primary');
    completionIndicator.style.display = 'none';
  } else {
    // Mark as complete
    stepText.style.textDecoration = 'line-through';
    stepText.style.opacity = '0.6';
    stepCard.classList.remove('bg-light', 'bg-opacity-25', 'border-primary-subtle');
    stepCard.classList.add('bg-success', 'bg-opacity-10', 'border-success');
    stepNumber.classList.remove('bg-primary');
    stepNumber.classList.add('bg-success');
    completionIndicator.style.display = 'block';
  }
  
  // Check if all steps are completed
  checkAllStepsComplete();
}

// Check if all steps are complete and show completion message
function checkAllStepsComplete() {
  const allStepCards = document.querySelectorAll('.step-card');
  const allCompleted = Array.from(allStepCards).every((card) => card.classList.contains('bg-success'));
  const completionCard = document.getElementById('completionCard');
  
  if (completionCard) {
    completionCard.style.display = allCompleted && allStepCards.length > 0 ? 'block' : 'none';
  }
}
