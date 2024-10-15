import Header from "core/components/header/header";
import { loginSuccess } from "examples/auth/auth.redux";
import HeaderData from "mocks/api/header.json";
import { fetchHeader } from "src/app.redux";

describe("Header", () => {
  beforeEach(() => {
    cy.intercept(/\/api\/header/, HeaderData).as("header-api");
    cy.mount(<Header />);
  });
  it("Should load header", () => {
    cy.dataCy("header").should("exist");
  });

  it("Should render header links from api", function () {
    this.store.dispatch(fetchHeader());
    cy.wait("@header-api");
    const link = HeaderData.links[1];
    cy.dataCy(link.url).should("have.text", link.text);
  });

  it("Should show login link before login", () => {
    cy.dataCy("login-link").should("exist");
  });

  it("Should show logout button after login", function () {
    this.store.dispatch(loginSuccess({ isLoggedIn: true }));
    cy.dataCy("logout-btn").should("exist");
  });

  it("Should show login when logout button click", function () {
    this.store.dispatch(loginSuccess({ isLoggedIn: true }));
    cy.dataCy("logout-btn").should("exist");
    cy.dataCy("logout-btn").click();
    cy.dataCy("login-link").should("exist");
  });
});
