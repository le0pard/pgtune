import React from 'react'
import PropTypes from 'prop-types'

import './field.sass'

export default class FormSimpleField extends React.Component {
  static propTypes = {
    input: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    className: PropTypes.string,
    inputClassName: PropTypes.string,
    errorClassName: PropTypes.string,
    inputProps: PropTypes.object,
    meta: PropTypes.shape({
      touched: PropTypes.bool.isRequired,
      error: PropTypes.string
    }).isRequired
  }

  static defaultProps = {
    inputProps: {}
  }

  render() {
    const {
      input,
      type,
      inputProps,
      className,
      inputClassName,
      errorClassName,
      meta: {touched, error}
    } = this.props

    const isError = touched && error

    return (
      <div className={className}>
        <input
          {...input}
          {...inputProps}
          className={inputClassName}
          type={type} />
        {isError && <div className={errorClassName}>{error}</div>}
      </div>
    )
  }
}
