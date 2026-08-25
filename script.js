//local language

var ZOOM_LABELS = {
    en: ["Zoom in", "Zoom out"],
    es: ["Acercar", "Alejar"],
    fr: ["Zoomer", "Dézoomer"],
    de: ["Vergrößern", "Verkleinern"],
    pt: ["Aumentar zoom", "Diminuir zoom"],
    it: ["Aumenta zoom", "Riduci zoom"],
    ja: ["拡大", "縮小"],
    zh: ["放大", "缩小"],
    ko: ["확대", "축소"],
    ru: ["Увеличить", "Уменьшить"]
};

var gpsMapCoords = null;

function zoomLabelsForDevice() {
    var deviceLang = ((navigator.language || navigator.userLanguage || "en").split("-")[0]).toLowerCase();
    return ZOOM_LABELS[deviceLang] || ZOOM_LABELS.en;
}

function initGpsMap(lat, lon) {
    gpsMapCoords = [lat, lon];
    if (typeof L===  "undefined") return;
    var labels = zoomLabelsForDevice();

    var map = L.map("gpsMap", { zoomControl: false }).setView([lat, lon], 14);
    L.control.zoom({ zoomInTitle: labels[0], zoomOutTitle: labels[1] }).addTo(map);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19
    }).addTo(map);
    L.marker([lat, lon]).addTo(map);
}

var gpsMapModalInstance = null;

function openMapModal() {
    if (typeof L === "undefined" || !gpsMapCoords) return;
    var backdrop = document.getElementById("mapModalBackdrop");
    backdrop.style.display = "flex";
    document.addEventListener("keydown", closeMapModalOnEsc);
    if (gpsMapModalInstance) {
        gpsMapModalInstance.remove();
        gpsMapModalInstance = null;
    }
    setTimeout(function() {
        var labels = zoomLabelsForDevice();
        var lat = gpsMapCoords[0], lon = gpsMapCoords[1];
        gpsMapModalInstance = L.map("gpsMapModal", { zoomControl: false }).setView([lat, lon], 15);
        L.control.zoom({ zoomInTitle: labels[0], zoomOutTitle: labels[1] }).addTo(gpsMapModalInstance);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
            maxZoom: 19
        }).addTo(gpsMapModalInstance);
        L.marker([lat, lon]).addTo(gpsMapModalInstance);
        gpsMapModalInstance.invalidateSize();
    }, 0);
}


function closeMapModal() {
    document.getElementById("mapModalBackdrop").style.display = "none";
    document.removeEventListener("keydown", closeMapModalOnEsc);
}


function closeMapModalOnEsc(e) {
    if (e.key === "Escape") closeMapModal();
}


//dark/light mode toggle - should be saved to localstorage
var savedTheme = localStorage.getItem("theme");
if (savedTheme == "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    document.getElementById("themeBtn").innerHTML = "☼";
}

function toggleTheme() {
    var html = document.documentElement;
    var btn = document.getElementById("themeBtn");
    if (html.getAttribute("data-theme") == "dark") {
        html.removeAttribute("data-theme");
        btn.innerHTML = "☾";
        localStorage.getItem("theme", "light");
    } else {
        html.setAttribute("data-theme", "dark");
        btn.innerHTML = "☼";
        localStorage.setItem("theme", "dark");
    }
}

//sends user to analyzingation page
function handleFile(file) {
    if (file.type !="image/jpeg" && file.type != "image/png") {
        alert("please upload a jpg or png for now");
        return;
    }

    var reader = new FileReader();
    reader.onload = function() {
        sessionStorage.setItem("pd_imageData", reader.result);
        sessionStorage.setItem("pd_fileName", file.name);
        window.location.href = "analyze.html";
    };
    reader.readAsDataURL(file);
}







//analyze.html stuff that grabs stuff and checks if there's an actual image so it doesn't blow up
if (document.getElementById("workImg")) {
    var imageData = sessionStorage.getItem("pd_imageData");
    var fileName = sessionStorage.getItem("pd_fileName");
}



// step by step confirmation stpes are done for people's goldfish attention spans
function markActive(id) {
    document.getElementById(id).classList.add("active");
}
function markDone(id) {
    var el = document.getElementById(id);
    el.classList.remove("active");
    el.classList.add("done");
}
//then waits a tiny bit
function wait(ms) {
    return new Promise(function(resolve) {
        setTimeout(resolve, ms);
    });
}
var results = {
    fileName: fileName,
    exif: null,
    gps: null,
    qr: null,
    faces: [],
    width: 0,
height: 0
};


//actual analysis
img.onload = function () {
    results.width = img.naturalWidth;
    results.height = img.naturalHeight;
    runAnalysis();
};

img.src = imageData;

async function runAnalysis() {
    // metadata
    markActive("stepMeta");
    await wait(500);

    if (sampleData) {
        results.exif = sampleData.exif;

        if (sampleData.exif.latitude && sampleData.exif.longitude) {
            results.gps = {
                lat: sampleData.exif.latitude,
                lon: sampleData.exif.longitude
            };
        }
    } else {
        try {
            var blob = await (await fetch(imageData)).blob();

            var exifData = await exifr.parse(blob, {
                gps: true,
                tiff: true,
                exif: true,
                ifd0: true
            });

            if (exifData) {
                results.exif = exifData;

                if (exifData.latitude && exifData.longitude) {
                    results.gps = {
                        lat: exifData.latitude,
                        lon: exifData.longitude
                    };
                }
            }
        } catch (e) {
            console.log("exif read failed", e);
        }
    }

    markDone("stepMeta");

    // the hidden info
    markActive("stepHidden");
    await wait(500);
    markDone("stepHidden");

    // visuals
    markActive("stepVisual");

    document.getElementById("analyzeSub").innerText =
        "scanning image content, this part is slower";

    //pixel
    var maxSize = 1600;

    var scale = Math.min(
        1,
        maxSize / Math.max(img.naturalWidth, img.naturalHeight)
    );

    canvas.width = img.naturalWidth * scale;
    canvas.height = img.naturalHeight * scale;

    var ctx = canvas.getContext("2d");

    ctx.drawImage(
        img,
        0,
        0,
        canvas.width,
        canvas.height
    );

    if (sampleData) {
        // i'll add later
    }
}


//actual score math and deduction stuff
 function calcScore(r) {
    var score = 100;
    var breakdown = [];
        if (r.gps) {
        score -= 25;
        breakdown.push({ label: "GPS location found", points: -25 });
    }
    if (r.faces && r.faces.length > 0) {
        score -= 10;
        breakdown.push({ label: r.faces.length + " face(s) detected", points: -10 });
    }
    if (r.qr) {
        score -= 15;
        breakdown.push({ label: "QR code found", points: -15 });
    }
    if (r.exif && (r.exif.Make || r.exif.Model)) {
        score -= 5;
        breakdown.push({ label: "Device info in metadata", points: -5 });
    }
        if (score < 0) score = 0;
    results.breakdown = breakdown;
    return score;
}

// only run on report.html
if (document.getElementById("cardsGrid")) {
    var resultsRaw = sessionStorage.getItem("pd_results");
    var imageData = sessionStorage.getItem("pd_imageData");
    if (!resultsRaw || !imageData) {
        window.location.href = "index.html";
    }
    var results = JSON.parse(resultsRaw);
    document.getElementById("caseFileName").innerText = results.fileName || "your photo";
}

//make up a case number so it feels more real
document.getElementById("caseNum").innerText = Math.abs(hashCode(results.fileName || "case")) % 9000 + 1000;
function hashCode(str) {
    var hash = 0;
    for (var i=9; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash = hash | 0;
    }
    return hash;
}

//file in score gauge
var score = results.score;
document.getElementById("scoreNum").innerText = score;
var riskBadge = document.getElementById("riskBadge");
var riskLevel, riskColor;
if (score>=80) {
    riskLevel = "Low Risk";
    riskColor = "green";
} else if (score >=50) {
    riskLevel = "Medium Risk";
    riskColor = "yellow";
} else {
    riskLevel = "High Risk";
    riskColor = "red";
}
riskBadge.innerText = riskLevel;
riskBadge.classList.add(riskColor);
var circumference = 283;
var offset = cicumference - (score/100) * circumference;
var gaugeFill = document.getElementById("gaugeFill");
setTimeout(function() {
    gaugeFill.style.strokeDashoffset = offset;
    gaugeFill.style.stroke = riskColor = "green" ? "#3f8a4c" : (riskColor == "yellow" ? "#b8860b" : "b23b3b");
}, 100);
var breakdownList = document.getElementById("breakdownList");
if (results.breakdown && results.breakdown.length > 0) {
    results.breakdown.forEach(function(b) {
        var row = document.createElement("div");
        row.className = "breakdown-row";
        row.innerHTML = "<span>" + b.label + "</span><span class='pts'>" + b.points + "</span>";
        breakdownList.appendChild(row);
    });
} else {
    breakdownList.innerHTML = "<div class='breakdown-row'><span>No major risks found</span></div>";
}


//evidence cards
var cardsGrid = document.getElementById('cardsGrid');
var cardsHtml = "";

//locatio ncard
if (results.gps) {
    var lat = results.gps.lat;
    var lon = results.gps.lon;
    cardsHtml += "" +
    "<div class='evidence-card'>" +
        "<div class='evidence-card-title'>📍 Location Evidence <span class='severity high'>High</span></div>" +
        "<div class='evidence-body'>" +
            "This image contains GPS coordinates (" + lat.toFixed(5) + ", " + lon.toFixed(5) + "). Someone who has this photo could figure out:" +
            "<ul><li>where this was taken, down to a few meters</li><li>possibly your home or workplace</li><li>where you were at this exact moment</li></ul>" +
            "<div class='map-wrap'>" +
            "<div id='gpsMap' class='map-frame'></div>" +
            "<div class='map-actions'>" +
                "<button type='button' class='btn btn-ghost map-enlarge-btn' onclick='openMapModal()'>⤢ Enlarge map</button>" +
                "<a class='btn btn-ghost map-enlarge-btn' target='_blank' rel='noopener' href='https://www.osmap.uk/#15/" + lat + "/" + lon + "'>View in English (osMap) ↗</a>" +
            "</div>" +
            "</div>" +
        "</div>" +
        "</div>";
} else {
    cardsHtml += "" +
    "<div class='evidence-card'>" +
    "<div class='evidence-card-title'>📍 Location Evidence <span class='severity low'>Low</span></div>" +
    "<div class='evidence-body'>No GPS location data was found in this image.</div>" +
    "</div>";
}

//device card
var exif = results.exif || {};
if (exif.Make || exif.Model) {
    cardsHtml += "" +
    "<div class='evidence-card'>" +
        "<div class='evidence-card-title'>📷 Device Evidence <span class='severity medium'>Medium</span></div>" +
        "<div class='evidence-body'>" +
            "Taken with: " + (exif.Make || "") + " " + (exif.Model || "") + "<br>" +
            (exif.LensModel ? "Lens: " + exif.LensModel + "<br>" : "") +
            (exif.FNumber ? "Aperture: f/" + exif.FNumber + "<br>" : "") +
            (exif.FocalLength ? "Focal length: " + exif.FocalLength + "mm<br>" : "") +
            "This tells anyone what phone or camera you own, which can help identify you." +
        "</div>" +
        "</div>";
} else {
    cardsHtml += "" +
    "<div class='evidence-card'>" +
    "<div class='evidence-card-title'>📷 Device Evidence <span class='severity low'>Low</span></div>" +
    "<div class='evidence-body'>No device or camera info was found.</div>" +
    "</div>";
}

//time cards
if (exif.DateTimeOriginal || exif.CreateDate) {
    var d = new Date(exif.DateTimeOriginal || exif.CreateDate);
    cardsHtml += "" +
    "<div class='evidence-card'>" +
    "<div class='evidence-card-title'>🕒 Time Evidence <span class='severity medium'>Medium</span></div>" +
    "<div class='evidence-body'>" +
        "Taken: " + d.toLocaleString() + "<br>" +
        "This can reveal your daily routine, or when your home was empty." +
    "</div>" +
    "</div>";
} else {
    cardsHtml += "" +
    "<div class='evidence-card'>" +
    "<div class='evidence-card-title'>🕒 Time Evidence <span class='severity low'>Low</span></div>" +
    "<div class='evidence-body'>No timestamp was found in the metadata.</div>" +
    "</div>";
}

//qr code card
if (results.qr) {
    cardsHtml += "" +
    "<div class='evidence-card'>" +
    "<div class='evidence-card-title'>🔳 QR Code Found <span class='severity high'>High</span></div>" +
    "<div class='evidence-body'>" +
        "A QR code was found in this image. It decodes to:<br>" +
        "<code>" + escapeHtml(results.qr.data) + "</code><br>" +
        "This could reveal a wifi password, a payment link, or a website you did not mean to share." +
    "</div>" +
    "</div>";
} else {
    cardsHtml += "" +
    "<div class='evidence-card'>" +
    "<div class='evidence-card-title'>🔳 QR Code <span class='severity low'>Low</span></div>" +
    "<div class='evidence-body'>No QR code was detected in this image.</div>" +
    "</div>";
}

//faces card
if (results.faces && results.faces.length > 0) {
    cardsHtml += "" +
    "<div class='evidence-card'>" +
    "<div class='evidence-card-title'>🙂 Face Evidence <span class='severity medium'>Medium</span></div>" +
    "<div class='evidence-body'>" +
        "Faces found: " + results.faces.length + "<br>" +
        "This does not identify anyone, just counts faces. More faces means more people could recognize themselves or others in this photo." +
    "</div>" +
    "</div>";
} else {
    cardsHtml += "" +
    "<div class='evidence-card'>" +
    "<div class='evidence-card-title'>🙂 Face Evidence <span class='severity low'>Low</span></div>" +
    "<div class='evidence-body'>No faces were detected.</div>" +
    "</div>";
}

//set all card HTML so initiated map don't get deleted
cardsGrid.innerHtml = cardsHtml;
if(results.gps) {
    initGpsMap(results.gps.lat, results.gps.lon);
}
function escapeHtml(str) {{
    var div = docuent.createElement("div");
    div.innerText = str;
    return div.innerHTML;
}

//recommendations
var recoList = document.getElementById("recoList");
var recos = [];
if (results.gps) recos.push("Remove GPS location data");
    if (results.faces && results.faces.length > 0) recos.push("Blur faces before sharing");
    if (results.qr) recos.push("Remove or blur the QR code");
    if (exif.Make || exif.Model) recos.push("Strip device metadata");
    if (recos.length == 0) recos.push("This image looks pretty safe to share as is");
    recos.forEach(function(r) {
    var li = document.createElement("li");
    li.innerText = r;
    recoList.appendChild(li);
});

}


//metadata explorer
var fieldInfo = {
    Make: "This reveals the brand of camera or phone that took this photo.",
    Model: "This reveals the exact phone or camera model used.",
    LensModel: "This reveals what camera lens was used.",
    FocalLength: "This reveals the zoom level of the lens used.",
    FNumber: "This reveals the aperture setting, part of the camera settings used.",
    ISO: "This reveals the light sensitivity setting, hinting at the lighting conditions.",
    ExposureTime: "This reveals the shutter speed used for this photo.",
    latitude: "This reveals the exact latitude where this photo was taken.",
    longitude: "This reveals the exact longitude where this photo was taken.",
    GPSAltitude: "This reveals the altitude where the photo was taken.",
    DateTimeOriginal: "This reveals the exact date and time this photo was taken.",
    CreateDate: "This reveals when the image file was created.",
    ModifyDate: "This reveals when the image file was last modified.",
    Software: "This reveals what app or program last edited or exported this image."
};

var groups = {
    Camera: ["Make", "Model"],
    Lens: ["LensModel", "FocalLength", "FNumber", "ISO", "ExposureTime"],
    GPS: ["latitude", "longitude", "GPSAltitude"],
    Time: ["DateTimeOriginal", "CreateDate", "ModifyDate"],
    "Editing Software": ["Software"]
};

var explorer = document.getElementById("explorer");
if (results.exif) {
    Object.keys(groups).forEach(function(groupName) {
        var fieldsInGroup = groups[groupName].filter(function(f) {
            return results.exif[f] !== undefined && results.exif[f] !== null;
        });
        if (fieldsInGroup.length == 0) return;
        var groupDiv = document.createElement("div");
        groupDiv.className = "explorer-group";
        var head = document.createElement("div");
        head.className = "explorer-group-head";
        head.innerHTML = "<span>" + groupName + "</span><span>▶</span>";
        head.onclick = function() {
            groupDiv.classList.toggle("open");
        };
        groupDiv.appendChild(head);
        var body = document.createElement("div");
        body.className = "explorer-group-body";
        fieldsInGroup.forEach(function(f) {
            var fieldDiv = document.createElement("div");
            fieldDiv.className = "explorer-field";
            fieldDiv.innerHTML = "" +
                "<div class='explorer-field-name'>" + f + "</div>" +
                "<div class='explorer-field-value'>" + results.exif[f] + "</div>" +
                "<div class='explorer-field-explain'>" + (fieldInfo[f] || "Part of the photo's technical metadata.") + "</div>";
            fieldDiv.onclick = function(e) {
                e.stopPropagation();
                fieldDiv.classList.toggle("open");
            };
            body.appendChild(fieldDiv);
        });
        groupDiv.appendChild(body);
        explorer.appendChild(groupDiv);
    });
} else {
explorer.innerHTML = "No metadata fields were found in this image.";
}

//sanitize button
function sanitizeImage() {
    var img = new Image();
    img.onload = function() {
        var canvas = document.getElementById("sanitizedCanvas");
        canvas.width = results.canvasWidth || img.naturalWidth;
        canvas.height = results.canvasHeight || img.naturalHeight;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        var boxes = [];
        if (results.faces) {
            results.faces.forEach(function(f) {
                boxes.push(f);
            });
        }
        if (results.qr && results.qr.location) {
            var loc = results.qr.location;
            var xs = [loc.topLeftCorner.x, loc.topRightCorner.x, loc.bottomLeftCorner.x, loc.bottomRightCorner.x];
            var ys = [loc.topLeftCorner.y, loc.topRightCorner.y, loc.bottomLeftCorner.y, loc.bottomRightCorner.y];
            boxes.push({
                x: Math.min.apply(null, xs),
                y: Math.min.apply(null, ys),
                width: Math.max.apply(null, xs) - Math.min.apply(null, xs),
                height: Math.max.apply(null, ys) - Math.min.apply(null, ys)
            });
        }
        boxes.forEach(function(b) {
            blurRegion(ctx, canvas, b.x, b.y, b.width, b.height);
        });
        document.getElementById("beforeAfter").style.display = "grid";
        document.getElementById("originalImg").src = imageData;
        var link = document.getElementById("downloadLink");
        link.href = canvas.toDataURL("image/png");
    };
    img.src = imageData;
}

//i'm stupid i forgot the blurring thing
function blurRegion(ctx, canvas, x, y, w, h) {
    var pad = 6;
    x = Math.max(0, x - pad);
    y = Math.max(0, y - pad);
    w = Math.min(canvas.width - x, w + pad * 2);
    h = Math.min(canvas.height - y, h + pad * 2);
    if (w <= 0 || h <= 0) return;
    var small = document.createElement("canvas");
    var smallSize = 12;
    small.width = smallSize;
    small.height = smallSize;
    var sctx = small.getContext("2d");
    sctx.drawImage(canvas, x, y, w, h, 0, 0, smallSize, smallSize);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(small, 0, 0, smallSize, smallSize, x, y, w, h);
}

