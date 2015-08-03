module Engageform {
  export interface IEngageform {
    enabled: boolean;
    type: Type;
    title: string;
    settings: ISetting;
    theme: ITheme;
    branding: Branding.IBranding;

    current: Page.IPage;
    message: string;
    navigation: Navigation.INavigation;

    pages: Page.IPages;
    startPages: string[];
    endPages: string[];
    availablePages: string[];
    hasForms: boolean;

    isType(type: Type): boolean;

    initPages(): ng.IPromise<IEngageform>;
    setCurrent(pageId: string);
    setCurrentEndPage(): ng.IPromise<API.IQuizFinish>;
  }
}
