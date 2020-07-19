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
            url: `https://stock-ranking.herokuapp.com/v1/portfolioAdvice/${encodeURIComponent(
              symbolString
            )}/${tokenParam}`,
            success: function(data) {
              console.log(data);
              if (data.accessDenied) {
                alert(data.accessDenied);
                $(".loader").css("display", "none");

                if (!data.accessDenied.includes("track")) {
                  window.location.href = "/features";
                }
                //
                // $("div.needsToRender").removeClass("invisible");
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
  console.table(data.current[0]);
  var minValue = 1;
  var maxValue = 1;
  var maxTick = 0;
  var maxRoi = 0;
  for (var i = 0; i < data.current.length; i++) {
    var xOffset = 200 - data.current[i].stdCloses.length;
    var yearsSince = xOffset / 20;
    var yOffset = Math.pow(1 + data.current[i].roi, yearsSince) * 0.25;
    for (var j = 0; j < data.current[i].stdCloses.length; j++) {
      data.current[i].stdCloses[j] += yOffset;
      maxTick = Math.max(maxTick, data.current[i].stdCloses[j]);
      var value = Math.log(data.current[i].stdCloses[j]);
      value = Math.max(value, 0);
      data.current[i].stdCloses[j] = value;
      minValue = Math.min(minValue, value);
      maxValue = Math.max(maxValue, value);
    }
  }
  for (var i = 0; i < data.suggested.length; i++) {
    var xOffset = 200 - data.suggested[i].stdCloses.length;
    var yearsSince = xOffset / 20;
    var yOffset = Math.pow(1 + data.suggested[i].roi, yearsSince) * 0.25;
    for (var j = 0; j < data.suggested[i].stdCloses.length; j++) {
      data.suggested[i].stdCloses[j] += yOffset;
      maxTick = Math.max(maxTick, data.suggested[i].stdCloses[j]);
      var value = Math.log(data.suggested[i].stdCloses[j]);
      data.suggested[i].stdCloses[j] = value;
      minValue = Math.min(minValue, value);
      maxValue = Math.max(maxValue, value);
    }
    //maxRoi = Math.max(maxRoi, stock.roi)
  }
  var sizes = ["wide", "tall"];
  var aspectRatios = {
    wide: 0.45,
    tall: 1
  };
  var svgs = [];
  for (var size of sizes) {
    var thickness = size == "wide" ? 0.8 : 1.2;
    for (var i = 0; i < data.current.length; i++) {
      var stock = data.current[i];
      svgs.unshift(
        getSVGForOverlay(
          stock,
          "current " + size,
          aspectRatios[size],
          minValue,
          maxValue,
          i,
          thickness,
          0
        )
      );
    }
    for (var i = 0; i < data.suggested.length; i++) {
      var stock = data.suggested[i];
      svgs.unshift(
        getSVGForOverlay(
          stock,
          "suggested " + size,
          aspectRatios[size],
          minValue,
          maxValue,
          i,
          thickness,
          0
        )
      );
    }
  }
  for (var svg of svgs) {
    $("#svgStack").append(svg);
  }
  var yRange = maxValue - minValue;
  $("#axis").append(`<p class="tick">${Math.round(maxTick * 100)}%</p>`);
  $("#axis").append(
    `<p class="tick" style="top: ${(maxValue / yRange) * 100}%;">0%</p>`
  );
  handleOverlaySize();
  // setTimeout(function() {
  //   $(".svgCover").remove();
  // }, 3000);
}

var threshold = 600;
function handleOverlaySize() {
  var width = $(window).width();
  if (width > threshold) {
    $(".wide").css("opacity", "1");
    $(".wide")
      .eq(0)
      .css("position", "relative");
    $(".tall").css("opacity", "0");
    $(".tall")
      .eq(0)
      .css("position", "absolute");
  } else {
    $(".wide").css("opacity", "0");
    $(".wide")
      .eq(0)
      .css("position", "absolute");
    $(".tall").css("opacity", "1");
    $(".tall")
      .eq(0)
      .css("position", "relative");
  }
}

$(window).resize(function() {
  handleOverlaySize();
});

function getSVGForOverlay(
  company,
  className,
  aspectRatio,
  min,
  max,
  id,
  thickness,
  radius
) {
  max = max;
  min = min;

  var yRange = max - min;
  // height / width
  var width = 200;
  var coords = [];
  var xOffset = 200 - company.stdCloses.length;
  var yOffset = 0;
  if (xOffset > 0) {
    console.log(yOffset);
  }
  for (var i = 0; i < company.stdCloses.length; i++) {
    coords.push({
      x: i + xOffset,
      y:
        ((yRange - company.stdCloses[i]) / yRange) * width * aspectRatio -
        yOffset
    });
  }
  var path = createRoundedPathString(coords, radius || 0.4);
  var suggestedMaxOpacity = 0.5;
  var styleAttr = `style="opacity: ${
    className.includes("suggested")
      ? Math.max(0.05, suggestedMaxOpacity * (1 - 0.07 * Math.pow(id, 1.5)))
      : 1
  };"`;
  var html = `<div class="svgHolder ${className}"><svg viewbox="0 0 ${width} ${width *
    aspectRatio}" xmlns="http://www.w3.org/2000/svg" ${styleAttr}><path d="${path}" stroke-width="${thickness ||
    0.9}" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg><div class="svgCover"></div></div>`;
  return html;
}
