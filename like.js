$("body").on("click", ".likeHolder .foreground", function(e) {
  e.preventDefault();
  var button = $(e.target);
  var symbol = button
    .parent()
    .parent()
    .text()
    .trim();
  if (button.hasClass("liked")) {
    var ref = firebase
      .database()
      .ref(`users/${firebase.auth().currentUser.uid}/likes/${symbol}`);
    ref.remove();
    $(`.symbol${symbol} .likeHolder .foreground`).removeClass("liked");
  } else {
    if (firebase.auth().currentUser) {
      var ref = firebase
        .database()
        .ref(`users/${firebase.auth().currentUser.uid}/likes`);
      var obj = {};
      obj[symbol] = true;
      console.log(obj);
      ref
        .update(obj)
        .then(function() {
          console.log($(this));
          $(`.symbol${symbol} .likeHolder .foreground`).addClass("liked");
        })
        .catch(function() {
          alert(`An error occurred when trying to save ${symbol}`);
        });
    } else {
      window.location.href = "/features";
    }
  }
});
