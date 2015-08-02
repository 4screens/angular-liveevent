/// <reference path="api/api.ts" />
/// <reference path="liveevent/liveevent.ts" />

class Extension extends Bootstrap {

  init(opts: API.ILiveEmbed) {
    if (!opts || !opts.id) {
      return Bootstrap.$q.reject({
        status: 'error',
        error: {
          code: 406,
          message: 'The required id property does not exist.'
        },
        data: opts
      });
    }

    Liveevent.Liveevent.init(opts).then((res) => {
      console.info(res);
      return res;
    });
  }

}

app.service('Liveevent', Extension);
