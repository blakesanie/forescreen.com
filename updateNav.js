var isProTested = false;

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    if (user.displayName.length > 0) {
      $(".navItem")
        .last()
        .find("h5")
        .text(user.displayName);
    }
    var ref = firebase.database().ref(`users/${user.uid}`);
    ref.on("value", function(snapshot) {
      if (snapshot.val()) {
        var expiration = snapshot.val().expiration;
        if (new Date(expiration) < new Date()) {
          showProMarkers();
        } else {
          removeProMarkers();
        }
      } else {
        showProMarkers();
      }
      isProTested = true;
      $(".authInvolved").removeClass("invisible");
    });
  } else {
    showProMarkers();
    isProTested = true;
    $(".authInvolved").removeClass("invisible");
  }
});

function showProMarkers() {
  $(".proMarker").css("display", "inline");
  $(".proMarker").removeClass("invisible");
}

function removeProMarkers() {
  $(".proMarker").css("display", "none");
  $(".proMarker").addClass("invisible");
}
