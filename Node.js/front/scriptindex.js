"use strict";

//animation de l'image 3d
const card = document.querySelector(".containfront");
card.addEventListener("mousemove", rotate); //lance une fonction quand la souris bouge
card.addEventListener("mouseout", stopRotate); //lance une fonction quand la souris sors de l'image

//fait tourner l'image en fonction de la position de la souris
function rotate(e) {
	const cardItem = this.querySelector(".frontimage");
	const halfWidth = cardItem.offsetWidth / 2;
	//ajoute en style css à l'image une rotation X et une rotation Y en degrés en fonction de la position de la souris par rapport à l'image
	cardItem.style.transform =
		"rotateX(" +
		-(e.offsetY - halfWidth) / 25 +
		"deg) rotateY(" +
		(e.offsetX - halfWidth) / 25 +
		"deg)";
}

//remet la rotation de l'image à 0
function stopRotate() {
	const cardItem = this.querySelector(".frontimage");
	cardItem.style.transform = "rotate(0)";
}
