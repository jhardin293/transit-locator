(function() {
  'use strict';

  angular
    .module('transitLocator')
    .factory('streetImage', streetImage);

  /** @ngInject */
  function streetImage($log) {
    var domain = "https://maps.googleapis.com/maps/api/streetview?size=",
        size   = "320x160",
        locHeader = "&location=",
        key     = "&key=AIzaSyAVr0IQSTHlIWRu7EgXm8M4kzLmDcF2XFI";




    var service = {
      getImage: getImage
    };

    return service;

    function getImage(location, dummy) {
      if(dummy) {
        return "http://naijatowncrier.com/wp-content/uploads/2014/12/woman-arraigned-for-stealing-clothes-at-brt-bus-stop-320x160.jpg";
      }
      return domain + size + locHeader + location + key;
    }
  }
})();
