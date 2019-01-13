import React from 'react'
import PropTypes from 'prop-types'
import _camelCase from 'lodash/camelCase'
import Tooltip from './tooltip'

import './dropdown.sass'

export default class FormDropdown extends React.Component {
  static propTypes = {
    input: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    tooltip: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.any.isRequired
    }).isRequired),
    meta: PropTypes.shape({
      touched: PropTypes.bool.isRequired,
      error: PropTypes.string
    }).isRequired
  }

  render() {
    const {
      label,
      input,
      tooltip,
      options,
      meta: {touched, error}
    } = this.props

    const dropdownID = _camelCase(`${input.name}-id`)
    const isError = touched && error

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
            {...input}
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
          {isError && <div className="form-dropdown-error">{error}</div>}
        </div>
      </div>
    )
  }
}
