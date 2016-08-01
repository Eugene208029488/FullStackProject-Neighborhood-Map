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
var infowindow;

//This will initialize the Google Map
/**
 * @description: Initialize the Google Map
 * @returns null
 */
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 41.76034899999998,
            lng: -72.67540800000003
        },
        zoom: 13
    });

    infowindow = new google.maps.InfoWindow();

    var myModel = new ViewModel();
    ko.applyBindings(myModel);

    //responsive code to ensure Google Map is
    //always re-centered if re-sized.
    google.maps.event.addDomListener(window, 'resize', function() {
        var center = map.getCenter();
        google.maps.event.trigger(map, 'resize');
        map.setCenter(center);
    });

    $(window).resize(function() {
        if ($(window).width() < 600)
            myModel.showMenuIcon(true);
        else
            myModel.showMenuIcon(false);
    });
    if ($(window).width() < 600)
        myModel.showMenuIcon(true);
    else
        myModel.showMenuIcon(false);
}

/**
 * @description: Error Handler for Google Map API call
 * @returns null
 */
function mapErrorHandler() {
    document.getElementById("map").innerHTML = "<b>Google Map is not available at this time.  Please try again later.</b>";
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

    mapmarker.addListener('click', (function(thisCopy) {
        return function() {
            thisCopy.displayYelpInfo();
        };
    })(this));
    this.marker = mapmarker;
};

/**
 * @description Asynchronous API call to Yelp and display in infowindow
 * @returns null
 */
LocationSpot.prototype.displayYelpInfo = function() {
    // "this" is the current instance inside this function
    var self = this;

    //Yelp requires OAuth authentication.  Use oauth.js and sha1.js to
    //authenticate using the token provided by Yelp.
    var accessor = {
        consumerSecret: auth.consumerSecret,
        tokenSecret: auth.accessTokenSecret
    };

    var location = self.location().lat + ',' + self.location().lng;
    var parameters = [];
    parameters.push(['term', self.name()]);
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
    var htmlcontent = '';
    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);
    var parameterMap = OAuth.getParameterMap(message.parameters);

    map.panTo(self.location());

    //use global infowindow variable so that there's only 1 instance of infowindow open at a time.
    if (infowindow) {
        infowindow.close();
    }

    infowindow.setContent('Loading...');
    infowindow.open(map, self.marker);

    $.ajax({
        'url': message.action,
        'data': parameterMap,
        'dataType': 'jsonp',
        'cache': true,
        'success': function(data, textStats, XMLHttpRequest) {
            htmlcontent = '<a href="' + data.businesses[0].url + '" target="_blank"><h4 style="margin:0;">' + data.businesses[0].name + '</h4></a>';
            htmlcontent += '<img src="' + data.businesses[0].rating_img_url + '" alt="Yelp Rating" height="17" width="84"> &nbsp; &nbsp;' + data.businesses[0].review_count + ' Yelp Reviews <br>';
            htmlcontent += data.businesses[0].location.display_address[0] + '<br>' + data.businesses[0].location.display_address[2] + '<br>' + data.businesses[0].display_phone;
            infowindow.setContent(htmlcontent);
        },
        'error': function() {
            infowindow.setContent('Error loading Yelp review.');
        }
    });

    self.selectMarker();

    infowindow.addListener('closeclick', function() {
        self.unselectMarker();
    });


    //will automatically close all infowindow, animation and highlight if click anywhere in the map
    google.maps.event.addListener(map, 'click', function() {
        if (infowindow) {
            infowindow.close();
            self.unselectMarker();
        }
    });

    //will automatically stop the animation and unhighlight the item from list view after 3 secs
    window.setTimeout(function() {
        self.unselectMarker();
    }, 3000);

};



/**
 * @description: LocationSpot selectMarker method will bounce the marker and highlight the item from the list view
 * @returns null
 */
LocationSpot.prototype.selectMarker = function() {
    // "this" is the current instance inside this function
    var self = this;
    self.marker.setAnimation(google.maps.Animation.BOUNCE);
    self.selected(true);
};

/**
 * @description: this will stop the animation and unhighlight the item from the list view
 * @returns null
 */
LocationSpot.prototype.unselectMarker = function() {
    // "this" is the current instance inside this function
    var self = this;
    self.marker.setAnimation(null);
    self.selected(false);
};


/**
 * @description: ViewModel section
 */
var ViewModel = function() {
    var self = this;
    self.locationList = ko.observableArray([]);
    self.showMenuIcon = ko.observable(false);
    //Load the default data into observablearray.
    initlocation.forEach(function(data) {
        self.locationList.push(new LocationSpot(data));
    });

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
            });
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
        //var infowindow = new google.maps.InfoWindow;
        data.displayYelpInfo();
    };

    self.clickMain = function(data) {
        var drawer = document.querySelector('#drawer');
        drawer.classList.remove('open');
    };

    self.clickMenu = function(data, e) {
        var drawer = document.querySelector('#drawer');
        drawer.classList.toggle('open');
        e.stopPropagation();
    };
};
