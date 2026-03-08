export function formatDate(date) {

  if (!date) return "";

  return new Date(date).toLocaleDateString();

}

export function truncate(text, length = 120) {

  if (!text) return "";

  if (text.length <= length) return text;

  return text.substring(0, length) + "...";

}