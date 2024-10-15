import { Field, FormikErrors, FormikTouched } from "formik";
import { FormValidation } from "src/core/services/form-validation.service";

export function FormGroup(props: FormGroupProps) {
  const {
    type,
    name,
    labelText,
    className,
    formGroupClass,
    errors,
    touched,
    testIdPrefix,
    asteriskRequired,
    ...inputProps
  } = props;

  const getErrorMessage = () => {
    const message = FormValidation.message(errors[name] as string, labelText);
    return message;
  };
  return (
    <div className={`${formGroupClass || ""} custom-form-group`}>
      <label
        htmlFor={name}
        id={name}
        data-test-id={`${testIdPrefix ? testIdPrefix + "-" : ""}label-${name}`}
      >
        {labelText}
        {asteriskRequired && <span>*</span>}
      </label>
      <Field
        type={type}
        name={name}
        className={`${className || ""}`}
        {...inputProps}
        data-test-id={`${testIdPrefix ? testIdPrefix + "-" : ""}input-${name}`}
      />
      {errors[name] && touched[name] && (
        <div
          className="error-message"
          data-test-id={`${testIdPrefix ? testIdPrefix + "-" : ""}error-${name}`}
          style={{
            color: "var(--button-red)",
            fontSize: "14px",
          }}
        >
          {getErrorMessage()}
        </div>
      )}
    </div>
  );
}

export interface FormGroupProps extends Partial<HTMLInputElement> {
  type: "text" | "password" | "email" | "number" | "date";
  /** Schema key */
  name: string;
  /** Text for label of input labelText also used by ValidationMessage service to show error message */
  labelText: string;
  /** Class name for input element */
  className?: string;
  /** Css class for form-group dev */
  formGroupClass?: string;
  /** FormikErrors object */
  errors: FormikErrors<any>;
  /** FormikTouched object */
  touched: FormikTouched<any>;
  testIdPrefix?: string;
  asteriskRequired?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
