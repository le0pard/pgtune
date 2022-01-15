import assign from 'lodash/assign'

const builder = (environment) => (config) => {
  return assign(config.default || {}, config[environment])
}

export default builder
