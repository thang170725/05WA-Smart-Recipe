// FORMAT DATE (DATE -> STRING)
export function FormatDate(date) {
  // Output: YY-MM-DD
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
}

// lấy ra ngày đầu tiên của tuần (tức thứ 2 của tuần đó)
export function GetStartOfWeek(date) {
  /*
  Input: string (ngày hiện tại hoặc bất kỳ ngày trong tuần) 
  Output: new Date()
  */
  const d = new Date(date);
  const day = d.getDay(); // 0 (CN) → 6 (T7)

  // Nếu là Chủ nhật (0) thì lùi 6 ngày, còn lại lùi day - 1
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);

  return d;
}

// START DATE OF MONTH
export function GetStartOfMonth (date) {
  const d = new Date(date)
  d.setDate(1)
  
  return d
}

export function CalcAge (birthDate) {
  // birthDate: YY-MM-DD (string)
  /* EX: 
    birth = '2005-07-17'
    age = CalcAge(birth)
  */
  const today = new Date()
  const birth = new Date(birthDate)

  let age = today.getFullYear() - birth.getFullYear()

  const monthDiff = today.getMonth() - birth.getMonth()

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age--
  }

  return age
}

export function DateDetail(baseDate) {
  /*
  Input: string | Date
  Output: JSON
  */

  const date = baseDate ? new Date(baseDate) : new Date();

  const startOfWeek = GetStartOfWeek(date);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const startOfMonth = GetStartOfMonth(date);

  const formatFull = (d) =>
    d.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

  // THÊM MỚI
  const weekDates = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);

    d.setDate(startOfWeek.getDate() + i);

    weekDates.push({
      date: d.getDate(),         // 16
      month: d.getMonth() + 1,   // 6
      year: d.getFullYear(),     // 2026
      fullDate: new Date(d),
      formatted: FormatDate(d),
    });
  }

  return {
    // Format YY-MM-DD
    currentDate: FormatDate(date),

    dateInMonth: date.getDate(),

    dateStartInWeek: FormatDate(startOfWeek),

    dateEndInWeek: FormatDate(endOfWeek),

    dateStartInMonth: FormatDate(startOfMonth),

    // Format hiển thị đầy đủ tiếng Việt
    currentDateFull: formatFull(date),

    weekRangeFull: `${formatFull(startOfWeek)} → ${formatFull(endOfWeek)}`,

    // THÊM MỚI
    weekDates,
  };
}