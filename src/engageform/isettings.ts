module Engageform {
  export interface ISetting {
    allowAnswerChange: boolean;
    share?: {
      title: string;
      imageUrl: string;
      link: string;
      description: string;
    }
  }
}
