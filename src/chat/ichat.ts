module ChatModule {
  export interface IChat {
    id: string;
    name: string;
    premoderated: boolean;
    socket?: SocketIOClient.Socket;
    messages?: IMessage[];

    init(): void;
  }

  export interface IChatResponse {
    data: {
      id: string;
      name: string;
      premoderated: boolean;
    };
    status: number;
  }

  export interface IMessage {
    accessToken: string;
    date: string;
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
    signedRequest?: string;
    userID: string;
  }
}
