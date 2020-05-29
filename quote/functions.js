var urlParams = getUrlVars();
if (urlParams.symbol) {
  $("input").val(urlParams.symbol.toUpperCase());
} else {
  welcomeMessage();
}

firebase.auth().onAuthStateChanged(function(user) {
  if (urlParams.symbol) {
    getSymbolData(urlParams.symbol);
  }
});

function getSymbolData(symbol) {
  $(".loader").css("display", "block");
  $.ajax({
    url: `http://stock-ranking.herokuapp.com/quote/${encodeURIComponent(
      symbol.toUpperCase()
    )}/${
      firebase.auth().currentUser ? firebase.auth().currentUser.uid : "null"
    }`,
    success: function(data) {
      if (data.length == 0) {
        symbolNotFound();
      } else {
        data = data[0];
        console.log(data);
        $("div.needsToRender").append(
          `<p class="name symbol${symbol.toUpperCase()}">${
            data.name
          }<span class="likeHolder"><img class="outline" src="https://img.icons8.com/material-outlined/96/000000/like.png"/><img class="foreground ${
            data.liked ? "liked" : ""
          }" src="https://img.icons8.com/material/96/000000/like--v1.png"/></span></p><p class="sector">${
            data.sector
          }</p>${getSVG(data, 0.3, 1, 0.3, 0.3)}<h3>Forescreen Insights</h3>
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
          )}</sup> </p> <p class="statDesc"> Fastest Growing </p> </div></div><h3>Advanced Price Chart</h3><div class="widgetHolder"><iframe id="tradingview_229cc" src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_229cc&amp;symbol=${
            data.symbol
          }&amp;interval=D&amp;hidetoptoolbar=1&amp;saveimage=0&amp;toolbarbg=white&amp;studies=%5B%5D&amp;theme=light&amp;style=1&amp;timezone=Etc%2FUTC&amp;studies_overrides=%7B%7D&amp;overrides=%7B%7D&amp;enabled_features=%5B%5D&amp;disabled_features=%5B%5D&amp;locale=en&amp;utm_source=127.0.0.1&amp;utm_medium=widget&amp;utm_campaign=chart&amp;utm_term=rng" style="width: 100%; height: 100%; margin: 0 !important; padding: 0 !important;" frameborder="0" allowtransparency="true" allowfullscreen=""></iframe></div></div><h3>Fundamentals</h3><a class="provided" href="https://www.tradingview.com/symbols/${
            data.symbol
          }/" target="_blank">Provided by TradingView</a><div class="widgetHolder" id="fundamentalsHolder"><iframe scrolling="no" allowtransparency="true" frameborder="0" src="https://s.tradingview.com/embed-widget/financials/?locale=en#%7B%22symbol%22%3A%22${
            data.symbol
          }%22%2C%22colorTheme%22%3A%22light%22%2C%22isTransparent%22%3Atrue%2C%22largeChartUrl%22%3A%22%22%2C%22displayMode%22%3A%22regular%22%2C%22width%22%3A%22480%22%2C%22height%22%3A%22830%22%2C%22utm_source%22%3A%22www.tradingview.com%22%2C%22utm_medium%22%3A%22widget_new%22%2C%22utm_campaign%22%3A%22financials%22%7D" style="box-sizing: border-box; height: calc(798px); width: 480px;"></iframe><div class="censorBar"></div></div>`
        );
      }
      $(".loader").css("display", "none");
      $("div.needsToRender").removeClass("invisible");
    }
  });
}

$("body").on("click", ".likeHolder .foreground", function(e) {
  e.preventDefault();
  var symbol = urlParams.symbol.toUpperCase();
  var button = $(e.target);
  if (button.hasClass("liked")) {
    var ref = firebase
      .database()
      .ref(`users/${firebase.auth().currentUser.uid}/likes/${symbol}`);
    ref.remove();
    button.removeClass("liked");
  } else {
    if (firebase.auth().currentUser) {
      var ref = firebase
        .database()
        .ref(`users/${firebase.auth().currentUser.uid}/likes`);
      ref
        .update({ [symbol]: true })
        .then(function() {
          console.log($(this));
          button.addClass("liked");
        })
        .catch(function() {
          alert(`An error occurred when trying to save ${symbol}`);
        });
    } else {
      window.location.href = "/account";
    }
  }
});

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
