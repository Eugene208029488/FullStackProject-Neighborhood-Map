#Neighborhood Map
Develop a single-page application featuring a map of your neighborhood restaurants. Add the following functionalities: map markers to identify popular restaurants, a search function to easily discover these restaurants, and a listview to support simple browsing of all restaurants. Also access Yelp third-party APIs to provide additional information about each of these places.

#Technology used:
1. Ajax call
2. KnockoutJS - MVVM pattern
3. Google Map API
4. Yelp API

#Instructions for the Neighborhood Map application
1. Open index.html in a Chrome browser.
2. Page will initially be loaded with all the locations on the list view and markers will be visible on the map.
3. Click any marker and it will:
  * Pan to the marker.
  * Marker will bounce.
  * Open infowindow with additional Yelp information using AJAX call.
  * The location name will be highlighted on the list view.
4. Close the infowindow and it should stop the marker animation and un-highlight the location name from the list view.  Marker animation and text highlight will reset after 3 secs.  Clicking another marker will automatically close any open infowindow.  There will only be 1 infowindow open at a time.
5. Click on the location name in the list view and it will:
  * Pan to the marker.
  * Marker will bounce.
  * Open infowindow with additional Yelp information using AJAX call.
6. Type something on the search box and it should:
  * filter the list based on what you type.  It will list any pattern match on the location name.
  * whatever comes up on the list will have marker on the map
7. Data requests error using AJAX call to Google Map API and Yelp API  are handled gracefully and will provide an error message to the user.
8. Webpage is responsive.  Once it gets to less than 600px screen size it will collapse the list view/search box.  You will need to click the hamburger icon to open the list view/search box.
