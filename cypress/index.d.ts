/// <reference types="cypress" />
/// <reference types="cypress/react18" />

declare namespace Cypress {
  interface Chainable {
    login(email: string, password: string): Chainable<void>;
    dataCy: (testId: string) => Chainable<JQuery<HTMLElement>>;
    /**
     * visitAsHtml command will remove all scripts from response
     * to mimic Javascript disabled scenario
     * this way can check page fully rendered on server or not
     */
    visitAsHtml: (route: string) => void;
    mount: typeof import("cypress/react18").mount;
  }
}

declare namespace Mocha {
  export interface Context {
    /**
     * wrapped redux store in [setup.tsx](./support/setup.tsx) with cy.wrap()
     * So store will available via this of {@link Context} in {@link it}
     */
    store: import("src/redux/create-store.js").AppStore;
  }
}
