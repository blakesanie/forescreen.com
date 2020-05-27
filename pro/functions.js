firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    var db = firebase.database();
    var ref = db.ref(`users/${user.uid}/data`);
    ref.once("value", function(snapshot) {
      if (snapshot.val().isPro === true) {
        $("#join")
          .removeAttr("href")
          .text("You're already a member!");
      }
    });
  }
});
