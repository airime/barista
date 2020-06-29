export abstract class DtDateAdapter<D> {
  /**
   * Creates a date with the given year, month, and date.
   * Does not allow over/under-flow of the month and date.
   */
  abstract createDate(year: number, month: number, date: number): D;

  /** Gets today's date. */
  abstract today(): D;

  /** Gets the year component of the given date. */
  abstract getYear(date: D): number;

  /** Gets the month component of the given date. */
  abstract getMonth(date: D): number;

  /** Gets the date of the month component of the given date. */
  abstract getDate(date: D): number;

  /** Gets the day of the week component of the given date.*/
  abstract getDayOfWeek(date: D): number;

  /** Gets the first day of the week. */
  abstract getFirstDayOfWeek(): number;

  /** Gets a list of names for the days of the week. */
  abstract getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[];

  /** Gets the number of days in the month of the given date.*/
  abstract getNumDaysInMonth(date: D): number;

  /** Gets a list of names for the dates of the month. */
  abstract getDateNames(): string[];

  /** Checks whether the given object is considered a date instance by this DateAdapter. */
  abstract isDateInstance(obj: any): obj is D;

  /** Checks whether the given date is valid. */
  abstract isValid(date: D): boolean;

  /**
   * Compares two dates.
   * Returns 0 if the dates are equal,
   * a number less than 0 if the first date is earlier,
   * a number greater than 0 if the first date is later
   */
  compareDate(first: D, second: D): number {
    return (
      this.getYear(first) - this.getYear(second) ||
      this.getMonth(first) - this.getMonth(second) ||
      this.getDate(first) - this.getDate(second)
    );
  }

  /** Clamp the given date between min and max dates.*/
  clampDate(date: D, min?: D | null, max?: D | null): D {
    if (min && this.compareDate(date, min) < 0) {
      return min;
    }
    if (max && this.compareDate(date, max) > 0) {
      return max;
    }
    return date;
  }
}
