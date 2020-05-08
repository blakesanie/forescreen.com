var urlParams = getUrlVars();
if (urlParams.symbol) {
  $("input").val(urlParams.symbol.toUpperCase());
  getSymbolData(urlParams.symbol);
} else {
  welcomeMessage();
}

function getSymbolData(symbol) {
  $(".loader").css("display", "block");
  $.ajax({
    url: `http://stock-ranking.herokuapp.com/quote/${encodeURIComponent(
      symbol.toUpperCase()
    )}`,
    success: function(data) {
      if (data.length == 0) {
        symbolNotFound();
      } else {
        data = data[0];
        console.log(data);
        $("div.needsToRender").append(
          `<p class="name">${data.name}</p><p class="sector">${
            data.sector
          }</p>${getSVG(data, 0.3, 1, 0.3, 0.3)}
    <div class="statsHolder"><div class="stat"> <p class="statValue">${Math.round(
      data.roi * 100
    )}<sup>%</sup> </p> <p class="statDesc"> Annual Gain </p> </div><div class="stat"> <p class="statValue">$${getFormattedMarketCap(
            data.marketCap
          )}<sup>${getMarketCapSuffix(
            data.marketCap
          )}</sup> </p> <p class="statDesc">Market Cap.</p> </div></div>

            <div class="statsHolder"> <div class="stat"> <p class="statValue">${
              data.scoreRank
            }<sup>${getRankSuffix(
            data.scoreRank
          )}</sup> </p> <p class="statDesc"> Overall </p> </div><div class="stat"> <p class="statValue">${
            data.scoreSectorRank
          }<sup>${getRankSuffix(
            data.scoreSectorRank
          )}</sup> </p> <p class="statDesc"> In ${
            data.sector
          } </p> </div><div class="stat"> <p class="statValue">${
            data.saleScoreRank
          }<sup>${getRankSuffix(
            data.saleScoreRank
          )}</sup> </p> <p class="statDesc"> Best Discount </p> </div><div class="stat"> <p class="statValue">${
            data.r2Rank
          }<sup>${getRankSuffix(
            data.r2Rank
          )}</sup> </p> <p class="statDesc"> Least Volatile </p> </div> <div class="stat"> <p class="statValue"> ${
            data.roiRank
          }<sup>${getRankSuffix(
            data.roiRank
          )}</sup> </p> <p class="statDesc"> Fastest Growing </p> </div></div><h3>Advanced Price Chart</h3><div id="tradingview_e59b1"></div>`
        );
        new TradingView.widget({
          symbol: symbol,
          interval: "D",
          timezone: "Etc/UTC",
          theme: "light",
          style: "1",
          locale: "en",
          toolbar_bg: "white",
          enable_publishing: false,
          hide_top_toolbar: true,
          save_image: false,
          container_id: "tradingview_e59b1"
        });
      }
      $(".loader").css("display", "none");
      $("div.needsToRender").removeClass("invisible");
    }
  });
}

function symbolNotFound() {
  $("div.needsToRender").append(
    `<p class="notFoundText"><span class="strong">Hmm... we're not tracking this symbol.</span><br /><br />This may be because the stock has:</p><ol><li>Less than five years of trading history</li><li>low market capitalization</li><li>minimal daily trading volume</li><li>irregular trading/price patterns</li></ol>`
  );
}

function welcomeMessage() {
  $("div.needsToRender").append(
    `<p class="notFoundText"><span>Enter a stock symbol to see our analysis.</span></p>`
  );
  $("div.needsToRender").removeClass("invisible");
}

function goToNewUrl(symbol) {
  if (symbol != "") {
    var baseUrl = window.location.href.split("?")[0];
    window.location.replace(baseUrl + `?symbol=${symbol.toUpperCase()}`);
  }
}

$("input").focusout(function() {
  if ($("input").val() != "") goToNewUrl($(this).val());
});

$(document).on("keypress", function(e) {
  if (e.which == 13 && $("input").val() != "") {
    goToNewUrl($("input").val());
  }
});
