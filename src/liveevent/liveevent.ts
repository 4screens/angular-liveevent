/// <reference path="iliveevent.ts" />

module Liveevent {
  interface summaryStatData {
    questionId: string;
    avg: number;
  }

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
    sendAnswerCallback: API.answerCallback;

    // Embed settings are stored on the instance since it's needed much after the initialisation.
    embedSettings: API.IEmbedSettings;

    event: Util.Event;

    constructor() {
      this.event = new Util.Event();
    }

    private summaryStatsUnification(data): summaryStatData {
      var result = <summaryStatData>{};

      result.questionId = data._id;

      if (data.type === 'rateIt') {
        result.avg = data.stats.avg;

        return result;
      }

      _.each(data.answers, function(answer: {percent: number, _id: string}) {
        result[answer._id] = answer.percent;
      });

      return result;
    };

    private getAnswersForSummary(): ng.IPromise<any> {
      var url = Extension.config.backend.domain + Extension.config.engageform.presentationViewStats;
      url = url.replace(':questionId', this.activePageId);

      return Extension.$http.get(url).then((res) => {
        if ([200, 304].indexOf(res.status) !== -1) {
          return this.summaryStatsUnification(res.data);
        }

        return Extension.$q.reject(res);
      });
    };

    private updatePage(page: Page.IPage) {
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

      if (!this.currentEngageform.navigation.truePick) {
        this.currentEngageform.navigation.truePick = this.currentEngageform.navigation.pick;
      }

      // Block pick if answers are not allowed
      this.currentEngageform.navigation.pick = (event, page: Page.ICase, options?) => {
        if (this.currentEngageform.liveSettings.acceptResponses) {
          this.currentEngageform.navigation.truePick(event, page, options);
        } else {
          this.currentEngageform.message = 'Answering is disabled at the moment.';
        }
      };

      if (Extension.mode === Engageform.Mode.Summary && this.currentEngageform.current
        && this.activePageId && _.has(Extension.config, 'engageform.presentationViewStats')) {
        this.getAnswersForSummary().then((answersData) => {
          this.currentEngageform.current.updateAnswers(answersData);
        });

        this.currentEngageform.liveSettings.showAnswers = true;
      }
    }

    private removePage() {
      return Extension.$timeout(() => {
        this.activePage = null;
        this.activePageId = null;

        if (this.currentEngageform) {
          this.currentEngageform.current = null;
          this.currentEngageform.message = null;
        }
      });
    }

    private updateQuiz(EF) {
      this.currentEngageform = EF;

      this.event.trigger('now::changed', EF);

      if (!this.currentEngageform.navigation.truePick) {
        this.currentEngageform.navigation.truePick = this.currentEngageform.navigation.pick;
      }

      this.activeQuiz = this.currentEngageform;
      this.activeQuizId = this.currentEngageform._engageformId;
    }

    private removeQuiz() {
      return this.removePage().then(() => {
        return Extension.$timeout(() => {
          this.activeQuiz = null;
          this.activeQuizId = null;

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

          this.currentEngageform = null;
        });
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

	  /**
     * Handler of the "liveEventStatus" socket event that manages the active quiz and page.
     * @param data Data from the event.
     * @param {API.ILiveEmbed} opts Options provided in the initSocket method.
     */
    liveStatusEventHandler(data, opts: API.ILiveEmbed) {
      // If the quiz is not active or there's no active quiz, run the deactivation process.
      if (!data.isActive || !data.activeQuizId) {
        this.removeQuiz();

      // No questions provided in the data? Deactivate the page.
      } else if (!data.activeQuestionId) {
        this.removePage();

      // Quiz changed, so initialise another form.
      } else if (data.activeQuizId !== this.activeQuizId) {
        this.EF.init({
          id: data.activeQuizId,
          mode: 'default',
          live: true,
          callback: {sendAnswerCallback: this.sendAnswerCallback},
          embedSettings: this.embedSettings
        }).then((res) => {
          this.updateQuiz(res);
          this.getPageById(data.activeQuestionId).then((page: Page.IPage) => {
            this.updatePage(page);
          });
        });

      // Question changed, so go to another page.
      } else if (data.activeQuestionId !== this.activePageId) {
        this.getPageById(data.activeQuestionId).then((page: Page.IPage) => {
          this.updatePage(page);
        });
      }

      // Change the current form settings if applies.
      Extension.$timeout(() => {
        if (this.currentEngageform) {
          this.currentEngageform.liveSettings.showAnswers = data.showAnswers;
          this.currentEngageform.liveSettings.acceptResponses = data.acceptResponses;
        }
      });

      // Run the callback.
      if (opts.callback && opts.callback.liveEventStatus) {
        data.id = opts.id;
        opts.callback.liveEventStatus(data);
      }
    }

    // Sockets
    private initSocket(opts: API.ILiveEmbed) {
      var url = Extension.config.backend.socket + Extension.config.liveEvent.socketNamespace;
      url = url.replace(':liveEventId', opts.id);

      // Create callback object if not provided.
      opts.callback = opts.callback || {};

      // Connect to the socket.
      this.socket = Extension.io.connect(url, { forceNew: true });

      this.socket.on('liveEventStatus', data => { this.liveStatusEventHandler(data, opts); });

      this.socket.on('connect', () => {
        this.socket.emit('getStatus', { liveEventId: opts.id });
      });

      this.socket.on('disconnect', this.initSocket);

      this.socket.on('error', (res) => {
        console.warn('[ Liveevent:Socket ] Error: ' + res);
      });

      this.socket.on('reconnecting', () => {
        console.warn('[ Liveevent:Socket ] Reconnecting');
      });

      this.socket.on('reconnect_failed', () => {
        console.warn('[ Liveevent:Socket ] Reconnect failed');
      });

      this.socket.on('reconnect', () => {
        this.socket.emit('getStatus', { liveEventId: opts.id });
      });

      this.socket.on('rateItQuestionStatus', (data) => {
        this.currentEngageform.current.updateAnswers(data);
      });

      this.socket.on('multipleChoiceQuestionAnswers', (data) => {
        this.currentEngageform.current.updateAnswers(data);
      });

      // Buzzer listening
      this.socket.on('buzzerQuestionStatus', (data) => {
        // Run callback
        if (opts.callback.buzzerQuestionStatus) {
          data.id = opts.id;
          opts.callback.buzzerQuestionStatus(data);
        }
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
          return res.data;
        }

          this.$q.reject(res);
      });
    }

    init(opts: API.ILiveEmbed) {
      var deferred = Extension.$q.defer();

      this.embedSettings = opts.embedSettings;
      this.id = opts.id;
      this.EF = opts.engageform;
      this.sendAnswerCallback = opts.callback.sendAnswerCallback;

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
