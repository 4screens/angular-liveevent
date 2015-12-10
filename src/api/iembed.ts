module API {
  export interface IEmbed {
    id: string;
    mode: string;
    callback: {
      sendAnswerCallback?: answerCallback;
      liveEventStatus?: liveEventStatusCallback;
      buzzerQuestionStatus?: buzzerQuestionStatusCallback;
    };
  }

  export interface answerCallback {
    (): void
  }

  export interface liveEventStatusCallback {
    (data): void;
  }

  export interface buzzerQuestionStatusCallback {
    (data): void;
  }
}
