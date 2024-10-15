import { Field, FormikErrors, FormikTouched } from "formik";
import { FormValidation } from "src/core/services/form-validation.service";
import { CountryCodeType } from "src/pages/manage-members/manage-members.model";

export function CountryCodeFormGroup(props: CountryCodeFormGroupProps) {
  const {
    name,
    labelText,
    className,
    formGroupClass,
    errors,
    touched,
    testIdPrefix,
    options,
    ...inputProps
  } = props;

  const getErrorMessage = () => {
    const message = FormValidation.message(errors[name] as string, labelText);
    return message;
  };

  return (
    <div className={`${formGroupClass || ""}`}>
      <label
        htmlFor={name}
        id={name}
        data-test-id={`${testIdPrefix ? testIdPrefix + "-" : ""}label-${name}`}
      >
        {labelText}
      </label>
      <Field
        as="select" // Use "select" as the input type
        name={name}
        className={`${className || ""}`}
        {...inputProps}
        data-test-id={`${testIdPrefix ? testIdPrefix + "-" : ""}select-${name}`}
      >
        <option value="+91" defaultValue={"+91"}>
          IND(+91)
        </option>
        {options.map((option, index) => (
          <option key={index} value={option.country_code}>
            {option.country_name}
          </option>
        ))}
      </Field>
      {errors[name] && touched[name] && (
        <div
          className="invalid-feedback"
          data-test-id={`${testIdPrefix ? testIdPrefix + "-" : ""}error-${name}`}
        >
          {getErrorMessage()}
        </div>
      )}
    </div>
  );
}

export interface CountryCodeFormGroupProps {
  name: string;
  labelText: string;
  className?: string;
  formGroupClass?: string;
  errors: FormikErrors<any>;
  touched: FormikTouched<any>;
  testIdPrefix?: string;
  options: Array<CountryCodeType>;
}
