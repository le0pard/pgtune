import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {Field} from 'redux-form'
import FormField from 'components/form/field'
import FormDropdown from 'components/form/dropdown'
import {DB_VERSIONS} from 'reducers/configuration/constants'

import './configuration-form.sass'

export default class ConfigurationForm extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    pristine: PropTypes.bool.isRequired,
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

  render() {
    const {
      handleSubmit,
      pristine,
      submitting
    } = this.props

    return (
      <form onSubmit={handleSubmit(this.handleGenerateConfig.bind(this))}>
        <Field
          name="dbVersion"
          component={FormDropdown}
          label="DB version"
          options={this.dbVersionOptions()}
        />
        <Field
          name="site"
          type="text"
          component={FormField}
          inputProps={{
            autoFocus: true,
            autoComplete: 'off',
            autoCorrect: 'off',
            autoCapitalize: 'none'
          }}
          label="Site"
        />
        <Field
          name="counter"
          type="number"
          component={FormField}
          inputProps={{
            step: 1,
            min: 1,
            max: 1000,
            pattern: '[0-9]*'
          }}
          label="Counter"
        />
        <Field
          name="template"
          component={FormDropdown}
          label="Template"
          options={[]}
        />
        <div className="generate-pass__buttons-wrapper">
          <button className={classnames('generate-pass__submit-button', {
            'generate-pass__submit-button--disabled': submitting
          })} type="submit" disabled={submitting}>
            Generate Password
          </button>
        </div>
      </form>
    )
  }
}
