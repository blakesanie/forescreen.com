$.ajax({
  // stock-ranking.herokuapp.com
  url: `http://stock-ranking.herokuapp.com/insta`,
  error: function(error) {
    console.error(error);
  },
  success: function(result) {
    console.log(result)
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
      $("body").prepend(html);
    }
  }
});
