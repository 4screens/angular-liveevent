module Page {
  export interface ICase {
    id: string;
    page: IPage;
    type: CaseType;

    result?: number;
    selected?: boolean;
    correct?: boolean;
    incorrect?: boolean;

    title?: string;
    image?: string;
    expectedValue?: string;
    value?: string;
    error?: string;
    ordinal?: number;

    send(): ng.IPromise<IPageSent>;
    validate(): boolean;
  }
}
