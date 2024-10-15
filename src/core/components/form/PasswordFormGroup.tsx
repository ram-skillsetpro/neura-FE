import { Field, FormikErrors, FormikTouched } from "formik";
import { useState } from "react";
import { FormValidation } from "src/core/services/form-validation.service";

export function PasswordFormGroup(props: PasswordFormGroupProps) {
  const {
    name,
    labelText,
    className,
    formGroupClass,
    errors,
    touched,
    testIdPrefix,
    ...inputProps
  } = props;
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
      {showPassword ? (
        <div className="password-input-container">
          <Field
            type={"text"}
            name={name}
            className={`${className || ""}`}
            {...inputProps}
            autoComplete="off"
            data-test-id={`${testIdPrefix ? testIdPrefix + "-" : ""}input-${name}`}
          />
          <i className="show-icon" onClick={togglePasswordVisibility}>
            <img
              width={24}
              height={24}
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFbUlEQVR4nO2cXYhVVRSAv6vTqJmpY1MvUfRjYWWTlZCQUY2FxIRND0pEvWlSEFpB/5P1Ug8R9OCDCf3RQwWBPSRRNDb+RCONmgyjSH8PhfYzZmozI5Ynlq0Ll8GZuefctc/ZM3d9sOAyc+esnzln773WXvuA4ziO4ziO4ziO4ziO4ziOExnTgIXASmA98DnQC/wGHAESlSP6s179znr9mxuBqUU7ESOTgEXAK8Be4GRFMLOKXONb4GXgJtVRt9wCbAQOGQR2LDkIvAHcTJ0wBXgQ2JNDcEeS3cAq4GwmIDOAdcAfBQZ4uIgtLwDnMAE4S++egxEEdiT5HXhSn7ZxyT3ADxEEMqlSvgPuZhxxAfBuBIFLMsqHwPlEzgNAfwTBSgzG7/uJEJlQ3jN2dgjoBJ7XYWgeMFvH/Ub9fJX+rgPYon9jacM7wHQi4Vpgn6Fz32iGNzODLbN08u0xtKcPuJqCuQ8YMHKoB7jT0Laluma2sO1vYDkFUAKeA04ZODEAPApMDmBnA7AGGDSwU3x9hhyR8fFtoztlPzA/B5tbgANGNr+lMQiKLOo3GRm8E2gmP5qAHUa2b9YqY7A0eouRoV8XlPqKzm4jH74I4cO5Ghyr4WIOxXGe4TCyQ29AE6TK9aWRYYPAdRTPfMPV0naLtbaMyZ8ZGZTo6iIW1hr69WktRamScbbXE2gJl5XJhutskQ80ZqlZZ2hEYpyMWHGXsY9SLkid8VkkI5VpdS3codteMpEeV9mn21NLariu3IG7DP2UmK2oVvkio0yqUlZmDMQVQFcV15fJem5GHQ8Z+zqgG8KjcmGAzdKhjAUi2bw9nEKPfHdxBj1SBTxh7PMhjeWIdYGtxgoTLXVmuZPTBLksUgu/PLU2u+VrpXSNNPm/FEBZpgmC6oaLkUSy16In/rK8OFzRbcC/gZQtyzDx1aqzNaXO9kC+/wPcWlYiKeRPgRQlujOSho0GOjek0vh/YT+U/z+W0/RXAypJMtQ19hvolKVf2vpHyBhIjE83CoZU0pjS6WMGOuUaaZgSOAa/kkP3UGNKp48a6DwaWaClSYfXJ+DQ0RfZ0CExPt0s8ldAJfPqfDL8s3In6ZGAipaldHqJgc7bI1neiTxcqWiS4X7acOkg30ytM6KEZduZmuCvDFBMyur4JTqB5JWChyg9DGkn1Rl5IpDCWRmcX5yyj68/Y1GpKUBRSeSxseqzHwdQuopszK1y570z450srA7g76Zqdltma9qYGG9j1UKrriT6NBk5pp83ZJj4KikZb2eJfJ/mCV4YoDNzKfHRZuyjxOyGtEZYL/l2a807Fhr0uF0MQ6R51riGeLCe+F+rxRhZA35kaMwgsIA4erqtGmjKxzFqPjQ6zbDnLtF2LKktFEWzHgxKDHvwzI5ETzde1HcX2OS409CPrhBHL2YYp+ndOd/ZzcZB3h7yZpH/3ifGw0gL4VlgPFxszuOJbNCud8sJcm2gpZ9c83HjGs6beS5TS1rxsmwb26O9cCUj+9qM18mn9Oy4hX2pacvY6JKMIru0TUtKAVkKRKsDpNWH1ddCuTSAY4lW1Lr0LmrXXZA5ugfZqJ+vAe7Vp2troCpcj5Zto2CqvkHG4u0xSSRyUn2K8rVBLcanVpOCZK8W1qJGzmo/HXjDNwkk8kKsp9SHcUOTPnqDEQRwLDmhtW15Bca45WJtIbAs4ljJgJ4auIgJxEyt1/ZGEOAD+nqfIs87BqekrblyJ/2SY3B/1uGhtaiko0hKwPXa+/GVHgKyCuxxLfw8q7WOugvuaEjx/DJNUDr07N427cfr1/aqyhVCv/5OvvO+ni5o12vU9dsbHcdxHMdxHMdxHMdxHMdxiIv/AFyxU2gxdMHCAAAAAElFTkSuQmCC"
            />
          </i>
        </div>
      ) : (
        <div className="password-input-container">
          <Field
            type={"password"}
            name={name}
            autoComplete="off"
            className={`${className || ""}`}
            {...inputProps}
            data-test-id={`${testIdPrefix ? testIdPrefix + "-" : ""}input-${name}`}
          />
          <i className="hide-icon" onClick={togglePasswordVisibility}>
            <img
              width={24}
              height={24}
              src="data:image/png;base64,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"
            />
          </i>
        </div>
      )}

      {errors[name] && touched[name] && (
        <div
          className="invalid-feedback"
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

export interface PasswordFormGroupProps extends Partial<HTMLInputElement> {
  // type: "text" | "password" | "email" | "number" | "date";
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
}
