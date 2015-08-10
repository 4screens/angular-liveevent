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

  constructor($http: ng.IHttpService, $q: ng.IQService, $timeout: ng.ITimeoutService, localStorage: ng.local.storage.ILocalStorageService, $rootScope: ng.IRootScopeService, ApiConfig) {
    Extension.$http = $http;
    Extension.$timeout = $timeout;
    Extension.$q = $q;
    Extension.localStorage = localStorage;
    Extension.config = ApiConfig;
    Extension.$rootScope = $rootScope;
  }

  init(opts: API.ILiveEmbed) {
    Extension.io = <SocketIOClientStatic>opts.io;

    var liveevent = new Liveevent.Liveevent;
    return liveevent.init(opts);
  }
}

Extension.$inject = ['$http', '$q', '$timeout', 'localStorageService', '$rootScope', 'ApiConfig'];
app.service('Liveevent', Extension);
