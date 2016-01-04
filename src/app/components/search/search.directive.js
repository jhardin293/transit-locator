(function() {
  'use strict';

  angular
    .module('transitLocator')
    .directive('search', search);

  /** @ngInject */
  function search($rootScope, $compile, streetImage) {
    var directive = {
      require: 'ngModel',
      scope: true,
      link: function(scope, element, attrs, model) {
        var scope = scope.$parent;
        var searchElement = element;
        var mapElement = element.find("#map")[0];
        var currentLocation;
        var newLat;
        var newLng;
        var newCurrLocation;
        var latlngArray;

        scope.autocomplete = new google.maps.places.Autocomplete(
          element[0],
          {
            componentRestrictions: {'country': 'us'}
          }
        );
        scope.places = new google.maps.places.PlacesService(scope.map);
        scope.infowindow = new google.maps.InfoWindow({});

        google.maps.event.addListener(scope.map,'dragend', function() {
          clearMarkers();
          currentLocation = scope.map.getCenter();
          newCurrLocation = currentLocation.toString();
          newCurrLocation = newCurrLocation.replace('(', '');
          newCurrLocation = newCurrLocation.replace(')', '');

          latlngArray = [];
          latlngArray = newCurrLocation.split(",");
          for (var a in latlngArray) {
              latlngArray[a] = parseFloat(latlngArray[a]);
          }
          newLat = latlngArray[0];
          newLng = latlngArray[1];
          scope.map.setCenter({
              lat : newLat,
              lng : newLng
          });

            findPlaces();
        });
        //init place
        var autoPlace = scope.autocomplete.getPlace();
        if( autoPlace=== undefined){
           currentLocation = new google.maps.LatLng(34.052234, 118.243685); 
           //findPlaces();
        }
        google.maps.event.addListener(scope.autocomplete, 'place_changed', function() {
          var place = scope.autocomplete.getPlace();
          scope.$apply(function(){
            scope.cityName = place.vicinity;
          });
          if (place.geometry) {
            scope.map.panTo(place.geometry.location);
            scope.map.setZoom(15);
            findPlaces();
          }           

          scope.$apply(function(){
            model.$setViewValue(searchElement.val());
          });
        });

        function findPlaces() {
          var options = {
            bounds: scope.map.getBounds(),
            types: ['bus_station']
          };

          if (currentLocation) {
            options.location = currentLocation;
          }

          scope.places.nearbySearch(options, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              clearMarkers();
              results.forEach(function(place, i){
                scope.markers[i] = new google.maps.Marker({
                  position: place.geometry.location,
                  animation: google.maps.Animation.DROP,
                  icon: "../../../assets/images/pin.svg",
                  name: place.name,
                  vicinity: place.vicinity
                });
                scope.markers[i].placeResult = results[i];
                var lat = place.geometry.location.lat();
                var lng = place.geometry.location.lng();
                scope.markers[i].location = [lat,lng];
                scope.markers[i].image = streetImage.getImage(scope.markers[i].location);


                dropMarker(i);
                google.maps.event.addListener(scope.markers[i], 'mouseover', showInfoWindow);
                google.maps.event.addListener(scope.markers[i], 'click', scope.openStreetView);
                google.maps.event.addListener(scope.markers[i], 'mouseout', closeInfoWindow);
              });
              scope.$apply(function(){
                scope.markers = scope.markers; 
              });
            }
          });
        }

        function showInfoWindow () {
          var marker = this;
          scope.places.getDetails({placeId: marker.placeResult.place_id},
            function(place, status) {
              if (status !== google.maps.places.PlacesServiceStatus.OK) {
                return;
              }
              var content = '<div><div id="infowindow_content" ng-include="\'/app/components/infoWindow/infoWindow.html\'"></div></div>';
              var compiled = $compile(content)(scope);
              scope.currentMarker = marker;
              scope.infowindow.open(scope.map, marker);
              scope.$apply();
              scope.infowindow.setContent( compiled[0].innerHTML );
            }
          );
        }

        function closeInfoWindow (){
          var marker = this; 
          scope.infowindow.close(scope.map, marker);
        }

        function dropMarker (i) {
          scope.markers[i].setMap(scope.map);
        }

        

        function clearMarkers() {
          for (var i = 0; i < scope.markers.length; i++) {
            if (scope.markers[i]) {
              scope.markers[i].setMap(null);
            }
          }
          scope.markers = [];
        }
      }
    };

    return directive;

  }

})();
  