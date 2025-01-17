export function convertRelativeDate(relativeDate: string): Date {
  const today = new Date();

  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const subDays = (date: Date, days: number) => {
    return addDays(date, -days);
  };

  const addWeeks = (date: Date, weeks: number) => {
    return addDays(date, weeks * 7);
  };

  const subWeeks = (date: Date, weeks: number) => {
    return addWeeks(date, -weeks);
  };

  const addMonths = (date: Date, months: number) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  };

  const subMonths = (date: Date, months: number) => {
    return addMonths(date, -months);
  };

  switch (relativeDate) {
    case 'today':
      return today;
    case 'yesterday':
      return subDays(today, 1);
    case '2daysAgo':
      return subDays(today, 2);
    case '3daysAgo':
      return subDays(today, 3);
    case '4daysAgo':
      return subDays(today, 4);
    case '5daysAgo':
      return subDays(today, 5);
    case '6daysAgo':
      return subDays(today, 6);
    case '1weekAgo':
      return subWeeks(today, 1);
    case '2weeksAgo':
      return subWeeks(today, 2);
    case '3weeksAgo':
      return subWeeks(today, 3);
    case '1monthAgo':
      return subMonths(today, 1);
    case '2monthsAgo':
      return subMonths(today, 2);
    case '3monthsAgo':
      return subMonths(today, 3);
    case '6monthsAgo':
      return subMonths(today, 6);
    case '9monthsAgo':
      return subMonths(today, 9);
    case '1yearAgo':
      return subMonths(today, 12);
    case 'tomorrow':
      return addDays(today, 1);
    case 'in2days':
      return addDays(today, 2);
    case 'in3days':
      return addDays(today, 3);
    case 'in4days':
      return addDays(today, 4);
    case 'in5days':
      return addDays(today, 5);
    case 'in6days':
      return addDays(today, 6);
    case 'in1week':
      return addWeeks(today, 1);
    case 'in2weeks':
      return addWeeks(today, 2);
    case 'in3weeks':
      return addWeeks(today, 3);
    case 'in1month':
      return addMonths(today, 1);
    case 'in2months':
      return addMonths(today, 2);
    case 'in3months':
      return addMonths(today, 3);
    case 'in6months':
      return addMonths(today, 6);
    case 'in9months':
      return addMonths(today, 9);
    case 'in1year':
      return addMonths(today, 12);
    default:
      throw new Error(`Unknown relative date: ${relativeDate}`);
  }
}

export function formatDateToYYYYMMDD(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
