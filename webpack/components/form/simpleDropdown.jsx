import React from 'react'
import PropTypes from 'prop-types'

import './dropdown.sass'

export default class FormSimpleDropdown extends React.Component {
  static propTypes = {
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

  render() {
    const {
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
      ...props
    } = this.props

    const isError = touched[field.name] && errors[field.name]

    return (
      <div className={className}>
        <select {...field} {...props} className={selectClassName} aria-label={label}>
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
}
