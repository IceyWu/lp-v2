declare module "live-photo" {
  interface ElementCustomization {
    attributes?: { [key: string]: string };
    styles?: { [key: string]: string };
  }

  interface LivePhotoOptions {
    photoSrc: string;
    videoSrc: string;
    container: HTMLElement;
    width?: number | string;
    height?: number | string;
    autoplay?: boolean;
    lazyLoadVideo?: boolean;
    imageCustomization?: ElementCustomization;
    videoCustomization?: ElementCustomization;
    onCanPlay?: () => void;
    onError?: (e?: any) => void;
    onEnded?: () => void;
    onVideoLoad?: () => void;
    onPhotoLoad?: () => void;
    onProgress?: (progress: number) => void;
  }

  class LivePhoto {
    constructor(options: LivePhotoOptions);
    play(): void;
    pause(): void;
    toggle(): void;
    stop(): void;
  }

  export default LivePhoto;
}
