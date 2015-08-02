module API {
  export interface ILiveevent {
    _id: string;
    title: string;

    quizzes: string[];

    status: {
      activeQuestionId: string;
      activeQuizId: string;
      isActive: boolean;
    }
  }

  export interface ILiveeventResponse {
    status: number;
    data: ILiveevent;
  }

  export interface ILiveEmbed {
    id: string;
    socket: () => {};
    engageform: {};
  }
}
