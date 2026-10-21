import { withLogger } from '../reducerLogger'

const reducer = (state, action) =>
  action.type === 'increment' ? { ...state, count: state.count + 1 } : state

describe('withLogger', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('logs action with previous and next state, and changed keys in development', () => {
    const group = vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {})
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const groupEnd = vi.spyOn(console, 'groupEnd').mockImplementation(() => {})

    const nextState = withLogger('counter', reducer)({ count: 1, name: 'a' }, { type: 'increment' })

    expect(nextState).toEqual({ count: 2, name: 'a' })
    expect(group.mock.calls[0][0]).toMatch(/^%ccounter %cincrement %c@ \d{2}:\d{2}:\d{2}\.\d{3}$/)
    expect(log.mock.calls.map((call) => call[0])).toEqual([
      '%cprev state',
      '%caction',
      '%cnext state',
      '%cchanged count:'
    ])
    expect(log.mock.calls[3].slice(2)).toEqual([1, '→', 2])
    expect(groupEnd).toHaveBeenCalledTimes(1)
  })

  it('returns reducer as is in production', () => {
    vi.stubEnv('DEV', false)

    expect(withLogger('counter', reducer)).toBe(reducer)
  })
})
