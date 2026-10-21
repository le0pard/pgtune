import { Fragment, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import './tooltip.css'

// Toggle button and help text panel. Parent should be a flex row with wrap:
// button takes the rest of the label row, panel takes full row under the label.
// Inputs can reference help text with aria-describedby={`${id}Content`}
const Tooltip = ({ id, label, text, className }) => {
  const [isVisible, setVisibility] = useState(false)

  useEffect(() => {
    if (!isVisible) {
      return () => {}
    }

    const closeOnEscape = (e) => {
      if (e.key === 'Escape') {
        setVisibility(false)
      }
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isVisible])

  const toggleTooltip = () => {
    setVisibility((visible) => !visible)
  }

  return (
    <Fragment>
      <div className={classnames('tooltip-toggle', className)}>
        <button
          id={`${id}Button`}
          className="tooltip-button"
          type="button"
          aria-expanded={isVisible}
          aria-controls={`${id}Content`}
          onClick={toggleTooltip}
        >
          {label}
        </button>
      </div>
      <div
        id={`${id}Content`}
        className={classnames('tooltip-panel', {
          'tooltip-panel--visible': isVisible
        })}
      >
        <div className="tooltip-panel__content">
          <div className="tooltip-panel__text">{text}</div>
        </div>
      </div>
    </Fragment>
  )
}

Tooltip.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  text: PropTypes.oneOfType([PropTypes.node, PropTypes.func, PropTypes.string]).isRequired,
  className: PropTypes.string
}

export default Tooltip
