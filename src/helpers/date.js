export function getFormattedDate(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

// "dd/MM/yyyy HH:mm", the same format get-schedule returns, so requested and scheduled times read alike
export function toDisplayDateTime(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Local wall-clock time without an offset, e.g. "2026-10-25T14:00:00"; an offset would make ASP.NET convert it to server time
export function toLocalIsoString(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function getDateFromString(date) {
  return new Date(date)
}