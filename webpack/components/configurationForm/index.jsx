import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {Field} from 'redux-form'
import FormField from 'components/form/field'
import FormDropdown from 'components/form/dropdown'
import {
  DB_VERSIONS,
  OS_LINUX,
  OS_WINDOWS,
  DB_TYPE_WEB,
  DB_TYPE_OLTP,
  DB_TYPE_DW,
  DB_TYPE_DESKTOP,
  DB_TYPE_MIXED,
  SIZE_UNIT_MB,
  SIZE_UNIT_GB,
  HARD_DRIVE_HDD,
  HARD_DRIVE_SSD,
  HARD_DRIVE_SAN
} from 'reducers/configuration/constants'

import './configuration-form.sass'

export default class ConfigurationForm extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    onSubmitForm: PropTypes.func.isRequired
  }

  handleGenerateConfig(values) {
    this.props.onSubmitForm(values)
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
        label: 'Linux/OS X',
        value: OS_LINUX
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

  totalMemoryUnitOptions() {
    return [
      {
        label: 'GB',
        value: SIZE_UNIT_GB
      },
      {
        label: 'MB',
        value: SIZE_UNIT_MB
      }
    ]
  }

  hdTypeOptions() {
    return [
      {
        label: 'HDD storage',
        value: HARD_DRIVE_HDD
      },
      {
        label: 'SSD storage',
        value: HARD_DRIVE_SSD
      },
      {
        label: 'Network (SAN) storage',
        value: HARD_DRIVE_SAN
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
        />
        <Field
          name="osType"
          component={FormDropdown}
          label="OS Type"
          options={this.osTypeOptions()}
        />
        <Field
          name="dbType"
          component={FormDropdown}
          label="DB Type"
          options={this.dbTypeOptions()}
        />
        <Field
          name="totalMemory"
          type="number"
          component={FormField}
          inputProps={{
            autoFocus: true,
            autoComplete: 'off',
            autoCorrect: 'off',
            autoCapitalize: 'none',
            required: 'required',
            min: '1',
            max: '9999',
            step: '1',
            pattern: '[0-9]{1,4}',
            placeholder: 'Memory size (RAM, required)'
          }}
          label="Total Memory (RAM)"
        />
        <Field
          name="totalMemoryUnit"
          component={FormDropdown}
          label="Unit"
          options={this.totalMemoryUnitOptions()}
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
        />
        <Field
          name="hdType"
          component={FormDropdown}
          label="Hard drive type"
          options={this.hdTypeOptions()}
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
