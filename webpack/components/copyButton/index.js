import React, {useRef, useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {useIsMounted} from 'hooks/useIsMounted'
import Clipboard from 'clipboard'

const COPIED_TIMEOUT = 1500

const CopyButton = ({text, className, label = 'Copy', successLabel = 'Copied', errorLabel = 'Error'}) => {
  const copyButton = useRef()
  const clipboard = useRef()
  const mounted = useIsMounted()
  const [copiedSuccess, setCopiedSuccess] = useState(false)
  const [copiedError, setCopiedError] = useState(false)

  useEffect(() => {
    const resetState = () => {
      setTimeout(() => {
        if (clipboard.current && mounted.current) {
          setCopiedSuccess(false)
          setCopiedError(false)
        }
      }, COPIED_TIMEOUT)
    }

    if (mounted.current && copyButton.current) {
      clipboard.current = new Clipboard(copyButton.current)
      clipboard.current.on('success', () => {
        setCopiedSuccess(true)
        resetState()
      })
      clipboard.current.on('error', () => {
        setCopiedError(true)
        resetState()
      })

      return () => {
        if (clipboard.current) {
          clipboard.current.destroy()
          clipboard.current = null
        }
      }
    }

    return () => {}
  }, [mounted])

  const renderLabel = () => {
    if (copiedSuccess) {
      return successLabel
    } else if (copiedError) {
      return errorLabel
    } else {
      return label
    }
  }

  return (
    <button
      className={className}
      ref={copyButton}
      data-clipboard-text={text}>
      {renderLabel()}
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
