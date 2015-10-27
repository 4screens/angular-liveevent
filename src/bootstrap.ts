/// <reference path="api/api.ts" />
/// <reference path="liveevent/liveevent.ts" />
/// <reference path="chat/chat.ts" />

class Extension {
  static $http: ng.IHttpService;
  static $q: ng.IQService;
  static $timeout: ng.ITimeoutService;
  static localStorage: ng.local.storage.ILocalStorageService;
  static $rootScope: ng.IRootScopeService;
  static config;
  static io: SocketIOClientStatic;
  Liveevent: Liveevent.ILiveevent;

  private static _instances: Liveevent.ILiveeventInstances = {};

  constructor($http: ng.IHttpService, $q: ng.IQService, $timeout: ng.ITimeoutService, localStorage: ng.local.storage.ILocalStorageService, $rootScope: ng.IRootScopeService, ApiConfig) {
    Extension.$http = $http;
    Extension.$timeout = $timeout;
    Extension.$q = $q;
    Extension.localStorage = localStorage;
    Extension.config = ApiConfig;
    Extension.$rootScope = $rootScope;
  }

  init(opts: API.ILiveEmbed): ng.IPromise<Liveevent.ILiveevent> {
    if (Extension._instances[opts.id]) {
      return Extension._instances[opts.id];
    }

    Extension.io = <SocketIOClientStatic>opts.io;

    switch (opts.mode) {
      case 'summary':
        Extension.mode = opts.engageform.Mode.Summary;
        break;
      case 'default':
      case '':
      case undefined:
        Extension.mode = opts.engageform.Mode.Default;
        break;
      default:
        return Extension.$q.reject({
          status: 'error',
          error: {
            code: 406,
            message: 'Mode property not supported.'
          },
          data: opts
        });
    };

    var liveEvent = new Liveevent.Liveevent();

    if (!opts.callback) {
      opts.callback = {
        sendAnswerCallback: function(){}
      }
    } else if (!opts.callback.sendAnswerCallback) {
      opts.callback.sendAnswerCallback = function(){};
    }

    return Extension._instances[opts.id] = liveEvent.init(opts);
  }
}

Extension.$inject = ['$http', '$q', '$timeout', 'localStorageService', '$rootScope', 'ApiConfig'];
app.service('Liveevent', Extension);
