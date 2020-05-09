var urlParams = getUrlVars();
var rank = urlParams.rank || "score";
var sector = urlParams.sector || "all";
var page = 0;
if (urlParams.page) {
  page = urlParams.page;
  if (page != "last") {
    page = parseInt(page);
  }
}
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

var userStartedAuth = false;
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    userStartedAuth = true;
    user.getIdToken(true).then(function(token) {
      tokenParam = `/${encodeURIComponent(token)}`;
      makeAPICall(tokenParam);
    });
  } else {
    if (userStartedAuth) {
      goToNewUrl(sector, rank, 0);
      return;
    }
    makeAPICall("");
  }
});

var totalPages = 0;

function makeAPICall(tokenParam) {
  $.ajax({
    // stock-ranking.herokuapp.com
    url: `http://stock-ranking.herokuapp.com/explore/${encodeURIComponent(
      toNormalCase(sector)
    )}/${rank}/${page}${tokenParam}`,
    error: function(error) {
      console.error(error);
    },
    success: function(result) {
      var companies = result.companies;
      totalPages = result.numPages;
      page = result.currentPage;
      if (page == totalPages - 1) {
        $("#next, #last").addClass("inactive");
      }
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
      $("div.needsToRender").removeClass("invisible");
    }
  });
}

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
  if ($(this).children(".invisible").length == 1) {
    // has invisible pro marker
    if (page < totalPages - 1) goToNewUrl(sector, rank, page + 1);
  } else {
    window.location.href = "/pro";
  }
});

$("#last").click(function() {
  if ($(this).children(".invisible").length == 1) {
    // has invisible pro marker
    if (page < totalPages - 1) goToNewUrl(sector, rank, "last");
  } else {
    window.location.href = "/pro";
  }
});

function goToNewUrl(sector, rank, page) {
  if (page != "last") page = Math.max(0, page);
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
