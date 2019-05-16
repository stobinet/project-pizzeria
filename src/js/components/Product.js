import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';

export class Product {
  constructor(id, data) {
    const thisProduct = this;

    /* add product data */
    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    //console.log('new Product:', thisProduct);
  }

  /* add product render method */
  renderInMenu() {
    const thisProduct = this;

    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);
    //console.log(generatedHTML);

    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);

    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);

  }

  getElements() {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion() {
    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) */
    const trigger = thisProduct.accordionTrigger;

    /* click event listener to trigger */
    trigger.addEventListener('click', function (event) {

      /* prevent default action for event */
      event.preventDefault();

      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle('active');

      /* find all active products */
      const activeProducts = document.querySelectorAll('.product.active');

      /* for each active product */
      for (let activeProduct of activeProducts) {

        if (activeProduct != thisProduct.element) {

          /* remove class active for the active product */
          activeProduct.classList.remove('active');

        }
      }

    });

  }

  initOrderForm() {
    const thisProduct = this;
    //console.log('Wywołano metodę initOrderForm()');

    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });

  }

  processOrder() {
    const thisProduct = this;
    //console.log('call the processOrder method');

    /* read all data from the form (using utils.serializeFormToObject) */
    const formData = utils.serializeFormToObject(thisProduct.form);
    //console.log('formData:', formData);

    thisProduct.params = {};

    /* set variable price to equal thisProduct.data.price */
    let price = thisProduct.data.price;
    //console.log('price:', price);

    for (let paramId in thisProduct.data.params) {

      /* save the element in thisProduct.data.params with key paramId */
      const param = thisProduct.data.params[paramId];

      for (let optionId in param.options) {

        /* save the element in param.options with key optionId */
        const option = param.options[optionId];

        /* check if the option is selected */
        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;

        if (optionSelected && !option.default) {

          /* add price of option to variable price */
          price += option.price;

        } else if (!optionSelected && option.default) {

          /* deduct price of option from price */
          price -= option.price;

        }

        // [NEW] find all images of the selected product
        const allImages = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);

        if (optionSelected) {

          if (!thisProduct.params[paramId]) {
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;

          for (let image of allImages) {

            /* set active class for each image of the selected option */
            //image.classList.add('active');
            image.classList.add(classNames.menuProduct.imageVisible);

          }

        } else {

          for (let image of allImages) {

            /* remove active class from each image of the not selected option */
            image.classList.remove('active');

          }

        }

      }

    }

    /* multiply price by amount */
    //price *= thisProduct.amountWidget.value;

    /* set the contents of thisProduct.priceElem to be the value of variable price */
    //thisProduct.priceElem.innerHTML = price;
    //console.log(price);

    /* [NEW] multiply price by amount */
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

    /* [NEW] set the contents of thisProduct.priceElem to be the value of variable price */
    thisProduct.priceElem.innerHTML = thisProduct.price;

    //console.log('thisProduct.params', thisProduct.params);
  }

  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

    thisProduct.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }

  addToCart() {
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    //app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
  }

}
