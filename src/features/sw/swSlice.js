import { createSlice, isAnyOf } from '@reduxjs/toolkit'
import { listenerMiddleware } from '@app/listenerMiddleware'
import { skipWaitingMessageAndReload } from './swWindow'

const initialState = {
  isNewVersionAvailable: false
}

const swSlice = createSlice({
  name: 'sw',
  initialState,
  reducers: {
    readyToUpdated: (state) => {
      state.isNewVersionAvailable = true
    },
    updating: (state) => {
      state.isNewVersionAvailable = false
    }
  }
})

export const { readyToUpdated, updating } = swSlice.actions

export const selectSw = (state) => state.sw
export const selectIsNewVersionAvailableSw = (state) => selectSw(state).isNewVersionAvailable

// Export the slice reducer as the default export
export default swSlice.reducer

// listeners
listenerMiddleware.startListening({
  matcher: isAnyOf(updating),
  effect: () => skipWaitingMessageAndReload()
})
