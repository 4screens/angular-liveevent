module Page {
  export interface IImageData {
    containerHeight: number;
    left: number;
    top: number;
    width: number;
  }

  export interface IPage {
    id: string;
    engageform: Engageform.IEngageform;

    type: Type;
    title: string;
    description: string;
    media: string;
    filled: boolean;
    settings: ISetting;
    cases: ICase[];

    image?: string;
    outcome?: string;
    button?: string;
    social?: boolean;
    exitLink?: boolean;
    link?: string;
    score?: number;
    result?: number;
    rangeMin?: number;
    rangeMax?: number;
    labelMin?: string;
    labelMax?: string;

    imageData: IImageData;

    send(vcase: ICase): ng.IPromise<IPageSent>;
    selectAnswer(data): void;
  }

  export interface ISocialData {
    title: string;
    description: string;
    imageUrl: string;
    link: string;
  }
}
