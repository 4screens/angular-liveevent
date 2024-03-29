/// <reference path="../branding/ibranding.ts" />

module API {
  export interface IQuiz {
    _id: string;
    title: string;
    type: string;

    tabs: {
      chatTitle: string;
      liveTitle: string;
      logoUrl: string;
    };

    settings: {
      allowAnswerChange: boolean;
      branding?: Branding.IBrandingData,
      share?: {
        title: string;
        imageUrl: string;
        link: string;
        description: string;
      }
    };
    theme: {
      answerBackgroundColor: string;
      answerBorderColor: string;
      answerColor: string;
      backgroundBrightness: string;
      backgroundColor: string;
      backgroundImageBlur: string;
      backgroundImageFile: string;
      backgroundImagePosition: string;
      buttonColor: string;
      font: string;
      fontUrl: string;
      questionColor: string;
      customThemeCssFile: string;
      tabFontColor: string;
      tabColor: string;
      tabBorderColor: string;
    };
  }
}
