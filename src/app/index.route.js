(function() {
  'use strict';

  angular
    .module('transitLocator')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainController',
      });

    $urlRouterProvider.otherwise('/');
  }

})();
