import {reduxForm} from 'redux-form'
import {connect} from 'react-redux'
import LocalStorage from 'lib/localStorage'
import ConfigurationForm from 'components/configurationForm'
import {DEFAULT_DB_VERSION} from 'reducers/configuration/constants'

const validate = (values) => {
  const errors = {}
  if (!values.dbVersion) {
    errors.dbVersion = 'Required'
  }
  return errors
}

const mapStateToProps = () => ({})

const mapDispatchToProps = (dispatch) => ({
  onSubmitForm: (values) => dispatch(submitConfiguration(values))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(reduxForm({
  form: 'configurationForm',
  validate,
  initialValues: {
    dbVersion: DEFAULT_DB_VERSION
  }
})(ConfigurationForm))
