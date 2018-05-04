import {reduxForm} from 'redux-form'
import {connect} from 'react-redux'
import ConfigurationForm from 'components/configurationForm'
import {submitConfiguration} from 'reducers/configuration'
import {
  DEFAULT_DB_VERSION,
  OS_LINUX,
  DB_TYPE_WEB,
  SIZE_UNIT_GB,
  HARD_DRIVE_SSD
} from 'reducers/configuration/constants'
import {validate} from './validation'

const mapDispatchToProps = (dispatch) => ({
  onSubmitForm: (values) => dispatch(submitConfiguration(values))
})

export default connect(
  null,
  mapDispatchToProps
)(reduxForm({
  form: 'configurationForm',
  validate,
  initialValues: {
    dbVersion: DEFAULT_DB_VERSION,
    osType: OS_LINUX,
    dbType: DB_TYPE_WEB,
    totalMemoryUnit: SIZE_UNIT_GB,
    hdType: HARD_DRIVE_SSD
  }
})(ConfigurationForm))
