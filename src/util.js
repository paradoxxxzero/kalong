export const range = (from, to) =>
  Array(to - from)
    .fill(0)
    .map((_, i) => i + from)

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2, 5)

export const prettyTime = time => {
  if (!time) {
    return ''
  }
  if (time < 1000) {
    return `${time}ns`
  }
  time /= 1000
  if (time < 10) {
    return `${time.toFixed(2)}μs`
  }
  if (time < 100) {
    return `${time.toFixed(1)}μs`
  }
  if (time < 1000) {
    return `${time.toFixed(0)}μs`
  }
  time /= 1000
  if (time < 10) {
    return `${time.toFixed(2)}ms`
  }
  if (time < 100) {
    return `${time.toFixed(1)}ms`
  }
  if (time < 1000) {
    return `${time.toFixed(0)}ms`
  }

  time /= 1000
  if (time < 10) {
    return `${time.toFixed(2)}s`
  }
  if (time < 60) {
    return `${time.toFixed(1)}s`
  }
  const withZero = s => {
    s = s.toString()
    if (s.length === 1) {
      return `0${s}`
    }
    return s
  }
  let mtime = Math.floor(time / 60)
  const stime = (time - 60 * mtime).toFixed(0)

  if (mtime < 60) {
    return `${mtime}m${withZero(stime)}s`
  }
  const htime = Math.floor(mtime / 60)
  mtime = (mtime - 60 * htime).toFixed(0)
  return `${htime}h${withZero(mtime)}m${withZero(stime)}s`
}

export const scrollIntoViewIfNeeded = e => {
  if (!e) {
    return
  }
  const { top, bottom } = e.getBoundingClientRect()
  if (top < 0) {
    e.scrollIntoView()
  } else if (bottom > window.innerHeight) {
    e.scrollIntoView(false)
  }
}
