var urlParams = getUrlVars();
var symbols = decodeURIComponent(urlParams.symbols || "").split(",");
console.log(symbols);

$("textarea").val(symbols.join(", "));
autosize($("textarea"));

function getUserSymbols() {
  var arr = $("textarea")
    .val()
    .toUpperCase()
    .split(/[ ,]+/);
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

function goToNewUrl(params) {
  var baseUrl = window.location.href.split("?")[0];
  window.location.replace(baseUrl + `?symbols=${encodeURIComponent(params)}`);
}

$("textarea").focusout(function() {
  if ($("textarea").val() != "" && !setsAreEqual(symbols, getUserSymbols()))
    goToNewUrl(getUserSymbolsString());
});

$(document).on("keypress", function(e) {
  if (
    e.which == 13 &&
    $("textarea").val() != "" &&
    !setsAreEqual(symbols, getUserSymbols())
  ) {
    goToNewUrl(getUserSymbolsString());
  }
});

if (symbols.length > 0) {
  $(".loader").css("display", "block");
  $.ajax({
    url: `http://stock-ranking.herokuapp.com/portfolioAdvice/${encodeURIComponent(
      getUserSymbolsString()
    )}`,
    success: function(companies) {
      console.log(companies);
      for (var i = companies.length - 1; i >= 0; i--) {
        var company = companies[i];
        var html = `<a class="company" href="../quote/?symbol=${company.symbol.toLowerCase()}"> <p class="symbol"> ${
          company.symbol
        } </p> <p class="companyName"> ${
          company.name
        } </p> <p class="sectorLabel"> ${
          company.sector
        } </p> <p class="rank ${toCamelCase(company.sector)}Gradient"> ${i +
          1} </p> ${getSVG(
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
        )}<sup>%</sup> </p> <p class="statDesc"> Annual Gain </p> </td> <td> <p class="statValue"> $${getFormattedMarketCap(
          company.marketCap
        )}<sup>${getMarketCapSuffix(
          company.marketCap
        )}</sup> </p> <p class="statDesc"> Market Cap. </p> </td> </tr> </table> </a>`;
        $("#companies h3").after(html);
      }
      $(".loader").css("display", "none");
      $(".needsToRender").removeClass("invisible");
    }
  });
}
