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