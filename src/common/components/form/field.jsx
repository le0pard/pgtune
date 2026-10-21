import Tooltip from './tooltip'

import './form.css'

/**
 * @typedef {object} FormFieldProps
 * @property {string} label
 * @property {import('react').ReactNode} tooltip help text, shown by "what is this?"
 */

/**
 * Input with label, help text and validation error (Formik Field component),
 * other props are passed to input element
 * @param {import('formik').FieldProps & FormFieldProps} props
 */
const FormField = ({ label, tooltip, field, form: { touched, errors }, ...rest }) => {
  const inputID = `${field.name}Id`
  const isError = touched[field.name] && errors[field.name]
  const errorID = `${inputID}Error`

  return (
    <div className="form-row">
      <label className="form-label" htmlFor={inputID}>
        {label}
      </label>
      <Tooltip id={`tooltip${inputID}`} label="what is this?" text={tooltip} />
      <div className="form-control">
        <input
          {...field}
          {...rest}
          className="form-input"
          aria-label={label}
          aria-describedby={[`tooltip${inputID}Content`, isError && errorID]
            .filter(Boolean)
            .join(' ')}
          aria-invalid={isError ? true : undefined}
          id={inputID}
        />
        {isError && (
          <div id={errorID} className="form-error">
            {errors[field.name]}
          </div>
        )}
      </div>
    </div>
  )
}

export default FormField
