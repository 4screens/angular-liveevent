/// <reference path="iliveevent.ts" />

module Liveevent {
  export class Liveevent implements ILiveevent {
    enabled: boolean;
    title: string;

    activePage: Page.IPage;
    activeQuiz: Engageform.IEngageform;
    activePageId: string;
    activeQuizId: string;
    socket: {};
    EF: Engageform.IEngageform;

    private updatePage(page) {
      console.log('> > > Update Page: ' + page._id);
      this.activePage = page;
      this.activePageId = page._id;
      this.EF._engageform.initPage(page);
    }

    private updateQuiz(EF) {
      console.log('> > > Update Quiz: ' + EF._engageformId);
      this.activeQuiz = EF;
      this.activeQuizId = EF._engageformId;
    }

    // Sockets
    private initSocket(opts: API.ILiveEmbed) {
      console.log('> Init socket');
      var url = Extension.config.backend.domain + Extension.config.liveEvent.socketNamespace, _self = this;
      url = url.replace(':liveEventId', opts.id);
      _self.socket = opts.io(url);

      _self.socket.on('connect', () => {
        console.log('[ Socket ] Connected');
        _self.socket.emit('getStatus', { liveEventId: opts.id });
      });

      _self.socket.on('liveEventStatus', (data) => {
        // FIXME: Remove fake chat data
        // _self.chat = new Chat('54c73d706abb690100969887');

        if (data.activeQuestionId !== _self.activePageId || data.activeQuizId !== _self.activeQuizId) {
          // Quiz changed
          if (data.activeQuizId !== _self.activeQuizId) {
            console.log('[ Socket ] Quiz changed');
            // return Engageform.Engageform.getById(data.activeQuizId).then((quizData) => {
            //   _self.updateQuiz(quizData);
            // });

            _self.EF.init({ id: data.activeQuizId, mode: 'default' }).then((res) => {
              _self.updateQuiz(res);
              console.log('> > LE get Quiz');
              // Update Page
              _self.getPageById(data.activeQuestionId).then((page) => {
                _self.updatePage(page);
              });
            });
          } else {
            // Only Page changed
            console.log('[ Socket ] Only Page changed');
            _self.getPageById(data.activeQuestionId).then((page) => {
              _self.updatePage(page);
            });
          }
        }
      });
    }

    // Get Liveevent
    getById(id: string): ng.IPromise<API.ILiveevent> {
      var url = Extension.config.backend.domain + Extension.config.liveEvent.liveEventUrl;
      url = url.replace(':liveEventId', id);

      // TODO: Get quiz and current question
      return Extension.$http.get(url).then((res: API.ILiveeventResponse) => {
        if ([200, 304].indexOf(res.status) !== -1) {
          console.log('> > LE get LE: ' + res.data._id);
          return res.data;
        }

        return Extension.$q.reject(res);
      });
    }

    // Get Page
    private getPageById(questionId: string) {
      var url = Extension.config.backend.domain + Extension.config.liveEvent.activeQuestion;
      url = url.replace(':questionId', questionId);

      return Extension.$http.get(url).then(function(res) {

        if ([200, 304].indexOf(res.status) !== -1) {
          console.log('> > LE get PAGE: ' + res.data._id);
          return res.data;
        }

          this.$q.reject(res);
      });
    }

    init(opts: API.ILiveEmbed) {
      console.log('> Init: ' + opts.id);
      this.EF = opts.engageform;

      // Init socket
      this.initSocket(opts);
    }
  }
}