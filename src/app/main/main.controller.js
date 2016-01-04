(function() {
  'use strict';

  angular
    .module('transitLocator')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($scope, $http, $rootScope, transitSystems) {

    var styles = [
            {
                "featureType": "water",
                "stylers": [
                    {
                        "visibility": "on"
                    },
                    {
                        "color": "#b5cbe4"
                    }
                ]
            },
            {
                "featureType": "landscape",
                "stylers": [
                    {
                        "color": "#efefef"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#83a5b0"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#bdcdd3"
                    }
                ]
            },
            {
                "featureType": "road.local",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#ffffff"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#e3eed3"
                    }
                ]
            },
            {
                "featureType": "administrative",
                "stylers": [
                    {
                        "visibility": "on"
                    },
                    {
                        "lightness": 33
                    }
                ]
            },
            {
                "featureType": "road"
            },
            {
                "featureType": "poi.park",
                "elementType": "labels",
                "stylers": [
                    {
                        "visibility": "on"
                    },
                    {
                        "lightness": 20
                    }
                ]
            },
            {},
            {
                "featureType": "road",
                "stylers": [
                    {
                        "lightness": 20
                    }
                ]
            }
        ];

    var mapElement = document.getElementById('map'); 
    var transitSys =  transitSystems.getSystems();
    var buses = {};
    
    $scope.markers = [];
    $scope.map = new google.maps.Map(mapElement, {
      center: {lat: 37.1, lng: -95.7},
      zoom: 4,
      mapTypeControl: false,
      panControl: false,
      streetViewControl: false,
      styles: styles,
      zoomControl: false
    }); 

    $scope.panorama = $scope.map.getStreetView();
    
    $scope.gotToPlace = function () {
      google.maps.event.trigger($scope.autocomplet, 'place_changed');
    };
    $scope.goToLocation = function (index) {
      google.maps.event.trigger($scope.markers[index], 'mouseover');
    };
    $scope.exitLocation = function (index) {
      google.maps.event.trigger($scope.markers[index], 'mouseout');
    };

    $scope.openStreetView = function (location) {
      var position = {};
      if(Array.isArray(location)){
        position.lat = location[0];
        position.lng = location[1];
      }else {
        position.lat = this.location[0];
        position.lng = this.location[1];
      }
      $scope.panorama.setPosition(position);
      $scope.panorama.setVisible(true);
    };


    var ref = new Firebase("https://publicdata-transit.firebaseio.com/");
    $scope.cityName = '';

    $scope.$watch('cityName', function (newVal){
      if(!newVal) {
        return;
      }

      var city = newVal;
      $scope.transitSystems = [];
      transitSys.forEach(function(system, i){
        if (system.city === city) {
          $scope.transitSystems.push(system);
        } 
      });
      $scope.transitSystems.forEach(function(system){
        var selectedTransit = system;
        var selectedTransitName = selectedTransit.tag; 
        var systemRef = ref.child(selectedTransitName + "/vehicles").limitToLast(100); 
        createBusListerners(systemRef);
      });
    });

    function moveBus (marker, latLngs, index, wait) {
      marker.setPosition(latLngs[index]);
      if (index !== latLngs.length - 1) {
        setTimeout(function () {
          moveBus(marker, latLngs, index + 1, wait);
        }.bind(this), wait);
      }
    }

    function animateBuses() {
      google.maps.Marker.prototype.animatedMoveTo = function (toLat, toLng) {
        var fromLat = this.getPosition().lat();
        var fromLng = this.getPosition().lng();
        var frames = [];
        var isLocationSame = (_areFloatsAlmostEqual(fromLat, toLat) && _areFloatsAlmostEqual(fromLng, toLng));
        var currentLat = 0.0;
        var currentLng = 0.0;

        if (isLocationSame) {
          return;
        }

        // CREATE 200 ANIMATION FRAMES FOR BUS
        for (var percent = 0; percent < 1; percent += 0.005) {
          currentLat = fromLat + percent * (toLat - fromLat);
          currentLng = fromLng + percent * (toLng - fromLng);
          frames.push(new google.maps.LatLng(currentLat, currentLng));
        }

        moveBus(this, frames, 0, 25);
      };
    } animateBuses();

    function createBusListerners (systemRef) {
      systemRef.once('value', function (snapshot) {
        snapshot.forEach(function(bus){
          newBus(bus.val(), bus.key());
        });
      });

      systemRef.on("child_changed", function (snapshot) {
        var busMarker = buses[snapshot.key()];

        if (busMarker) {
          busMarker.animatedMoveTo(snapshot.val().lat, snapshot.val().lon);
        } else {
          newBus(snapshot.val(), snapshot.key());
        }
      });

      systemRef.on("child_removed", function (snapshot) {
        var busMarker = buses[snapshot.key()];

        if (busMarker) {
          busMarker.setMap(null);
          delete buses[snapshot.key()];
        }
      });
    }
    
    function newBus(bus, busId) {
      var busLatLng = new google.maps.LatLng(bus.lat, bus.lon);
      
      var busRouteHead = bus.routeTag.toString()[0].toUpperCase();
      var busRouteTail = bus.routeTag.toString().slice(1);
      var tag = busRouteHead + busRouteTail;
      var marker = new google.maps.Marker({
        icon: "http://chart.googleapis.com/chart?chst=d_bubble_icon_text_small&chld=bus|bbT|" + tag + "|7094FF|eee",
        position: busLatLng,
        map: $scope.map
      });
      google.maps.event.addListener(marker, 'click', function(){
        var location = [];
        location[0] = marker.position.lat();
        location[1] = marker.position.lng();
        $scope.openStreetView(location);
      });

      buses[busId] = marker;
    }
     /**
       * _areFloatsAlmostEqual
       *
       * test to see if two floats in JS are functionally equal
       * @param {Number} f1 - a number to compare
       * @param {Number} f2 - a number to compare
       * @param {Boolean} - whether the two floats are basically equal
       */

      function _areFloatsAlmostEqual(f1, f2) {
        return (Math.abs(f1 - f2) < 0.000001);
      }
  }
})();
