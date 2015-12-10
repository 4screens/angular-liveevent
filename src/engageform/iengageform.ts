///<reference path="../page/ipage.ts"/>

module Engageform {
  export interface IEngageform {
    _engageformId?: string;
    enabled: boolean;
    type: Type;
    title: string;
    settings: ISetting;
    theme: ITheme;
    branding: Branding.IBranding;
    tabs: ITabs;

    Mode: Engageform.Mode;

    current: Page.IPage;
    message: string;
    navigation: Navigation.INavigation;

    meta?: any;

    pages: Page.IPages;
    startPages: string[];
    endPages: string[];
    availablePages: string[];
    hasForms: boolean;

    liveSettings: Page.ILiveSetting;

    isType(type: Type): boolean;
    init(opts: API.IEmbed): ng.IPromise<Engageform.IEngageform>;

    initPage(page: Page.IPage): void;

    initPages(): ng.IPromise<IEngageform>;
    setCurrent(pageId: string);
    setCurrentEndPage(): ng.IPromise<API.IQuizFinish>;
  }
}
