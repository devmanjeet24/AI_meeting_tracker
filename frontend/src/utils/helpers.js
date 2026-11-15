export function formatDate(date) {

  if (!date) return ""

  const d = new Date(date)

  if (isNaN(d)) return ""

  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })

}

export function truncate(text, length = 120) {

  if (!text) return ""

  if (text.length <= length) return text

  return text.substring(0, length).trimEnd() + "..."

}
