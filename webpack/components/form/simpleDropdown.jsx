import React from 'react'
import PropTypes from 'prop-types'
import _camelCase from 'lodash/camelCase'
import Tooltip from './tooltip'

import './dropdown.sass'

export default class FormSimpleDropdown extends React.Component {
  static propTypes = {
    input: PropTypes.object.isRequired,
    className: PropTypes.string,
    selectClassName: PropTypes.string,
    errorClassName: PropTypes.string,
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
      className,
      selectClassName,
      errorClassName,
      meta: {touched, error}
    } = this.props

    const isError = touched && error

    return (
      <div className={className}>
        <select {...input} className={selectClassName}>
          {options.map((option, index) => {
            return (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            )
          })}
        </select>
        {isError && <div className={errorClassName}>{error}</div>}
      </div>
    )
  }
}
