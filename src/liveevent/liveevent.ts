/// <reference path="iliveevent.ts" />

module Liveevent {
  export class Liveevent implements ILiveevent {
    enabled: boolean;
    title: string;

    activePage: Page.IPage;
    activeQuiz: Engageform.IEngageform;
    activePageId: string;
    activeQuizId: string;
    socket: SocketIOClient.Socket;
    EF: Engageform.IEngageform;
    chat: ChatModule.IChat;

    constructor() {
      console.log('[ Liveevent ] Constructor');
    }

    private updatePage(page) {
      console.log('[ Liveevent ] Update Page: ' + page._id);
      this.activePage = page;
      this.activePageId = page._id;
      this.EF['_engageform'].initPage(page); // ts compiler ..
      console.log(this.EF);
    }

    private updateQuiz(EF) {
      console.log('[ Liveevent ] Update Quiz: ' + EF._engageformId);
      this.activeQuiz = EF;
      this.activeQuizId = EF._engageformId;
    }

    // Sockets
    private initSocket(opts: API.ILiveEmbed) {
      console.log('[ Liveevent ] Init socket');
      var url = Extension.config.backend.domain + Extension.config.liveEvent.socketNamespace;
      url = url.replace(':liveEventId', opts.id);
      this.socket = Extension.io(url);

      this.socket.on('connect', () => {
        console.log('[ Liveevent:Socket ] Connected');
        this.socket.emit('getStatus', { liveEventId: opts.id });
      });

      this.socket.on('disconnect', this.initSocket);

      this.socket.on('liveEventStatus', (data) => {

        // Init chat if Liveevent has one
        // FIXME: Uncomment chatId checking
        if (!this.chat /*&& data.chatId*/) {
          // FIXE: Remove fake chat id #55c1f03de5498601002e0c9e and get rid of socketio injection
          // this.chat = new ChatModule.ChatModule(data.chatId);
          this.chat = new ChatModule.Chat('54c73d706abb690100969887');
          this.chat.init();
        }

        if (data.activeQuestionId !== this.activePageId || data.activeQuizId !== this.activeQuizId) {
          // Quiz changed
          if (data.activeQuizId !== this.activeQuizId) {
            console.log('[ Liveevent:Socket ] Quiz changed');
            // return Engageform.Engageform.getById(data.activeQuizId).then((quizData) => {
            //   this.updateQuiz(quizData);
            // });

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
      });
    }

    // Get Liveevent
    getById(id: string): ng.IPromise<API.ILiveevent> {
      var url = Extension.config.backend.domain + Extension.config.liveEvent.liveEventUrl;
      url = url.replace(':liveEventId', id);

      // TODO: Get quiz and current question
      return Extension.$http.get(url).then((res: API.ILiveeventResponse) => {
        if ([200, 304].indexOf(res.status) !== -1) {
          console.log('[ Liveevent ] Get LE: ' + res.data._id);
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

      this.EF = opts.engageform;

      // Init socket
      this.initSocket(opts);

      deferred.resolve(this);
      return deferred.promise;
    }
  }
}
