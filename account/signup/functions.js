$(".submit").click(function() {
  if ($("#name").val().length == 0) {
    alert("Please enter your full name");
    return;
  }
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
    .createUserWithEmailAndPassword($("#email").val(), $("#password").val())
    .catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(errorMessage);
    });
});

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    if ($("#name").val() != "") {
      user
        .updateProfile({
          displayName: $("#name").val()
        })
        .then(function() {
          goToAccountPage();
        });
    } else {
      goToAccountPage();
    }
  } else {
    $("#content").removeClass("invisible");
  }
});

function goToAccountPage() {
  window.location.href = "/account";
}

/*
var oneTaskDone = false;
setInDB().then(function() {
    if (oneTaskDone)
  goToAccountPage();
  oneTaskDone = true;
})
user
.updateProfile({
  displayName: $("#name").val()
})
.then(function() {
    if (oneTaskDone)
  goToAccountPage();
  oneTaskDone = true;
});
*/
