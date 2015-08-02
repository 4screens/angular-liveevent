/// <reference path="iliveevent.ts" />

module Liveevent {
  export class Liveevent implements ILiveevent {
    enabled: boolean;
    title: string;
    activePage: Page.IPage;
    activeQuiz: Page.IPage;
    activePageId: string;
    activeQuizId: string;

    // FIXME: Init sockets here
    constructor(opts: API.ILiveEmbed) {
      console.log('LE constructor');
    }

    static updatePage(page) {
      console.log('> > Update Page');
      console.log(page);
      this.activePage = page;
      this.activePageId = page._id;

      if (this._engageform && this.activePage) {
        this._engageform.initPage(this.activePage);
      }
    }

    static updateQuiz(quiz) {
      console.log('> > Update Quiz');
      this.activeQuiz = quiz;
      this.activeQuizId = quiz._id;
      this._engageform = new Engageform.Live(this.activeQuiz);

      if (this._engageform && this.activePage) {
        this._engageform.initPage(this.activePage);
      }

      return this._engageform;
    }

    static connectToSocket(opts: API.ILiveEmbed) {
      console.log('> > Init socket');
      var url = Bootstrap.config.backend.domain + Bootstrap.config.liveEvent.socketNamespace, _self = this;
      url = url.replace(':liveEventId', opts.id);
      _self.socket = opts.io(url);

      _self.socket.on('connect', () => {
        _self.socket.emit('getStatus', { liveEventId: opts.id });
      });

      _self.socket.on('liveEventStatus', (data) => {
        if (data.activeQuestionId !== _self.activePageId) {
          _self.getPageById(data.activeQuestionId).then((page) => {
            _self.updatePage(page);
          });
        }

        if (data.activeQuizId !== _self.activeQuizId) {
          Engageform.Engageform.getById(data.activeQuizId).then((quizData) => {
            _self.updateQuiz(quizData);
          });
        }
      });
    }

    static getById(id: string): ng.IPromise<API.ILiveevent> {
      console.log('> > LE getById');
      var url = Bootstrap.config.backend.domain + Bootstrap.config.liveEvent.liveEventUrl;
      url = url.replace(':liveEventId', id);

      // TODO: Get quiz and current question
      return Bootstrap.$http.get(url).then((res: API.ILiveeventResponse) => {
        if ([200, 304].indexOf(res.status) !== -1) {
          console.log(res.data);
          return res.data;
        }

        return Bootstrap.$q.reject(res);
      });
    }

    static getPageById(questionId: string): ng.IPromise<API.IQuizQuestion> {
      console.log('> > LE getPageById');
      var url = Bootstrap.config.backend.domain + Bootstrap.config.liveEvent.activeQuestion;
      url = url.replace(':questionId', questionId);

      return Bootstrap.$http.get(url).then(function(res) {

        if ([200, 304].indexOf(res.status) !== -1) {
          console.log(res.data);
          return res.data;
        }

          this.$q.reject(res);
      });
    }

    static init(opts: API.ILiveEmbed): ng.IPromise<Engageform.IEngageform> {
      console.log('> Init: ' + opts.id);

      // Get socket
      return this.connectToSocket(opts);

      // Get Liveevent
      // return this.getById(opts.id).then((liveeventData) => {
        // _self.enabled = liveeventData.isActive || false;

        // FIXME: REMOVE FAKE QUIZID
        // _self.activeQuizId = liveeventData.activeQuizId || '55a92a97b596220100fb090c';

        // FIXME: REMOVE FAKE PAGEID
        // _self.activePageId = liveeventData.activePageId || '55a92a9ab596220100fb090d';

        // Get Quiz
        // return Engageform.Engageform.getById(_self.activeQuizId).then((quizData) => {
        //   _self.updateQuiz(quizData);

        //   // Get Question
        //   // FIXME: MOVEIT to engagenow - /engageform/type/live.ts ?
        //   _self.getPageById(_self.activePageId).then((page) => {
        //     _self.updatePage(page);
        //   });
        // });
      // });
    }
  }
}