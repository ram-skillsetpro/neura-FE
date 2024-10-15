import { NavigateOptions } from "react-router";

export interface RedirectTo {
  path: string;
  options?: NavigateOptions;
}

export interface AppState {
  redirectTo?: RedirectTo;
  userLogo?: string;
}
