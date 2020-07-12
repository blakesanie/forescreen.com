$(".submit").click(function() {
  submit();
});

function submit() {
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
  if (!$("input[type='checkbox']").is(":checked")) {
    alert("You must acknowledge the Terms and Conditions");
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
}

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    if ($("#name").val() != "") {
      user
        .updateProfile({
          displayName: $("#name").val()
        })
        .then(function() {
          user.sendEmailVerification().then(function() {
            goToAccountPage();
          });
        });
    } else {
      goToAccountPage();
    }
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
