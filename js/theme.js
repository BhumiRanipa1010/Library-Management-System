window.onload = () => {

const savedTheme =

localStorage.getItem(
"theme"
);

const icon =

document.getElementById(
"themeIcon"
);

if(savedTheme==="dark"){

document.body.classList.add(
"dark-mode"
);

}

updateThemeIcon();

};


function toggleTheme(){

document.body.classList.toggle(
"dark-mode"
);

const darkEnabled =

document.body.classList.contains(
"dark-mode"
);

localStorage.setItem(

"theme",

darkEnabled

? "dark"

: "light"

);

updateThemeIcon();

}


function updateThemeIcon(){

const icon =

document.getElementById(
"themeIcon"
);

if(!icon) return;

icon.textContent =

document.body.classList.contains(
"dark-mode"
)

? "☀️"

: "🌙";

}