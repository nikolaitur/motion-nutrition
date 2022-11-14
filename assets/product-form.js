if ((typeof Shopify) === 'undefined') { window.Shopify = {}; }
  /* Get from cart.js returns the cart in JSON */
  if ((typeof Shopify.getCart) === 'undefined') {
  Shopify.getCart = function(callback, cart) {
    var promise = jQuery.Deferred();
    if( !callback){
      callback = promise.resolve;
    }
    if(!cart){    
      var o = (new Date).getTime();
      jQuery.ajax({
        type: "GET",
        url: "/cart.js?_=" + o,
        dataType: "json",
        async: false,
        success: function (cart, textStatus, xhr) {
          if ((typeof callback) === 'function') {
            return callback(cart,textStatus, xhr);
          }
          else if(typeof Shopify.onCartUpdate ==='function') {
            return Shopify.onCartUpdate(cart);
          }
        }
      })
    }else{
      if ((typeof callback) === 'function') {
      callback(cart);
    }else if(typeof Shopify.onCartUpdate ==='function') {
      Shopify.onCartUpdate(cart);
        }
    }
    return promise;
  }
}

class ProductForm extends HTMLElement {
  constructor() {
    super();   
    this.form = this.querySelector('form');
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    this.cartNotification = document.querySelector('cart-notification');
  }
  onSubmitHandler(evt) {
    evt.preventDefault();
    this.cartNotification.setActiveElement(document.activeElement);
    
    const submitButton = this.querySelector('[type="submit"]');

    submitButton.setAttribute('disabled', true);
    submitButton.classList.add('loading');

    const body = JSON.stringify({
      ...JSON.parse(serializeForm(this.form)),
      sections: this.cartNotification.getSectionsToRender().map((section) => section.id),
      sections_url: window.location.pathname
    });

    fetch(`${routes.cart_add_url}`, { ...fetchConfig('javascript'), body })
      .then((response) => response.json())
      .then((parsedState) => {
      console.log(parsedState);
      	var _this = this;
Shopify.getCart(function(cart){
  		$.get("/cart?view=ajax", function(data, status){
			  $("#cart-notification-product").html(data); 
               $('.cart-count-bubble span[aria-hidden="true"]').html(data.item_count);            
		  });
//       jQuery.getJSON('/cart.js', function(cart) {
       $('.cart-count-bubble span[aria-hidden="true"]').html(cart.item_count); 
        if(cart.item_count < 1){
        $("#cart-notification").removeClass('active');
        }
        _this.cartNotification.renderContents(parsedState);
  
});      
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        submitButton.classList.remove('loading');
        submitButton.removeAttribute('disabled');
      });
   }
}
customElements.define('product-form', ProductForm);
