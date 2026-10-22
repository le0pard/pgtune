import { configurationText } from '../configurationText'
import { normalizeConfiguration } from '../configurationParams'
import {
  selectHardwareConfiguration,
  selectSettings,
  selectWarningInfoMessages,
  selectRestartRequiredSettings
} from '../configurationSelectors'

// generates configuration text from form values, as configuration view does
export const generateConfiguration = (
  values,
  { isAlterSystem = false, includeWarnings = true } = {}
) => {
  const state = { configuration: normalizeConfiguration(values) }
  return configurationText({
    hardware: selectHardwareConfiguration(state),
    settings: selectSettings(state),
    warnings: selectWarningInfoMessages(state),
    restartRequiredSettings: selectRestartRequiredSettings(state),
    isAlterSystem,
    includeWarnings
  })
}
