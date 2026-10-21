import { useCallback, useMemo } from 'react'
import { useLocation } from 'preact-iso/router'

/**
 * Search params of current location and setter, which navigates to current path with new params
 * (push by default, replace with { replace: true })
 * @returns {[URLSearchParams, (params: URLSearchParams | Record<string, string>, options?: { replace?: boolean }) => void]}
 */
export const useSearchParams = () => {
  const { url, path, route } = useLocation()

  // url is path with search params (no window access, so it works in prerender too)
  const searchParams = useMemo(() => new URLSearchParams(url.split('?')[1] ?? ''), [url])

  const setSearchParams = useCallback(
    (params, { replace = false } = {}) => {
      const search = new URLSearchParams(params).toString()
      route(search ? `${path}?${search}` : path, replace)
    },
    [path, route]
  )

  return [searchParams, setSearchParams]
}
