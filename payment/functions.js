firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    var db = firebase.database();
    var ref = db.ref(`users/${user.uid}`);
    ref
      .once("value", function(snapshot) {
        var now = new Date();
        var isPro = snapshot.val().isPro;
        if (isPro) {
          window.location.replace("/account");
        } else {
        }
      })
      .then(function() {
        $("#content").removeClass("invisible");
      });
  } else {
      window.location.href = "/account/login";
    //window.location.href = "./login";
  }
});

// var stripe = Stripe("pk_live_nL2eBNFYDbE9gT18kWyPB92y00QpdTDTk5");
//
// // Create an instance of Elements.
// var elements = stripe.elements();
//
// // Custom styling can be passed to options when creating an Element.
// // (Note that this demo uses a wider set of styles than the guide below.)
// var style = {
//   base: {
//     color: "#32325d",
//     fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
//     fontSmoothing: "antialiased",
//     fontSize: "16px",
//     "::placeholder": {
//       color: "#aab7c4"
//     }
//   },
//   invalid: {
//     color: "#fa755a",
//     iconColor: "#fa755a"
//   }
// };
//
// // Create an instance of the card Element.
// var card = elements.create("card", { style: style });
//
// // Add an instance of the card Element into the `card-element` <div>.
// card.mount("#card-element");
//
// card.addEventListener("change", function(event) {
//   var displayError = document.getElementById("card-errors");
//   if (event.error) {
//     displayError.textContent = event.error.message;
//   } else {
//     displayError.textContent = "";
//   }
// });
//
// // Handle form submission.
// var form = document.getElementById("payment-form");
// form.addEventListener("submit", function(event) {
//   event.preventDefault();
//
//   stripe.createToken(card).then(function(result) {
//     if (result.error) {
//       // Inform the user if there was an error.
//       var errorElement = document.getElementById("card-errors");
//       errorElement.textContent = result.error.message;
//     } else {
//       // Send the token to your server.
//       stripeTokenHandler(result.token);
//     }
//   });
// });
//
// /**
//  * Payment Request Element
//  */
// var paymentRequest = stripe.paymentRequest({
//   country: "US",
//   currency: "usd",
//   total: {
//     amount: 2500,
//     label: "Total"
//   },
//   requestShipping: true,
//   shippingOptions: [
//     {
//       id: "free-shipping",
//       label: "Free shipping",
//       detail: "Arrives in 5 to 7 days",
//       amount: 0
//     }
//   ]
// });
// paymentRequest.on("token", function(result) {
//   var example = document.querySelector(".example5");
//   example.querySelector(".token").innerText = result.token.id;
//   example.classList.add("submitted");
//   result.complete("success");
// });
//
// var paymentRequestElement = elements.create("paymentRequestButton", {
//   paymentRequest: paymentRequest,
//   style: {
//     paymentRequestButton: {
//       theme: "light"
//     }
//   }
// });
//
// paymentRequest.canMakePayment().then(function(result) {
//   if (result) {
//     // document.querySelector(".example5 .card-only").style.display = "none";
//     // document.querySelector(
//     //   ".example5 .payment-request-available"
//     // ).style.display =
//     //   "block";
//     paymentRequestElement.mount("#paymentRequest");
//   }
// });
//
// // Submit the form with the token ID.
// function stripeTokenHandler(token) {
//   // Insert the token ID into the form so it gets submitted to the server
//   var form = document.getElementById("payment-form");
//   var hiddenInput = document.createElement("input");
//   hiddenInput.setAttribute("type", "hidden");
//   hiddenInput.setAttribute("name", "stripeToken");
//   hiddenInput.setAttribute("value", token.id);
//   form.appendChild(hiddenInput);
//
//   // Submit the form
//   form.submit();
// }
