import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {Field} from 'redux-form'
import FormField from 'components/form/field'
import FormDropdown from 'components/form/dropdown'
import TotalMemoryInput from './totalMemoryInput'
import {
  DB_VERSIONS,
  OS_LINUX,
  OS_MAC,
  OS_WINDOWS,
  DB_TYPE_WEB,
  DB_TYPE_OLTP,
  DB_TYPE_DW,
  DB_TYPE_DESKTOP,
  DB_TYPE_MIXED,
  HARD_DRIVE_SSD,
  HARD_DRIVE_SAN,
  HARD_DRIVE_HDD
} from 'reducers/configuration/constants'

import './configuration-form.sass'

export default class ConfigurationForm extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    onSubmitForm: PropTypes.func.isRequired
  }

  handleGenerateConfig(values) {
    return this.props.onSubmitForm(values)
  }

  dbVersionOptions() {
    return DB_VERSIONS.map((version) => ({
      label: String(version),
      value: version
    }))
  }

  osTypeOptions() {
    return [
      {
        label: 'Linux',
        value: OS_LINUX
      },
      {
        label: 'OS X',
        value: OS_MAC
      },
      {
        label: 'Windows',
        value: OS_WINDOWS
      }
    ]
  }

  dbTypeOptions() {
    return [
      {
        label: 'Web application',
        value: DB_TYPE_WEB
      },
      {
        label: 'Online transaction processing systems',
        value: DB_TYPE_OLTP
      },
      {
        label: 'Data warehouses',
        value: DB_TYPE_DW
      },
      {
        label: 'Desktop applications',
        value: DB_TYPE_DESKTOP
      },
      {
        label: 'Mixed type of applications',
        value: DB_TYPE_MIXED
      }
    ]
  }

  hdTypeOptions() {
    return [
      {
        label: 'SSD storage',
        value: HARD_DRIVE_SSD
      },
      {
        label: 'Network (SAN) storage',
        value: HARD_DRIVE_SAN
      },
      {
        label: 'HDD storage',
        value: HARD_DRIVE_HDD
      }
    ]
  }

  render() {
    const {handleSubmit, submitting} = this.props

    return (
      <form onSubmit={handleSubmit(this.handleGenerateConfig.bind(this))}>
        <Field
          name="dbVersion"
          component={FormDropdown}
          label="DB version"
          options={this.dbVersionOptions()}
          tooltip="PostgreSQL version (find out via 'SELECT version();')"
        />
        <Field
          name="osType"
          component={FormDropdown}
          label="OS Type"
          options={this.osTypeOptions()}
          tooltip="Operation system of the PostgreSQL server host"
        />
        <Field
          name="dbType"
          component={FormDropdown}
          label="DB Type"
          options={this.dbTypeOptions()}
          tooltip="For what type of application is PostgreSQL used"
        />
        <TotalMemoryInput
          tooltip="How much memory can PostgreSQL use"
        />
        <Field
          name="cpuNum"
          type="number"
          component={FormField}
          inputProps={{
            autoComplete: 'off',
            autoCorrect: 'off',
            autoCapitalize: 'none',
            min: '1',
            max: '9999',
            step: '1',
            pattern: '[0-9]{1,4}',
            placeholder: 'Number of CPUs (optional)'
          }}
          label="Number of CPUs"
          tooltip={<span>Number of CPUs, which PostgreSQL can use<br />CPUs = threads per core * cores per socket * sockets</span>}
        />
        <Field
          name="connectionNum"
          type="number"
          component={FormField}
          inputProps={{
            autoComplete: 'off',
            autoCorrect: 'off',
            autoCapitalize: 'none',
            min: '10',
            max: '9999',
            step: '1',
            pattern: '[0-9]{1,4}',
            placeholder: 'Number of Connections (optional)'
          }}
          label="Number of Connections"
          tooltip="Maximum number of PostgreSQL client connections"
        />
        <Field
          name="hdType"
          component={FormDropdown}
          label="Data Storage"
          options={this.hdTypeOptions()}
          tooltip="Type of data storage device"
        />
        <div className="configuration-form-btn-wrapper">
          <button className={classnames('configuration-form-btn', {
            'configuration-form-btn--disabled': submitting
          })} type="submit" disabled={submitting}>
            Generate
          </button>
        </div>
      </form>
    )
  }
}
