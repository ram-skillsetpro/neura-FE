import ProductsData from "mocks/api/product.json";
import TopProducts from "mocks/api/product/top-products.json";
import UsersData from "mocks/api/user.json";

describe("Home Page", () => {
  // when query string will have cypress true then page will behave like CSR
  // manipulated in process request middleware and lazy component to achieve this behavior
  const homePage = "/";
  it("Should render home page with products on CSR", () => {
    cy.visit(`${homePage}?cypress=true`);
    cy.dataCy("home-page").should("exist");
    cy.get(".card.productCard").should("exist");
  });

  it("Should render home page with products when javascript disabled (SSR)", () => {
    cy.visitAsHtml(homePage);
    cy.get(".card.productCard").should("exist");
  });

  it("Should render home page with products", () => {
    cy.visit(homePage);
    cy.dataCy(`product-card-${ProductsData.products[0].id}`).should("exist");
    cy.get(".card.productCard").should("have.length", ProductsData.products.length);
  });

  it("Should not render top products on page load", () => {
    cy.visit(homePage);
    cy.dataCy("top-products").should("not.exist");
  });

  it("Should render top products on scroll", () => {
    cy.visit(homePage);
    cy.scrollTo("bottom");
    cy.dataCy("top-products").should("exist");
    cy.dataCy("top-products").within(() => {
      cy.get(".productCard").should("have.length", TopProducts.length);
    });
  });

  it("Should redirect to login page on click of view button", () => {
    cy.visit(homePage);
    cy.dataCy(`home-view-btn-${ProductsData.products[0].id}`).click();
    cy.dataCy("login-page").should("exist");
  });

  it("Should redirect to product edit on click if edit button when logged in", () => {
    cy.visit(homePage);
    cy.login(UsersData.users[0].email, UsersData.users[0].password);
    cy.dataCy(`home-view-btn-${ProductsData.products[0].id}`).click();
    cy.dataCy("product-detail-page").should("exist");
  });

  it("Should render home page with products on CSR", () => {
    cy.visit(`${homePage}?cypress=true`);
    cy.dataCy("home-page").should("exist");
    cy.get(".card.productCard").should("exist");
  });
});
