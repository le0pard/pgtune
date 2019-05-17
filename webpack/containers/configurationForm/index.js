import {connect} from 'react-redux'
import ConfigurationForm from 'components/configurationForm'
import {submitConfiguration} from 'reducers/configuration'

const mapDispatchToProps = (dispatch) => ({
  onSubmitForm: (values) => dispatch(submitConfiguration(values))
})

export default connect(
  null,
  mapDispatchToProps
)(ConfigurationForm)
