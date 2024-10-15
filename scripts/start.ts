import chalk from "chalk";
import { NextFunction, Request, Response } from "express";
import webpack from "webpack";
import WebpackDevMiddleware from "webpack-dev-middleware";
import WebpackHotMiddleware from "webpack-hot-middleware";
import webpackDevConfig from "../config/webpack.dev";
import webpackProdConfig from "../config/webpack.prod";
import { API_URL, LOCAL_API_SERVER } from "../src/const";
import { proxyMiddleware } from "../src/node/middlewares/proxy-middleware";
import { startNodeServer } from "../src/node/server";
import { log } from "./logger";

const env = process.env.ENV;
log(`environment: ${env}`);
let webpackConfig: any;

const baseEnv = { IS_LOCAL: "true", ENV: env };
const isDev = env === "development" || env === "cypress";
// webpack client build
if (isDev) {
  webpackConfig = webpackDevConfig(baseEnv, {});
} else {
  webpackConfig = webpackProdConfig(baseEnv, {});
}
const compiler = webpack(webpackConfig);

const middlewares = [];
// start webpack dev server for HMR
middlewares.push(
  WebpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    serverSideRender: false,
    writeToDisk: true,
  }),
);

middlewares.push(WebpackHotMiddleware(compiler, {}));

/* istanbul ignore if */
if (!API_URL) {
  throw new Error(
    `Please add env/${process.env.ENV}.env file if not available. Add API_BASE_URL in .env file`,
  );
}
console.log(chalk.yellowBright("/api/* request will proxy to ", API_URL));

middlewares.push((req: Request, resp: Response, next: NextFunction) => {
  // if (req.url.startsWith("/comment-api/")) {
  //   req.url = req.url.replace("/comment-api", "");

  //   proxyMiddleware(COMMENT_API_URL || "")(req, resp, next);
  //   return;
  // }
  if (req.url.startsWith("/v1/")) {
    proxyMiddleware(API_URL || "")(req, resp, next);
    return;
  }
  next();
});

const app = startNodeServer(middlewares);

if (process.env.IS_LOCAL === "true") {
  // Following code is just for reference
  // If api is not available and you want to return dummy response
  // create a test api in test-api.ts and add here
  // Don't forget to remove proxy otherwise response will always come from test api
  app.get("/api/products", proxyMiddleware(LOCAL_API_SERVER));
}
