module Page {
  export interface ISetting {
    showAnswers: boolean;
    showCorrectAnswer: boolean;
    showMainMedia: boolean;
    showDescription: boolean;
    requiredAnswer: boolean;
  }

  export interface ILiveSetting {
      acceptResponses: boolean;
      showAnswers: boolean;
  };
}
