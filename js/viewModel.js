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

    // These are the real estate listings that will be shown to the user.
    // Normally we'd have these in a database instead.
    var locations = [
        { title: 'Park Ave Penthouse', location: { lat: 40.7713024, lng: -73.9632393 } },
        { title: 'Chelsea Loft', location: { lat: 40.7444883, lng: -73.9949465 } },
        { title: 'Union Square Open Floor Plan', location: { lat: 40.7347062, lng: -73.9895759 } },
        { title: 'East Village Hip Studio', location: { lat: 40.7281777, lng: -73.984377 } },
        { title: 'TriBeCa Artsy Bachelor Pad', location: { lat: 40.7195264, lng: -74.0089934 } },
        { title: 'Chinatown Homey Space', location: { lat: 40.7180628, lng: -73.9961237 } }
    ];

    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
        // Get the position from the location array.
        var position = locations[i].location;
        var title = locations[i].title;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i,
        });
        // Push the marker to our array of markers.
        markers.push(marker);
        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function () {
            populateInfoWindow(this, largeInfowindow);
        });
        bounds.extend(markers[i].position);
    }
    // Extend the boundaries of the map for each marker
    map.fitBounds(bounds);
    
ko.applyBindings(viewModel);
}


// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.title + '</div>');
        infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function () {
            infowindow.setMarker = null;
        });
    }
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
    addItem: function () {
        this.items.push(new Item(title, lat ,lng));
    },
    removeItem: function (item) {
        this.items.remove(item);
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

            for (var i=0; i<markers.length; i++){
                if( map.getBounds().contains(markers[i].getPosition()) ){
                         markers[i].setMap(map);
                }
            }
        });
        return this.items();
    } else {
        return ko.utils.arrayFilter(this.items(), function (item) {
            if (stringStartsWith(item.title().toLowerCase(), filter)){
                console.log(item.title(), item.lat(), item.lng());

                for (var i=0; i<markers.length; i++){
                    if( map.getBounds().contains(markers[i].getPosition()) ){
                        if (markers[i].title != item.title()){
                            console.log(markers[i].title);
                            markers[i].setMap(null);
                        }

                    }
                };
                return stringStartsWith(item.title().toLowerCase(), filter);
            }
        });
    }
}, viewModel);





var JSONdataFromServer = [
    { title: 'Park Ave Penthouse', location: { lat: 40.7713024, lng: -73.9632393 } },
    { title: 'Chelsea Loft', location: { lat: 40.7444883, lng: -73.9949465 } },
    { title: 'Union Square Open Floor Plan', location: { lat: 40.7347062, lng: -73.9895759 } },
    { title: 'East Village Hip Studio', location: { lat: 40.7281777, lng: -73.984377 } },
    { title: 'TriBeCa Artsy Bachelor Pad', location: { lat: 40.7195264, lng: -74.0089934 } },
    { title: 'Chinatown Homey Space', location: { lat: 40.7180628, lng: -73.9961237 } },
];

// console.log(JSONdataFromServer);

//parse into an object
// var dataFromServer = ko.utils.parseJson(JSONdataFromServer);

// console.log(dataFromServer);

//do some basic mapping (without mapping plugin)
var mappedData = ko.utils.arrayMap(JSONdataFromServer, function (item) {
    return new Item(item.title, item.location.lat, item.location.lng);
});

viewModel.items(mappedData);
