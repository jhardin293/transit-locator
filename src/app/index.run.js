(function() {
  'use strict';

  angular
    .module('transitLocator')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
