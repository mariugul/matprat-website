/* eslint-disable no-unused-vars */
/* Recipe page functionality - Bootstrap 5 version */

// Navigate to recipe detail page
function openRecipe(recipe) {
  window.location.href = `/recipes/${recipe}`;
}

// Filter recipes by search input
function filterRecipes() {
  const searchInput = document.getElementById('searchInput');
  const filter = searchInput.value.toLowerCase();
  const recipeItems = document.querySelectorAll('.recipe-item');
  const noResults = document.getElementById('noResults');
  let visibleCount = 0;

  recipeItems.forEach((item) => {
    const recipeName = item.getAttribute('data-name');
    if (recipeName.includes(filter)) {
      item.style.display = '';
      visibleCount += 1;
    } else {
      item.style.display = 'none';
    }
  });

  // Show/hide no results message
  if (noResults) {
    noResults.style.display = visibleCount === 0 ? 'block' : 'none';
  }
}

// Filter recipes by category
function filterByCategory(category) {
  const recipeItems = document.querySelectorAll('.recipe-item');
  const categoryButtons = document.querySelectorAll('#categoryFilters button');
  const noResults = document.getElementById('noResults');
  let visibleCount = 0;

  // Update active button state
  categoryButtons.forEach((btn) => {
    btn.classList.remove('active', 'btn-primary');
    btn.classList.add('btn-outline-primary');
  });
  event.target.classList.remove('btn-outline-primary');
  event.target.classList.add('active', 'btn-primary');

  // Filter recipes
  recipeItems.forEach((item) => {
    const itemCategory = item.getAttribute('data-category');
    if (category === 'all' || itemCategory === category) {
      item.style.display = '';
      visibleCount += 1;
    } else {
      item.style.display = 'none';
    }
  });

  // Show/hide no results message
  if (noResults) {
    noResults.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  // Reset search input
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = '';
  }
}

// Sort recipes
function sortRecipes(sortType) {
  const container = document.getElementById('recipesContainer');
  const recipeItems = Array.from(document.querySelectorAll('.recipe-item'));
  const sortButtons = document.querySelectorAll('.btn-group button');

  // Update active button state
  sortButtons.forEach((btn) => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');

  // Sort logic
  let sortedItems = [...recipeItems];

  if (sortType === 'name') {
    // Sort alphabetically by name
    sortedItems.sort((a, b) => {
      const nameA = a.getAttribute('data-name');
      const nameB = b.getAttribute('data-name');
      return nameA.localeCompare(nameB);
    });
  } else if (sortType === 'time') {
    // Sort by cooking time
    sortedItems.sort((a, b) => {
      const timeA = parseInt(a.getAttribute('data-time'), 10);
      const timeB = parseInt(b.getAttribute('data-time'), 10);
      return timeA - timeB;
    });
  }
  // 'default' keeps original order

  // Re-append items in sorted order
  sortedItems.forEach((item) => {
    container.appendChild(item);
  });
}
