// style on map set to 100vh but want it to cover page without scroll bar
// issues: markers is only right size for one, wrong size when zooming
// works locally, not in prod
// style, center form/buttons
//"refresh" after posting so map populates

var placeSearch, autocomplete;


var state = {
  lat: null,
  long: null,
  kindly: null
};

var allKindlys = [];
var map;


function initMap() {
  var styledMapType = new google.maps.StyledMapType(
    [
        {
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#444444"
            }
        ]
        },
        {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#f2f2f2"
            }
        ]
        },
        {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
        },
        {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 45
            }
        ]
        },
        {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
        },
        {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
        },
        {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
        },
        {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#46bcec"
            },
            {
                "visibility": "on"
            }
        ]
        }
      ], {name: 'Kindly Map'});

  var kindlyCoords = {lat: 44.975173, lng: -93.274837};
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: kindlyCoords,
    mapTypeIds: 'kindly_map'
  });

  map.mapTypes.set('kindly_map', styledMapType);
  map.setMapTypeId('kindly_map');


}

function setMarkers(){

  var infoWindow = new google.maps.InfoWindow(), marker, i;
  var bounds = new google.maps.LatLngBounds();

  var image = {
    url: './images/kindly-marker.svg',
    scaledSize: new google.maps.Size(50, 50),
    origin: new google.maps.Point(0,0), // origin
    anchor: new google.maps.Point(0, 0) // anchor
  };

  for (i = 0; i < allKindlys.length; i++) {
    var kindly = allKindlys[i];

    marker = new google.maps.Marker({
      position: {lat: kindly[0], lng: kindly[1]},
      map: map,
      icon: image,
      title: kindly[2]
    });
    //Add info window to marker
    google.maps.event.addListener(marker, 'click', (function(marker, i) {
        return function() {
            infoWindow.setContent(allKindlys[i][2]);
            infoWindow.open(map, marker);
        }
    })(marker, i));


  }





}

function initAutocomplete() {
  // Create the autocomplete object, restricting the search to geographical
  // location types.
  initMap();
  autocomplete = new google.maps.places.Autocomplete(
      /** @type {!HTMLInputElement} */(document.getElementById('autocomplete')),
      {types: ['geocode']});
      console.log(autocomplete);
  autocomplete.addListener('place_changed', function(){

    //get place
    var place = autocomplete.getPlace();
    console.log(place);

    GetLatlong();


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

function getKindlys(){
  $.ajax({
    type: "GET",
    dataType: 'json',
    // data: data,
		contentType: 'application/json',
    url: "/api/kindlys",
    success: function(msg) {
       console.log('YAY');
       console.log(msg);
       let kindlys = msg.kindlys;
       for (var i = 0; i < kindlys.length; i++){
         // pushing to array of array because Google markexpects lat, long, infotext
         allKindlys.push([kindlys[i].lat, kindlys[i].long, kindlys[i].kindly]);
       }
       console.log(allKindlys);
       setMarkers(map);
    }
  });
}



$(function(){
  initAutocomplete();
  const geolocButton = $('#current-location');
  const addressButton = $('#address');
  const kindlyPostButton = $('#submit');

  getKindlys();

  geolocButton.on('click', function(e){
    geolocate();
    $('#kindly, #submit').removeAttr("hidden");
  });

  addressButton.on('click', function(e){
    $('#autocomplete, #kindly, #submit').removeAttr("hidden");
  });

  $( "#toggle-kindly-form" ).click(function() {
    $( "#kindly-form" ).slideToggle("fast");
  });

  kindlyPostButton.on('click', function(e){
    state.kindly = $('#kindly').val();
    saveKindly();
  });
});
