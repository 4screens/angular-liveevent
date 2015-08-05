/// <reference path="ichat.ts" />

module Chat {
  export class Chat implements IChat {
    id: string;
    name: string;
    premoderated: boolean;
    io: ();
    socket: {};
    messages: IMessage[];

    // FIXME: remove socket io injection
    constructor(id: string, io: ()) {
      console.log('[ Chat ] Constructor');
      this.id = id;
      this.io = io;
      this.socket = {};

      return this;
    }

    private updateChat(data: IChatResponse) {
      console.log('[ Chat ] Update chat');
      this.id = data.id;
      this.name = data.name;
      this.premoderated = data.premoderated;

      // Get some old msgs
      this.getMsgs();
    }

    private getMsgs() {
      console.log('[ Chat ] Get old msgs');
      var url = Extension.config.backend.domain + Extension.config.chat.messagesUrl;
      url = url.replace(':chatId', this.id);
      return Extension.$http.get(url).then((res) => {
        console.log(res);
      });
    }

    private initSocket() {
      console.log('[ Chat:Socket ] Init socket');

      // var url = Extension.config.backend.domain + Extension.config.chat.socketNamespace, _self = this;
      var url = Extension.config.backend.socket, _self = this;
      // url = url.replace(':chatId', this.id);

      _self.socket = _self.io.connect(url);

      _self.socket.on('connect', (data) => {
        console.log('[ Chat:Socket ] Connected');

        // Join room
        _self.socket.emit('joinRoom', _self.id);
        // We can also leave room, to do so just emit 'leaveRoom' event with roomId as param
      });

      // New msg event
      _self.socket.on('msg', (data) => {
        console.log('[ Chat:Socket ] New msg');
        console.log(data);
      });

      // On disconect
      _self.socket.on('disconnect', _self.initSocket);
    }

    init() {
      console.log('[ Chat ] Init: ' + this.id);

      // Get chat details
      var url = Extension.config.backend.domain + Extension.config.chat.detailUrl;
      url = url.replace(':chatId', this.id);
      Extension.$http.get(url).then((res.data: IChatResponse) => {
        this.updateChat(res.data);
        this.initSocket();
      });
    }
  }
}