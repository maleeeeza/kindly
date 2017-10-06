// style, center form/buttons

var placeSearch, autocomplete;


var state = {
  id: null,
  lat: null,
  long: null,
  kindly: null,
  creator: userId,
};

var allKindlys = [];

var userKindlys = {
  kindlys: []
};

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
    url: './images/kindly-marker.png',
    size: new google.maps.Size(50, 50),
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
      // console.log(msg);
      userKindlys = {
        kindlys: []
      };
      for (var i = 0; i < kindlys.length; i++){
        userKindlys.kindlys.push({createdDate: kindlys[i].createdDate, kindly: kindlys[i].kindly, id: kindlys[i]._id});
      }

    }
  });
  console.log(userKindlys);
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
    state.creator = userId;

}

function updateKindly(kindlyId){
  $.ajax({
    type:"PUT",
    dataType:'json',
    data: JSON.stringify(state),
    beforeSend: function(req){
      isLoggedIn();
      const authCookie = Cookies.get('authToken');
        req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
    },
    contentType: 'application/json',
    url: "/api/kindlys/" + kindlyId,
    success: function(msg){
      console.log(msg);
    }
  });
}

function deleteMyKindly(kindlyId){
  $.ajax({
    type:"DELETE",
    dataType:'json',
    beforeSend: function(req){
      isLoggedIn();
      const authCookie = Cookies.get('authToken');
        req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
    },
    contentType: 'application/json',
    url: "/api/kindlys/" + kindlyId,
    success: function(msg){
      console.log(msg);
    }
  });
}


function generateMyKindlysString(kindlys) {
  console.log('Generating ');

  const items = kindlys.map((item, index) =>
    generateMyKindlyElement(item, index)
  );

  return items.join('');
}

function generateMyKindlyElement(kindly, kindlyIndex){
  let myKindlyHTML = (
    `
      <span class="my-kindly-createdDate">${kindly.createdDate}</span>
      <span class="my-kindly">${kindly.kindly}</span>
      <button type="button" id="delete-button-${kindly.id}" class="delete-my-kindly" data-id="${kindly.id}">Delete</button>
      <button type="button" id="edit-button-${kindly.id}" class="edit-my-kindly" data-id="${kindly.id}" onclick="editKindly('${kindly.id}')">Edit</button>
      <form id="form-${kindly.id}" class="kindly-edit-form" hidden>
        <div>
          <textarea id="kindlyedit-${kindly.id}" name="kindlyedit" placeholder="Enter act of kindness" type="text" class="kindly-edit-field">${kindly.kindly}</textarea>
          <button id="cancel-${kindly.id}"type="button" class="cancel-kindly-edit" onclick="cancelEdit('${kindly.id}')">Cancel</button>
          <button id="save-${kindly.id}"type="button" class="submit-edited-kindly-button" data-id="${kindly.id}" onclick="saveKindlyEdit('${kindly.id}')">Save</button>
        </div>
      </form>
    `
  );

  return (
    `<li class="js-item-index-element" data-item-index="${kindlyIndex}" data-id: "${kindly.id}">
      ${myKindlyHTML}
    </li>`
  );
}

function editKindly(id) {
  $(`#form-${id}`).removeAttr('hidden');
};

function cancelEdit(id){
  $(`#form-${id}`).attr('hidden', true);
}

function saveKindlyEdit(id){
  //Update Kindly and refresh list
    state.kindly = $(`#kindlyedit-${id}`).val();
    // state.id = $(this).attr('data-id');
    state.id = id;
    console.log(JSON.stringify(state));
    console.log(id);
    updateKindly(state.id);
    getKindlysById();
    setTimeout(function(){
        renderMyKindlyList();
    }, 1000);



}



function renderMyKindlyList() {
  console.log('`rendermyKindlyList` ran');
  let { kindlys } = userKindlys;
  const myKindlyListString = generateMyKindlysString(kindlys);

  // insert kindly list into the DOM
  $('#my-kindlys-list').html(myKindlyListString);

  //Delete kindly from DB and remove li from DOM
  $('.delete-my-kindly').on('click', function(e){
    deleteMyKindly($(this).attr('data-id'));
    var li = $(this).closest('li')
    li.fadeOut('slow', function() { li.remove(); });
  });

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
    $('#autocomplete').attr('hidden', true);
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
      renderMyKindlyList();
  }, 1000);

});


//logout
$('#logout').on('click', function(e){
  document.cookie = 'authToken' + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  window.location.replace("/");
})

});
