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

  export interface ILiveEmbed extends IEmbed {
    engageform: Engageform.IEngageform;
    io: SocketIOClientStatic;
  }
}
