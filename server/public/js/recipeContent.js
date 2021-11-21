// Steps up the number of portions when the plus button is clicked
function stepUpPortions() {
    document.getElementById("nr-of-portions").stepUp();
  
    // Try to resize eggs
    var eggs = parseInt(document.getElementById("egg-amounts").innerHTML);
    eggs++;
    document.getElementById("egg-amounts").innerHTML = eggs;
  }
  
  // Steps down the number of portions when the minus button in clicked
  function stepDownPortions() {
    document.getElementById("nr-of-portions").stepDown();
  
    // Try to resize eggs
    var eggs = parseInt(document.getElementById("egg-amounts").innerHTML);
    eggs--;
    document.getElementById("egg-amounts").innerHTML = eggs;
  }