import { FormGroup } from "core/components/form/FormGroup";
import { Form, Formik } from "formik";
import { PASSWORD_REGEX } from "src/const";
import { FormValidation } from "src/core/services/form-validation.service";
import "src/style.scss";
import * as Yup from "yup";

describe("Form Group", () => {
  const nameTestField = "testField";
  const labelTextTestField = "Test Field";
  const nameAge = "age";
  const labelTextAge = "Age";

  beforeEach(() => {
    const schema = Yup.object().shape({
      [nameTestField]: Yup.string().required().min(10).max(20),
      [nameAge]: Yup.number().min(18).max(50),
      password: Yup.string().matches(PASSWORD_REGEX, { name: "password" }),
    });

    cy.mount(
      <Formik
        validationSchema={schema}
        initialValues={{ [nameTestField]: "", [nameAge]: undefined }}
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onSubmit={() => {}}
        validate={(values) => FormValidation.validateForm(schema, values)}
      >
        {({ errors, touched }) => (
          <Form>
            <FormGroup
              type="text"
              labelText={labelTextTestField}
              name={nameTestField}
              errors={errors}
              touched={touched}
            />
            <FormGroup
              type="text"
              labelText={labelTextAge}
              name={nameAge}
              errors={errors}
              touched={touched}
            />
          </Form>
        )}
      </Formik>,
    );
  });

  it("Should render correct label text and input", () => {
    cy.dataCy(`label-${nameTestField}`).should("exist");
    cy.dataCy(`input-${nameTestField}`).should("exist");
  });

  it("Should show error message of required", () => {
    cy.dataCy(`input-${nameTestField}`).focus();
    cy.dataCy("root").click();
    cy.dataCy(`error-${nameTestField}`).should("have.text", `${labelTextTestField} is required`);
  });

  it("Should show error message of min characters", () => {
    cy.dataCy(`input-${nameTestField}`).type("ab");
    cy.dataCy("root").click();
    cy.dataCy(`error-${nameTestField}`).should(
      "have.text",
      `${labelTextTestField} can't be less than 10 characters`,
    );
  });

  it("Should show error message of max characters", () => {
    cy.dataCy(`input-${nameTestField}`).type("Lorem Ipsum is simply dummy text of the printing");
    cy.dataCy("root").click();
    cy.dataCy(`error-${nameTestField}`).should(
      "have.text",
      `${labelTextTestField} can't be more than 20 characters`,
    );
  });

  it("Should show correct error message for age of min", () => {
    cy.dataCy(`input-${nameAge}`).type("10");
    cy.dataCy("root").click();
    cy.dataCy(`error-${nameAge}`).should("have.text", `${labelTextAge} can't be less than 18`);
  });

  it("Should show correct error message for age of max", () => {
    cy.dataCy(`input-${nameAge}`).type("55");
    cy.dataCy("root").click();
    cy.dataCy(`error-${nameAge}`).should("have.text", `${labelTextAge} can't be more than 50`);
    console.log("coverage!!", (window as any).__coverage__);
  });
});
