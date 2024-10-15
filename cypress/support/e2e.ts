import "@cypress/code-coverage/support";
import { configureHttpClient } from "src/core/functions/configure-http-client";
import "./commands";

configureHttpClient();
