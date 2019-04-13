/* global flatpickr */

import { BaseWidget } from './BaseWidget.js';
import { select, settings } from '../settings.js';
import { utils } from '../utils.js';

export class DatePicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, new Date());
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);
    thisWidget.initPlugin();
  }

  initPlugin() {
    const thisWidget = this;

    thisWidget.minDate = new Date(thisWidget.value);
    thisWidget.maxDate = utils.addDays(new Date(), settings.datePicker.maxDaysInFuture);

    // [NEW] Add flatpickr plugin, default as flatpickr(yourElement, configOptions);
    flatpickr(thisWidget.dom.input, {
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      locale: {
        firstDayOfWeek: 1 // start week on Monday
      },
      disable: [
        function (date) {
          // return true to disable all Mondays
          return (date.getDay() === 1);
        }
      ],
      onChange: function (selectedDates, dateStr) {
        thisWidget.value = dateStr;
      }
    });
  }

  parseValue(newValue) {
    return newValue;
  }

  isValid() {
    return true;
  }

  renderValue() {
  }
}
