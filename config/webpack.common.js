/** @type {import("webpack").Configuration} */

import { CleanWebpackPlugin } from "clean-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import Dotenv from "dotenv-webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { createRequire } from "module";
import webpack from "webpack";

import { readFileSync } from "fs";
import { join } from "path";
import { getDefinePluginObjFromEnv } from "./functions/get-define-plugin-obj-from-env.js";
import { getPath, isLocalFn } from "./functions/helper-functions.js";
import { tsconfigPathToWebpackPath } from "./functions/tsconfig-path-to-webpack-path.js";

const require = createRequire(import.meta.url);
const HtmlWebpackPlugin = require("html-webpack-plugin");

/**
 * Common webpack config that will used for production as well as development env
 *
 * @param {Object} env Environment key value pair
 * @returns Webpack common config
 */
export default function (env, args, isProd = false) {
  const packageJson = JSON.parse(
    readFileSync(join(process.cwd(), "package.json"), { encoding: "utf-8" }),
  );

  /** Is Build running for local development */
  const isLocal = isLocalFn(env);
  const isCypress = env.ENV === "cypress";
  /** React client side css, js and other static will go here after build */
  const clientBuildPath = getPath("build/public");
  /** Output folder for client as well as server */
  const outFolder = clientBuildPath;

  const entry = {};

  /** Entry.server will produce client.js in build folder */
  entry.client = [getPath("src/client.tsx")];
  if (isLocal && !isCypress) {
    entry.client.push(
      "webpack-hot-middleware/client?reload=true",
      "/node_modules/react-refresh/runtime.js",
    );
  }

  const definePluginObj = getDefinePluginObjFromEnv(env);
  const miniCssFileName = !(isLocal || isCypress)
    ? "assets/css/style.[contenthash].css"
    : "assets/css/style.css";
  const miniCssChunkName = !(isLocal || isCypress)
    ? "assets/css/[name].[contenthash].chunk.css"
    : "assets/css/[name].chunk.css";
  let slash = "/";
  if (process.platform === "win32") {
    slash = "\\";
  }

  const plugins = [
    new webpack.DefinePlugin(definePluginObj),
    new MiniCssExtractPlugin({
      filename: miniCssFileName,
      chunkFilename: miniCssChunkName,
    }),
    new Dotenv({
      path: getPath(`env/${env.ENV}.env`),
    }),
  ];

  if (!isCypress) {
    plugins.push(new CleanWebpackPlugin());
  }
  plugins.push(
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: getPath("favicon.ico"),
          to: join(clientBuildPath, "favicon.ico"),
          force: true,
        },
        {
          from: getPath("robots.txt"),
          to: join(clientBuildPath, "robots.txt"),
        },
        // assets for PWA
        {
          from: getPath("src/manifest.json"),
          to: join(clientBuildPath, "manifest.json"),
        },
        {
          from: getPath("src/assets/icons"),
          to: join(clientBuildPath, "assets/icons"),
          toType: "dir",
        },
      ],
    }),
    new HtmlWebpackPlugin({
      filename: "index.html",
      title: "SimpleO App",
      template: getPath("src/index.html"),
    }),
  );

  const alias = tsconfigPathToWebpackPath();
  const dateTimeStamp = new Date().getTime();

  const config = {
    entry,
    output: {
      // TODO@ below commented code is genrating dynamic client.js filename
      // filename: `[name]${!(isLocal || isCypress) ? ".[contenthash]" : ""}.js`,
      // chunkFilename: `[name]${!(isLocal || isCypress) ? ".[contenthash]" : ""}.chunk.js`,
      filename: `[name]${!(isLocal || isCypress) ? `.${dateTimeStamp}` : ""}.js`,
      chunkFilename: `[name]${!(isLocal || isCypress) ? `.${dateTimeStamp}` : ""}.chunk.js`,

      path: outFolder,
      publicPath: "/",
      // chunkFormat: "array-push",
      assetModuleFilename: `assets/images/[name].[hash][ext]`,
    },
    experiments: {
      outputModule: true,
    },
    watch: isLocal,
    watchOptions: {
      ignored: ["**/node_modules", "**/config", "cypress"],
    },
    resolve: {
      alias: {
        ...alias,
      },
      extensions: [".ts", ".tsx", ".js", ".scss", ".css"],
      fallback: {
        path: require.resolve("path-browserify"),
      },
    },
    target: "web",
    externals: [],
    externalsPresets: { node: false },
    module: {
      rules: [
        {
          test: /.(ts|tsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "swc-loader",
              options: {
                parseMap: isCypress,
                jsc: {
                  parser: {
                    syntax: "typescript",
                    dynamicImports: true,
                  },
                  transform: {
                    react: {
                      runtime: "automatic",
                      refresh: isLocal && env.ENV !== "cypress",
                      development: isLocal,
                    },
                  },
                },
                isModule: true,
                sourceMaps: isLocal || isCypress,
                inlineSourcesContent: isLocal || isCypress,
                module: {
                  type: "es6",
                  resolveFully: true,
                  // lazy: true,
                },
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            // Creates `style` nodes from JS strings
            MiniCssExtractPlugin.loader,
            // Translates CSS into CommonJS
            "css-loader",
            // Compiles Sass to CSS
            {
              loader: "sass-loader",
              options: {
                // Prefer `dart-sass`
                // implementation: require("sass"),
              },
            },
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg|woff2?)$/i,
          type: "asset/resource",
          generator: {
            emit: true,
          },
        },
      ],
    },
    plugins,
  };
  if (isCypress) {
    // Add instrument code for code coverage
    config.module.rules[0].use.unshift("@jsdevtools/coverage-istanbul-loader");
  }
  return config;
}
