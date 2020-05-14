firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    $("h3").text(`Welcome, ${user.displayName}`);
    var verification = (user.emailVerified ? "" : "un") + "verified";
    var h4Html = `${user.email}, <span class="${verification}">${verification}`;
    if (!user.emailVerified)
      h4Html += `<br /><span class="resend">Send verification email</span>`;
    $("h4").html(h4Html);
    var db = firebase.database();
    var ref = db.ref(`users/${user.uid}`);
    ref
      .once("value", function(snapshot) {
        var now = new Date();
        var isPro = snapshot.val().isPro ? true : false;
        var tempDate = new Date();
        var time = snapshot.val().trialExpiration
          ? new Date(snapshot.val().trialExpiration)
          : tempDate.setDate(tempDate.getDate() + 7);
        if (isPro === true) {
          $(".desc").text(`🥂 You're a Pro member! 🍾`);
          $(".action").css("display", "none");
          $("#why").css("display", "none");
        } else if (time > now) {
          $(".desc").text(
            `⏳ Your free trial ends on ${time.getMonth() +
              1}/${time.getDate() + 1}/${time.getFullYear() % 100} ⏳`
          );
          $("#unsub").css("display", "none");
        } else {
          $(".desc").text(
            `⌛ Your free trial ended on ${time.getMonth() +
              1}/${time.getDate() + 1}/${time.getFullYear() % 100} ⌛`
          );
          $(".action").text("Become a Pro!");
        }
      })
      .then(function() {
        $("#content").removeClass("invisible");
      });
  } else {
    window.location.href = "./login";
  }
});

$("#signOut").click(function() {
  firebase.auth().signOut();
});

$(document).on("click", ".resend", function() {
  firebase
    .auth()
    .currentUser.sendEmailVerification()
    .then(function() {
      alert("Verification email sent");
    })
    .catch(function(error) {
      alert("We've encountered an error");
    });
});

$(".action").click(function() {
  // if (firebase.auth().currentUser.emailVerified === false) {
  //   alert("You need to verify your email before becoming a Pro member");
  //   return;
  // }
  var stripe = Stripe("pk_test_Th4JkFYAic5iEtvkKBf1cTv600fkIT8gwT"); //Stripe("pk_live_nL2eBNFYDbE9gT18kWyPB92y00QpdTDTk5");
  var checkoutButton = document.getElementById(
    "checkout-button-plan_HF3C1YRHG8Ttiu"
  );
  var parts = window.location.href.split("/");
  parts.pop();
  parts[parts.length - 1] = "account";
  var success = parts.join("/");
  // parts.pop();
  // var cancel = parts.join("/");
  stripe
    .redirectToCheckout({
      items: [{ plan: "plan_HF9578s0VACzdH", quantity: 1 }], //items: [{ plan: "plan_HF3C1YRHG8Ttiu", quantity: 1 }],

      // Do not rely on the redirect to the successUrl for fulfilling
      // purchases, customers may not always reach the success_url after
      // a successful payment.
      // Instead use one of the strategies described in
      // https://stripe.com/docs/payments/checkout/fulfillment
      successUrl: success,
      cancelUrl: success,
      clientReferenceId: firebase.auth().currentUser.uid,
      customerEmail: firebase.auth().currentUser.email
    })
    .then(function(result) {
      if (result.error) {
        console.log(result.error);
      }
    });
});

$("#changeName").focusout(function() {
  changeName();
});

$("#changeName").on("keypress", function(e) {
  if (e.which === 13) {
    changeName();
  }
});

function changeName() {
  if ($("#changeName").val() != "") {
    firebase
      .auth()
      .currentUser.updateProfile({
        displayName: $("#changeName").val()
      })
      .then(function() {
        location.reload();
      });
  }
}

$("#resetPassword").click(function() {
  firebase
    .auth()
    .sendPasswordResetEmail(firebase.auth().currentUser.email)
    .then(function() {
      alert("Password reset email sent");
    })
    .catch(function(error) {
      alert("We've encountered an error");
    });
});

$("#unsub").click(function() {
  alert("try to unsub");
  firebase
    .auth()
    .currentUser.getIdToken(true)
    .then(function(token) {
      $.ajax({
        //stock-ranking.herokuapp.com
        url: `http://stock-ranking.herokuapp.com/unsubscribe/${encodeURIComponent(
          token
        )}`,
        error: function(error) {
          alert("Sorry, an error occurred.");
        },
        success: function(result) {
          alert(
            "Success! Your subscription has been set to terminate at the end of the current payment term."
          );
          location.reload();
        }
      });
    });
});
