import { select, settings } from '../settings.js';
import { BaseWidget } from './BaseWidget.js';

export class AmountWidget extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, settings.amountWidget.defaultValue);
    const thisWidget = this;

    thisWidget.getElements();
    //thisWidget.value = settings.amountWidget.defaultValue;
    //thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions();

    //console.log('AmountWidget:', thisWidget);
    //console.log('constructor arguments:', element);
  }

  getElements() {
    const thisWidget = this;

    //thisWidget.element = element;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(newValue) {
    return !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax;
  }

  renderValue() {
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
    console.log('widget value:', thisWidget.value);
  }

  initActions() {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function () {
      //thisWidget.setValue(thisWidget.input.value);
      thisWidget.value = thisWidget.dom.input.value;
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      //thisWidget.setValue(thisWidget.value + 1);
      thisWidget.value++;
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      //thisWidget.setValue(thisWidget.value - 1);
      thisWidget.value--;
    });
  }

}
