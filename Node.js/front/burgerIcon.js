//on récupère le menu burger pour les petits écrans
const burgerIcon = document.getElementById("burgericon");
const menu = document.getElementById("menu");
//on récupère le menu burger pour les petits écrans

burgerIcon.addEventListener("click", function () {
	//quand on clique sur le burger, ça ajoute/retire des classes pour faire apparaître/disparaître le menu
	burgerIcon.classList.toggle("menuout");
	menu.classList.toggle("active");
	document.getElementById("home").classList.toggle("hide");
	document.getElementById("mycards").classList.toggle("hide");
	document.getElementById("archive").classList.toggle("hide");
	document.getElementById("profile").classList.toggle("hide");
});

document.addEventListener("DOMContentLoaded", function () {
	if (window.location.pathname === "/front/profile.html") {
		document.getElementById("profile").classList.add("active");
	}
	if (window.location.pathname === "/front/mycards.html") {
		document.getElementById("mycards").classList.add("active");
	}
	if (window.location.pathname === "/front/collection.html") {
		document.getElementById("archive").classList.add("active");
	}
	if (window.location.pathname === "/front/index.html") {
		document.getElementById("home").classList.add("active");
	}
});
