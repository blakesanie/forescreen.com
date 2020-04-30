console.log("here");
$.ajax({
  url: "http://stock-ranking.herokuapp.com/overview/",
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
      return b.scoreRank - a.scoreRank;
    });
    topSales.sort(function(a, b) {
      return b.saleScoreRank - a.saleScoreRank;
    });
    for (var key of Object.keys(sectors)) {
      sectors[key].sort(function(a, b) {
        return b.scoreSectorRank - a.scoreSectorRank;
      });
    }
    for (var i = 0; i < overall.length; i++) {
      renderCompany(overall[i], ".overall", "scoreRank", i);
    }
    for (var i = 0; i < topSales.length; i++) {
      renderCompany(topSales[i], ".topSales", "saleScoreRank", -i);
    }
    var sectorNames = Object.keys(sectors);
    sectorNames.sort();
    for (var sector of sectorNames) {
      renderSectorSection(sector);
      for (var i = 0; i < sectors[sector].length; i++) {
        renderSectorCompany(sectors[sector][i]);
      }
    }
    console.table(overall);
    console.table(topSales);
    console.log(sectors);
    $(".needsToRender").removeClass("invisible");
  }
});

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
  var html = `<a class="company" href="./quote/?symbol=${company.symbol.toLowerCase()}"> <p class="symbol"> ${
    company.symbol
  } </p> <p class="companyName"> ${company.name} </p> <p class="sectorLabel"> ${
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
  $(selector).prepend(html);
}

function renderTopSalesCompany(company) {}

function renderSectorCompany(company) {
  var html = `<a class="company" href="./quote/?symbol=${
    company.symbol
  }"> <p class="symbol"> ${company.symbol} </p> <p class="companyName"> ${
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
  $("." + toCamelCase(company.sector) + " .sectorNameHolder").after(html);
}
