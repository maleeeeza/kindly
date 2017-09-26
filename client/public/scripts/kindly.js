var placeSearch, autocomplete;


var state = {
  lat: null,
  long: null,
  kindly: null
};

function initAutocomplete() {
  // Create the autocomplete object, restricting the search to geographical
  // location types.
  autocomplete = new google.maps.places.Autocomplete(
      /** @type {!HTMLInputElement} */(document.getElementById('autocomplete')),
      {types: ['geocode']});
      console.log(autocomplete);
  autocomplete.addListener('place_changed', function(){

    //get place
    var place = autocomplete.getPlace();
    console.log(place);

    GetLatlong();




    //call place.geometry.lat function to find lat
    //call place.geometry.long function to find long
    //set lat and long to state.lat/state.long

  });
}

function GetLatlong(){
        var geocoder = new google.maps.Geocoder();
        var address = document.getElementById('autocomplete').value;

        geocoder.geocode({ 'address': address }, function (results, status) {

            if (status == google.maps.GeocoderStatus.OK) {
                var latitude = results[0].geometry.location.lat();
                var longitude = results[0].geometry.location.lng();

            }
            console.log(latitude + ' ' + longitude);
            state.lat = latitude;
            state.long = longitude;
            console.log("state: " + JSON.stringify(state));
        });
      }





// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      state.lat = geolocation.lat;
      state.long = geolocation.lng;


      var circle = new google.maps.Circle({
        center: geolocation,
        radius: position.coords.accuracy
      });
      console.log("geolocation:" + geolocation.lat + "  " + geolocation.lng);
      console.log("circle:" + circle.center + circle.radius);
      console.log("state: " + JSON.stringify(state));

      autocomplete.setBounds(circle.getBounds());

    });


  }
}

function saveKindly() {


  $.ajax({
        type: "POST",
        dataType: 'json',
        data: JSON.stringify(state),
				contentType: 'application/json',
        url: "/api/kindlys",
        success: function(msg) {
             console.log('YAY');
             console.log("state: " + JSON.stringify(state));
             }

    });
}



$(function(){

  const geolocButton = $('#current-location');
  const addressButton = $('#address');
  const kindlyPostButton = $('#submit');


  geolocButton.on('click', geolocate);
  addressButton.on('click', function(e){
    $('#autocomplete').removeAttr("hidden");
  });
  kindlyPostButton.on('click', function(e){
    state.kindly = $('#kindly').val();
    console.log("state with kindly: " + JSON.stringify(state));
    saveKindly();
  });


});
