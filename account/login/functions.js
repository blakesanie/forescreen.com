$(".submit").click(function() {
  submit();
});

function submit() {
  if ($("#email").val().length == 0) {
    alert("Please enter your email address");
    return;
  }
  if ($("#password").val().length < 8) {
    alert("Your password must be of length 8+");
    return;
  }
  firebase
    .auth()
    .signInWithEmailAndPassword($("#email").val(), $("#password").val())
    .catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(errorMessage);
    });
}

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    goToAccountPage();
  } else {
    $(".needsToRender").removeClass("invisible");
  }
});

function goToAccountPage() {
  window.location.href = "/account";
}

$(document).on("keydown", function(e) {
  if (e.which == 13) {
    submit();
  }
});
