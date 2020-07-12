var symbols = [];
localPortfolio = localStorage.getItem("portfolio");
if (localPortfolio) {
  symbols = localPortfolio.split(",");
} else {
  var urlParams = getUrlVars();
  symbols = decodeURIComponent(urlParams.symbols || "").split(",");
  symbols = symbols.filter(function(element) {
    return element != "";
  });
}
console.log(symbols);

$("textarea").val(symbols.join(", "));
autosize($("textarea"));

function getUserSymbols() {
  var arr = $("textarea")
    .val()
    .toUpperCase()
    .split(/[^A-Za-z]/);
  return arr.filter(function(element) {
    return element != "";
  });
}

function getUserSymbolsString() {
  return getUserSymbols().join(",");
}

function setsAreEqual(arr1, arr2) {
  return arr1.sort().join(",") === arr2.sort().join(",");
}

function goToNewUrl() {
  var baseUrl = window.location.href.split("?")[0];
  window.location.replace(baseUrl);
}

$("textarea").focusout(function() {
  if (!firebase.auth().currentUser) {
    goToBasicPage();
    return;
  }
  if ($("textarea").val() != "" && !setsAreEqual(symbols, getUserSymbols())) {
    localStorage.setItem("portfolio", getUserSymbolsString());
    goToNewUrl();
  }
});

$(document, "input").on("keydown", function(e) {
  if (e.which == 13) {
    //going to basic page on keydown triggers alert multiple times, so just refresh page
    e.preventDefault();
    if ($("textarea").val() != "" && !setsAreEqual(symbols, getUserSymbols())) {
      localStorage.setItem("portfolio", getUserSymbolsString());
      goToNewUrl();
    }
  }
});

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function goToBasicPage() {
  // $(".loader").css("display", "none");
  // $("div.needsToRender").addClass("invisible");
  alert("Sorry, the portfolio builder is only available to Pro users.");
  localStorage.removeItem("portfolio");
  window.location.href = "/features";
}

firebase.auth().onAuthStateChanged(function(user) {
  makeAPICall();
});

function makeAPICall() {
  try {
    if (symbols.length > 0) {
      $(".loader").css("display", "block");
      var tokenParam;
      firebase
        .auth()
        .currentUser.getIdToken(true)
        .then(function(token) {
          tokenParam = `${encodeURIComponent(token)}`;
        })
        .then(function() {
          symbols = getUserSymbols();
          symbolString = getUserSymbolsString();
          $.ajax({
            //stock-ranking.herokuapp.com
            url: `https://stock-ranking.herokuapp.com/portfolioAdvice/${encodeURIComponent(
              symbolString
            )}/${tokenParam}`,
            success: function(data) {
              if (data.accessDenied) {
                alert(data.accessDenied);
                $(".loader").css("display", "none");
                $("div.needsToRender").removeClass("invisible");
                window.location.href = "/features";
                return;
              }
              buildComparisonChart(data);
              for (var i = data.suggested.length - 1; i >= 0; i--) {
                var company = data.suggested[i];
                var html = `<a class="company symbol${
                  company.symbol
                }" href="../quote/?symbol=${company.symbol.toLowerCase()}"> <p class="symbol"> ${
                  company.symbol
                } <span class="likeHolder"><img class="outline" src="https://img.icons8.com/material-outlined/96/000000/like.png"/><img class="foreground ${
                  company.liked ? "liked" : ""
                }" src="https://img.icons8.com/material/96/000000/like--v1.png"/></span></p> <p class="companyName"> ${
                  company.name
                } </p> <p class="sectorLabel"> ${
                  company.sector
                } </p> <p class="rank ${toCamelCase(
                  company.sector
                )}Gradient"> ${i + 1} </p> ${getSVG(
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
                )}<sup>%</sup> </p> <p class="statDesc"> Return </p> </td> <td> <p class="statValue"> $${getFormattedMarketCap(
                  company.marketCap
                )}<sup>${getMarketCapSuffix(
                  company.marketCap
                )}</sup> </p> <p class="statDesc"> Market Cap. </p> </td> </tr> </table> </a>`;
                $("#companies h3.aquireTheFollowing").after(html);
              }
              $(".loader").css("display", "none");
              $("div.needsToRender").removeClass("invisible");
            }
          });
        });
    }
  } catch {
    goToBasicPage();
  }
}

function buildComparisonChart(data) {
  console.log(data);
  var minValue = data.suggested[0].stdCloses[0];
  var maxValue = data.suggested[0].stdCloses[0];
  for (var stock of data.current.concat(data.suggested)) {
    for (var close of stock.stdCloses) {
      minValue = Math.min(minValue, close);
      maxValue = Math.max(maxValue, close);
    }
  }
  console.log(minValue, maxValue);
  var aspectRatio = 0.35;
  var currentSvgs = [];
  for (var i = 0; i < data.current.length; i++) {
    var stock = data.current[i];
    currentSvgs.push(
      getSVGForOverlay(
        stock,
        "current",
        aspectRatio,
        minValue,
        maxValue,
        i,
        0.4,
        0
      )
    );
  }
  var suggestedSvgs = [];
  for (var i = 0; i < data.suggested.length; i++) {
    var stock = data.suggested[i];
    suggestedSvgs.push(
      getSVGForOverlay(
        stock,
        "suggested",
        aspectRatio,
        minValue,
        maxValue,
        i,
        0.4,
        0
      )
    );
  }
  console.log(currentSvgs, suggestedSvgs);
  for (var svg of suggestedSvgs) {
    $("#svgStack").append(svg);
  }
  for (var svg of currentSvgs) {
    $("#svgStack").append(svg);
  }
  var yRange = maxValue - minValue;
  $("#axis").append(`<p class="tick">${Math.round(maxValue * 100)}%</p>`);
  $("#axis").append(
    `<p class="tick" style="top: ${(maxValue / yRange) * 100}%;">0%</p>`
  );
}
