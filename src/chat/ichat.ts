module Chat {
  export interface IChat {
    id: string;
    name: string;
    premoderated: boolean;
    socket: {};
    messages: Chat.IMessage[];

    init(): void;
  }

  export interface IChatResponse {
    data: {
      id: string;
      name: string;
      premoderated: boolean;
    };
  }

  export interface IMessage {
    accessToken: string;
    date: date;
    hidden: boolean;
    id: string;
    msg: string;
    user: string;
    userLink: string;
    userName?: string;
  }

  export interface IUser {
    accessToken: string;
    user: string;
    userLink: string;
    userName?: string;
    userId?: string;
  }

  export interface IFbAuth {
    accessToken: string;
    expiresIn?: number;
    signedRequest: string;
    userID: string;
  }
}