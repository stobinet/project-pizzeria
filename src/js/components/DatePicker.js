import { BaseWidget } from './BaseWidget.js';
import { select } from '../settings.js';

export class DatePicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, new Date());
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);
    thisWidget.initPlugin();
  }

  initPlugin() {
    const thisWidget = this;
    console.log('initPlugin', thisWidget);
  }
}
