import { AmountWidget } from './AmountWidget.js';
import { select, templates, settings, classNames } from '../settings.js';
import { utils } from '../utils.js';
import { DatePicker } from './DatePicker.js';
import { HourPicker } from './HourPicker.js';


export class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  render(element) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.element = utils.createDOMFromHTML(generatedHTML);
    thisBooking.dom.wrapper.appendChild(thisBooking.element);
    console.log('render element', element);

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.selectedTable = thisBooking.dom.wrapper.querySelector(select.booking.selected);
    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });
    thisBooking.submitBooking = thisBooking.dom.wrapper.querySelector(select.booking.bookingSubmit);
    thisBooking.submitBooking.addEventListener('click', function () {
      event.preventDefault();
      if (thisBooking.selectedTable == null) {
        alert('Wybierz wolny stolik');
      } else {
        thisBooking.sendBooking();
      }
    });
  }

  getData() {
    const thisBooking = this;

    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);

    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey];

    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };

    console.log('getData params', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };

    console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function ([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]) {
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  /* [DONE] data aggregation */
  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;
    //console.log('parseData', thisBooking);
    thisBooking.booked = {};

    //console.log('eventsCurrent', eventsCurrent);
    for (let eventCurrent of eventsCurrent) {
      thisBooking.makeBooked(eventCurrent.date, eventCurrent.hour, eventCurrent.duration, eventCurrent.table);
      //console.log('eventCurrent', eventCurrent);
    }

    for (let booking of bookings) {
      thisBooking.makeBooked(booking.date, booking.hour, booking.duration, booking.table);
      //console.log('booking', booking);
    }

    for (let eventRepeat of eventsRepeat) {
      for (let i = 0; i <= settings.datePicker.maxDaysInFuture; i++) {
        thisBooking.makeBooked(utils.dateToStr(utils.addDays(thisBooking.datePicker.minDate, i)), eventRepeat.hour, eventRepeat.duration, eventRepeat.table);
        //console.log('eventRepeat', eventRepeat);
      }
    }
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;
    const hourNumber = utils.hourToNumber(hour);
    if (!thisBooking.booked.hasOwnProperty(date)) {
      thisBooking.booked[date] = {};
    }
    for (let i = 0; i <= duration * 2; i++) {
      //thisBooking.booked[date][hourNumber + i * 0.5] = [table];
      //console.log('thisBooking.booked', thisBooking.booked[date]);
      if (!thisBooking.booked[date].hasOwnProperty(hourNumber + i * 0.5)) {
        thisBooking.booked[date][hourNumber + i * 0.5] = [table.toString()];
      } else {
        thisBooking.booked[date][hourNumber + i * 0.5].push(table.toString());
      }
    }
  }

  updateDOM() {
    const thisBooking = this;
    console.log('updateDOM()');

    /* add current values for date and time */
    //thisBooking.date = utils.dateToStr(thisBooking.datePicker.value); // utils.js:65 Uncaught TypeError: dateObj.toISOString is not a function
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    for (let table of thisBooking.dom.tables) {
      if (thisBooking.booked[thisBooking.date] != null && thisBooking.booked[thisBooking.date][thisBooking.hour] && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(table.getAttribute(settings.booking.tableIdAttribute))) {
        table.classList.add(classNames.booking.tableBooked);
        if (table.classList.contains(classNames.booking.tableBooked)) {
          table.classList.remove(classNames.booking.selected);
          thisBooking.selectedTable = null;
        }
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
    thisBooking.initBooking();
  }

  initBooking() {
    const thisBooking = this;

    for (let table of thisBooking.dom.tables) {
      table.addEventListener('click', function () {
        if (!table.classList.contains(classNames.booking.tableBooked)) {
          for (let tab of thisBooking.dom.tables) {
            tab.classList.remove(classNames.booking.selected);
            thisBooking.selectedTable = null;
          }
          table.classList.add(classNames.booking.selected);
          thisBooking.selectedTable = table.getAttribute('data-table');
        }
      });
    }
  }

  sendBooking() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.selectedTable,
      repeat: false,
      duration: thisBooking.hoursAmount.value,
      ppl: thisBooking.peopleAmount.value,
      starters: []
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      }).then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      });
    thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
    document.location.reload(true);
  }

}
