module Liveevent {
  export interface ILiveevent {
    enabled: boolean;
    title: string;
    activePage: Page.IPage;
    activeQuiz: Engageform.IEngageform;
    activePageId: string;
    activeQuizId: string;
    socket: {};
    EF?: Engageform.IEngageform;
    chat: ChatModule.IChat;

    init(opts: API.ILiveEmbed): void;
  }

  export interface ILiveeventResponse {
    _id: string;
    account: string;
    chatId: string;
    status: {
      activeQuestionId: string;
      activeQuizId: string;
    };
    activeQuestionId: string;
    activeQuizId: string;
    title: string;
  }
}