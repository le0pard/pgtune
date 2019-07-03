import React from 'react'
import PropTypes from 'prop-types'

import './field.sass'

export default class FormSimpleField extends React.Component {
  static propTypes = {
    field: PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.any
    }).isRequired,
    className: PropTypes.string,
    inputClassName: PropTypes.string,
    errorClassName: PropTypes.string,
    form: PropTypes.shape({
      touched: PropTypes.object,
      errors: PropTypes.object
    }).isRequired
  }

  render() {
    const {
      field,
      className,
      inputClassName,
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
        <input
          {...field}
          {...props}
          className={inputClassName} />
        {isError && <div className={errorClassName}>{errors[field.name]}</div>}
      </div>
    )
  }
}
