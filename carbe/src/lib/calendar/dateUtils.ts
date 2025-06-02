import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWeekend, addMonths, subMonths } from 'date-fns';

export const formatDateToString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const parseStringToDate = (dateString: string): Date => {
  return new Date(dateString + 'T00:00:00');
};

export const isWeekendDay = (date: Date): boolean => {
  return isWeekend(date);
};

export const getDaysInMonth = (date: Date): Date[] => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
};

export const getCalendarGrid = (date: Date): Date[] => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  
  // Get first day of the week for the month
  const startOfWeek = new Date(start);
  startOfWeek.setDate(start.getDate() - start.getDay());
  
  // Get last day of the week for the month
  const endOfWeek = new Date(end);
  endOfWeek.setDate(end.getDate() + (6 - end.getDay()));
  
  return eachDayOfInterval({ start: startOfWeek, end: endOfWeek });
};

export const navigateMonth = (currentMonth: Date, direction: 'prev' | 'next'): Date => {
  return direction === 'next' ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1);
};

export const isSameDayUtil = (date1: Date, date2: Date): boolean => {
  return isSameDay(date1, date2);
};

export const formatDisplayDate = (date: Date): string => {
  return format(date, 'EEEE, MMMM d, yyyy');
};

export const formatMonthYear = (date: Date): string => {
  return format(date, 'MMMM yyyy');
};

export const getDaysBetween = (startDate: Date, endDate: Date): Date[] => {
  return eachDayOfInterval({ start: startDate, end: endDate });
};

export const calculateWeekendMarkup = (basePrice: number, markupPercentage: number = 15): number => {
  return Math.round(basePrice * (1 + markupPercentage / 100));
}; 