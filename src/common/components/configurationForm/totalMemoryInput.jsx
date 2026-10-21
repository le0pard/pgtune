import PropTypes from 'prop-types'
import { Field } from 'formik'
import Tooltip from '@common/components/form/tooltip'
import FormSimpleField from '@common/components/form/simpleField'
import FormSimpleDropdown from '@common/components/form/simpleDropdown'
import { SIZE_UNIT_MB, SIZE_UNIT_GB, SIZE_UNIT_TB } from '@features/configuration/constants'

import './total-memory-input.css'

const totalMemoryUnitOptions = () => [
  {
    label: 'TB',
    value: SIZE_UNIT_TB
  },
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
      <Tooltip id={`tooltip${inputID}`} label="what is this?" text={tooltip} />
      <Field
        name="totalMemory"
        type="text"
        inputMode="numeric"
        className="total-memory-amount"
        inputClassName="total-memory-amount__input"
        errorClassName="total-memory-amount__error"
        component={FormSimpleField}
        id={inputID}
        aria-describedby={`tooltip${inputID}Content`}
        autoFocus={true}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        required="required"
        pattern="[0-9]*"
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
