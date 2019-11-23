import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import './tooltip.sass'

export default class Tooltip extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    label: PropTypes.string.isRequired,
    text: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.func,
      PropTypes.string
    ]).isRequired,
    className: PropTypes.string
  }

  constructor(props) {
    super(props)

    this.closeTooltip = this.closeTooltip.bind(this)
    this.tooltipRef = React.createRef()

    this.state = {
      isVisible: false
    }
  }

  componentDidMount() {
    document.body.addEventListener('click', this.closeTooltip)
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.closeTooltip)
  }

  closeTooltip(e) {
    if (
      this.tooltipRef.current &&
      !this.tooltipRef.current.contains(e.target) &&
      this.state.isVisible
    ) {
      this.setState(() => ({
        isVisible: false
      }))
    }
  }

  toggleTooltip() {
    this.setState((prevState) => ({
      isVisible: !prevState.isVisible
    }))
  }

  render() {
    const {
      id,
      label,
      text,
      className
    } = this.props

    const {isVisible} = this.state

    return (
      <div ref={this.tooltipRef} className={classnames('tooltip-container', className)}>
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
          onClick={this.toggleTooltip.bind(this)}
        >
          {label}
        </button>
      </div>
    )
  }
}
