/// <reference path="api/api.ts" />
/// <reference path="liveevent/liveevent.ts" />
/// <reference path="chat/chat.ts" />

class Extension {
  static $http: ng.IHttpService;
  static $q: ng.IQService;
  static localStorage: ng.local.storage.ILocalStorageService;
  static config;
  static io;

  constructor($http: ng.IHttpService, $q: ng.IQService, localStorage: ng.local.storage.ILocalStorageService, ApiConfig) {
    Extension.$http = $http;
    Extension.$q = $q;
    Extension.localStorage = localStorage;
    Extension.config = ApiConfig;
  }

  init(opts: API.ILiveEmbed) {
    Extension.io = opts.io;

    this.Liveevent = new Liveevent.Liveevent;
    return this.Liveevent.init(opts);
  }

}
Extension.$inject = ['$http', '$q', 'localStorageService', 'ApiConfig'];
app.service('Liveevent', Extension);
