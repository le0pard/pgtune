import React from 'react'
import MainGenerator from 'containers/mainGenerator'
import pgtuneLogo from './pgtune.svg'

import './dashboard.sass'

export default class DashboardPage extends React.Component {
  render() {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header-wrapper">
          <div className="dashboard-header-logo">
            <img alt="Pgtune"
              className="dashboard-header-logo__svg"
              src={pgtuneLogo} />
          </div>
          <div className="dashboard-header-title">
            <h1 className="dashboard-header-title__text">
              PGTune
            </h1>
          </div>
        </div>
        <MainGenerator />
      </div>
    )
  }
}
