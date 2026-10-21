import Tooltip from './tooltip'

import './form.css'

/**
 * @typedef {object} FormDropdownProps
 * @property {string} label
 * @property {import('react').ReactNode} tooltip help text, shown by "what is this?"
 * @property {Array<{ label: string, value: string | number }>} options
 */

/**
 * Select with label, help text and validation error (Formik Field component),
 * other props are passed to select element
 * @param {import('formik').FieldProps & FormDropdownProps} props
 */
const FormDropdown = ({ label, tooltip, options, field, form: { touched, errors }, ...rest }) => {
  const dropdownID = `${field.name}Id`
  const isError = touched[field.name] && errors[field.name]
  const errorID = `${dropdownID}Error`

  return (
    <div className="form-row">
      <label className="form-label" htmlFor={dropdownID}>
        {label}
      </label>
      <Tooltip id={`tooltip${dropdownID}`} label="what is this?" text={tooltip} />
      <div className="form-control">
        <select
          {...field}
          {...rest}
          className="form-input form-input--select"
          aria-describedby={[`tooltip${dropdownID}Content`, isError && errorID]
            .filter(Boolean)
            .join(' ')}
          aria-invalid={isError ? true : undefined}
          id={dropdownID}
        >
          {options.map((option, index) => {
            return (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            )
          })}
        </select>
        {isError && (
          <div id={errorID} className="form-error">
            {errors[field.name]}
          </div>
        )}
      </div>
    </div>
  )
}

export default FormDropdown
