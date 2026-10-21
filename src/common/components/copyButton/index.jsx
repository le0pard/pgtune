import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const COPIED_TIMEOUT = 2000

const COPY_STATUS_SUCCESS = 'success'
const COPY_STATUS_ERROR = 'error'

const CopyButton = ({
  text,
  className,
  label = 'Copy',
  successLabel = 'Copied',
  errorLabel = 'Error'
}) => {
  const [copyStatus, setCopyStatus] = useState(null)

  // show result of copy for some time, timer is cleared if button is unmounted
  useEffect(() => {
    if (!copyStatus) {
      return () => {}
    }

    const timer = setTimeout(() => setCopyStatus(null), COPIED_TIMEOUT)
    return () => clearTimeout(timer)
  }, [copyStatus])

  const handleCopy = () => {
    // clipboard API is available only in secure context (https or localhost)
    if (!navigator.clipboard) {
      setCopyStatus(COPY_STATUS_ERROR)
      return
    }

    navigator.clipboard.writeText(text).then(
      () => setCopyStatus(COPY_STATUS_SUCCESS),
      () => setCopyStatus(COPY_STATUS_ERROR)
    )
  }

  const renderLabel = () => {
    if (copyStatus === COPY_STATUS_SUCCESS) {
      return successLabel
    } else if (copyStatus === COPY_STATUS_ERROR) {
      return errorLabel
    } else {
      return label
    }
  }

  return (
    <button type="button" className={className} onClick={handleCopy}>
      <span aria-live="polite">{renderLabel()}</span>
    </button>
  )
}

CopyButton.propTypes = {
  className: PropTypes.string,
  text: PropTypes.string.isRequired,
  label: PropTypes.string,
  successLabel: PropTypes.string,
  errorLabel: PropTypes.string
}

export default CopyButton
