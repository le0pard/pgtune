import React from 'react'
import PropTypes from 'prop-types'

import './dropdown.css'

const FormSimpleDropdown = ({
  field,
  options,
  label,
  className,
  selectClassName,
  errorClassName,
  form: {
    touched,
    errors
  },
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

FormSimpleDropdown.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.any
  }).isRequired,
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
  selectClassName: PropTypes.string,
  errorClassName: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.any.isRequired
  }).isRequired),
  form: PropTypes.shape({
    touched: PropTypes.object,
    errors: PropTypes.object
  }).isRequired
}

export default FormSimpleDropdown
