firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    $("h3").text(`Welcome, ${user.displayName}`);
    var db = firebase.database();
    var ref = db.ref(`users/${user.uid}`);
    ref
      .once("value", function(snapshot) {
        var now = new Date();
        var isPro = snapshot.val().isPro;
        if (isPro) {
          $(".desc").text(`🥂 You're a Pro member! 🍾`);
          $(".action").css("display", "none");
          $("#why").css("display", "none");
        } else if (new Date(snapshot.val().trialExpiration) > now) {
          var time = new Date(snapshot.val().trialExpiration);
          $(".desc").text(
            `⏳ Your free trial ends on ${time.getMonth() +
              1}/${time.getDate() + 1}/${time.getFullYear() % 100} ⏳`
          );

          $("#unsub").css("display", "none");
        } else {
          var time = new Date(snapshot.val().trialExpiration);
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
