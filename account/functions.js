var urlParams = getUrlVars();

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    if (urlParams.success && urlParams.success == 1) {
      alert(
        "Congratulations! You've become a PRO member. Your account status will be updated within one minute."
      );
    }
    getLikedStocks();
    $("h3").text(`Welcome, ${user.displayName}`);
    var verification = (user.emailVerified ? "" : "un") + "verified";
    var h4Html = `${user.email}, <span class="${verification}">${verification}`;
    if (!user.emailVerified)
      h4Html += `<br /><span class="resend">Send verification email</span>`;
    $("h4").html(h4Html);
    var db = firebase.database();
    var ref = db.ref(`users/${user.uid}/data`);
    var now = new Date();
    var tempDate = new Date();
    console.log(tempDate);
    var time = new Date(tempDate.setDate(tempDate.getDate() + 7));
    console.log(time);
    var isPro = false;
    ref
      .once("value", function(snapshot) {
        if (snapshot.val()) {
          console.log(snapshot.val());
          if (snapshot.val().isPro) {
            isPro = snapshot.val().isPro;
          }
          if (snapshot.val().trialExpiration) {
            time = new Date(snapshot.val().trialExpiration);
          }
        }
      })
      .then(function() {
        if (isPro === true) {
          $(".desc").text(`You're a Pro member!`);
          $(".action").css("display", "none");
          $("#why").css("display", "none");
        } else if (time > now) {
          $(".desc").text(
            `Your free trial ends on ${time.getMonth() + 1}/${time.getDate() +
              1}/${time.getFullYear() % 100}`
          );
          $("#unsub").css("display", "none");
        } else {
          $(".desc").text(
            `Your free trial ended on ${time.getMonth() + 1}/${time.getDate() +
              1}/${time.getFullYear() % 100}`
          );
          $(".action").text("Become a Pro!");
        }
        $(".needsToRender").removeClass("invisible");
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
  if (firebase.auth().currentUser.emailVerified === false) {
    alert("You need to verify your email before becoming a Pro member");
    return;
  }
  var stripe = Stripe("pk_live_nL2eBNFYDbE9gT18kWyPB92y00QpdTDTk5");
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
      items: [{ plan: "price_1Gpy9dACbhl0jE7ZM0nCCVTA", quantity: 1 }], //items: [{ plan: "plan_HF3C1YRHG8Ttiu", quantity: 1 }],

      // Do not rely on the redirect to the successUrl for fulfilling
      // purchases, customers may not always reach the success_url after
      // a successful payment.
      // Instead use one of the strategies described in
      // https://stripe.com/docs/payments/checkout/fulfillment
      successUrl: success + "/?success=1",
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
        window.location.replace(getRefreshUrl());
      });
  }
}

function getRefreshUrl() {
  var url = window.location.href.replace("?success=1", "");
  return url;
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
  if (
    confirm(
      `Are you sure you want to unsubscribe, ${
        firebase.auth().currentUser.displayName
      }?`
    )
  ) {
    firebase
      .auth()
      .currentUser.getIdToken(true)
      .then(function(token) {
        $.ajax({
          //localhost:3001/v1
          url: `https://stock-ranking.herokuapp.com/v1/unsubscribe/${encodeURIComponent(
            token
          )}`,
          error: function(error) {
            alert("Sorry, an error occurred.");
          },
          success: function(result) {
            alert(
              "Success! Your subscription has been set to terminate at the end of the current payment term."
            );
            location.replace(getRefreshUrl());
          }
        });
      });
  }
});

function getLikedStocks() {
  $.ajax({
    // localhost:3001/v1
    url: `https://stock-ranking.herokuapp.com/v1/likedStocks/${
      firebase.auth().currentUser.uid
    }`,
    error: function(error) {
      console.error(error);
    },
    success: function(result) {
      console.log(result);
      if (result) {
        if (result.accessDenied) {
          $("#content h5").text("Liked Stocks (Not Pro)");
          $(".loader").css("display", "none");
          return;
        }
        var companies = result.sort(function(a, b) {
          return a.symbol > b.symbol;
        });
        if (companies.length == 0) {
          $("#content h5").text("Liked Stocks (none)");
          $(".loader").css("display", "none");
          return;
        }
        console.log(companies);
        for (var i = companies.length - 1; i >= 0; i--) {
          var company = companies[i];
          var html = `<a class="company symbol${
            company.symbol
          }" href="../quote/?symbol=${company.symbol.toLowerCase()}"> <p class="symbol"> ${
            company.symbol
          } <span class="likeHolder"><img class="outline" src="https://img.icons8.com/material-outlined/96/000000/like.png"/><img class="foreground liked" src="https://img.icons8.com/material/96/000000/like--v1.png"/></span></p> <p class="companyName"> ${
            company.name
          } </p> <p class="sectorLabel"> ${
            company.sector
          } </p> <p class="rank ${toCamelCase(company.sector)}Gradient"> ${i +
            1} </p> ${getSVG(
            company,
            0.5,
            i
          )} <table cellspacing="0"> <tr> <td> <p class="statValue"> ${
            company.scoreRank
          }<sup>${getRankSuffix(
            company.scoreRank
          )}</sup> </p> <p class="statDesc"> Overall </p> </td> <td> <p class="statValue"> ${
            company.scoreSectorRank
          }<sup>${getRankSuffix(
            company.scoreSectorRank
          )}</sup> </p> <p class="statDesc"> In Sector </p> </td> <td> <p class="statValue"> ${
            company.saleScoreRank
          }<sup>${getRankSuffix(
            company.saleScoreRank
          )}</sup> </p> <p class="statDesc"> Best Discount </p> </td> </tr> <tr> <td> <p class="statValue"> ${
            company.r2Rank
          }<sup>${getRankSuffix(
            company.r2Rank
          )}</sup> </p> <p class="statDesc"> Least Volatile </p> </td> <td> <p class="statValue"> ${Math.round(
            company.roi * 100
          )}<sup>%</sup> </p> <p class="statDesc"> Annual Gain </p> </td> <td> <p class="statValue"> $${getFormattedMarketCap(
            company.marketCap
          )}<sup>${getMarketCapSuffix(
            company.marketCap
          )}</sup> </p> <p class="statDesc"> Market Cap. </p> </td> </tr> </table> </a>`;
          $("#likedStocksContainer").prepend(html);
        }
      }
      $(".loader").css("display", "none");
      $("#likedStocksContainer").removeClass("invisible");
    }
  });
}
