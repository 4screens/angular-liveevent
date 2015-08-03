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

  export interface ILiveeventResponse {
    status: number;
    data: ILiveevent;
  }

  export interface ILiveEmbed {
    id: string;
    socket: () => {};
    engageform: Engageform.IEngageform;
  }
}
