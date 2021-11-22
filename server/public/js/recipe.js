// Globals -> Loaded only once and after the html page has rendered
// ----------------------------------------------------------------------

// The deault amount of portions defined for the recipe. This value is
// used to scale the recipes accurately.
const DEFAULT_PORTIONS = document.getElementById("nr-of-portions").value;

// The default amount of each ingredient defined for the recipe. This
// value is used to scale the recipes accurately.
const DEFAULT_AMOUNTS = (function setDefaultIngredients(nr) {
  let defaultNumbers = new Array();

  const matches = document.querySelectorAll("div.ingredient-amounts > p");
  matches.forEach((ingredient) => {
    defaultNumbers += parseInt(ingredient.innerHTML);
  });

  return defaultNumbers;
})();

const MAX_PORTIONS = 99;
const MIN_PORTIONS = 1;

// Functions
// ----------------------------------------------------------------------

// Scales the amount of each ingredient proportional to the chosen portions.
function updateIngredientValues(portion) {
  // Reset or limit portions
  if (portion == "" || portion == "0") portion = DEFAULT_PORTIONS; // Reset values to default on invalid input
  if (portion > MAX_PORTIONS) portion = MAX_PORTIONS; 
  if (portion < MIN_PORTIONS) portion = MIN_PORTIONS; 

  // Update portions number
  document.getElementById("nr-of-portions").value = portion;

  // Get all ingredient's value
  const matches = document.querySelectorAll("div.ingredient-amounts > p");

  // Loop over every ingredient and scale the value
  matches.forEach(function (ingredient, i) {
    var scaled_amount = (portion / DEFAULT_PORTIONS) * DEFAULT_AMOUNTS[i];
    // Round value to 1 decimal poin
    ingredient.innerHTML =
      Math.round((scaled_amount + Number.EPSILON) * 10) / 10;
  });
}

// Steps up the number of portions when the plus button is clicked
function stepUpPortions() {
  var portions = getPortionsObject();
  portions.stepUp();
  updateIngredientValues(parseInt(portions.value));
}

// Steps down the number of portions when the minus button in clicked
function stepDownPortions() {
  var portions = getPortionsObject();
  portions.stepDown();
  updateIngredientValues(parseInt(portions.value));
}

function getPortionsObject() {
  return document.getElementById("nr-of-portions");
}
