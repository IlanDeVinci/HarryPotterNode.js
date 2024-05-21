"use strict";

const cardContainer = document.getElementById("cardContainer");

let searchBar = document.getElementById("search");
//fonctionnement de la barre de recherche dynamique
searchBar.addEventListener("input", (e) => {
	const searchString = e.target.value.toLowerCase();
	//searchstring contient l'input de l'utilisateur
	const filteredCharacters = hpList1.filter((character) => {
		//filteredcharacters est la nouvelle liste de personnages filtrée
		return (
			character.name.toLowerCase().includes(searchString) ||
			character.house.toLowerCase().includes(searchString)
			//on renvoie seulement dans la liste filtrée les personnages dont le nom ou la maison contient l'input de l'utilisateur
		);
	});
	if (filteredCharacters.length > 0) {
		displayCharacters(filteredCharacters);
	} else {
		cardContainer.innerHTML = `
        <h2>No cards</h2>
        `;
	}
});

let hpCharacters1 = [];
let hpList1 = [];
const loadCharacters1 = async () => {
	const res = await fetch("https://hp-api.lainocs.fr/characters"); //on va chercher la liste des personnages dans l'API
	hpCharacters1 = await res.json(); //on la met dans hpCharacters
	hpCharacters1.forEach((element) => {
		if (element.image) {
			hpList1.push(element); //on ajoute à hpList seulement les personnages qui ont une image
		}
		hpList1.forEach((element) => {
			if (element.house == "") {
				element.house = "None"; //on remplace le "" par None pour les personnages qui n'ont pas de maison
			}
		});
	});
	displayCharacters(hpList1);
};

//cette fonction crée les cartes de chaque personnage
const displayCharacters = (characters) => {
	const htmlString = characters
		.map((character) => {
			//on exécute le code suivant pour chaque personnage de la liste characters
			//on crée un string qui contient ce qui va être inséré dans l'html
			if (character.house == currentFilter || currentFilter == "none") {
				//on ajoute la carte seulement si elle correspond au filtre
				{
					return `
                        <div class="card">
                            <div class="imgcard">
                                <a href="single.html?slug=${character.slug}">
                                    <img class ="cardimg" src="${character.image}"></img>
                                </a>
                            </div>
                            <div class="textcard">
                                <h2>${character.name}</h2>
                             <h3>House: ${character.house}</h3>
                                <h3>Actor: ${character.actor}</h3>
                            </div>
                        </div>
                        `;
				} //le code ci-dessus constitue une carte avec un personnage, son image, son nom, sa maison, son acteur
			}
		})
		.join("");
	cardContainer.innerHTML = htmlString; //on ajoute le string dans le code html pour afficher les cartes
	let i = 0;
	document.querySelectorAll(".card").forEach((element) => {
		//on sélectionne toutes les cartes sur la page
		i++;
		setTimeout(function fade() {
			element.classList.add("fade");
		}, 50 * i); //on donne un effet de fade in à chaque carte avec un intervalle de 50 millisecondes
	});
};

loadCharacters1();
let currentFilter = "none";
//la fonction suivante change le thème du site en fonction du bouton cliqué + change et applique le filtre

function changeTheme(name) {
	document.querySelectorAll('[name="sortbutton"]').forEach((e) => {
		if (currentFilter == e.id && name !== e.id) {
			e.classList.toggle(currentFilter); //désactive le visuel du précédent filtre
		}
	});
	document.getElementById("nav").classList.toggle(currentFilter); //désactive le visuel du précédent filtre
	document.getElementById("main").classList.toggle(currentFilter); //idem
	document.getElementById("body").classList.toggle(currentFilter); //idem
	document.getElementById(name).classList.toggle(name); //active le visuel du bouton du nouveau filtre
	if (currentFilter == name) {
		currentFilter = "none"; //désactive le filtre si le bouton a été appuyé deux fois de suite
	} else {
		currentFilter = name; //change la variable au nouveau filtre
		document.getElementById("nav").classList.toggle(currentFilter); //active le visuel du site du nouveau filtre
		document.getElementById("main").classList.toggle(currentFilter);
		document.getElementById("body").classList.toggle(currentFilter);
	}
	displayCharacters(hpList1); //actualise la liste des personnages
}

//ajoute une fonction qui s'exécute lorsqu'on clique un des boutons filtres
document.querySelectorAll('[name="sortbutton"]').forEach((element) => {
	element.addEventListener("click", function () {
		changeTheme(element.id);
	});
});
