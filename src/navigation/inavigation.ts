module Navigation {
  export interface INavigation {
    enabled: boolean;
    position: number;
    size: number;
    hasStart: boolean;
    enabledStart: boolean;
    hasPrev: boolean;
    enabledPrev: boolean;
    hasNext: boolean;
    enabledNext: boolean;
    hasFinish: boolean;
    enabledFinish: boolean;
    distance: number;

    hasStartPages: boolean;
    hasEndPages: boolean;

    start($event): void;
    prev($event): void;

    pick($event, vcase: Page.ICase): void;
    pick($event, vcase: Page.ICase, opts: {quiet?: boolean} ): void;

    truePick($event, vcase: Page.ICase): void;
    truePick($event, vcase: Page.ICase, opts: {quiet: boolean} ): void;

    next($event, vcase: Page.ICase): void;
    finish($event, vcase: Page.ICase): void;
  }
}
