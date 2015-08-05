module Chat {
  export interface IChat {
    id: string;
    name: string;
    premoderated: boolean;
    io: ();
    socket: {};
  }

  export interface IChatResponse {
    id: string;
    name: string;
    premoderated: boolean;
  }

  export interface IMessage {
    date: date;
    hidden: boolean;
    id: string;
    msg: string;
    user: string;
    userLink: string;
    userName?: string;
  }
}
