import React from 'react'
import PropTypes from 'prop-types'
import _camelCase from 'lodash/camelCase'
import Tooltip from './tooltip'

import './field.sass'

export default class FormField extends React.Component {
  static propTypes = {
    input: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    tooltip: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.func,
      PropTypes.string
    ]).isRequired,
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
      label,
      input,
      tooltip,
      inputProps,
      meta: {touched, error}
    } = this.props

    const inputID = _camelCase(`${input.name}-id`)
    const isError = touched && error

    return (
      <div className="form-field">
        <label className="form-field-label" htmlFor={inputID}>
          {label}
        </label>
        <Tooltip
          id={`tooltip${inputID}`}
          label="what is this?"
          text={tooltip}
          className="form-field-tooltip" />
        <div className="form-field-wrapper">
          <input
            {...input}
            {...inputProps}
            className="form-field-wrapper__input"
            aria-label={label}
            aria-describedby={`tooltip${inputID}Content`}
            id={inputID} />
          {isError && <div className="form-field-error">{error}</div>}
        </div>
      </div>
    )
  }
}
