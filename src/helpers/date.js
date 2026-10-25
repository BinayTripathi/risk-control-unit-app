export function getFormattedDate(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

// "dd/MM/yyyy HH:mm", the same format get-schedule returns, so requested and scheduled times read alike
export function toDisplayDateTime(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function getDateFromString(date) {
  return new Date(date)
}