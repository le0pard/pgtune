import React, {useEffect, useRef, useState} from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import './tooltip.css'

const Tooltip = ({
  id,
  label,
  text,
  className
}) => {
  const tooltipRef = useRef()
  const [isVisible, setVisibility] = useState(false)

  useEffect(() => {
    const closeTooltip = (e) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target) &&
        isVisible
      ) {
        setVisibility(false)
      }
    }

    document.body.addEventListener('click', closeTooltip)
    return () => document.body.removeEventListener('click', closeTooltip)
  }, [isVisible])

  const toggleTooltip = () => {
    setVisibility((visible) => !visible)
  }

  return (
    <div ref={tooltipRef} className={classnames('tooltip-container', className)}>
      <div className={classnames('tooltip-block', {
        ['tooltip-block__visible']: isVisible,
        ['tooltip-block__hidden']: !isVisible
      })}>{text}</div>
      <button
        id={`${id}Content`}
        className={classnames('tooltip-button', {
          [`${className}__button`]: !!className
        })}
        type="button"
        onClick={toggleTooltip}
      >
        {label}
      </button>
    </div>
  )
}

Tooltip.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string.isRequired,
  text: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
    PropTypes.string
  ]).isRequired,
  className: PropTypes.string
}

export default Tooltip
