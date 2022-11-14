class CartNotification extends HTMLElement {
  constructor() {
    super();

    this.notification = document.getElementById('cart-notification');
    //this.cardDrawer = document.getElementById('cart-drawerr');
    this.header = document.querySelector('sticky-header');
    this.onBodyClick = this.handleBodyClick.bind(this);
    
    this.notification.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
    this.querySelectorAll('button[type="button"]').forEach((closeButton) =>
      closeButton.addEventListener('click', this.close.bind(this))
    );

  }
  open() {

    //this.cardDrawer.classList.add('current');
	this.notification.classList.add('animate', 'active');
    this.notification.addEventListener('transitionend', () => {
    this.notification.focus();
    trapFocus(this.notification);
    }, { once: true });
    document.body.addEventListener('click', this.onBodyClick);
  }

  close() {
    //this.cardDrawer.classList.remove('current');
    this.notification.classList.remove('active');

    document.body.removeEventListener('click', this.onBodyClick);

    removeTrapFocus(this.activeElement);
  }

  renderContents(parsedState) {
      
      this.productId = parsedState.id;
      this.getSectionsToRender().forEach((section => {
        document.getElementById(section.id).innerHTML =
          this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
      }));

      this.header?.reveal();
      this.open();
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-notification-product',
        selector: `.cart_items_list`,
      },
      {
        id: 'cart-notification-button'
      },
      {
        id: 'cart-icon-bubble'
      }
    ];
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  handleBodyClick(evt) {
    const target = evt.target;
    if (target !== this.notification && !target.closest('cart-notification')) {
      const disclosure = target.closest('details-disclosure');
      this.activeElement = disclosure ? disclosure.querySelector('summary') : null;
      this.close();
    }
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}

customElements.define('cart-notification', CartNotification);
$("#cart-icon-bubble").click(function(e){
 event.preventDefault();
  $.get("/cart?view=ajax", function(data, status){
  $("#cart-notification-product").html(data);    
  $("#cart-notification").addClass('active');   
  });  
});
$("body").on("click", "#cart-notification-product .quantity__button", function(){
$(this).attr('disabled', 'disabled');
});
$("body").on("click", "#cart-notification-product .plus-btn", function(event){
   event.preventDefault();
$(this).parent().find('.submit').click();
});


function addItemToCart (variant_id, quantity, shipping_interval_frequency, shipping_interval_unit_type, subscription_id) {
  data = {
      "quantity": quantity,
      "id": variant_id,
      "properties[shipping_interval_frequency]": shipping_interval_frequency, 
	"properties[shipping_interval_unit_type]": shipping_interval_unit_type,            
	"properties[subscription_id]": subscription_id
    }
  jQuery.ajax({
      type: 'POST',
      url: '/cart/add.js',
      data: data,
      dataType: 'json',
      success: function() { 
        setTimeout(function(){
          window.location.href = '/cart';
        }, 2000);
      }
  });
  //window.location = '/checkout';

}
  

 $("body").on('click', '.product-subscription .product-normal', function(){   
    console.log('here.....');
    if($(this).is(":checked")) {
      $(this).parent().find(".loader").addClass("is-loading");
  	  var id = $(this).val();
      var line = $(this).data("line");
      var vid = $(this).data("variant-id");
      var baseid = $(this).data("base-variant-id");
      var sid = $(this).data("sub-id");
      var sunit = $(this).data("sub-unit");
      var snum = $(this).data("sub-number");
      jQuery.post('/cart/change.js', { quantity: 0, line: line });
      setTimeout(function(){
      	addItemToCart(id , 1, snum, sunit, sid);
      }, 1000);
    }else{

    }
  });
  
  $("body").on('click', '.product-subscription .product-subscribe', function(){
    if($(this).is(":checked")) {
    }else{
      $(this).parent().find(".loader").addClass("is-loading");
      var line = $(this).data("line");
      var vid = $(this).data("variant-id");
      var baseid = $(this).data("base-variant-id");
      jQuery.post('/cart/change.js', { quantity: 0, line: line });
      setTimeout(function(){
      	jQuery.post('/cart/add.js', { quantity: 1, id: baseid });
      }, 1000);
      setTimeout(function(){
      	window.location.href = '/cart';
      }, 2000);
    }
  });
  
  $(".cart .product-subscription").click(function(){
    $(this).find("input").trigger("click");
  });

