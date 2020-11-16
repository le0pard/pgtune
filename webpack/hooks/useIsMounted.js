import {useEffect, useRef} from 'react'

export const useIsMounted = () => {
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  return mounted
}
