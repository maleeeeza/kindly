var placeSearch, autocomplete;
var state = {
  loc: null
};

function initAutocomplete() {
  // Create the autocomplete object, restricting the search to geographical
  // location types.
  autocomplete = new google.maps.places.Autocomplete(
      /** @type {!HTMLInputElement} */(document.getElementById('autocomplete')),
      {types: ['geocode']});
      console.log(autocomplete);

}


// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
  console.log('howdy');
  if (navigator.geolocation) {
    console.log('after if');
    navigator.geolocation.getCurrentPosition(function(position) {
      var geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      var circle = new google.maps.Circle({
        center: geolocation,
        radius: position.coords.accuracy
      });
      console.log("geolocation:" + geolocation.lat + "  " + geolocation.lng);
      console.log("circle:" + circle.center + circle.radius);

      autocomplete.setBounds(circle.getBounds());

    });

  }
}

$(function(){

  const geolocButton = $('#current-location');
  const addressButton = $('#address');

  geolocButton.on('click', geolocate);
  addressButton.on('click', function(e){
    $('#autocomplete').removeAttr("hidden");
  });




});
