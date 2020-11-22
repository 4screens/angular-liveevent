module ChatModule {
  export interface IChat {
    id: string;
    name: string;
    premoderated: boolean;
    direction: string;
    theme?: ITheme;
    socket?: SocketIOClient.Socket;
    messages?: IMessage[];
    status: boolean;

    init(): ng.IPromise<IChatResponse>;
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
    avatarColor?: string;
  }

  export interface IUser {
    accessToken: string;
    user: string;
    userLink: string;
    userName?: string;
    userId?: string;
    userID?: string
  }

  export interface IFbAuth {
    accessToken: string;
    expiresIn?: number;
    signedRequest?: string;
    userID: string;
  }

  export interface ITheme {
      avatar: string;
      backgroundColor: string;
      borderColor: string;
      fontColor: string;
      headerFontColor: string;
  }
}
