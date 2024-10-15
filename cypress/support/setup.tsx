import { mount } from "cypress/react18";
import { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import ReactCsrApp from "src/index";
import { AppStore, createStore } from "src/redux/create-store";

export function setUp(Component: ReactNode) {
  const store: AppStore = createStore();
  // wrapped store will available in **it** only when it will use function syntax
  // instead of arrow syntax
  // example: it("my test", function(){ body of it})
  cy.wrap(store).as("store");
  return mount(
    <BrowserRouter>
      <ReactCsrApp appComp={Component} store={store} />
    </BrowserRouter>,
  );
}
