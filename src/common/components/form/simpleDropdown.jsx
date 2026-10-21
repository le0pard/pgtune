import './form.css'

/**
 * @typedef {object} FormSimpleDropdownProps
 * @property {string} label accessible name of select
 * @property {Array<{ label: string, value: string | number }>} options
 * @property {string} [className] class for wrapper
 * @property {string} [selectClassName]
 * @property {string} [errorClassName]
 */

/**
 * Select with validation error, without visible label (Formik Field component),
 * other props are passed to select element
 * @param {import('formik').FieldProps & FormSimpleDropdownProps} props
 */
const FormSimpleDropdown = ({
  field,
  options,
  label,
  className,
  selectClassName,
  errorClassName,
  form: { touched, errors },
  ...rest
}) => {
  const isError = touched[field.name] && errors[field.name]

  return (
    <div className={className}>
      <select {...field} {...rest} className={selectClassName} aria-label={label}>
        {options.map((option, index) => {
          return (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          )
        })}
      </select>
      {isError && <div className={errorClassName}>{errors[field.name]}</div>}
    </div>
  )
}

export default FormSimpleDropdown
