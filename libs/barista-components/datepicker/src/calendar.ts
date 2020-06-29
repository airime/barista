/**
 * @license
 * Copyright 2020 Dynatrace LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { DtDateAdapter } from '@dynatrace/barista-components/core';

const DAYS_PER_WEEK = 7;

interface DtCalendarCell<D> {
  displayValue: string;
  value: number;
  rawValue: D;
}

@Component({
  selector: 'dt-calendar',
  templateUrl: 'calendar.html',
  styleUrls: ['calendar.scss'],
  host: {
    class: 'dt-calendar',
  },
  encapsulation: ViewEncapsulation.Emulated,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DtCalendar<D> {
  /**
   * The date to display in this month view (everything other than the month and year is ignored).
   */
  @Input()
  get startAt(): D | null {
    return this._startAt;
  }
  set startAt(value: D | null) {
    this._startAt = this._getValidDateOrNull(value);
  }
  private _startAt: D | null;

  /** The currently selected date. */
  @Input()
  get selected(): D | null {
    return this._selected;
  }
  set selected(value: D | null) {
    this._selected = this._getValidDateOrNull(value);
  }
  private _selected: D | null = null;

  /** The minimum selectable date. */
  @Input()
  get minDate(): D | null {
    return this._minDate;
  }
  set minDate(value: D | null) {
    this._minDate = this._getValidDateOrNull(value);
  }
  private _minDate: D | null;

  /** The maximum selectable date. */
  @Input()
  get maxDate(): D | null {
    return this._maxDate;
  }
  set maxDate(value: D | null) {
    this._maxDate = this._getValidDateOrNull(value);
  }
  private _maxDate: D | null;

  get activeDate(): D {
    return this._activeDate;
  }
  set activeDate(value: D) {
    const validDate =
      this._getValidDateOrNull(value) ?? this._dateAdapter.today();
    this._activeDate = this._dateAdapter.clampDate(
      validDate,
      this._minDate,
      this._maxDate,
    );
    this._init();
  }
  private _activeDate: D;

  /** The names of the weekdays. */
  _weekdays: { long: string; short: string }[];

  /** Grid of calendar cells representing the dates of the month. */
  _weeks: DtCalendarCell<D>[][];

  /** The number of blank cells to put at the beginning for the first row. */
  _firstRowOffset: number;

  constructor(
    private _dateAdapter: DtDateAdapter<D>,
    private _changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngAfterContentInit(): void {
    this.activeDate = this.activeDate;
  }

  /** Checks whether the provided date cell is the currently selected one. */
  _isSelected(cell: DtCalendarCell<D>): boolean {
    return (
      this._selected !== null &&
      cell.rawValue !== null &&
      this._dateAdapter.compareDate(cell.rawValue, this._selected) === 0
    );
  }

  private _init(): void {
    this._initWeekdays();
    this._initWeeks();

    this._changeDetectorRef.markForCheck();
  }

  private _initWeekdays(): void {
    const firstDayOfWeek = this._dateAdapter.getFirstDayOfWeek();
    const shortWeekdays = this._dateAdapter.getDayOfWeekNames('short');
    const longWeekdays = this._dateAdapter.getDayOfWeekNames('long');

    const weekdays = longWeekdays.map((long, i) => ({
      long,
      short: shortWeekdays[i],
    }));
    this._weekdays = weekdays
      .slice(firstDayOfWeek)
      .concat(weekdays.slice(0, firstDayOfWeek));
  }

  private _initWeeks(): void {
    const daysInMonth = this._dateAdapter.getNumDaysInMonth(this.activeDate);
    const dateNames = this._dateAdapter.getDateNames();
    const firstOfMonth = this._dateAdapter.createDate(
      this._dateAdapter.getYear(this.activeDate),
      this._dateAdapter.getMonth(this.activeDate),
      1,
    );
    const firstWeekOffset =
      (DAYS_PER_WEEK +
        this._dateAdapter.getDayOfWeek(firstOfMonth) -
        this._dateAdapter.getFirstDayOfWeek()) %
      DAYS_PER_WEEK;

    let weeks: DtCalendarCell<D>[][] = [[]];
    for (let i = 0, cell = firstWeekOffset; i < daysInMonth; i++, cell++) {
      if (cell == DAYS_PER_WEEK) {
        weeks.push([]);
        cell = 0;
      }
      const date = this._dateAdapter.createDate(
        this._dateAdapter.getYear(this.activeDate),
        this._dateAdapter.getMonth(this.activeDate),
        i + 1,
      );

      weeks[weeks.length - 1].push({
        value: i + 1,
        displayValue: dateNames[i],
        rawValue: date,
      } as DtCalendarCell<D>);
    }
    this._weeks = weeks;
    this._firstRowOffset =
      weeks && weeks.length && weeks[0].length
        ? DAYS_PER_WEEK - weeks[0].length
        : 0;
  }

  private _getValidDateOrNull(obj: any): D | null {
    return this._dateAdapter.isDateInstance(obj) &&
      this._dateAdapter.isValid(obj)
      ? obj
      : null;
  }
}
