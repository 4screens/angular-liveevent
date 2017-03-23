module API {
  export interface IEmbed {
    id: string;
    mode: string;
    live: boolean;
    callback: {
      sendAnswerCallback?: answerCallback;
      liveEventStatus?: liveEventStatusCallback;
      buzzerQuestionStatus?: buzzerQuestionStatusCallback;
    };
    embedSettings: IEmbedSettings;
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
