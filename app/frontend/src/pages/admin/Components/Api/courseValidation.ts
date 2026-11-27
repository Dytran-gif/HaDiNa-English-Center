export function validateCourseForm(form: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};
  const number = (key: string) => form[key]?.trim() ? Number(form[key]) : NaN;
  const from = number("bandFrom"), to = number("bandTo");
  for (const [key, value] of [["bandFrom", from], ["bandTo", to]] as const) {
    if (!Number.isFinite(value) || value < 0 || value > 9 || value % .5 !== 0)
      errors[key.toLowerCase()] = "Band phải từ 0 đến 9 và tăng theo bước 0.5.";
  }
  if (Number.isFinite(from) && Number.isFinite(to) && from >= to) {
    errors.bandfrom = "Band từ phải nhỏ hơn band đến.";
    errors.bandto = "Band đến phải lớn hơn band từ.";
  }
  const tuition = number("tuition"), discount = number("discountPercent");
  if (!Number.isFinite(tuition) || tuition < 0 || tuition > 1000000000) errors.tuition = "Học phí phải từ 0 đến 1.000.000.000 VND.";
  if (!Number.isFinite(discount) || discount < 0 || discount > 50) errors.discountpercent = "Giảm giá phải từ 0 đến 50%.";
  const total = number("totalSessions"), weekly = number("sessionsPerWeek");
  if (!Number.isInteger(total) || total < 1 || total > 1000) errors.totalsessions = "Tổng số buổi phải là số nguyên từ 1 đến 1000.";
  if (!Number.isInteger(weekly) || weekly < 1 || weekly > 7 || weekly > total) errors.sessionsperweek = "Số buổi mỗi tuần từ 1 đến 7 và không vượt quá tổng số buổi.";
  return errors;
}
