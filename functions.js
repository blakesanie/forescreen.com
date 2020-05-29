console.log("here");
function makeAPICall() {
  $.ajax({
    url: `http://stock-ranking.herokuapp.com/overview/${
      firebase.auth().currentUser ? firebase.auth().currentUser.uid : "null"
    }`, //stock-ranking.herokuapp.com
    success: function(companies) {
      console.log(companies);
      var overall = [];
      var topSales = [];
      var sectors = {};
      for (var company of companies) {
        if (company.scoreRank < 11) {
          overall.push(company);
        }
        if (company.saleScoreRank < 11) {
          topSales.push(company);
        }
        if (company.scoreSectorRank < 6) {
          if (sectors[company.sector] === undefined) {
            sectors[company.sector] = [];
          }
          sectors[company.sector].push(company);
        }
      }
      // rank in reverse for prepend
      overall.sort(function(a, b) {
        return a.scoreRank - b.scoreRank;
      });
      topSales.sort(function(a, b) {
        return a.saleScoreRank - b.saleScoreRank;
      });
      for (var key of Object.keys(sectors)) {
        sectors[key].sort(function(a, b) {
          return a.scoreSectorRank - b.scoreSectorRank;
        });
      }
      for (var i = 0; i < overall.length && i < 5; i++) {
        renderCompany(
          overall[i],
          ".overall .companyCenterHolder",
          "scoreRank",
          i + "id" + i
        );
      }
      for (var i = 0; i < topSales.length && i < 5; i++) {
        renderCompany(
          topSales[i],
          ".topSales .companyCenterHolder",
          "saleScoreRank",
          -i + "id" + "ok"
        );
      }
      var sectorNames = Object.keys(sectors);
      sectorNames.sort();
      for (var sector of sectorNames) {
        renderSectorSection(sector);
        for (var i = 0; i < 3 && i < sectors[sector].length; i++) {
          renderSectorCompany(sectors[sector][i]);
        }
      }
      console.table(overall);
      console.table(topSales);
      console.log(sectors);
      $(".loader").css("display", "none");
      $(".needsToRender").removeClass("invisible");
    }
  });
}

function renderSectorSection(sector) {
  var html = `<div class="sector ${toCamelCase(
    sector
  )}"> <div class="sectorNameHolder"> <h4 class="${toCamelCase(
    sector
  )}Gradient">${sector}</h4> </div> <a class="company"  href="./explore/?sector=${toCamelCase(
    sector
  )}"> <p class="viewMore"> View more </p> </a> </div>`;
  $("#sectors").append(html);
}

function renderCompany(company, selector, rankType, id) {
  var html = `<a class="company symbol${
    company.symbol
  }" href="./quote/?symbol=${company.symbol.toLowerCase()}"> <p class="symbol"> ${
    company.symbol
  }<span class="likeHolder"><img class="outline" src="https://img.icons8.com/material-outlined/96/000000/like.png"/><img class="foreground ${
    company.liked ? "liked" : ""
  }" src="https://img.icons8.com/material/96/000000/like--v1.png"/></span></p> <p class="companyName"> ${
    company.name
  } </p> <p class="sectorLabel"> ${
    company.sector
  } </p> <p class="rank ${toCamelCase(company.sector)}Gradient"> ${
    company[rankType]
  } </p> ${getSVG(
    company,
    0.5,
    id
  )} <div class="statsHolder"> <div class="stat"> <p class="statValue"> ${
    company.scoreRank
  }<sup>${getRankSuffix(
    company.scoreRank
  )}</sup> </p> <p class="statDesc"> Overall </p> </div> <div class="stat"> <p class="statValue"> ${Math.round(
    company.roi * 100
  )}<sup>%</sup> </p> <p class="statDesc"> Annual Gain </p> </div> <div class="stat"> <p class="statValue"> $${getFormattedMarketCap(
    company.marketCap
  )}<sup>${getMarketCapSuffix(
    company.marketCap
  )}</sup> </p> <p class="statDesc"> Market Cap. </p> </div> </div> </a>`;
  $(selector + " .company:last-child").before(html);
}

function renderTopSalesCompany(company) {}

function renderSectorCompany(company) {
  console.log(company);
  var html = `<a class="company symbol${
    company.symbol
  }" href="./quote/?symbol=${company.symbol}"> <p class="symbol"> ${
    company.symbol
  } <span class="likeHolder"><img class="outline" src="https://img.icons8.com/material-outlined/96/000000/like.png"/><img class="foreground ${
    company.liked ? "liked" : ""
  }" src="https://img.icons8.com/material/96/000000/like--v1.png"/></span></p> <p class="companyName"> ${
    company.name
  } </p> <p class="rank ${toCamelCase(company.sector)}Gradient"> ${
    company.scoreSectorRank
  } </p> <div class="statsHolder"> <div class="stat"> <p class="statValue"> ${
    company.scoreRank
  }<sup>${getRankSuffix(
    company.scoreRank
  )}</sup> </p> <p class="statDesc"> Overall </p> </div> <div class="stat"> <p class="statValue"> ${Math.round(
    company.roi * 100
  )}<sup>%</sup> </p> <p class="statDesc"> Annual Gain </p> </div> <div class="stat"> <p class="statValue"> $${getFormattedMarketCap(
    company.marketCap
  )}<sup>${getMarketCapSuffix(
    company.marketCap
  )}</sup> </p> <p class="statDesc"> Market Cap. </p> </div> </div> </a>`;
  $("." + toCamelCase(company.sector) + " .company:last-child").before(html);
}

firebase.auth().onAuthStateChanged(function(user) {
  makeAPICall();
});
