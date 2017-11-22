var map;

// Create a new blank array for all the listing markers.
var markers = [];

var i = 0;

// These are the real estate listings that will be shown to the user.
// Normally we'd have these in a database instead.
var locations = [
    { title: 'Charging Bull', location: { lat: 40.7055537, lng: -74.0134436 },id: "4a675deef964a52045c91fe3" },
    { title: 'Museum at Eldridge Street', location: { lat: 40.7147484, lng: -73.9935561 },id: "4b37a3c9f964a5207e4325e3" },
    { title: 'Times Square', location: { lat: 40.758895, lng: -73.985131 },id: "49b7ed6df964a52030531fe3" },
    { title: 'Pier 45', location: { lat: 40.7331926, lng: -74.0116944 },id: "4a58f59ef964a5204eb81fe3" },
    { title: 'Washington Square Park', location: { lat: 40.7308228, lng: -73.997332 },id: "40abf500f964a52035f31ee3" }
];


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

function error(){
    alert("Google Maps could not be loaded. Please try again later");
}

//Toggle Bounce Animation when maker is clicked
function toggleBounce() {
    if (this.getAnimation() !== null) {
        this.setAnimation(null);
    } else {
        this.setAnimation(google.maps.Animation.BOUNCE);
    }
};

var getFQSREdata = function (id,callback){
    // Make AJAX request to Foursquare
$.ajax({
    url: 'https://api.foursquare.com/v2/venues/' + id +
    '?client_id=WFBLQALVHSC22TA2JXBZARYZB4I2OALGLQGWHNUS312TBNLI&client_secret=04XCV5EXCNLLCUNNGRQIGX5MPZNNVTDKDFE4CEOZGK03U2DY&v=20171119',
    dataType: "json",
    success: function (data){
        callback (data);
    },
    // Alert the user on error. Set messages in the DOM and infowindow
    error: function (e) {
        alert("Error in the Foursquare request.Please try refreshing later!");

    }
});
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

// This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI


function Item(title, lat, lng) {
    this.title = ko.observable(title);
    this.lat = ko.observable(lat);
    this.lng = ko.observable(lng);

};

var viewModel = {
    items: ko.observableArray([]),
    itemsFiltered: ko.observableArray([]),
    filter: ko.observable(""),
    search: ko.observable(""),
    numberOfClicks: ko.observable(0),

    addItem: function () {
        this.items.push(new Item(title, lat, lng));
    },
    removeItem: function (item) {
        this.items.remove(item);
    },

    showInfoWindow: function () {
        // marker.addListener('click', function () {
        //     populateInfoWindow(this, largeInfowindow);
        // });
        for (var i = 0; i < markers.length; i++) {
            if (map.getBounds().contains(markers[i].getPosition())) {
                if (markers[i].title == this.title()) {
                    var markerImage = new google.maps.MarkerImage(
                        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + 'FFFF24' +
                        '|40|_|%E2%80%A2',
                        new google.maps.Size(21, 34),
                        new google.maps.Point(0, 0),
                        new google.maps.Point(10, 34),
                        new google.maps.Size(21, 34));
                    markers[i].setIcon(markerImage);

                    //Toggle Bounce
                    if (markers[i].getAnimation() !== null) {
                        markers[i].setAnimation(null);
                    } else {
                        markers[i].setAnimation(google.maps.Animation.BOUNCE);
                        var largeInfowindow = new google.maps.InfoWindow();
                    //Shows Info Window
                        populateInfoWindow(markers[i], largeInfowindow);

                    }
                }
            }
        }
    }
};

//startsWith method
var stringStartsWith = function (string, startsWith) {
    string = string || "";
    if (startsWith.length > string.length)
        return false;
    return string.substring(0, startsWith.length) === startsWith;
};

var itensFiltered = ko.observableArray([]);

//ko.utils.arrayFilter - filter the items using the filter text
this.filteredItems = ko.computed(function () {
    var filter = this.filter().toLowerCase();

    if (!filter) {
        ko.utils.arrayFilter(this.items(), function (item) {

            for (var i = 0; i < markers.length; i++) {
                if (map.getBounds().contains(markers[i].getPosition())) {
                    markers[i].setMap(map);
                }
            }
        });
        return this.items();
    } else {
        return ko.utils.arrayFilter(this.items(), function (item) {
            if (stringStartsWith(item.title().toLowerCase(), filter)) {

                for (var i = 0; i < markers.length; i++) {
                    if (map.getBounds().contains(markers[i].getPosition())) {
                        if (markers[i].title != item.title()) {
                            markers[i].setMap(null);
                        }

                    }
                }
                return stringStartsWith(item.title().toLowerCase(), filter);
            }
        });
    }
}, viewModel);

//do some basic mapping 
var mappedData = ko.utils.arrayMap(locations, function (item) {
    return new Item(item.title, item.location.lat, item.location.lng);
});

viewModel.items(mappedData);
