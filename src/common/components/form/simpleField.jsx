import './form.css'

/**
 * @typedef {object} FormSimpleFieldProps
 * @property {string} [className] class for wrapper
 * @property {string} [inputClassName]
 * @property {string} [errorClassName]
 */

/**
 * Input with validation error, without label (Formik Field component),
 * other props are passed to input element
 * @param {import('formik').FieldProps & FormSimpleFieldProps} props
 */
const FormSimpleField = ({
  field,
  className,
  inputClassName,
  errorClassName,
  form: { touched, errors },
  ...rest
}) => {
  const isError = touched[field.name] && errors[field.name]
  const errorID = `${field.name}Error`
  const describedBy = [rest['aria-describedby'], isError && errorID].filter(Boolean).join(' ')

  return (
    <div className={className}>
      <input
        {...field}
        {...rest}
        className={inputClassName}
        aria-describedby={describedBy || undefined}
        aria-invalid={isError ? true : undefined}
      />
      {isError && (
        <div id={errorID} className={errorClassName}>
          {errors[field.name]}
        </div>
      )}
    </div>
  )
}

export default FormSimpleField
