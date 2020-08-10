$.ajax({
  // localhost:3001/v1
  url: `http://localhost:3001/v1/insta`,
  error: function(error) {
    console.error(error);
  },
  success: function(result) {
    var { data, rankType } = result;

    console.log(data, rankType);
    $("h1").text(data.symbol);
    $("h2").text(data.name);
    $("h3").html(
      `${data[rankType]}<sup>${getRankSuffix(data[rankType])}</sup>`
    );
    var categories = {
      r2Rank: "Least Volatile",
      scoreRank: "Overall",
      saleScoreRank: "Current Buy",
      roiRank: "Fastest Growing"
    };
    $("#rank h4").text(categories[rankType]);
    var sectorRank = data[rankType.replace("Rank", "") + "SectorRank"];
    $("#sectorRank")
      .html(`<span class="strong">${sectorRank}<sup class="strong">${getRankSuffix(
      sectorRank
    )}</sup>
    </span>
    in sector</h4>`);
    $("body").append(getSVG(data, 0.59, "id", 1, 0));
    var now = new Date();
    $("#date").text(
      `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear() % 100}`
    );
    $("h6").text(`${Math.round(
      ((data.numDataPoints || 520) / 52) * 2
    ) / 2} yrs`)
  }
});
