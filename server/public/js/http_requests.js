/* eslint-disable no-unused-vars */
// Loads the basic info of a specific recipe.
// e.g. Description, Default Portions ..
function loadRecipeInfo(recipe) {
  const xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function onStateChange() {
    if (this.readyState === 4 && this.status === 200) {
      document.getElementById('demo').innerHTML = this.responseText;
    }
  };

  const getRecipeInfo = `http://172.21.222.253:3000/api/db/select/recipe/${recipe}`;
  xhttp.open('GET', getRecipeInfo, true);
  xhttp.send();
}

// Loads the name of all recipes in the database.
// This is displayed on the 'recipes' page to choose a recipe.
function loadAllRecipeNames() {
  const xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function onSateChange() {
    if (this.readyState === 4 && this.status === 200) {
      document.getElementById('demo').innerHTML = this.responseText;
    }
  };

  xhttp.open('GET', 'http://172.21.222.253:3000/api/db/select/recipes', true);
  xhttp.send();
}
