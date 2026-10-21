import { useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from '@hooks/useSearchParams'
import classnames from 'classnames'
import { Formik, Field, Form, useFormikContext } from 'formik'
import FormField from '@common/components/form/field'
import FormDropdown from '@common/components/form/dropdown'
import TotalMemoryInput from './totalMemoryInput'
import { selectMaxConnections } from '@features/configuration/configurationSelectors'
import { normalizeConfiguration } from '@features/configuration/configurationParams'
import { useConfiguration } from '@features/configuration/useConfiguration'
import {
  OS_TYPE_LABELS,
  DB_TYPE_LABELS,
  HARD_DRIVE_LABELS,
  DB_SIZE_LABELS
} from '@features/configuration/labels'
import { validationSchema } from '@features/configuration/validation'
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
  HARD_DRIVE_HDD,
  HARD_DRIVE_NVME,
  DB_SIZE_LESS_RAM,
  DB_SIZE_MID_RAM,
  DB_SIZE_GREATER_RAM
} from '@features/configuration/constants'

import './configuration-form.css'

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

/**
 * @typedef {object} UrlSyncProps
 * @property {URLSearchParams} searchParams current url params
 * @property {object} formParams form values from current url params
 * @property {{ current: string }} writtenParams params, which form wrote to url last time
 * @property {(params: URLSearchParams, options?: { replace?: boolean }) => void} writeParams
 */

/**
 * Keeps form and url in sync: valid form values are written to url (configuration is
 * generated again), url changed outside of the form (browser back or forward, links)
 * is shown in the form
 * @param {UrlSyncProps} props
 */
const UrlSync = ({ searchParams, formParams, writtenParams, writeParams }) => {
  const { values, setValues } = useFormikContext()

  // url was changed outside of the form, so form shows its values
  useEffect(() => {
    if (searchParams.toString() !== writtenParams.current) {
      writtenParams.current = searchParams.toString()
      setValues(formParams)
    }
  }, [searchParams, formParams, writtenParams, setValues])

  useEffect(() => {
    if (!validationSchema.isValidSync(values)) {
      return
    }
    const params = new URLSearchParams(values)
    if (params.toString() === searchParams.toString()) {
      return
    }
    // replace, so typing does not create browser history entries
    const timer = setTimeout(() => writeParams(params, { replace: true }), AUTO_GENERATE_DELAY)
    return () => clearTimeout(timer)
  }, [values, searchParams, writeParams])

  return null
}

const ConfigurationForm = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  // form values from url params
  const { values: formParams } = useConfiguration()
  // to recognize url changes made by the form itself
  const writtenParams = useRef(searchParams.toString())

  const writeParams = useCallback(
    (params, options) => {
      writtenParams.current = params.toString()
      setSearchParams(params, options)
    },
    [setSearchParams]
  )

  const handleGenerateConfig = (values, { setSubmitting }) => {
    writeParams(new URLSearchParams(values))
    setSubmitting(false)
  }

  return (
    <Formik
      onSubmit={handleGenerateConfig}
      initialValues={formParams}
      validationSchema={validationSchema}
    >
      {({ isSubmitting, values }) => (
        <Form>
          <UrlSync
            searchParams={searchParams}
            formParams={formParams}
            writtenParams={writtenParams}
            writeParams={writeParams}
          />
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
            type="text"
            inputMode="numeric"
            component={FormField}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            pattern="[0-9]*"
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
            type="text"
            inputMode="numeric"
            component={FormField}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            pattern="[0-9]*"
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
