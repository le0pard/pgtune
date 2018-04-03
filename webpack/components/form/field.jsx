import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import './field.sass'

export default class FormField extends React.Component {
  static propTypes = {
    input: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    inputProps: PropTypes.object,
    autoFocus: PropTypes.bool,
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
      label,
      input,
      type,
      inputProps,
      meta: {touched, error}
    } = this.props

    const isError = touched && error

    return (
      <div
        className={classnames('form-field', {
          'form-field--error': isError
        })}>
        <div className="form-field__input-wrapper">
          <input
            {...input}
            {...inputProps}
            className="form-field__input"
            placeholder={label}
            aria-label={label}
            type={type} />
        </div>
        {isError && <div className="form-field__error">{error}</div>}
      </div>
    )
  }
}
