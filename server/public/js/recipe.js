// Globals -> Loaded only once and after the html page has rendered
// ----------------------------------------------------------------------

// The deault amount of portions defined for the recipe. This value is
// used to scale the recipes accurately.
const DEFAULT_PORTIONS = document.getElementById("nr-of-portions").value;

// The default amount of each ingredient defined for the recipe. This
// value is used to scale the recipes accurately.
const DEFAULT_AMOUNTS = (function setDefaultIngredients(nr) {
  let defaultNumbers = new Array();

  var table = document.getElementsByClassName("amounts");
  for (let index = 0; index < table.length; index++) {
    defaultNumbers += parseInt(table[index].innerHTML);
  }

  return defaultNumbers;
})();

const MAX_PORTIONS = 99;
const MIN_PORTIONS = 1;

// Functions
// ----------------------------------------------------------------------

// Scales the amount of each ingredient proportional to the chosen portions.
function updateIngredientValues(portion) {
  // Enable plus and minus button in case they were diabled previously
  document.getElementById("plus-button").disabled = false;
  document.getElementById("minus-button").disabled = false;

  // Reset portions on invalid number input
  if (portion == "" || portion == "0") portion = DEFAULT_PORTIONS; // Reset values to default on invalid input

  // Limit portions to MAX_PORTIONS and disable plus button
  if (portion >= MAX_PORTIONS) {
    portion = MAX_PORTIONS;
    document.getElementById("plus-button").disabled = true;
  }

  // Limit portions to MIN_PORTIONS and disable minus button
  if (portion <= MIN_PORTIONS) {
    portion = MIN_PORTIONS;
    document.getElementById("minus-button").disabled = true;
  }

  // Update portions number
  document.getElementById("nr-of-portions").value = portion;

  // Get all 'td's of ingredient-amounts from the table
  var table_td = document.getElementsByClassName("amounts");

  // Loop over every ingredient and scale the value
  for (let index = 0; index < table_td.length; index++) {
    var scaled_amount = (portion / DEFAULT_PORTIONS) * DEFAULT_AMOUNTS[index];
    table_td[index].innerHTML =
      Math.round((scaled_amount + Number.EPSILON) * 10) / 10;
  }
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

function strikeThroughText(listId) {
  const clickedListItem = document.getElementById(listId);
  const spanElement = clickedListItem.querySelector("span");
  const text = spanElement.innerHTML;
  const strikedText = "<del>" + text + "</del>";

  // If the text is striked through, unstrike
  if (clickedListItem.querySelector("del") !== null) {
    // Parse away the strike tag
    let unstrikedText = text.replace("<del>", "");
    unstrikedText = unstrikedText.replace("</del>", "");

    // Set the text back
    spanElement.innerHTML = unstrikedText;
  } else {
    spanElement.innerHTML = strikedText;
  }

  console.log(spanElement.innerHTML);
}
