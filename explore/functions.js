var urlParams = getUrlVars();
var rank = urlParams.rank || "score";
var sector = urlParams.sector || "all";
var page = parseInt(urlParams.page || 0);
console.log(urlParams);

for (var key of Object.keys(urlParams)) {
  $(`.${key} select`).val(urlParams[key]);
}

$("select").change(function() {
  sector = $(".sector select").val();
  rank = $(".rank select").val();
  goToNewUrl(sector, rank, 0);
});

console.log(toNormalCase(sector));

$.ajax({
  url: `http://stock-ranking.herokuapp.com/explore/${encodeURIComponent(
    toNormalCase(sector)
  )}/${rank}/${page}`,
  success: function(companies) {
    console.log(companies);
    if (page > 0 && companies.length == 0) {
      goToNewUrl(sector, rank, 0);
    }
    for (var i = companies.length - 1; i >= 0; i--) {
      var company = companies[i];
      var html = `<a class="company" href="../quote/?symbol=${company.symbol.toLowerCase()}"> <p class="symbol"> ${
        company.symbol
      } </p> <p class="companyName"> ${
        company.name
      } </p> <p class="sectorLabel"> ${
        company.sector
      } </p> <p class="rank ${toCamelCase(company.sector)}Gradient"> ${i +
        1 +
        page * 20} </p> ${getSVG(
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
      $("#companies").prepend(html);
    }
    $(".loader").css("display", "none");
    $(".needsToRender").removeClass("invisible");
  }
});

var numPages = Infinity;

$.ajax({
  url: `http://stock-ranking.herokuapp.com/pagecount/${encodeURIComponent(
    toNormalCase(sector)
  )}`,
  success: function(res) {
    numPages = res.count;
    if (page == numPages - 1) {
      $("#next, #last").addClass("inactive");
    }
  }
});

if (page == 0) {
  $("#first, #prev").addClass("inactive");
}

$("#first").click(function() {
  goToNewUrl(sector, rank, 0);
});

$("#prev").click(function() {
  goToNewUrl(sector, rank, page - 1);
});

$("#next").click(function() {
  if (numPages > 0) goToNewUrl(sector, rank, page + 1);
});

$("#last").click(function() {
  if (numPages > 0) goToNewUrl(sector, rank, numPages - 1);
});

function goToNewUrl(sector, rank, page) {
  page = Math.min(numPages - 1, Math.max(0, page));
  var baseUrl = window.location.href.split("?")[0];
  window.location.replace(
    baseUrl + `?sector=${sector}&rank=${rank}&page=${page}`
  );
}

function toNormalCase(str) {
  var out = "";
  if (str.length > 0) {
    out += str.charAt(0).toUpperCase();
  }
  for (var i = 1; i < str.length; i++) {
    if (str.charAt(i).toUpperCase() === str.charAt(i)) {
      out += " ";
    }
    out += str.charAt(i);
  }
  return out;
}

function stripSpaces(str) {
  var start;
  var end;
  for (var i = 0; i < str.length; i++) {
    if (str.charAt(i) != " ") {
      start = i;
      break;
    }
  }
  for (var j = str.length - 1; j >= 0; j--) {
    if (str.charAt(j) != " ") {
      end = j + 1;
      break;
    }
  }
  return str.substring(start, end);
}
