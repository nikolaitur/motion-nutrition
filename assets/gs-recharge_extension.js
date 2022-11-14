// utils

(() => {
  let rechargeExecuted = false;

  const rechargeInitFn = () => {
    //const rechargeContainer = document.querySelectorAll('.rc-custom-injection-point');
    const getProductId = Shopify.productIdSubscription;
    console.log(getProductId);

    Array.from(getProductId).forEach((id, index) => {
      console.log(id);

      window.ReChargeWidget.createWidget({
        productId: id,
        injectionParent: `.rc-custom-injection-point-${id}`,
        selectors: {
          price: [".my-price-selector"], // the selectors that will be updated based on subscription
          variant: [".variant-selector"], // The variants to watch for to update the subscription prices
        },
      });
    });
  };

  setInterval(() => {
    const rechargeInit = window.ReChargeWidget;

    if (rechargeInit && !rechargeExecuted) {
      rechargeInitFn();
      rechargeExecuted = true;
    }
  }, 100);
})();

class RechargeExtension extends HTMLElement {
  constructor() {
    super();
    this._executed = false;
    this._optionsState = false;

    this._containerSelector = this.querySelector(".gs-custom__recharge");
    this._quantityInputSelector = this.querySelector(".gs-quantity__hide");

    this._subscriptionClass = "gs-recharge_subs";
    this._subscriptionInnerClass = "gs-recharge_subs-inner";

    this._noSubscription = Shopify?.rechargeSubscriptionsCopy?.oneTimeBuy;
    this._subscription = Shopify?.rechargeSubscriptionsCopy?.subscription;
    this._monthly = Shopify?.rechargeSubscriptionsCopy?.month;
    this._quarterly = Shopify?.rechargeSubscriptionsCopy?.quarter;

    this._monthlySubscriptionVariant =
      Shopify?.rechargeSubscriptionsCopy?.monthDesc;
    this._quarterlySubscriptionVariant =
      Shopify?.rechargeSubscriptionsCopy?.quarterDesc;

    this.initialDomLoad();

    console.log(Shopify.rechargeSubscriptions);

    this.verifyRecharge();
  }

  renderPrice(price, text) {
    const selector = document.querySelector(".gs-custom__price h2");
    selector.innerText = price;

    if (text) {
      const descriptionSelector = document.querySelector(
        ".gs-custom__description"
      );
      descriptionSelector.innerText = text;
    }
  }

  createCheckbox() {
    const checkboxWrapper = document.createElement("div");
    checkboxWrapper.classList.add("checkbox");
    const checkboxInner = document.createElement("span");
    checkboxWrapper.append(checkboxInner);

    return checkboxWrapper;
  }

  createElement(elem, inner, selector, price, parent) {
    const createdElement = document.createElement(elem);

    const generateElements = (element) => {
      const createCheckbox = this.createCheckbox();
      const createText = document.createElement("p");
      const createPrice = document.createElement("p");

      createText.innerText = inner;
      if (price) createPrice.innerText = price;

      element.append(createCheckbox);
      element.append(createText);

      if (price) element.append(createPrice);
    };

    if (parent) {
      let innerElement = document.createElement("div");
      innerElement.classList.add("inner");
      generateElements(innerElement);
      createdElement.append(innerElement);
      createdElement.classList.add(parent);
    } else {
      generateElements(createdElement);
    }

    createdElement.classList.add(selector);

    return createdElement;
  }

  subscriptionQuarterly() {
    document.querySelector(
      ".rc-selling-plans__dropdown"
    ).options[1].selected = true;
    document.querySelector(".select__select").options[2].selected = true;
    this.renderPrice(
      Shopify?.rechargeSubscriptions?.subscriptionQuarterlyPrice,
      this._quarterlySubscriptionVariant
    );
  }

  subscriptionMonthly() {
    document.querySelector(
      ".rc-selling-plans__dropdown"
    ).options[0].selected = true;
    document.querySelector(".select__select").options[1].selected = true;
    this.renderPrice(
      Shopify?.rechargeSubscriptions?.subscriptionPrice,
      this._monthlySubscriptionVariant
    );
  }

  subscription() {
    const rechargeSubs = document.querySelector("[data-radio-subsave]");
    rechargeSubs.click();

    /*
        const rechargeOnce = document.querySelector('[data-radio-onetime]');
        rechargeOnce.disabled = true;
        const rechargeSubs = document.querySelector('[data-radio-subsave]');
        rechargeSubs.checked = true;
        */

    const subs = this.querySelectorAll(".gs-recharge_subs-inner");

    Array.from(subs).forEach((sub, index) => {
      if (sub.classList.contains("active")) {
        index == 0 ? this.subscriptionMonthly() : this.subscriptionQuarterly();
      }
    });
  }

  defaultPayment() {
    const rechargeOnce = document.querySelector("[data-radio-onetime]");
    rechargeOnce.click();

    /*
        const rechargeSubs = document.querySelector('[data-radio-subsave]');
        rechargeSubs.disabled = true;
        const rechargeOnce = document.querySelector('[data-radio-onetime]');
        rechargeOnce.checked = true;
        console.log(rechargeOnce);
        */

    console.log(this.querySelector(".select__select"));

    this.querySelector(".select__select").options[0].selected = true;
    this.renderPrice(Shopify?.rechargeSubscriptions?.defaultPrice);
  }

  selectVariants(element) {
    const select = this.querySelector(".select__select");

    element.classList.contains("parent-subscription")
      ? this.subscription(select)
      : this.defaultPayment(select);
  }

  updateOption(element) {
    element.classList.add("active");
  }

  trackOptions() {
    const childElements = this.querySelectorAll(
      `.${this._subscriptionInnerClass}`
    );

    Array.from(childElements).forEach((child) => {
      child.addEventListener("click", () => {
        Array.from(childElements).forEach((childEl) => {
          childEl.classList.remove("active");
        });

        child.classList.contains("active")
          ? console.log("activ")
          : this.updateOption(child);
      });
    });
  }

  disableOptions() {
    const optionList = this.querySelectorAll(
      `.${this._subscriptionInnerClass}`
    );

    Array.from(optionList).forEach((option) => {
      option.remove();
    });

    this._optionsState = false;
  }

  enableOptions(element) {
    const subscriptionMonthly = this.createElement(
      "div",
      this._monthly,
      this._subscriptionInnerClass
    );

    const subscriptionQuarterly = this.createElement(
      "div",
      this._quarterly,
      this._subscriptionInnerClass
    );

    subscriptionMonthly.classList.add("active");

    element.append(subscriptionMonthly);
    element.append(subscriptionQuarterly);

    this.trackOptions();

    this._optionsState = true;
  }

  disableInput() {
    const selector = this.querySelector(".number-parent input.quantity__input");
    selector.disabled = true;
  }

  enableInput() {
    const selector = this.querySelector(".number-parent input.quantity__input");
    selector.disabled = false;
  }

  addActive(element) {
    element.classList.add("active");
    element.classList.contains("parent-subscription") &&
      !this._optionsState &&
      this.enableOptions(element);
  }

  removeActive(element) {
    //for now not used
    //element.classList.remove("active")
  }

  trackEvents() {
    const elements = this.querySelectorAll(`.${this._subscriptionClass}`);

    Array.from(elements).forEach((element) => {
      element.addEventListener("click", () => {
        Array.from(elements).forEach((el) => {
          el.classList.remove("active");
        });

        element.classList.contains("active")
          ? this.removeActive(element)
          : this.addActive(element);

        element.classList.contains("parent-subscription") &&
        element.classList.contains("active")
          ? this.disableInput()
          : this.disableOptions();

        element.classList.contains("active") &&
          !element.classList.contains("parent-subscription") &&
          this.enableInput();

        this.selectVariants(element);
      });
    });
  }

  initRecharge() {
    console.log(this._Recharge);
    this.trackEvents();

    //const select = document.querySelector('.select__select').options[1].selected = true;
    //select.click();
  }

  initNoSubs() {
    /* For now not used
        setTimeout( () => {
            this._Recharge = document.querySelector('.rc-widget');
            if(!this._Recharge && !this._executed) {
                const subscription = document.querySelector('.parent-subscription.gs-recharge_subs');
                const price = document.querySelector('.gs-custom__price')
                subscription.style.display = 'none';
                price.style.display = 'none';
                this.enableInput();
                let input = document.querySelector('.quantity__input');
                input.max = 1000;
                this._executed = true;
            }
        }, 1000)
        */
  }

  verifyRecharge() {
    setInterval(() => {
      this._Recharge = document.querySelector(".rc-widget");

      if (this._Recharge && !this._executed) {
        this.initRecharge();
        this._executed = true;
      }
    }, 100);
  }

  initialDomLoad() {
    const noSubscription = this.createElement(
      "div",
      this._noSubscription,
      this._subscriptionClass,
      Shopify?.rechargeSubscriptions?.defaultPrice
    );

    const subscriptionBasic = this.createElement(
      "div",
      this._subscription,
      this._subscriptionClass,
      Shopify?.rechargeSubscriptions?.subscriptionPrice,
      "parent-subscription"
    );

    const numberParent = document.createElement("div");
    numberParent.classList.add("number-parent");
    const numberSel = document.querySelector("quantity-input");
    const numberInput = document.createElement("div");
    numberInput.innerHTML = numberSel.outerHTML;
    numberInput.classList.add("number-input");

    noSubscription.classList.add("active");

    this._containerSelector.append(numberParent);

    numberParent.append(noSubscription);
    numberParent.append(numberInput);

    this._containerSelector.append(subscriptionBasic);
  }
}

class ProductRechargeExtension extends RechargeExtension {
  constructor() {
    super();
    this._containerSelector = this.querySelector(".gs-custom__recharge");
  }

  enableOptions(element) {
    const subscriptionMonthly = this.createElement(
      "div",
      this._monthly,
      this._subscriptionInnerClass
    );
    console.log(subscriptionMonthly);

    const subscriptionQuarterly = this.createElement(
      "div",
      this._quarterly,
      this._subscriptionInnerClass
    );

    subscriptionMonthly.classList.add("active");

    element.append(subscriptionMonthly);
    element.append(subscriptionQuarterly);
    console.log(element);

    console.log("apply");

    this.trackOptions();

    this._optionsState = true;
  }

  trackEvents() {
    const elements = this.querySelectorAll(`.${this._subscriptionClass}`);

    Array.from(elements).forEach((element) => {
      element.addEventListener("click", () => {
        Array.from(elements).forEach((el) => {
          el.classList.remove("active");
        });

        element.classList.contains("active")
          ? this.removeActive(element)
          : this.addActive(element);

        element.classList.contains("parent-subscription") &&
        element.classList.contains("active")
          ? console.log("ds")
          : this.disableOptions();

        element.classList.contains("active") &&
          !element.classList.contains("parent-subscription");

        this.selectVariants(element);
      });
    });
  }

  subscription() {
    const rechargeSubs = this.querySelector("[data-radio-subsave]");
    rechargeSubs.click();

    /*
        const rechargeOnce = document.querySelector('[data-radio-onetime]');
        rechargeOnce.disabled = true;
        const rechargeSubs = document.querySelector('[data-radio-subsave]');
        rechargeSubs.checked = true;
        */

    const subs = this.querySelectorAll(".gs-recharge_subs-inner");

    Array.from(subs).forEach((sub, index) => {
      if (sub.classList.contains("active")) {
        index == 0 ? this.subscriptionMonthly() : this.subscriptionQuarterly();
      }
    });
  }

  subscriptionQuarterly() {
    this.querySelector(
      ".rc-selling-plans__dropdown"
    ).options[1].selected = true;
    this.querySelector(".select__select").options[2].selected = true;
  }

  subscriptionMonthly() {
    this.querySelector(
      ".rc-selling-plans__dropdown"
    ).options[0].selected = true;
    this.querySelector(".select__select").options[1].selected = true;
  }

  defaultPayment() {
    const rechargeOnce = this.querySelector("[data-radio-onetime]");
    rechargeOnce.click();
    console.log(this.querySelector(".select__select"));
    this.querySelector(".select__select").options[0].selected = true;
  }

  verifyRecharge() {
    setInterval(() => {
      this._Recharge = document.querySelector(".rc-widget");

      if (this._Recharge && !this._executed) {
        this.initRecharge();
        this._executed = true;
      }
    }, 100);
  }

  initialDomLoad() {
    const noSubscription = this.createElement(
      "div",
      this._noSubscription,
      this._subscriptionClass,
      Shopify?.rechargeSubscriptions?.defaultPrice
    );
    console.log(this._subscription);

    const subscriptionBasic = this.createElement(
      "div",
      "Subscribe & save ↺",
      this._subscriptionClass,
      Shopify?.rechargeSubscriptions?.subscriptionPrice,
      "parent-subscription"
    );

    noSubscription.classList.add("active");
    this._containerSelector.append(noSubscription);
    this._containerSelector.append(subscriptionBasic);
  }
}

class OneTime extends HTMLElement {
  constructor() {
    super();
    this._subscriptionClass = "gs-recharge_subs";
    this._subscriptionInnerClass = "gs-recharge_subs-inner";
    this._noSubscription = Shopify?.rechargeSubscriptionsCopy?.oneTimeBuy;
    this._containerSelector = this.querySelector(".gs-custom__recharge");
    this.domLoad();
  }

  createCheckbox() {
    const checkboxWrapper = document.createElement("div");
    checkboxWrapper.classList.add("checkbox");
    const checkboxInner = document.createElement("span");
    checkboxWrapper.append(checkboxInner);

    return checkboxWrapper;
  }

  createElement(elem, inner, selector, price, parent) {
    const createdElement = document.createElement(elem);

    const generateElements = (element) => {
      const createCheckbox = this.createCheckbox();
      const createText = document.createElement("p");
      const createPrice = document.createElement("p");

      createText.innerText = inner;
      if (price) createPrice.innerText = price;

      element.append(createCheckbox);
      element.append(createText);

      if (price) element.append(createPrice);
    };

    if (parent) {
      let innerElement = document.createElement("div");
      innerElement.classList.add("inner");
      generateElements(innerElement);
      createdElement.append(innerElement);
      createdElement.classList.add(parent);
    } else {
      generateElements(createdElement);
    }

    createdElement.classList.add(selector);
    return createdElement;
  }

  domLoad() {
    const noSubscription = this.createElement(
      "div",
      this._noSubscription,
      this._subscriptionClass,
      Shopify?.rechargeSubscriptions?.defaultPrice
    );

    const numberParent = document.createElement("div");
    numberParent.classList.add("number-parent");
    const numberSel = document.querySelector("quantity-input");
    const numberInput = document.createElement("div");
    numberInput.innerHTML = numberSel.outerHTML;
    numberInput.classList.add("number-input");

    noSubscription.classList.add("active");

    this._containerSelector.append(numberParent);

    numberParent.append(noSubscription);
    numberParent.append(numberInput);

    let inputs = document.querySelectorAll(".quantity__input");

    setTimeout(() => {
      Array.from(inputs).forEach((input) => {
        input.max = 1000;
      });
    }, 100);
  }
}

customElements.define("recharge-extension", RechargeExtension);
customElements.define("recharge-small", ProductRechargeExtension);
customElements.define("recharge-onetime", OneTime);
