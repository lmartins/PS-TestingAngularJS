'use strict';

var myApp = angular.module('myApp');

myApp.config(function ($routeProvider) {
  $routeProvider.when('/about',
    {
      template: 'Hello World'
    }
  );
  $routeProvider.when('/newEvent',
    {
      templateUrl: '/templates/NewEvent.html',
      controller: 'EditEventController'
    }
  );
  $routeProvider.when('/events',
    {
      templateUrl: 'templates/EventList.html',
      controller: 'EventListController',
      resolve: {
        events: function ($route, eventData) {
          return eventData.getAllEvents().$promise;
        }
      }
    }
  );
  $routeProvider.when('/editProfile',
    {
      templateUrl: 'templates/EditProfile.html',
      controller: 'EditProfileController'
    }
  );
  $routeProvider.when('/event/:eventId',
    {
      templateUrl: '/templates/EventDetails.html',
      controller: 'EventController',
      resolve: {
        event: function ($route, eventData) {
          return eventData.getEvent($route.current.pathParams.eventId).$promise;
        }
      }
    }
  );
  $routeProvider.otherwise({redirectTo: '/events'});
  // $locationProvider.html5Mode(true);
});
