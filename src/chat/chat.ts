/// <reference path="ichat.ts" />

module ChatModule {
  export class Chat implements IChat {
    id: string;
    name: string;
    premoderated: boolean;
    direction: string;
    theme: ITheme;
    socket: SocketIOClient.Socket;
    messages: IMessage[] = [];
    user: IUser;

    constructor(id: string) {
      console.log('[ Chat ] Constructor');
      this.id = id;

      return this;
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
      console.log('[ Chat ] Update chat');
      this.id = data.id;
      this.name = data.name;
      this.premoderated = data.premoderated;
      this.direction = data.chatDirection;
      this.theme = data.theme;

      // Get some old msgs
      this.getMsgs();
    }

    private sendMsg(m: IMessage) {
      console.log('[ Chat ] Posting msg');

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
      console.log('[ Chat ] Get old msgs');
      var url = Extension.config.backend.domain + Extension.config.chat.messagesUrl;
      url = url.replace(':chatId', this.id);
      return Extension.$http.get(url).then((res) => {
        //console.log('[ Chat ] Got ' + res.data.length + ' msgs');
        this.messages = <IMessage[]>res.data;
      });
    }

    private initSocket() {
      console.log('[ Chat:Socket ] Init socket');

      var url = Extension.config.backend.socket;

      this.socket = Extension.io.connect(url, { 'force new connection': true });

      this.socket.on('error', (res) => {
        console.warn(res);
      });

      this.socket.on('connect', (data) => {
        console.log('[ Chat:Socket ] Connected');

        // Join room
        this.socket.emit('joinRoom', this.id);
        // We can also leave room, to do so just emit 'leaveRoom' with roomId as param
      });

      // New msg event
      this.socket.on('msg', (data) => {
        console.log('[ Chat:Socket ] New msg');
        Extension.$rootScope.$apply(() => {
          this.messages.unshift(<IMessage>data);
        })
      });

      this.socket.on('msgHide', (id) => {
        console.log('[ Chat:Socket] Hide msg');

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
      console.log('[ Chat ] Init: ' + this.id);

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
