import { format, isValid, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return 'N/A';
  
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return isValid(parsedDate) ? format(parsedDate, 'PPP') : 'Invalid Date';
  } catch {
    return 'Invalid Date';
  }
}; 