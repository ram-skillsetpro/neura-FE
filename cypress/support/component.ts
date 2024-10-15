import "@bahmutov/cypress-code-coverage/support";
import { configureHttpClient } from "src/core/functions/configure-http-client";
import "./commands";
import { setUp } from "./setup";

configureHttpClient();

Cypress.Commands.add("mount", setUp);
