import { useState, useEffect } from 'react'

const COPIED_TIMEOUT = 2000

const COPY_STATUS_SUCCESS = 'success'
const COPY_STATUS_ERROR = 'error'

/**
 * @typedef {object} CopyButtonProps
 * @property {string} text text, which is copied to clipboard
 * @property {string} [className]
 * @property {string} [label] button label
 * @property {string} [successLabel] label shown after successful copy
 * @property {string} [errorLabel] label shown if copy failed
 */

/**
 * Button, which copies text to clipboard and shows result in its label
 * @param {CopyButtonProps} props
 */
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

export default CopyButton
