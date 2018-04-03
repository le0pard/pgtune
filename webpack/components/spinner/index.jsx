import React from 'react'

import './spinner.sass'

export default class Spinner extends React.Component {
  render() {
    return (
      <div className="spinner-cube">
        <div className="spinner-cube-part spinner-cube-cube1" />
        <div className="spinner-cube-part spinner-cube-cube2" />
        <div className="spinner-cube-part spinner-cube-cube4" />
        <div className="spinner-cube-part spinner-cube-cube3" />
      </div>
    )
  }
}
