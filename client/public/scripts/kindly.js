// style on map set to 100vh but want it to cover page without scroll bar
// issues: markers is only right size for one, wrong size when zooming
// style, center form/buttons

var placeSearch, autocomplete;


var state = {
  lat: null,
  long: null,
  kindly: null
};

var allKindlys = [];

var userKindlys = [];
var map;
var userId;


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
  autocomplete.addListener('place_changed', function(){

    //get place
    var place = autocomplete.getPlace();

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
            state.lat = latitude;
            state.long = longitude;
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


      autocomplete.setBounds(circle.getBounds());

    });


  }
}

function saveKindly() {
  $.ajax({
    url: "/api/kindlys",
    type: "POST",
    dataType: 'json',
    data: JSON.stringify(state),
		contentType: 'application/json',
    beforeSend: function(req){
    const authCookie = Cookies.get('authToken');
      req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
    },
    success: function(data) {
      console.log(data);
      window.location.replace("/");

      }
    });
}

function getKindlys(){
  $.ajax({
    type: "GET",
    dataType: 'json',
		contentType: 'application/json',
    url: "/api/kindlys",
    success: function(msg) {

       let kindlys = msg.kindlys;
       for (var i = 0; i < kindlys.length; i++){
         // pushing to array of array because Google markexpects lat, long, infotext
         allKindlys.push([kindlys[i].lat, kindlys[i].long, kindlys[i].kindly]);
       }
       setMarkers(map);
    }
  });
}

function getKindlysById(){


  $.ajax({

    type:"GET",
    dataType:'json',
    beforeSend: function(req){
      isLoggedIn();
      const authCookie = Cookies.get('authToken');
        req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
    },
    contentType: 'application/json',
    url: "/api/kindlys/" + userId,
    success: function(msg){
      let kindlys = msg.kindlys;
      console.log(msg);
      for (var i = 0; i < kindlys.length; i++){
        userKindlys.push([kindlys[i].createdDate, kindlys[i].kindly]);
      }

    }
  });
}

function signUp(formData){


  $.ajax({
    url: "/api/users",
    type: "POST",
    dataType: 'json',
    data: JSON.stringify(formData),
		contentType: 'application/json',
    success: function(data) {
      console.log(data);
      var loginCredentials = {
        uname: formData.username,
        psw: formData.password
      }

      logMeIn(loginCredentials);

      setTimeout(function(){
          window.location.replace("/");
      }, 1000);


      }
    });
}


function logMeIn(formData) {

  const loginURL = '/api/auth/login';
  const { uname, psw } = formData;

  /** Set the auth headers we need before sending request. */
  function setHeader(req) {
    const encodedStr = btoa(`${uname}:${psw}`);
    req.setRequestHeader('Authorization', 'Basic ' + encodedStr);
  }

  function handleSuccess(res) {
      Cookies.set('authToken', res.authToken);
      getUserId();
    }

  const infoSettings = {
    url: loginURL,
    type: 'POST',
    beforeSend: setHeader,
    data: formData,
    success: handleSuccess,
    error: function(err) {
      console.log(err);
    }
  };

  $.ajax(infoSettings);

}

function isLoggedIn(){
  if (Cookies.get('authToken')) {
    getUserId();
    return true;

  }
}

function getUserId(){
    var jwt = Cookies.get('authToken');
    var tokens = jwt.split(".");
    var userObject = JSON.parse(atob(tokens[1]));
    userId = userObject.user.id;
}







$(function(){
  initAutocomplete();
  const geolocButton = $('#current-location');
  const addressButton = $('#address');
  const kindlyPostButton = $('#submit');
  const loginModal = $('#login-modal');



  getKindlys();

  //find current location - lat/long
  geolocButton.on('click', function(e){
    geolocate();
    $('#kindly, #submit').removeAttr("hidden");
  });

  //show address field
  addressButton.on('click', function(e){
    $('#autocomplete, #kindly, #submit').removeAttr("hidden");
  });

  //toggle kindly form if logged in
  $( "#toggle-kindly-form" ).click(function(e) {
    if(isLoggedIn()){
    $( "#kindly-form" ).slideToggle("fast");
  } else {
    $('#id01').css('display', "block");
  }
  });

  // submit kindly
  kindlyPostButton.on('click', function(e){
      state.kindly = $('#kindly').val();
      saveKindly();
  });

  // login
  $('#form').on('submit', function(e) {
  e.preventDefault();

  const formData = {};

  $('#form input').each(function() {
    let { name, value } = this;
    formData[name] = value;
  });

  logMeIn(formData);
  // $('#id01').css('display', "none");
  window.location.replace("/");


});

// signup
$('#signup-form').on('submit', function(e) {
e.preventDefault();

const formData = {};

$('#signup-form input').each(function() {
  let { name, value } = this;
  formData[name] = value;
});

signUp(formData);
});


//Validate if user is logged in and update userID
if(isLoggedIn()){
  $('#login').attr('hidden', true);
  $('#signup').attr('hidden', true);
  $('#toggle-kindly-form').removeAttr('hidden');
  $('#logout').removeAttr('hidden');
  $('#my-kindlys').removeAttr('hidden');
};

//Show My Kindlys
$('#my-kindlys').on('click', function(e){
  getKindlysById();
  setTimeout(function(){
      $('#my-kindlys-list').append(userKindlys);
  }, 1000);

});

//logout
$('#logout').on('click', function(e){
  document.cookie = 'authToken' + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  window.location.replace("/");
})

});
