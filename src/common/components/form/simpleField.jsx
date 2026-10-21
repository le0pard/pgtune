import PropTypes from 'prop-types'

import './field.css'

const FormSimpleField = ({
  field,
  className,
  inputClassName,
  errorClassName,
  form: { touched, errors },
  ...rest
}) => {
  const isError = touched[field.name] && errors[field.name]
  const errorID = `${field.name}Error`
  const describedBy = [rest['aria-describedby'], isError && errorID].filter(Boolean).join(' ')

  return (
    <div className={className}>
      <input
        {...field}
        {...rest}
        className={inputClassName}
        aria-describedby={describedBy || undefined}
        aria-invalid={isError ? true : undefined}
      />
      {isError && (
        <div id={errorID} className={errorClassName}>
          {errors[field.name]}
        </div>
      )}
    </div>
  )
}

FormSimpleField.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.any
  }).isRequired,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  errorClassName: PropTypes.string,
  form: PropTypes.shape({
    touched: PropTypes.object,
    errors: PropTypes.object
  }).isRequired
}

export default FormSimpleField
