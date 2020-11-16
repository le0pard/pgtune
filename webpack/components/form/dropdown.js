import React from 'react'
import PropTypes from 'prop-types'
import _camelCase from 'lodash/camelCase'
import Tooltip from './tooltip'

import './dropdown.sass'

const FormDropdown = ({
  label,
  tooltip,
  options,
  field,
  form: {
    touched,
    errors
  },
  ...rest
}) => {
  const dropdownID = _camelCase(`${field.name}-id`)
  const isError = touched[field.name] && errors[field.name]

  return (
    <div className="form-dropdown">
      <label className="form-dropdown-label" htmlFor={dropdownID}>
        {label}
      </label>
      <Tooltip
        id={`tooltip${dropdownID}`}
        label="what is this?"
        text={tooltip}
        className="form-dropdown-tooltip" />
      <div className="form-dropdown-wrapper">
        <select
          className="form-dropdown-wrapper__select"
          {...field}
          {...rest}
          aria-describedby={`tooltip${dropdownID}Content`}
          id={dropdownID}>
          {options.map((option, index) => {
            return (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            )
          })}
        </select>
        {isError && <div className="form-dropdown-error">{errors[field.name]}</div>}
      </div>
    </div>
  )
}

FormDropdown.propTypes = {
  label: PropTypes.string.isRequired,
  tooltip: PropTypes.string.isRequired,
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.any
  }).isRequired,
  form: PropTypes.shape({
    touched: PropTypes.object,
    errors: PropTypes.object
  }).isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.any.isRequired
  }).isRequired)
}

export default FormDropdown
