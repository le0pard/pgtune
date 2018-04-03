const LocalStorage = {
  getItem: (key) => {
    const value = window.localStorage.getItem(key)
    if (value) {
      return JSON.parse(value)
    } else {
      return null
    }
  },
  setItem: (key, value) => {
    window.localStorage.setItem(key, JSON.stringify(value))
  },
  removeItem: (key) => {
    window.localStorage.removeItem(key)
  }
}

export default LocalStorage
