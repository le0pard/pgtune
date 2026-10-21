// colors of redux-logger
const STYLES = {
  muted: 'color: gray; font-weight: lighter',
  title: 'font-weight: bold',
  prevState: 'color: #9e9e9e; font-weight: bold',
  action: 'color: #03a9f4; font-weight: bold',
  nextState: 'color: #4caf50; font-weight: bold',
  changed: 'color: #2196f3; font-weight: bold'
}

// local time with milliseconds, e.g. 12:30:15.042
const formatTime = (date) =>
  `${date.toTimeString().slice(0, 8)}.${String(date.getMilliseconds()).padStart(3, '0')}`

/**
 * Wraps reducer to log each action with previous and next state in development
 * (as collapsed console group, like redux-logger). Production build gets the reducer as is,
 * so logging code is removed from the bundle
 * @template S, A
 * @param {string} name state name, shown in the log
 * @param {(state: S, action: A & { type: string }) => S} reducer
 * @returns {(state: S, action: A & { type: string }) => S}
 */
export const withLogger = (name, reducer) => {
  if (!import.meta.env.DEV) {
    return reducer
  }

  return (state, action) => {
    const nextState = reducer(state, action)

    console.groupCollapsed(
      `%c${name} %c${action.type} %c@ ${formatTime(new Date())}`,
      STYLES.muted,
      STYLES.title,
      STYLES.muted
    )
    console.log('%cprev state', STYLES.prevState, state)
    console.log('%caction', STYLES.action, action)
    console.log('%cnext state', STYLES.nextState, nextState)
    Object.keys(nextState)
      .filter((key) => !Object.is(state[key], nextState[key]))
      .forEach((key) =>
        console.log(`%cchanged ${key}:`, STYLES.changed, state[key], '→', nextState[key])
      )
    console.groupEnd()

    return nextState
  }
}
