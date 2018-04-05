import React from 'react'
import PropTypes from 'prop-types'
import RcTooltip from 'rc-tooltip'

import './tooltip.sass'

export default class Tooltip extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    label: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    className: PropTypes.string
  }

  render() {
    const {
      id,
      label,
      text,
      className
    } = this.props

    return (
      <RcTooltip
        id={id}
        placement="topRight"
        trigger={['click']}
        overlay={'test'}
        destroyTooltipOnHide={true}>
          <a href='#' className={className}>{label}</a>
      </RcTooltip>
    )
  }
}
