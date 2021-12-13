/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

function showDivs(n) {
  let i;
  const x = document.getElementsByClassName('mySlides');
  const dots = document.getElementsByClassName('demo');
  if (n > x.length) { slideIndex = 1; }
  if (n < 1) { slideIndex = x.length; }
  for (i = 0; i < x.length; i += 1) {
    x[i].style.display = 'none';
  }
  for (i = 0; i < dots.length; i += 1) {
    dots[i].className = dots[i].className.replace(' w3-opacity-off', '');
  }
  x[slideIndex - 1].style.display = 'block';
  dots[slideIndex - 1].className += ' w3-opacity-off';
}

function currentDiv(n) {
  showDivs(slideIndex = n);
}

function openRecipe(recipe) {
  window.open(`recipes/${recipe}`, '_self');
}
