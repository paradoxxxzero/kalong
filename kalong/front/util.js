export const range = (from, to) =>
  Array(to - from)
    .fill(0)
    .map((_, i) => i + from)
