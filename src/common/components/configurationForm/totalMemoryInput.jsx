import React from 'react'
import PropTypes from 'prop-types'
import { Field } from 'formik'
import Tooltip from '@common/components/form/tooltip'
import FormSimpleField from '@common/components/form/simpleField'
import FormSimpleDropdown from '@common/components/form/simpleDropdown'
import { SIZE_UNIT_MB, SIZE_UNIT_GB, MAX_NUMERIC_VALUE } from '@features/configuration/constants'

import './total-memory-input.css'

const totalMemoryUnitOptions = () => [
  {
    label: 'GB',
    value: SIZE_UNIT_GB
  },
  {
    label: 'MB',
    value: SIZE_UNIT_MB
  }
]

const TotalMemoryInput = ({ tooltip }) => {
  const inputID = 'TotalMemoryId'

  return (
    <div className="total-memory">
      <label className="total-memory-label" htmlFor={inputID}>
        Total Memory (RAM)
      </label>
      <Tooltip
        id={`tooltip${inputID}`}
        label="what is this?"
        text={tooltip}
        className="total-memory-tooltip"
      />
      <Field
        name="totalMemory"
        type="number"
        className="total-memory-amount"
        inputClassName="total-memory-amount__input"
        errorClassName="total-memory-amount__error"
        component={FormSimpleField}
        id={inputID}
        autoFocus={true}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        required="required"
        min={1}
        max={MAX_NUMERIC_VALUE}
        step="any"
        pattern="[0-9]+([.][0-9]+)?"
        placeholder="Memory size (RAM, required)"
      />
      <Field
        name="totalMemoryUnit"
        label="Memory units"
        className="total-memory-unit"
        selectClassName="total-memory-unit__select"
        component={FormSimpleDropdown}
        options={totalMemoryUnitOptions()}
      />
    </div>
  )
}

TotalMemoryInput.propTypes = {
  tooltip: PropTypes.oneOfType([PropTypes.node, PropTypes.func, PropTypes.string]).isRequired
}

export default TotalMemoryInput
