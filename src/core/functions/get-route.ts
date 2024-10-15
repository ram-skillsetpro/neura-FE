import { matchPath } from "react-router";
import { Routes } from "src/routes";
import { IRoute } from "../models/route.model";

/**
 * Match route from {@link Routes} for given path
 *
 * @param path Path to be matched
 * @returns {@link IRoute}
 */
export function getRoute(path: string) {
  let matchedRoute: IRoute | undefined;
  Routes.forEach((r) => {
    if (r.children) {
      matchedRoute = r.children.find((child) => !!matchPath(path, `/${r.path}/${child.path}`));
      return;
    }
    if (matchPath(r.path, path)) {
      matchedRoute = r;
    }
  });
  return matchedRoute;
}
