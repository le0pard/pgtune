import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import _camelCase from 'lodash/camelCase'

import './dropdown.sass'

export default class FormDropdown extends React.Component {
  static propTypes = {
    input: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
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
      options,
      meta: {touched, error}
    } = this.props

    const dropdownID = _camelCase(`${input.name}-id`)
    const isError = touched && error

    return (
      <div
        className={classnames('form-dropdown', {
          'form-dropdown--error': isError
        })}>
        <div className="form-dropdown__wrapper">
          <label className="form-dropdown__label" htmlFor={dropdownID}>
            {label}
          </label>
          <select className="form-dropdown__select" {...input} id={dropdownID}>
            {options.map((option, index) => {
              return (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              )
            })}
          </select>
        </div>
        {isError && <div className="form-dropdown__error">{error}</div>}
      </div>
    )
  }
}
