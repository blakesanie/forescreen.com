console.log("here");
function makeAPICall() {
  $.ajax({
    url: `https://stock-ranking.herokuapp.com/v1/overview/${
      firebase.auth().currentUser ? firebase.auth().currentUser.uid : "null"
    }`, //localhost:3001/v1
    success: function(companies) {
      console.log(companies);
      var overall = [];
      var topSales = [];
      var sectors = {};
      for (var company of companies) {
        if (company.scoreRank < 6) {
          overall.push(company);
        }
        if (company.saleScoreRank < 6) {
          topSales.push(company);
        }
        if (company.scoreSectorRank < 4) {
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
        if (i == 2 || i == 4) {
          $(".overall .companyCenterHolder .company:last-child").before(
            `<div class="adCardHolder"></div>`
          );
        }
        renderCompany(
          overall[i],
          ".overall .companyCenterHolder",
          "scoreRank",
          i + "id" + i
        );
      }

      for (var i = 0; i < topSales.length && i < 5; i++) {
        if (i == 2 || i == 4) {
          $(".topSales .companyCenterHolder .company:last-child").before(
            `<div class="adCardHolder"></div>`
          );
        }
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
      $(".adCardHolder, .sectorAdHolder").each(function() {
        $(
          this
        ).append(`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center; height: 100%; width: 100%;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-6360136649418025"
     data-ad-slot="8953202344"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`);
      });
    }
  });
}

// $(document).ready(function(){(adsbygoogle = window.adsbygoogle || []).push({})});

function renderSectorSection(sector) {
  var html = `<div class="sector ${toCamelCase(
    sector
  )}"> <div class="sectorNameHolder"> <h4 class="${toCamelCase(
    sector
  )}Gradient">${sector}</h4> </div> <a class="company"  href="./explore/?sector=${toCamelCase(
    sector
)}"> <p class="viewMore"> View more </p> </a> <div class="sectorAdHolder"></div></div>`;
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
  } </p> ${getSVG(company, 0.5, id)} <p class="timeFrame">${Math.round(
    ((company.numDataPoints || 520) / 52) * 2
  ) /
    2} yrs</p><div class="statsHolder"> <div class="stat"> <p class="statValue"> ${
    company.scoreRank
  }<sup>${getRankSuffix(
    company.scoreRank
  )}</sup> </p> <p class="statDesc"> Overall </p> </div> <div class="stat"> <p class="statValue"> ${Math.round(
    company.roi * 100
  )}<sup>%</sup> </p> <p class="statDesc"> Return </p> </div> <div class="stat"> <p class="statValue"> $${getFormattedMarketCap(
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
  )}<sup>%</sup> </p> <p class="statDesc"> Return </p> </div> <div class="stat"> <p class="statValue"> $${getFormattedMarketCap(
    company.marketCap
  )}<sup>${getMarketCapSuffix(
    company.marketCap
  )}</sup> </p> <p class="statDesc"> Market Cap. </p> </div> </div> </a>`;
  $("." + toCamelCase(company.sector) + " .company:last-of-type").before(html);
}

firebase.auth().onAuthStateChanged(function(user) {
  makeAPICall();
});
