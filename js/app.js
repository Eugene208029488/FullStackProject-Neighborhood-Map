//Yelp API authorization
var auth = {
    consumerKey: '8L0N5Y4Y_5nWgpDtuTkohQ',
    consumerSecret: 'iFNnSoNi7GEdTww73caLQvsKf3Y',
    accessToken: 'tTEdjH2VZaIZas2ioc-ex72kEHxHEpir',
    accessTokenSecret: 'PJ5AjTZKwL8Jp-5LM686Czm39hU',
    serviceProvider: {
        signatureMethod: 'HMAC-SHA1'
    }
};

//Initial data for this project
var initlocation = [{
    name: 'Salute',
    location: {
        lat: 41.765559,
        lng: -72.675989,
    }
}, {
    name: 'Firebox Restaurant',
    location: {
        lat: 41.762332,
        lng: -72.686888,
    }
}, {
    name: 'ON20',
    location: {
        lat: 41.7659452,
        lng: -72.669071,
    }
}, {
    name: 'The Capital Grille',
    location: {
        lat: 41.762998,
        lng: -72.670809,
    }
}, {
    name: "Peppercorn's Grill",
    location: {
        lat: 41.760349,
        lng: -72.675408,
    }
}, {
    name: 'Ichiban',
    location: {
        lat: 41.7667179,
        lng: -72.7119986,
    }
}, {
    name: "Carbone's Ristorante",
    location: {
        lat: 41.732369,
        lng: -72.674121,
    }
}, {
    name: "Fleming's Prime Steakhouse",
    location: {
        lat: 41.7601688,
        lng: -72.7437346,
    }
}];

var map;

//This will initialize the Google Map
/**
* @description: Initialize the Google Map
* @returns null
*/
function initMap() {
    var infowindow;
    var marker, i;
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 41.76034899999998,
            lng: -72.67540800000003
        },
        zoom: 13
    });
}

/**
* @description Asynchronous API call to Yelp and display in infowindow
* @param {LocationSpot} data
* @returns null
*/
function displayYelpInfo(data) {
    //Yelp requires OAuth authentication.  Use oauth.js and sha1.js to
    //authenticate using the token provided by Yelp.
    var accessor = {
        consumerSecret: auth.consumerSecret,
        tokenSecret: auth.accessTokenSecret
    };

    var location = data.location().lat + ',' + data.location().lng;
    var parameters = [];
    parameters.push(['term', data.name()]);
    parameters.push(['ll', location]);
    parameters.push(['callback', 'cb']);
    parameters.push(['oauth_consumer_key', auth.consumerKey]);
    parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
    parameters.push(['oauth_token', auth.accessToken]);
    parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

    var message = {
        'action': 'http://api.yelp.com/v2/search',
        'method': 'GET',
        'parameters': parameters
    };

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);
    var parameterMap = OAuth.getParameterMap(message.parameters);

    map.panTo(data.location());

    var infowindow = new google.maps.InfoWindow;
    infowindow.setContent('Loading...');
    infowindow.open(map, data.marker);

    $.ajax({
        'url': message.action,
        'data': parameterMap,
        'dataType': 'jsonp',
        'cache': true,
        'success': function(data, textStats, XMLHttpRequest) {
            //console.log(data);
            htmlcontent = '<a href="' + data.businesses[0].url + '" target="_blank"><h4 style="margin:0;">' + data.businesses[0].name + '</h4></a>'
            htmlcontent += '<img src="' + data.businesses[0].rating_img_url + '" alt="Yelp Rating" height="17" width="84"> &nbsp; &nbsp;' + data.businesses[0].review_count + ' Yelp Reviews <br>'
            htmlcontent += data.businesses[0].location.display_address[0] + '<br>' + data.businesses[0].location.display_address[2] + '<br>' + data.businesses[0].display_phone
            infowindow.setContent(htmlcontent);
        },
        'error': function(jqXHR, textStats, errorThrown) {
            infowindow.setContent('Error loading Yelp review.');
        }
    });

    data.marker.setAnimation(google.maps.Animation.BOUNCE);
    data.selected(true);

    infowindow.addListener('closeclick', function() {
        data.marker.setAnimation(null);
        data.selected(false);
    });

    //will automatically close the infowindow after 8 secs if user
    //did not manually close it.
    window.setTimeout(function() {
        data.marker.setAnimation(null);
        infowindow.close();
        data.selected(false);
    }, 8000);

}

/**
* @description: Model section
*/
var LocationSpot = function(data) {
    this.name = ko.observable(data.name);
    this.location = ko.observable(data.location);
    this.selected = ko.observable(false);

    // creating the Google marker and making it as part of this model
    var mapmarker = new google.maps.Marker({
        position: data.location,
        title: data.name,
        map: map
    });
    this.marker = mapmarker;
}

/**
* @description: ViewModel section
*/
var ViewModel = function() {
    var self = this;
    self.locationList = ko.observableArray([]);
    //Load the default data into observablearray.
    initlocation.forEach(function(data) {
        self.locationList.push(new LocationSpot(data));
    });

    //Create an click event listener to all the marker
    //in the observablearray.  It will call displayYelpInfo
    //if marker is clicked.
    self.locationList().forEach(function(data) {
        if (data.hasOwnProperty('marker')) {
            data.marker.addListener('click', function() {
                displayYelpInfo(data);
            })
        }
    })

    //Create a filtereddata based on the search query.
    //will make the marker visible or not based on the search query.
    self.query = ko.observable('');
    self.filtereddata = ko.computed(function() {
        var filter = self.query().toLowerCase();
        if (!filter) {
            self.locationList().forEach(function(data) {
                if (data.hasOwnProperty('marker')) {
                    data.marker.setVisible(true);
                }
            })
            return self.locationList();
        } else {
            return ko.utils.arrayFilter(self.locationList(), function(item) {
                if (item.name().toLowerCase().indexOf(filter) !== -1) {
                    item.marker.setVisible(true);
                    return true;
                } else {
                    item.marker.setVisible(false);
                    return false;
                }
            });
        }
    });

    // this will be called by the data-bind click event if the list item is clicked
    self.clickListitem = function(data) {
        var infowindow = new google.maps.InfoWindow;
        displayYelpInfo(data);
    }

}

$(document).ready(function() {
    initMap();
    ko.applyBindings(new ViewModel());

    //responsive code to ensure Google Map is
    //always re-centered if re-sized.
    google.maps.event.addDomListener(window, 'resize', function() {
        var center = map.getCenter();
        google.maps.event.trigger(map, 'resize');
        map.setCenter(center);
    });

    //create off-canvas pattern layout to hide search list if < 600px
    var menu = document.querySelector('#menu');
    var main = document.querySelector('main');
    var drawer = document.querySelector('#drawer');

    menu.addEventListener('click', function(e) {
        drawer.classList.toggle('open');
        e.stopPropagation();
    });
    main.addEventListener('click', function() {
        drawer.classList.remove('open');
    });
});