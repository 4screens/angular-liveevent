/// <reference path="./ichat.ts" />

module ChatModule {
  function featuredMessageNotify(oldValue, newValue, message) {
    this._liveevent.event.trigger('chat::messageFeatureStatusChanged', this._liveevent.id, message, newValue);
    return message;
  }

  function updateFeaturedStatus(oldValue, newValue, message) {
    message.featured = newValue;
    return message;
  }

  export class Chat implements IChat {
    id: string;
    name: string;
    premoderated: boolean;
    direction: string;
    theme: ITheme;

    socket: SocketIOClient.Socket;
    messages: IMessage[] = [];
    user: IUser;
    status: boolean;

    private _liveevent: Liveevent.ILiveevent;

    private updateMessageHandlers = {};

    /**
     * Registers handlers that will be invoked and will potentially modify the message on its data update.
     * @param field
     * @param handler
     */
    private registerUpdateMessageHandler(field: string, handler: (oldValue: any, newValue: any, message: IMessage) => IMessage) {
      if (!this.updateMessageHandlers[field]) {
        this.updateMessageHandlers[field] = [];
      }

      this.updateMessageHandlers[field].push(handler);
    }

    constructor(id: string, liveevent: Liveevent.ILiveevent) {
      this.id = id;
      this._liveevent = liveevent;

      // Feature status handlers
      this.registerUpdateMessageHandler('featured', updateFeaturedStatus);
      this.registerUpdateMessageHandler('featured', featuredMessageNotify);
    }

    private login(data: IFbAuth, dataMe: any) { // FIXME: dateMe FB interface (v2.3 or 2.2) ?
      this.user = {
        accessToken: data.accessToken,
        user: data.userID,
        userLink: dataMe.link,
        userName: dataMe.name,
        userID: data.userID
      };
    }

    private logout():void {
      this.user = null;
    }

    private updateChat(data) {
      this.id = data.id;
      this.name = data.name;
      this.premoderated = data.premoderated;
      this.direction = data.chatDirection;
      this.theme = data.theme;

      // Get some old msgs
      this.getMsgs();
    }

    private sendMsg(m: IMessage) {
      if (!this.user) return;

      var url = Extension.config.backend.domain + Extension.config.chat.sendUrl, msg;
      url = url.replace(':chatId', this.id);

      msg = {
        accessToken: this.user.accessToken,
        date: Date.now(),
        hidden: false,
        id: this.user.userId,
        msg: m,
        user: this.user.user,
        userLink: this.user.userLink,
        userName: this.user.userName
      };

      return Extension.$http.post(url, msg);
    }

    private getMsgs() {
      var url = Extension.config.backend.domain + Extension.config.chat.messagesUrl;
      url = url.replace(':chatId', this.id);
      return Extension.$http.get(url).then((res) => {
        this.messages = <IMessage[]>res.data;

        if (this.messages.length) {
          // Sort by newest
          this.messages = _.sortBy(this.messages, 'date').reverse();

          // Reverse msg order
          if (this.direction && this.direction === 'ttb') {
            this.messages.reverse();
          }
        }

        _.forEach(this.messages, (message) => {
          this._liveevent.event.trigger('chat::message', this._liveevent.id, message);
        })
      });
    }

    /**
     * Handles updates of a message data, delegating data to handler functions.
     * @param message
     * @param newData
     * @returns {IMessage}
     */
    private handleNewMessageData(message: IMessage, newData: IMessage) {
      _.forOwn(newData, (value, field) => {
        // When the value is different than it was before and there are handlers defined, call them.
        if (value !== message[field] && _.isArray(this.updateMessageHandlers[field])) {
          var oldValue = message[field];
          _.forEach(this.updateMessageHandlers[field], (handler) => {
            handler.call(this, oldValue, value, message);
          })
        }
      });

      return message;
    }

    private initSocket() {
      var url = Extension.config.backend.socket;

      this.socket = Extension.io.connect(url, { forceNew: true });

      this.socket.on('error', (res) => {
        console.warn(res);
      });

      this.socket.on('connect', (data) => {
        // Join room
        this.socket.emit('joinRoom', this.id);
        // We can also leave room, to do so just emit 'leaveRoom' with roomId as param
      });

      // New msg event
      this.socket.on('msg', (data) => {
        // "msg" event is triggered not only when new message arrives, but also a message changes.
        var existingMsg = _.find(this.messages, function(message) {
          return message.id === data.id;
        });

        Extension.$rootScope.$apply(() => {
          if (existingMsg) {
            this.handleNewMessageData(existingMsg, data);
          } else {
            if (this.direction && this.direction === 'ttb') {
              this.messages.push(<IMessage>data);
            } else {
              this.messages.unshift(<IMessage>data);
            }
          }
        });

        if (!existingMsg) {
          this._liveevent.event.trigger('chat::message', this._liveevent.id, <IMessage>data);
        }
      });

      this.socket.on('msgHide', (id) => {
        this._liveevent.event.trigger('chat::hideMessage', id);

        var messageIndex = this.messages.length;

        for (var i = 0; i < this.messages.length; i += 1) {
          if (this.messages[i].id === id) {
            messageIndex = i;
          }
        }

        Extension.$rootScope.$apply(() => {
          this.messages.splice(messageIndex, 1);
        });
      });

      // On disconect
      this.socket.on('disconnect', this.initSocket);
    }

    init():ng.IPromise<IChatResponse> {
      // Get chat details
      var url = Extension.config.backend.domain + Extension.config.chat.detailUrl;
      url = url.replace(':chatId', this.id);
      return Extension.$http.get(url).then((res: IChatResponse) => {
        this.updateChat(res.data);
        this.initSocket();
        return res;
      });
    }
  }
}
