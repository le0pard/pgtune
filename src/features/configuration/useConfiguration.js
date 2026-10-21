import { useMemo } from 'react'
import { useSearchParams } from '@hooks/useSearchParams'
import { configurationFromParams } from './configurationParams'

// configuration from url params, which are the only source of it
export const useConfiguration = () => {
  const [searchParams] = useSearchParams()
  return useMemo(() => configurationFromParams(searchParams), [searchParams])
}
