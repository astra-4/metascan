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