module Branding {
  export interface IBrandingData {
    imageUrl?: string;
    link?: string;
    text?: string;
  }

  export interface IBranding {
    text: string;
    link: string;
    imageUrl: string;

    isDefault: boolean;
    isCustom: boolean;
  }
}
