describe("404 Not Found Page", () => {
  beforeEach(() => {
    cy.visit("/404");
  });

  it("Should render 404 page", () => {
    cy.dataCy("404-page").should("exist");
  });

  it("Should not render header", () => {
    cy.dataCy("header").should("not.exist");
  });
});
