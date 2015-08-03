module API {
  export interface IQuizQuestionAnswer {
    quizQuestionId?: string;
    userIdent?: string;
    selectedAnswerId?: string;
    correctAnswerId?: string;
    selectedValue?: number;
    points?: number;
    avgRateItValue?: string;
    stats?: {
      [index: string]: number;
    }
  }
}
