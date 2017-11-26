var map;

// Create a new blank array for all the listing markers.
var markers = [];

var i = 0;

function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.7413549, lng: -73.9980244 },
        zoom: 15
    });

    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
        // Get the position from the location array.
        var position = locations[i].location;
        var title = locations[i].title;
        var id = locations[i].id;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: id,
        });

        // Add animation to the marker when clicked
        marker.addListener('click', toggleBounce);

        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function () {
            populateInfoWindow(this, largeInfowindow);
        });

        // Push the marker to our array of markers.
        markers.push(marker);

        bounds.extend(markers[i].position);

    }
    // Extend the boundaries of the map for each marker
    map.fitBounds(bounds);

    ko.applyBindings(viewModel);
}

//Toggle Bounce Animation when maker is clicked
function toggleBounce() {
    if (this.getAnimation() !== null) {
        this.setAnimation(null);
    } else {
        this.setAnimation(google.maps.Animation.BOUNCE);
    }
};

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;

        getFQSREdata(marker.id,function(data){
            if(data){
                // Make results easier to handle
                var result = data.response.venue;

                infowindow.setContent(  '<div><h5>' + marker.title +' 📍</h5></div>'+
                    '<div>Address: ' + result.location.formattedAddress +'</div>'+
                    '<div>Checkins Count: ' + result.stats.checkinsCount +'</div>'+
                    '<div>Users Count: ' + result.stats.usersCount +'</div>'+
                    '<div>Visits: ' + result.stats.visitsCount +'</div>'+
                    '<div>Rating: ' + result.rating +' ⭐</div></br>'+
                    '<div> Provided by Foursquare</div>'
                );
                infowindow.open(map, marker);
                // Make sure the marker property is cleared if the infowindow is closed.
                infowindow.addListener('closeclick', function () {
                    infowindow.setMarker = null;
                });
            }
        });

    }
}

function openInfoWindow(marker) {
    // Check to make sure the infowindow is not already opened on this marker.
    infowindow.open(map, marker);
}

function error(){
    alert("Google Maps could not be loaded. Please try again later");
}
