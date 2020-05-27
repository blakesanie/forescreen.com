function toCamelCase(str) {
  splitted = str.split([" "]);
  splitted[0] = splitted[0].toLowerCase();
  return splitted.join([""]);
}

function getRankSuffix(num) {
  if (num == 1) return "st";
  if (num == 2) return "nd";
  if (num == 3) return "rd";
  return "th";
}

function getFormattedMarketCap(cap) {
  if (cap > 1000) {
    cap /= 1000;
    return Math.round(cap * 10) / 10;
  }
  if (cap < 1) {
    cap *= 1000;
  }
  return Math.round(cap);
}

function getMarketCapSuffix(cap) {
  if (cap > 1000) return "T";
  if (cap < 1) return "M";
  return "B";
}

function getSVG(company, aspectRatio, id, thickness, radius) {
  // height / width
  var width = company.closesTruncated.length;
  var coords = [];
  for (var i = 0; i < company.closesTruncated.length; i++) {
    coords.push({
      x: i,
      y: (width - company.closesTruncated[i]) * aspectRatio
    });
  }
  console.log(coords);
  var path = createRoundedPathString(coords, radius || 0.4);
  console.log(path);
  var html = `<svg viewbox="0 0 ${width} ${width *
    aspectRatio}" xmlns="http://www.w3.org/2000/svg"> <defs> <lineargradient id="grad${id}" x1="0%" y1="0%" x2="100%" y2="0%"> <stop offset="0%" class="${toCamelCase(
    company.sector
  )}Start"/> <stop offset="100%" class="${toCamelCase(
    company.sector
  )}End"//> </lineargradient> </defs> <path d="${path}" stroke="url(#grad${id})" stroke-width="${thickness ||
    0.9}" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
  return html;
}

/**
 * Creates a coordinate path for the Path SVG element with rounded corners
 * @param pathCoords - An array of coordinates in the form [{x: Number, y: Number}, ...]
 */
function createRoundedPathString(pathCoords, radius) {
  var path = [];
  var curveRadius = radius;

  // Reset indexes, so there are no gaps
  pathCoords = pathCoords.slice();

  for (let i = 0; i < pathCoords.length; i++) {
    // 1. Get current coord and the next two (startpoint, cornerpoint, endpoint) to calculate rounded curve
    var c2Index =
      i + 1 > pathCoords.length - 1 ? (i + 1) % pathCoords.length : i + 1;
    var c3Index =
      i + 2 > pathCoords.length - 1 ? (i + 2) % pathCoords.length : i + 2;

    var c1 = pathCoords[i];
    var c2 = pathCoords[c2Index];
    var c3 = pathCoords[c3Index];

    // 2. For each 3 coords, enter two new path commands: Line to start of curve, bezier curve around corner.

    // Calculate curvePoint c1 -> c2
    var c1c2Distance = Math.sqrt(
      Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2)
    );
    var c1c2DistanceRatio = (c1c2Distance - curveRadius) / c1c2Distance;
    var c1c2CurvePoint = [
      ((1 - c1c2DistanceRatio) * c1.x + c1c2DistanceRatio * c2.x).toFixed(1),
      ((1 - c1c2DistanceRatio) * c1.y + c1c2DistanceRatio * c2.y).toFixed(1)
    ];

    // Calculate curvePoint c2 -> c3
    var c2c3Distance = Math.sqrt(
      Math.pow(c2.x - c3.x, 2) + Math.pow(c2.y - c3.y, 2)
    );
    var c2c3DistanceRatio = curveRadius / c2c3Distance;
    var c2c3CurvePoint = [
      ((1 - c2c3DistanceRatio) * c2.x + c2c3DistanceRatio * c3.x).toFixed(1),
      ((1 - c2c3DistanceRatio) * c2.y + c2c3DistanceRatio * c3.y).toFixed(1)
    ];

    // If at last coord of polygon, also save that as starting point
    if (i === pathCoords.length - 1) {
      path.unshift("M" + c2c3CurvePoint.join(","));
    }

    // Line to start of curve (L endcoord)
    path.push("L" + c1c2CurvePoint.join(","));
    // Bezier line around curve (Q controlcoord endcoord)
    path.push("Q" + c2.x + "," + c2.y + "," + c2c3CurvePoint.join(","));
  }
  // Logically connect path to starting point again (shouldn't be necessary as path ends there anyway, but seems cleaner)
  // path.push("Z");

  return path.slice(0, path.length - 3).join(" ");
}

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(
    m,
    key,
    value
  ) {
    vars[key] = value;
  });
  return vars;
}

$("body").on("click", ".likeHolder .foreground", function(e) {
  e.preventDefault();
  var button = $(e.target);
  var symbol = button
    .parent()
    .parent()
    .text()
    .trim();
  if (button.hasClass("liked")) {
    var ref = firebase
      .database()
      .ref(`users/${firebase.auth().currentUser.uid}/likes/${symbol}`);
    ref.remove();
    $(`.symbol${symbol} .likeHolder .foreground`).removeClass("liked");
  } else {
    if (firebase.auth().currentUser) {
      var ref = firebase
        .database()
        .ref(`users/${firebase.auth().currentUser.uid}/likes`);
      ref
        .update({ [symbol]: true })
        .then(function() {
          console.log($(this));
          $(`.symbol${symbol} .likeHolder .foreground`).addClass("liked");
        })
        .catch(function() {
          alert(`An error occurred when trying to save ${symbol}`);
        });
    } else {
      window.location.href = "/account";
    }
  }
});
