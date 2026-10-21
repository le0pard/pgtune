import { useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router'
import classnames from 'classnames'
import { isEmpty } from 'lodash-es'
import { Formik, Field, Form, useFormikContext } from 'formik'
import FormField from '@common/components/form/field'
import FormDropdown from '@common/components/form/dropdown'
import TotalMemoryInput from './totalMemoryInput'
import { submitConfiguration } from '@app/actions/configurator'
import {
  normalizeConfiguration,
  selectMaxConnections
} from '@features/configuration/configurationSlice'
import {
  OS_TYPE_LABELS,
  DB_TYPE_LABELS,
  HARD_DRIVE_LABELS,
  DB_SIZE_LABELS
} from '@features/configuration/labels'
import { validationSchema } from './validation'
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
  HARD_DRIVE_NVME,
  DB_SIZE_LESS_RAM,
  DB_SIZE_MID_RAM,
  DB_SIZE_GREATER_RAM,
  SIZE_UNIT_GB,
  MAX_NUMERIC_VALUE,
  MAX_CONNECTIONS_VALUE
} from '@features/configuration/constants'

import './configuration-form.css'

const FORM_DEFAULTS = {
  dbVersion: DEFAULT_DB_VERSION,
  osType: OS_LINUX,
  dbType: DB_TYPE_WEB,
  cpuNum: '',
  totalMemory: '',
  totalMemoryUnit: SIZE_UNIT_GB,
  connectionNum: '',
  hdType: HARD_DRIVE_SSD,
  dbSize: DB_SIZE_MID_RAM
}

const FORM_FIELDS = Object.keys(FORM_DEFAULTS)

// delay before configuration is generated again after form changes
const AUTO_GENERATE_DELAY = 400

const dbVersionOptions = () =>
  DB_VERSIONS.map((version) => ({
    label: String(version),
    value: version
  }))

const labelOptions = (labels, values) =>
  values.map((value) => ({
    label: labels[value],
    value
  }))

const osTypeOptions = () => labelOptions(OS_TYPE_LABELS, [OS_LINUX, OS_MAC, OS_WINDOWS])

const dbTypeOptions = () =>
  labelOptions(DB_TYPE_LABELS, [
    DB_TYPE_WEB,
    DB_TYPE_OLTP,
    DB_TYPE_DW,
    DB_TYPE_DESKTOP,
    DB_TYPE_MIXED
  ])

const hdTypeOptions = () =>
  labelOptions(HARD_DRIVE_LABELS, [HARD_DRIVE_NVME, HARD_DRIVE_SSD, HARD_DRIVE_SAN, HARD_DRIVE_HDD])

const dbSizeOptions = () =>
  labelOptions(DB_SIZE_LABELS, [DB_SIZE_LESS_RAM, DB_SIZE_MID_RAM, DB_SIZE_GREATER_RAM])

// shows max_connections, which will be used, if number of connections is empty
const connectionsPlaceholder = (values) => {
  const valuesWithoutConnections = { ...values, connectionNum: '' }
  if (!validationSchema.isValidSync(valuesWithoutConnections)) {
    return 'Number of Connections (optional)'
  }
  const assumedConnections = selectMaxConnections({
    configuration: normalizeConfiguration(valuesWithoutConnections)
  })
  return `Optional, ${assumedConnections} if empty`
}

// generates configuration again, when form values are changed and valid
const AutoGenerate = ({ searchParams, setSearchParams }) => {
  const { values } = useFormikContext()

  useEffect(() => {
    if (!validationSchema.isValidSync(values)) {
      return
    }
    const params = new URLSearchParams(values)
    if (params.toString() === searchParams.toString()) {
      return
    }
    // replace, so typing does not create browser history entries
    const timer = setTimeout(() => setSearchParams(params, { replace: true }), AUTO_GENERATE_DELAY)
    return () => clearTimeout(timer)
  }, [values, searchParams, setSearchParams])

  return null
}

AutoGenerate.propTypes = {
  searchParams: PropTypes.instanceOf(URLSearchParams).isRequired,
  setSearchParams: PropTypes.func.isRequired
}

const filterFormParams = (params = {}) => {
  const paramKeys = Object.keys(params)
  return FORM_FIELDS.reduce((arr, key) => {
    if (paramKeys.includes(key)) {
      arr[key] = params[key]
    }
    return arr
  }, {})
}

const ConfigurationForm = () => {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()

  const handleGenerateConfig = (values, { setSubmitting }) => {
    setSearchParams(new URLSearchParams(values))
    setSubmitting(false)
  }

  const urlParams = useMemo(() => {
    return filterFormParams(Object.fromEntries(searchParams.entries()))
  }, [searchParams])

  const formParams = useMemo(() => {
    if (isEmpty(urlParams)) {
      return FORM_DEFAULTS
    }

    let vParams = urlParams

    try {
      validationSchema.validateSync(vParams)
    } catch (e) {
      console.warn('Url params error', e)
      vParams = {} // back to default
    }

    return Object.assign({}, FORM_DEFAULTS, vParams)
  }, [urlParams])

  useEffect(() => {
    dispatch(submitConfiguration(formParams))
  }, [dispatch, formParams])

  return (
    <Formik
      onSubmit={handleGenerateConfig}
      initialValues={formParams}
      validationSchema={validationSchema}
    >
      {({ isSubmitting, values }) => (
        <Form>
          <AutoGenerate searchParams={searchParams} setSearchParams={setSearchParams} />
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
            tooltip="Operating system of the PostgreSQL server host"
          />
          <Field
            name="dbType"
            component={FormDropdown}
            label="DB Type"
            options={dbTypeOptions()}
            tooltip={
              <span>
                For what type of application is PostgreSQL used:
                <br />
                Web: mostly simple queries, DB smaller than RAM
                <br />
                OLTP: many small writes, some complex reads
                <br />
                Data warehouse: bulk loads, large reporting queries
                <br />
                Desktop: not a dedicated database, e.g. workstation
                <br />
                Mixed: both data warehouse and OLTP queries
              </span>
            }
          />
          <TotalMemoryInput
            tooltip={
              <span>
                How much memory can PostgreSQL use
                <br />
                For containers use the container memory limit
              </span>
            }
          />
          <Field
            name="cpuNum"
            type="number"
            component={FormField}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            min={1}
            max={MAX_NUMERIC_VALUE}
            step={1}
            pattern="[0-9]{1,6}"
            placeholder="Number of CPUs (optional)"
            label="Number of CPUs"
            tooltip={
              <span>
                Number of CPUs, which PostgreSQL can use
                <br />
                CPUs = threads per core * cores per socket * sockets
                <br />
                If empty, parallel query settings are not changed
              </span>
            }
          />
          <Field
            name="connectionNum"
            type="number"
            component={FormField}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            min={20}
            max={MAX_CONNECTIONS_VALUE}
            step={1}
            pattern="[0-9]{1,6}"
            placeholder={connectionsPlaceholder(values)}
            label="Number of Connections"
            tooltip={
              <span>
                Maximum number of PostgreSQL client connections
                <br />
                If empty, assumed by DB type and memory (min 100)
              </span>
            }
          />
          <Field
            name="hdType"
            component={FormDropdown}
            label="Data Storage"
            options={hdTypeOptions()}
            tooltip="Type of data storage device"
          />
          <Field
            name="dbSize"
            component={FormDropdown}
            label="Total Data Size"
            options={dbSizeOptions()}
            tooltip="Estimated total size of your database compared to total server RAM"
          />
          <div className="configuration-form-btn-wrapper">
            <button
              className={classnames('configuration-form-btn', {
                'configuration-form-btn--disabled': isSubmitting
              })}
              type="submit"
              disabled={isSubmitting}
            >
              Generate
            </button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default ConfigurationForm
