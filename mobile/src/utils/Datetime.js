export function FormatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function GetStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function GetStartOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  return d;
}

export function CalcAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function DateDetail(baseDate) {
  const date = baseDate ? new Date(baseDate) : new Date();
  const startOfWeek = GetStartOfWeek(date);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const startOfMonth = GetStartOfMonth(date);

  const formatFull = (d) =>
    d.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    weekDates.push({
      date: d.getDate(),
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      fullDate: new Date(d),
      formatted: FormatDate(d),
      dayLabel: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][i],
    });
  }

  return {
    currentDate: FormatDate(date),
    dateInMonth: date.getDate(),
    dateStartInWeek: FormatDate(startOfWeek),
    dateEndInWeek: FormatDate(endOfWeek),
    dateStartInMonth: FormatDate(startOfMonth),
    currentDateFull: formatFull(date),
    weekRangeFull: `${formatFull(startOfWeek)} → ${formatFull(endOfWeek)}`,
    weekDates,
  };
}
