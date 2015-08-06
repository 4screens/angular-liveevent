/// <reference path="ichat.ts" />

module Chat {
  export class Chat implements IChat {
    id: string;
    name: string;
    premoderated: boolean;
    socket: {} = {};
    messages: Chat.IMessage[] = [];
    user: IUser;

    constructor(id: string) {
      console.log('[ Chat ] Constructor');
      this.id = id;

      return this;
    }

    private login(data: IFbAuth, dataMe: any) { // FIXME: dateMe FB interface (v2.3 or 2.2) ?
      this.user = {
        accessToken: data.accessToken,
        user: data.userID, // FIXME: What i should pass here (in old version it was userId) ?!
        userLink: dataMe.link,
        userName: dataMe.name,
        userID: data.userID
      };
    }

    private logout():void {
      this.user = null;
    }

    private updateChat(data: IChat) {
      console.log('[ Chat ] Update chat');
      this.id = data.id;
      this.name = data.name;
      this.premoderated = data.premoderated;

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

      Extension.$http.post(url, msg).then((res) => {
        this.messages.push(msg);
      });
    }

    private getMsgs() {
      console.log('[ Chat ] Get old msgs');
      var url = Extension.config.backend.domain + Extension.config.chat.messagesUrl;
      url = url.replace(':chatId', this.id);
      return Extension.$http.get(url).then((res) => {
        console.log('[ Chat ] Got ' + res.data['length'] + ' msgs');
        this.messages = res.data;
      });
    }

    private initSocket() {
      console.log('[ Chat:Socket ] Init socket');

      // var url = Extension.config.backend.domain + Extension.config.chat.socketNamespace, _self = this;
      var url = Extension.config.backend.socket, _self = this;
      // url = url.replace(':chatId', this.id);

      _self.socket = Extension.io.connect(url);

      _self.socket.on('connect', (data) => {
        console.log('[ Chat:Socket ] Connected');

        // Join room
        _self.socket.emit('joinRoom', _self.id);
        // We can also leave room, to do so just emit 'leaveRoom' with roomId as param
      });

      // New msg event
      _self.socket.on('msg', (data) => {
        console.log('[ Chat:Socket ] New msg');
        console.log(data);
      });

      // On disconect
      _self.socket.on('disconnect', _self.initSocket);
    }

    init():void {
      console.log('[ Chat ] Init: ' + this.id);

      // Get chat details
      var url = Extension.config.backend.domain + Extension.config.chat.detailUrl;
      url = url.replace(':chatId', this.id);
      Extension.$http.get(url).then((res: IChatResponse) => {
        console.log(res);
        this.updateChat(res.data);
        this.initSocket();
      });
    }
  }
}