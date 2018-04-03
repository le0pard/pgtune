import React from 'react'

import './main-generator.sass'

export default class MainGenerator extends React.Component {
  render() {
    return (
      <div className="main-generator">
        <div className="main-generator-form-wrapper">
          <h4 className="main-generator-form-subtitle">
            Parameters of your system
          </h4>
        </div>
        <div className="main-generator-result-wrapper" />
      </div>
    )
  }
}
