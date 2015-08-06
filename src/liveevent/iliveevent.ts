module Liveevent {
  export interface ILiveevent {
    enabled: boolean;
    title: string;
    activePage: Page.IPage;
    activeQuiz: Engageform.IEngageform;
    activePageId: string;
    activeQuizId: string;
    socket: {
      liveevent: {};
      chat: {};
    };
    EF: Engageform.IEngageform;
    chat: Chat.IChat;
  }
}
