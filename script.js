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