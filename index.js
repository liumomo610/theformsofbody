// costom dropdown menu, dfferent from bootstrap

function showDropdown(dropdownbtn) {
  dropdownbtn.parentNode.children[1].classList.toggle("customShow");
  console.log(dropdownbtn.parentNode.children[1]);
}


window.onclick = function(event) {
  if (!event.target.matches('.customDropbtn')) {
    var dropdowns = document.getElementsByClassName("customDropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('customShow')) {
        openDropdown.classList.remove('customShow');
      }
    }
  }
}


// changing background img using dropdowns
var emgPlacementImg = [
  'images/emgPlacement/02.png',
  'images/emgPlacement/03.png',
  'images/emgPlacement/09.png',
  'images/emgPlacement/11.png',
  'images/emgPlacement/14.png',
  'images/emgPlacement/19.png',
  'images/emgPlacement/22.png',
  'images/emgPlacement/23.png',
  'images/emgPlacement/27.png',

];

$('#EMGPlacementImage').change(function() {
  var val = parseInt($('#EMGPlacementImage').val());
  $('#EMGPlacementView').css("background-image", "url(" + emgPlacementImg[val] + ")");
});

//change background for yoga poseInstructionText

var yogaPoseImg = [
  'images/yogaPose/bikram03.png',
  'images/yogaPose/bikram04.png',
  'images/yogaPose/bikram07.png',
  'images/yogaPose/bikram08.png',
  'images/yogaPose/bikram09.png',

];

$('#yogaPoseImage').change(function() {
  var val = parseInt($('#yogaPoseImage').val());
  $('#poseInstructionImage').css("background-image", "url(" + yogaPoseImg[val] + ")");
});
