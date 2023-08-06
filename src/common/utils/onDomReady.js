export const onDomReady = (callback) => {
  if (document.readyState !== 'loading') {
    return setTimeout(callback, 0)
  } else {
    return document.addEventListener('DOMContentLoaded', () => callback())
  }
}
