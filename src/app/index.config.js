(function() {
  'use strict';

  angular
    .module('transitLocator')
    .config(config);

  /** @ngInject */
  function config($logProvider, toastrConfig) {
    // Enable log
    $logProvider.debugEnabled(true);
  }

})();
