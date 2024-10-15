import { Image } from "core/components/image/image.comp";

describe("Image.cy.ts", () => {
  const loadingImage = "https://via.placeholder.com/150";
  const actualImage = "https://via.placeholder.com/300";

  beforeEach(() => {
    cy.mount(
      <div>
        <div style={{ height: "100vh" }}></div>
        <Image
          src={actualImage}
          loadingSrc={loadingImage}
          width="100%"
          data-test-id="lazy-loaded-img"
        />
      </div>,
    );
  });

  it("Should load placeholder image when not in view", () => {
    cy.dataCy("lazy-loaded-img").should("have.attr", "src").should("include", loadingImage);
  });

  it("Should load actual image when in in view", () => {
    cy.scrollTo("bottom");
    cy.dataCy("lazy-loaded-img").should("have.attr", "src").should("include", actualImage);
  });
});
