firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    var db = firebase.database();
    var ref = db.ref(`users/${user.uid}`);
    ref.once("value", function(snapshot) {
      var now = new Date();
      console.log(
        new Date(snapshot.val().expiration) >= now,
        snapshot.val().isPro
      );
      if (new Date(snapshot.val().expiration) >= now && snapshot.val().isPro) {
        $("#join")
          .removeAttr("href")
          .text("You're already a member!");
      }
    });
  }
});
