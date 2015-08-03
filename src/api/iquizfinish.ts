module API {
  export interface IQuizFinish {
    userIdent: string;
    globalUserIdent: string;
    outcome: string;
    totalScore: number;
    maxScore: number;
    msg: string;
  }
}
