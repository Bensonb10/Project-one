
// --------------------------------------------------------------------- <variables>
// Init Firebase
var map, infoWindow;
var config = {
    apiKey: "AIzaSyCjw3ZOOzTjEiAs4FX0yVvnevh06UwoeMs",
    authDomain: "fudmeh.firebaseapp.com",
    databaseURL: "https://fudmeh.firebaseio.com",
    projectId: "fudmeh",
    storageBucket: "",
    messagingSenderId: "426120982640"
};

firebase.initializeApp(config);

var database = firebase.database(); // Create a variable to reference the database

//  Create variables for latitude and longitude
let lat = "";
let lon = "";
let lng = "";
let cityCode = '';

// data object to store click location info
var data = {
    sender: null,
    timestamp: null,
    lat: null,
    lng: null
  };


// --------------------------------------------------------------------- <firebase>
//  Pull users lat and longitude from firebase
database.ref('location').on('value', function (snapshot) {
    lat = snapshot.val().lat;
    lon = snapshot.val().lng;
    lng = lon;


    //  Create variable holding the search url including parameters
    let queryURL = "https://developers.zomato.com/api/v2.1/search?lat=" + lat + "&lon=" + lon + "&cuisines=" + cityCode + "&radius=10&sort=real_distance&count=10";

    //  Create Ajax call
    $.ajax({
        url: queryURL,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'user-key': 'faf6b95bf12c6d16066378598f219943'
        }
    }).then(function (response) {
        //  Calling the zomato JSON information manipulation
        zomato(response);
    })

    //  Create function to handle zomato JSON
    function zomato(x) {

        //  Iterate through the JSON retrived from zomato
        //  Push zomato JSON to firebase
        for (var i = 0; i < x.results_shown; i++) {
            //  Creates a restaurant variable to hold data sent to firebase
            var restaurant = {
                //  Saving the name of the restuarant
                name: x.restaurants[i].restaurant.name,
                //  Saving information regarding image size
                img: {
                    url: x.restaurants[i].restaurant.photos_url
                },
                //  Saving the restaurant URL
                url: x.restaurants[i].restaurant.url,
                //  Saves the longitude and latitude of the restaurant
                //  Parse the string value into a float number
                myLatLng: {
                    lat: parseFloat(x.restaurants[i].restaurant.location.latitude),
                    lng: parseFloat(x.restaurants[i].restaurant.location.longitude)
                },
                //  Unique restaurant ID number from Zomato
                id: x.restaurants[i].restaurant.id,
                //  The cuisine identifier 
                cuisines: x.restaurants[i].restaurant.cuisines

            }   //  Closes the restaurant variable

            //  Push the data from Zomato to Firebase
            database.ref('restaurant' + i).set(restaurant);

        }// Closes out the iterating for loop

    }// Closes out the Zomato function

});//closes out firebase


// --------------------------------------------------------------------- <map>
function initMap(lat, lng) {
    if (lat == null || lng ==null) {
        lat = 29.7560;
        lng = -95.3573;
    }
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: lat, // default location Norris Conference Center
            lng: lng
        },
        zoom: 15
    });
    infoWindow = new google.maps.InfoWindow;

    // <click listener>
   /* map.addListener('click', function(e) {
        data.lat = e.latLng.lat();
        data.lng = e.latLng.lng();
        console.log(`you clicked at lat:${data.lat}, lng:${data.lng}` )
        // ------------------------------------------------------------------- need to do something with location of click
        initMap(data.lat, data.lng)
    });*/

    // Try HTML5 geolocation. ------------------------------------------------ need to rember allow location choice
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            database.ref('location').set({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            })

            infoWindow.setPosition(pos);
            infoWindow.setContent('Location found.');
            infoWindow.open(map);
            map.setCenter(pos);
        }, function () { 
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
    //  Loop through the restuarants pulled from firebase
    for (var i = 0; i < 10; i++) {
        database.ref('restaurant' + i).on('value', function (snapshot) {

            //  Pulling lat and longitude of restuarant from Firebase
            var myLatLng = new google.maps.LatLng(snapshot.val().myLatLng.lat, snapshot.val().myLatLng.lng);

            //  Setting the inner text for popper
            var contentString = snapshot.val().name;

            //  Create a new info window when clicked
            var infowindow = new google.maps.InfoWindow({
                //  Inserts the content from content-string defined above
                content: contentString
            });

            //  Creates a new marker on the map
            var marker = new google.maps.Marker({
                //  Pulls the lat and long from declared variable
                position: myLatLng,
                //  Defines the map as the google.maps window
                map: map,
                //  Gives the popper a name
                title: snapshot.val().name
            });

            //  creates listener for the click event of icon
            marker.addListener('click', function () {
                infowindow.open(map, marker);
                setTimeout(close, 3000);
            });

            function close() {
                infowindow.close(map, marker);
            }
        })
    }


}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
} 


















    

    







