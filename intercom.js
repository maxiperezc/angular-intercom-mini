/*
 * angular-intercom service v0.0.1
 * (c) 2013 Maximiliano Perez Coto http://about.me/maxiperezc
 * License: MIT
 */

!function(module, angular, undefined) {
  'use strict';

  angular.module('ngIntercom', ['intercom']);

  module.value('IntercomSettings', {});

  module.provider('IntercomService', function() {
    var createScript = function ($document, appId, callback) {
      var scriptTag = $document.createElement('script');
      scriptTag.type = 'text/javascript';
      scriptTag.async = true;
      scriptTag.src = 'https://widget.intercom.io/widget/' + appId;
      scriptTag.onreadystatechange = function () {
        if (this.readyState === 'complete') {
          callback();
        }
      };
      scriptTag.onload = callback;
      var s = $document.getElementsByTagName('head')[0];
      s.appendChild(scriptTag);
    };

    var intercomBootstrap = function () {
      var Intercom = function(){
        Intercom.c(arguments)
      };
      Intercom.q = [];
      Intercom.c = function(args){
        Intercom.q.push(args)
      };
      return Intercom;
    };

    this.$get = ['$document', '$timeout', '$q', '$window',
      function($document, $timeout, $q, $window) {
        return {
          init: function(appId) {
            var deferred = $q.defer();
            $window.Intercom = intercomBootstrap();

            var onScriptLoad = function(callback) {
              $timeout(function(){
                deferred.resolve($window.Intercom);
              });
            };
            createScript($document[0], appId, onScriptLoad);
            return deferred.promise;
          }
        }
      }
    ];
  });

  module.provider('Intercom', function() {

    var appID = null;
    this.init = function(_appID) { appID = _appID };

    this.$get = ['IntercomService', 'IntercomSettings', function(IntercomService, IntercomSettings) {
      var _options = {};
      var intercomObj = false;

      angular.extend(_options, IntercomSettings);

      return {
        boot: function(options) {
          IntercomService.init(appID).then(function(intercom) {
            options = options || _options;
            angular.extend(options, { app_id: appID });

            intercom('boot', options);
            intercomObj = intercom;
          });
        },

        track: function(eventName, options) {
          if (!intercomObj) {
            return;
          }

          intercomObj('trackEvent', eventName, options);
        }
      };

    }];
  });

}(angular.module('intercom',[]), angular);
