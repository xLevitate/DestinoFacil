declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.gif';

declare namespace React {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
  }
}

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL: string;
  }
} 