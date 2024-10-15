import UsersData from "mocks/api/user.json";
import { ROUTE_LOGIN } from "src/const";

describe("login page", () => {
  beforeEach(() => {
    cy.visit(ROUTE_LOGIN);
  });

  it("Should render login page", () => {
    cy.dataCy("login-page").should("exist");
  });

  it("Should login after entering email and password", () => {
    cy.login(UsersData.users[0].email, UsersData.users[0].password);
    cy.dataCy("logout-btn").should("exist");
  });

  it("Should show error message when username/password doesn't match", () => {
    cy.visit("/");
    cy.login("wronguser@gmail.com", "Wrong@123");
    cy.dataCy("login-error-message").should("exist");
  });
});
