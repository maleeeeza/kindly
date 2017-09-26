var placeSearch, autocomplete;


var state = {
  lat: null,
  long: null,
  kindly: null
};

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
      ],
            {name: 'Kindly Map'});

  var kindlyCoords = {lat: 44.975173, lng: -93.274837};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: kindlyCoords,
    mapTypeControlOptions: {
            mapTypeIds: ['kindly_map']
          }
  });
  map.mapTypes.set('kindly_map', styledMapType);
        map.setMapTypeId('kindly_map');

  var image = {
    url: './images/kindly-marker.svg',
    scaledSize: new google.maps.Size(50, 50),
    origin: new google.maps.Point(0,0), // origin
    anchor: new google.maps.Point(0, 0) // anchor
};
  var marker = new google.maps.Marker({
    position: kindlyCoords,
    map: map,
    icon:image
  });

  marker.addListener('click', function() {
          infowindow.open(map, marker);
        });

  var contentString = '<div id="content">'+
            '<div id="siteNotice">'+
            '</div>'+
            '<h1 id="firstHeading" class="firstHeading">Minneapolis, MN</h1>'+
            '<div id="bodyContent">'+
            '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras iaculis, orci mattis vestibulum vulputate, augue turpis lobortis leo, ut molestie nibh urna eget elit. Phasellus sed euismod quam. Ut tristique metus massa. Suspendisse mollis et enim vitae blandit. Suspendisse ac lobortis magna. Curabitur nisl dui, dapibus non nunc non, lacinia euismod massa. Duis ut faucibus augue, commodo blandit dolor. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vestibulum ut sapien vulputate, vestibulum risus eget, posuere mauris.</p>'+
            '</div>'+
            '</div>';

        var infowindow = new google.maps.InfoWindow({
          content: contentString
        });


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


  // geolocButton.on('click', geolocate);

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
    console.log("state with kindly: " + JSON.stringify(state));
    saveKindly();
  });


});

$(function() {
    $('a').click(function() {
        func1();
        func2();
    });
});
