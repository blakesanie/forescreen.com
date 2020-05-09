firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    var db = firebase.database();
    var ref = db.ref(`users/${user.uid}`);
    ref.once("value", function(snapshot) {
      if (snapshot.val().isPro) {
        $("#join")
          .removeAttr("href")
          .text("You're already a member!");
      }
    });
  }
});
