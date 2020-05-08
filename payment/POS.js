var stripe = Stripe('pk_live_nL2eBNFYDbE9gT18kWyPB92y00QpdTDTk5');
var elements = stripe.elements();

var card = elements.create('card', {
  style: {
    base: {
      iconColor: '#666EE8',
      color: '#31325F',
      lineHeight: '40px',
      fontWeight: 300,
      fontFamily: 'Helvetica Neue',
      fontSize: '15px',

      '::placeholder': {
        color: '#CFD7E0',
      },
    },
  }
});
card.mount('#card-element');

card.addEventListener('change', ({error}) => {
  const displayError = document.getElementById('card-errors');
  if (error) {
    displayError.textContent = error.message;
  } else {
    displayError.textContent = '';
  }
});

var form = document.getElementById('payment-form');

form.addEventListener('submit', function(event) {
  // We don't want to let default form submission happen here,
  // which would refresh the page.
  event.preventDefault();

  stripe.createPaymentMethod({
    type: 'card',
    card: card,
    billing_details: {
        name: form.querySelector('input[name=cardholder-name]').value,
        email: form.querySelector('input[name=cardholder-email]').value,
    }
  }).then(stripePaymentMethodHandler);
});

function stripePaymentMethodHandler(result, email) {
    console.log(result);
}


// function setOutcome(result) {
//
//   if (result.token) {
//     // Use the token to create a charge or a customer
//     // https://stripe.com/docs/charges
//     console.log(result.token);
//   } else if (result.error) {
//     console.log(result.error);
//   }
// }
//
// card.on('change', function(event) {
//   setOutcome(event);
// });
//
// document.querySelector('form').addEventListener('submit', function(e) {
//   e.preventDefault();
//   var form = document.querySelector('form');
//   var extraDetails = {
//     name: form.querySelector('input[name=cardholder-name]').value,
//     email: form.querySelector('input[name=cardholder-email]').value,
//   };
//   stripe.createToken(card, extraDetails).then(setOutcome);
// });
