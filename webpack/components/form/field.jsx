import React from 'react'
import PropTypes from 'prop-types'
import _camelCase from 'lodash/camelCase'
import Tooltip from './tooltip'

import './field.sass'

export default class FormField extends React.Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    tooltip: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.func,
      PropTypes.string
    ]).isRequired,
    field: PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.any
    }).isRequired,
    form: PropTypes.shape({
      touched: PropTypes.object,
      errors: PropTypes.object
    }).isRequired
  }

  render() {
    const {
      label,
      tooltip,
      field,
      form: {
        touched,
        errors
      },
      ...props
    } = this.props

    const inputID = _camelCase(`${field.name}-id`)
    const isError = touched[field.name] && errors[field.name]

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
            {...field}
            {...props}
            className="form-field-wrapper__input"
            aria-label={label}
            aria-describedby={`tooltip${inputID}Content`}
            id={inputID} />
          {isError && <div className="form-field-error">{errors[field.name]}</div>}
        </div>
      </div>
    )
  }
}
