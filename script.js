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