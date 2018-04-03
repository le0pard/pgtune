import {reduxForm} from 'redux-form'
import {connect} from 'react-redux'
import ConfigurationForm from 'components/configurationForm'
import {
  DEFAULT_DB_VERSION,
  OS_LINUX,
  DB_TYPE_WEB,
  HARD_DRIVE_HDD
} from 'reducers/configuration/constants'

const validate = (values) => {
  const errors = {}
  if (!values.dbVersion) {
    errors.dbVersion = 'Required'
  }
  if (!values.osType) {
    errors.osType = 'Required'
  }
  if (!values.dbType) {
    errors.dbType = 'Required'
  }
  if (!values.totalMemory) {
    errors.totalMemory = 'Required'
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
    dbVersion: DEFAULT_DB_VERSION,
    osType: OS_LINUX,
    dbType: DB_TYPE_WEB,
    hdType: HARD_DRIVE_HDD
  }
})(ConfigurationForm))
