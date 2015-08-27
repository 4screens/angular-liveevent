/// <reference path="iliveevent.ts" />

module Liveevent {
  export class Liveevent implements ILiveevent {
    enabled: boolean;
    id :string;
    title: string;

    activePage: Page.IPage;
    activeQuiz: Engageform.IEngageform;
    activePageId: string;
    activeQuizId: string;
    socket: SocketIOClient.Socket;
    EF: Engageform.IEngageform;
    chat: ChatModule.IChat;
    currentEngageform: Engageform.IEngageform;

    event: Util.Event;

    constructor() {
      console.log('[ Liveevent ] Constructor');

      this.event = new Util.Event();
    }

    private updatePage(page) {
      console.log('[ Liveevent ] Update Page: ' + page._id, this.currentEngageform.navigation);

      var __type = this.activePage ? (this.activePage.type + '') : null;

      // Check if form and if so, send all inputs
      if (__type && __type.indexOf('form') > -1) {
        this.currentEngageform.navigation.pick(null, null, {quiet: true});
      }

      this.activePage = page;
      this.activePageId = page._id;

      this.currentEngageform.message = null;
      this.currentEngageform.initPage(page);

      // Add liveSettings
      this.currentEngageform.liveSettings = <Page.ILiveSetting>page.liveSettings;

      // Overwrite navigation
      this.currentEngageform.navigation.enabled = false;
      this.currentEngageform.navigation.position = 0;
      this.currentEngageform.navigation.size = 1;
      this.currentEngageform.navigation.hasStart = false;
      this.currentEngageform.navigation.enabledStart = false;
      this.currentEngageform.navigation.hasPrev = false;
      this.currentEngageform.navigation.enabledPrev = false;
      this.currentEngageform.navigation.hasNext = false;
      this.currentEngageform.navigation.enabledNext = false;
      this.currentEngageform.navigation.hasFinish = false;
      this.currentEngageform.navigation.enabledFinish = false;
      this.currentEngageform.navigation.distance = 0;
      this.currentEngageform.navigation.prev = ($event) => { return; };
      this.currentEngageform.navigation.next = ($event, vcase: Page.ICase) => { return; };
      this.currentEngageform.navigation.start = ($event) => { return; };
      this.currentEngageform.navigation.finish = ($event, vcase: Page.ICase) => { return; };

      // Block pick if answers are not allowed
      this.currentEngageform.navigation.pick = (e, n, r) => {
        if (this.currentEngageform.liveSettings.acceptResponses) {
          this.currentEngageform.navigation.truePick(e, n, r);
        } else {
          this.currentEngageform.message = 'Answers are currently not acceptabe';
        }
      };
    }

    private removePage() {
      console.log('[ Liveevent ] Remove page');
      Extension.$timeout(() => {
        this.activePage = null;
        this.activePageId = null;

        if (this.currentEngageform) {
          this.currentEngageform.current = null;
          this.currentEngageform.message = null;
        }
      });
    }

    private updateQuiz(EF) {
      console.log('[ Liveevent ] Update Quiz: ' + this.currentEngageform._engageformId);

      this.currentEngageform = EF;
      this.currentEngageform.navigation.truePick = this.currentEngageform.navigation.pick;

      this.activeQuiz = this.currentEngageform;
      this.activeQuizId = this.currentEngageform._engageformId;
    }

    private removeQuiz() {
      console.log('[ Liveevent ] Remove quiz');
      Extension.$timeout(() => {
        this.activeQuiz = null;
        this.activeQuizId = null;
        this.currentEngageform = null;

        if (this.currentEngageform) {
          this.currentEngageform.branding = null;
          this.currentEngageform.current = null;
          this.currentEngageform.message = null;
          this.currentEngageform.meta = null;
          this.currentEngageform.navigation = null;
          this.currentEngageform.theme = null;
          this.currentEngageform.title = null;
          this.currentEngageform.type = null;
        }
      });
    }

    // Init chat
    private initChat(id: string): ng.IPromise<any> {
      var deferred = Extension.$q.defer();

      if (!this.chat && id) {
        this.chat = new ChatModule.Chat(id, this);

        return this.chat.init();
      } else {
        // If it is already initialised (meaning it's available on this instance), return a fake promise that
        // is here just to make the API looks better.
        deferred.resolve();
        return deferred.promise;
      }
    }

    // Sockets
    private initSocket(opts: API.ILiveEmbed) {
      console.log('[ Liveevent ] Init socket');
      var url = Extension.config.backend.socket + Extension.config.liveEvent.socketNamespace;
      url = url.replace(':liveEventId', opts.id);
      this.socket = Extension.io.connect(url, { 'force new connection': true });

      this.socket.on('connect', () => {
        console.log('[ Liveevent:Socket ] Connected');
        this.socket.emit('getStatus', { liveEventId: opts.id });
      });

      this.socket.on('disconnect', this.initSocket);

      this.socket.on('error', (res) => {
        console.warn('[ Liveevent:Socket ] Error: ' + res);
      });

      this.socket.on('liveEventStatus', (data) => {

        // Liveevent is off
        if (!data.isActive) {
          console.log('[ Liveevent:Socket ] Liveevent is not active');
          this.removePage();
          this.removeQuiz();

          return;
        }

        if (data.activeQuestionId !== this.activePageId || data.activeQuizId !== this.activeQuizId) {

          // Quiz is off
          if (!data.activeQuizId) {
            console.log('[ Liveevent ] Quiz is empty');
            this.removeQuiz();

            return;
          }

          this.EF.init({ id: data.activeQuizId, mode: 'default' }).then((res) => {
            this.currentEngageform = res;

            console.log('[eform]', this.currentEngageform);
          });

          // Page is off
          if (!data.activeQuestionId) {
              console.log('[ Liveevent ] Page is empty');
            this.removePage();

            return;
          }


          // Quiz changed
          if (data.activeQuizId !== this.activeQuizId) {
            console.log('[ Liveevent:Socket ] Quiz changed');
            this.EF.init({ id: data.activeQuizId, mode: 'default' }).then((res) => {
              this.updateQuiz(res);

              // Update Page
              this.getPageById(data.activeQuestionId).then((page) => {
                this.updatePage(page);
              });
            });
          } else {
            // Only Page changed
            console.log('[ Liveevent:Socket ] Only Page changed');
            this.getPageById(data.activeQuestionId).then((page) => {
              this.updatePage(page);
            });
          }
        }

        // Quiz and page is same, check if showAnswers or acceptResponses had change
        if (this.currentEngageform) {
          if (data.showAnswers !== this.currentEngageform.liveSettings.showAnswers) {
            console.log('[ Liveevent ] Show answer option changed');

            Extension.$timeout(() => {
              this.currentEngageform.liveSettings.showAnswers = data.showAnswers;
            });
          }
          if (data.acceptResponses !== this.currentEngageform.liveSettings.acceptResponses) {
            console.log('[ Liveevent ] Accept responses option changed');

            Extension.$timeout(() => {
              this.currentEngageform.liveSettings.acceptResponses = data.acceptResponses;
              this.currentEngageform.message = '';
            });
          }
        }
      });

      this.socket.on('multipleChoiceQuestionAnswers', (data) => {
        this.currentEngageform.updateAnswers(data);
      });
    }

    // Get Liveevent
    getById(id: string): ng.IPromise<ILiveeventResponse> {
      var url = Extension.config.backend.domain + Extension.config.liveEvent.liveEventUrl;
      url = url.replace(':liveEventId', id);

      // TODO: Get quiz and current question
      return Extension.$http.get(url).then((res) => {
        if ([200, 304].indexOf(res.status) !== -1) {
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
          console.log('[ Liveevent ] Get PAGE: ' + res.data['_id']);
          return res.data;
        }

          this.$q.reject(res);
      });
    }

    init(opts: API.ILiveEmbed) {
      console.log('[ Liveevent ] Init: ' + opts.id);
      var deferred = Extension.$q.defer();

      this.id = opts.id;
      this.EF = opts.engageform;

      // Get Liveevent
      this.getById(opts.id).then((res) => {
        // Init socket
        this.initSocket(opts);

        // Init chat
        this.initChat(res.chatId).then(() => {
          // ...
        });
        deferred.resolve(this);
      });

      return deferred.promise;
    }
  }
}
