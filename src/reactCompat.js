// "react" module for the app and libraries (react-router, react-redux, formik):
// Preact compat layer, plus React APIs, which Preact does not provide (see vite.config.js aliases)

export * from 'preact/compat'
export { default } from 'preact/compat'

// react-router imports useOptimistic, but calls it only in RouterProvider (data router), which
// this app does not use (BrowserRouter). Outside of transitions React returns passed state,
// so the same is done here
export const useOptimistic = (passthrough) => [passthrough, () => {}]
