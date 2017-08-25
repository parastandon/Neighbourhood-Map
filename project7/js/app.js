var dreamtour = [{

        lat: 31.3071,
        lng: 75.5757,
        name: 'Modeltown',
        id: '4ccd0d5d09b1b71389dadba6',
        show: true,
        selected: false

    },
    {

        lat: 31.3105,
        lng: 75.6043,
        name: 'Country inn ',
        id: '4bcf47090ffdce72d956b2c0',
        show: true,
        selected: false

    },
    {

        lat: 31.3194,
        lng: 75.5845,
        name: 'mbd neopolis',
        id: '4fa3831ee4b038e6a0f1c9e5',
        show: true,
        selected: false,

    },
    {

        lat: 31.3312,
        lng: 75.5908,
        name: 'Jalandhar railway station',
        id: '4c9356416cfea093d315b98b',
        show: true,
        selected: false,

    },
    {

        lat: 31.146016,
        lng: 75.355793,
        name: 'Haveli',
        id: '4c016cf6b45676b0192ce180',
        show: true,
        selected: false,

    }


];
//------------model end ---------
//for display of my map

function initMap() {
    // creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {

            lat: 31.3260,
            lng: 75.5762

        },
        zoom: 12,



    });
    ko.applyBindings(new viewmodel());
}
//if there is a error
function error() {
    alert("ERROR");
}



var locations = []; //arrary of markers



// my viewmodel for viewing
var viewmodel = function() {
    var bounds = new google.maps.LatLngBounds();
    var defaultMarker = makeMarkerIcon('ffffff'); //default color of marker is stored in default icon
    var highlightMarker = makeMarkerIcon('000000'); //color when we highlight it
    var Infowindow = new google.maps.InfoWindow(); //info window of marker.

    function makeMarkerIcon(markerColor) { //passing marker color and building marker icon in this function
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
            '|40|_|%E2%80%A2', //type of marker we choose.
            new google.maps.Size(23, 33), //marker height and width
            new google.maps.Point(0, 0),
            new google.maps.Point(12, 36), //accuracy of marker
            new google.maps.Size(23, 32));

        return markerImage;
    }

    var image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
    for (i = 0; i < dreamtour.length; i++) {


        var marker = new google.maps.Marker({ //in marker we are settings marker's details in marker variable
            //by iterating it into a loop through all places that we decided in model
            position: {
                lat: dreamtour[i].lat, //inserting latitude and longitude
                lng: dreamtour[i].lng
            },

            draggable: true,
            map: map, //map 
            title: dreamtour[i].name, //title of markers

            venue: dreamtour[i].id, //foursquare id
            selected: ko.observable(dreamtour[i].selected), //for marker selection
            icon: image,
            show: ko.observable(dreamtour[i].show)
        });
        locations.push(marker); //adding marker in location array
        bounds.extend(marker.position); //for bounding

        marker.addListener('mouseover', function() { //when we take mouse on marker we change color 
            this.setIcon(highlightMarker); // calling setIcon() color of highlighted icon
        });
        marker.addListener('mouseout', function() {
            this.setIcon(defaultMarker); //when we take are mouse away from marker
        });

        // for onclick zoom
        marker.addListener('click', function() {
            map.setZoom(9);
            map.setCenter(marker.getPosition());
        });
        // for animation
        var forBounce = 0;
        var bouncing = function() {
            if (forBounce != this) {
                this.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function() {
                    forBounce.setAnimation(null);
                }, 200);
                forBounce = this;
            } else
                forBounce = 0;
        };


        google.maps.event.addListener(marker, 'click', bouncing);
        marker.addListener('click', function() {
            showInfoWindow(this, Infowindow);
        });

    }

    map.fitBounds(bounds);
    // get rating for each marker
    locations.forEach(function(mk) {

        $.ajax({ //ajax request for foursquare api
            method: 'GET',
            dataType: "json",
            url: "https://api.foursquare.com/v2/venues/" + mk.venue + "?client_id=RN2PDFL5H4IPPLI5V1YO45GNTNVZHGROFJ0JSWEII4LRKODR&client_secret=GQNY0UECBYCEOZKAH3KCNCLJ1A031UCE2AA4Q1CYGJMP22DS&v=20170405",
            success: function(data) { //if data is successfully fetch than it will execute
                var final = data.response.venue;


                if ((final.hasOwnProperty('rating'))) {
                    mk.rating = final.rating;
                } else {
                    mk.rating = 'error';
                }
                if ((final.hasOwnProperty('ratingSignals'))) {
                    mk.ratingSignals = final.ratingSignals;
                } else {

                    mk.ratingSignals = 'error';
                }
            },
            error: function(e) { //if any error occur in data
                alert('There is some error in fetching data');
            }

        });
    });

    function showInfoWindow(marker, infowindow) //opening info window wen we click
    {
        if (infowindow.marker != marker) {

            infowindow.marker = marker;

            infowindow.setContent('<div>' + '<h3>' + marker.title + '</h3>' + "<h4>Ratings:" + marker.rating + '</h4>' + "<h3>Signalsrating:" + marker.ratingSignals + '</h3>' + '</div>'); //set content that should be appear in info window
            //if they are not null then open window
            if (marker.rating !== null || marker.ratingSignals !== null) {
                infowindow.open(map, marker);
            }

            // property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = 0;
            });
        }
    }
    //the marker which is selected
    this.selectAll = function(marker) {
        showInfoWindow(marker, Infowindow);
        marker.selected = ko.observable(true);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 500);

    };


    //it will help in showing content
    this.showAll = function(variable) {
        //for loop after clearing my search bar it will run
        for (i = 0; i < locations.length; i++) {
            locations[i].show(variable);
            locations[i].setVisible(variable);
        }
    };




    //function for searching content
    this.inputText = ko.observable('');
    this.filterText = ko.observable('');
    this.filtersearch = function() {
        Infowindow.close();

        //closes all the windows

        var activeSearch = this.inputText();

        if (activeSearch.length === 0) {
            this.showAll(true);
        } else {

            //for filteration
            for (i = 0; i < locations.length; i++) {
                var m = locations[i].title.toLowerCase();

                if (m.indexOf(activeSearch.toLowerCase()) != -1) {
                    locations[i].show(true);
                    locations[i].setVisible(true);
                } else {
                    locations[i].show(false);
                    locations[i].setVisible(false);
                }
            }
        }
        Infowindow.close();
    };
};