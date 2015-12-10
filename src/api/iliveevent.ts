module API {
  export interface ILiveevent {
    _id: string;
    title: string;

    quizzes: string[];

    status: {
      isActive: boolean;
      activePage: Page.IPage;
      activeQuiz: Engageform.IEngageform;
      activePageId: string;
      activeQuizId: string;
    }
  }

  export interface ILiveEmbed {
    id: string;
    mode: string;
    engageform: Engageform.IEngageform;
    io: SocketIOClientStatic;
    callback: {
      sendAnswerCallback: () => void;
    };
  }
}
