/// <reference types="cypress" />

Cypress.Commands.add("dataCy", (dataCy: string, ...args) => {
  return cy.get(`[data-test-id="${dataCy}"]`, ...args);
});
//
Cypress.Commands.add("login", (email: string, password: string) => {
  cy.dataCy("login-link").click();
  cy.dataCy("login-input-email").type(email);
  cy.dataCy("login-input-password").type(password);
  cy.dataCy("login-btn").click();
});

Cypress.Commands.add("visitAsHtml", (route: string) => {
  cy.request(route)
    .its("body")
    .then((html) => {
      // remove the application code JS bundle
      html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
      cy.document().invoke({ log: false }, "write", html);
    });
  // now we can use "normal" Cypress api on the page
});
