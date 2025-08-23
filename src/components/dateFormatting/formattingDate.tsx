export function formatCustomDate(dateValue?: string | number | Date): string {
  if (!dateValue) return "-";

  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return "-"; // invalid date check

  const day = date.getDate();
  const suffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  const time = date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).toLowerCase();

  return `${day}${suffix(day)} ${month}, ${year} ${time}`;
}
