const userToken = localStorage.getItem("token");
if (
	userToken !== null &&
	userToken !== undefined &&
	userToken !== "" &&
	userToken !== "undefined"
) {
	let modal = document.getElementById("modal");
	//on récupère le bouton pour faire apparaître le modal
	document
		.getElementById("floating-button")
		.addEventListener("click", function () {
			modal.style.display = "block";
		});

	//le modal disparaît si on clique sur la croix
	document.querySelector("span").addEventListener("click", function () {
		modal.style.display = "none";
	});

	//le modal disparaît si on clique en dehors
	window.onclick = function (event) {
		if (event.target == modal) {
			modal.style.display = "none";
		}
	};

	let hpCharacters = [];
	let hpList = [];
	const loadCharacters = async () => {
		const res = await fetch("https://hp-api.lainocs.fr/characters"); //on va chercher la liste des personnages dans l'API
		hpCharacters = await res.json(); //on la met dans hpCharacters
		hpCharacters.forEach((element) => {
			if (element.image) {
				hpList.push(element); //on ajoute à hpList seulement les personnages qui ont une image
			}
		});
		hpList.forEach((element) => {
			if (element.house == "") {
				element.house = "None"; //on remplace le "" par None pour les personnages qui n'ont pas de maison
			}
		});
	};
	loadCharacters();

	let cardChoose = document.getElementById("cardchoose");
	let usersChoose = document.getElementById("userschoose");
	let allUsers;
	let fullCards = [];
	async function getUserData() {
		const userRes = await fetch("http://localhost:3000/getMyProfile", {
			headers: {
				Authorization: `Bearer ${userToken}`,
			},
		});

		const userData = await userRes.json();
		const userId = await userData.id;
		return userId;
	}
	async function getUsersAndCards() {
		const userId = await getUserData();
		allUsers = Object.values(await getAllUsers());
		allUsers = allUsers.filter((user) => {
			return user.id !== userId;
		});
		let allCards = Object.values(await getAllCards(userId));
		fullCards;
		await Promise.all(
			allCards.map(async (card) => {
				let cardObject = card;
				let hpListCharacter = hpList.filter((element) => {
					return element.name == cardObject.name;
				});
				cardObject.actor = await hpListCharacter[0].actor;
				cardObject.house = await hpListCharacter[0].house;
				cardObject.image = await hpListCharacter[0].image;
				cardObject.slug = await hpListCharacter[0].slug;
				cardObject.isnew = "no";
				fullCards.push(cardObject);
			})
		);
		let cardString = "";
		allCards.forEach((character, i) => {
			//itération à travers la liste des cartes
			cardString = `${cardString}
                                <option value="${i}">${character.name}, ${character.rarity}</option>
                                `;
		}); //on va créer une option dans la liste par carte
		cardChoose.innerHTML = cardString; //on ajoute le string au code html
		let userString = "";
		allUsers.forEach((user, i) => {
			//itération à travers la liste des cartes
			userString = `${userString}
                                <option value="${i}">${user.name}, ${user.email}</option>
                                `;
		}); //on va créer une option dans la liste par carte
		usersChoose.innerHTML = userString; //on ajoute le string au code html
	}
	//on fait apparaître le modal lorsqu'on clique sur le bouton
	document
		.getElementById("floating-button")
		.addEventListener("click", async function () {
			modal.style.display = "block";
			//on va chercher la lis te des cartes de l'utilisateur pet on la met dans une liste pour que l'utilisateur puisse en choisir une
			getUsersAndCards();
		});

	async function getAllUsers() {
		const res = await fetch("http://localhost:3000/users", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});
		const data = await res.json();
		return data;
	}

	async function getAllCards(userId) {
		const res = await fetch(`http://localhost:3000/cards/${userId}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ id: userId }),
		});
		const data = await res.json();
		return data;
	}

	//la fonction suivante va permettre de choisir une carte et de l'afficher dans le modal avant de l'échanger
	document.getElementById("submitcard").addEventListener("click", function (e) {
		e.preventDefault();
		let cardValue = cardChoose.value;
		let showCard = "";
		//on fait apparaître la carte sans les boutons supprimer et favori
		if (fullCards.length > 0) {
			showCard = ` <div id="${fullCards[cardValue].rarity}" class="card fade">  
                        <div class="imgcard">
                            <img class ="cardimg" src="${fullCards[cardValue].image}"></img>
                        </div>
                        <div class="textcard">
                            <h2>${fullCards[cardValue].name}</h2>
                            <h3>House: ${fullCards[cardValue].house}</h3>
                            <h3>Actor: ${fullCards[cardValue].actor}</h3>
                            <h3>Rarity: ${fullCards[cardValue].rarity}</h3>
                        </div>
                    </div>`;
		} else {
			//si la liste de cartes est vide, on affiche le texte suivant
			showCard = `<h2>You have no cards</h2>`;
		}
		document.getElementById("showCard").innerHTML = showCard;
		e.preventDefault();
	});

	document
		.getElementById("submitExchange")
		.addEventListener("click", function (e) {
			let cardValue = cardChoose.value;
			let userValue = usersChoose.value;
			let cardId = fullCards[cardValue].id;
			let userID = allUsers[userValue].id;
			doTrade(cardId, userID);
		});

	async function doTrade(cardId, userID) {
		await fetch(`http://localhost:3000/cards/${cardId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				ownerId: userID,
			}),
		});
	}
} else {
	//on récupère le bouton pour faire apparaître le modal
	document
		.getElementById("floating-button")
		.addEventListener("click", function () {
			alert("You need to be logged in to trade !");
		});
}
