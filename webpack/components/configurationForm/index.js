import React from 'react'
import {useDispatch} from 'react-redux'
import classnames from 'classnames'
import {Formik, Field, Form} from 'formik'
import FormField from 'components/form/field'
import FormDropdown from 'components/form/dropdown'
import TotalMemoryInput from './totalMemoryInput'
import {submitConfiguration} from 'reducers/configuration'
import {validationSchema} from './validation'
import {
  DEFAULT_DB_VERSION,
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
  HARD_DRIVE_HDD,
  SIZE_UNIT_GB
} from 'reducers/configuration/constants'

import './configuration-form.sass'

const dbVersionOptions = () => (
  DB_VERSIONS.map((version) => ({
    label: String(version),
    value: version
  }))
)

const osTypeOptions = () => (
  [
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
)

const dbTypeOptions = () => (
  [
    {
      label: 'Web application',
      value: DB_TYPE_WEB
    },
    {
      label: 'Online transaction processing system',
      value: DB_TYPE_OLTP
    },
    {
      label: 'Data warehouse',
      value: DB_TYPE_DW
    },
    {
      label: 'Desktop application',
      value: DB_TYPE_DESKTOP
    },
    {
      label: 'Mixed type of application',
      value: DB_TYPE_MIXED
    }
  ]
)

const hdTypeOptions = () => (
  [
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
)

const ConfigurationForm = () => {
  const dispatch = useDispatch()

  const handleGenerateConfig = (values, {setSubmitting}) => {
    dispatch(submitConfiguration(values))
    setSubmitting(false)
  }

  return (
    <Formik
      onSubmit={handleGenerateConfig}
      initialValues={{
        dbVersion: DEFAULT_DB_VERSION,
        osType: OS_LINUX,
        dbType: DB_TYPE_WEB,
        cpuNum: '',
        totalMemory: '',
        totalMemoryUnit: SIZE_UNIT_GB,
        connectionNum: '',
        hdType: HARD_DRIVE_SSD
      }}
      validationSchema={validationSchema}
    >{({isSubmitting}) => (
        <Form>
          <Field
            name="dbVersion"
            component={FormDropdown}
            label="DB version"
            options={dbVersionOptions()}
            tooltip="PostgreSQL version (find out via 'SELECT version();')"
          />
          <Field
            name="osType"
            component={FormDropdown}
            label="OS Type"
            options={osTypeOptions()}
            tooltip="Operation system of the PostgreSQL server host"
          />
          <Field
            name="dbType"
            component={FormDropdown}
            label="DB Type"
            options={dbTypeOptions()}
            tooltip="For what type of application is PostgreSQL used"
          />
          <TotalMemoryInput
            tooltip="How much memory can PostgreSQL use"
          />
          <Field
            name="cpuNum"
            type="number"
            component={FormField}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            min={1}
            max={9999}
            step={1}
            pattern="[0-9]{1,4}"
            placeholder="Number of CPUs (optional)"
            label="Number of CPUs"
            tooltip={<span>Number of CPUs, which PostgreSQL can use<br />CPUs = threads per core * cores per socket * sockets</span>}
          />
          <Field
            name="connectionNum"
            type="number"
            component={FormField}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            min={20}
            max={9999}
            step={1}
            pattern="[0-9]{1,4}"
            placeholder="Number of Connections (optional)"
            label="Number of Connections"
            tooltip="Maximum number of PostgreSQL client connections"
          />
          <Field
            name="hdType"
            component={FormDropdown}
            label="Data Storage"
            options={hdTypeOptions()}
            tooltip="Type of data storage device"
          />
          <div className="configuration-form-btn-wrapper">
            <button className={classnames('configuration-form-btn', {
              'configuration-form-btn--disabled': isSubmitting
            })} type="submit" disabled={isSubmitting}>Generate</button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default ConfigurationForm
