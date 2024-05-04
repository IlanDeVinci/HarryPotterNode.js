const userToken = localStorage.getItem("token");
let id = 0;
const setAsyncTimeout = (cb, timeout = 0) =>
	new Promise((resolve) => {
		setTimeout(() => {
			cb();
			resolve();
		}, timeout);
	});
let isChosenCard = false;
let isChosenUser = false;
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
	/*
	const res = await fetch(`http://localhost:3000/users`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			istrading: false,
			cardtradingid: 0,
		}),
	});
	*/

	async function acceptTrade(tradeId) {
		const response = await fetch(`http://localhost:3000/trades/${tradeId}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});
		const trade = await response.json();
		const status = trade.status;
		const senderCardId = trade.senderCardId;
		const receiverCardId = trade.receiverCardId;
		const senderId = trade.senderId;
		const receiverId = trade.receiverId;
		let senderCard = trade.senderCard;
		let receiverCard = trade.receiverCard;
		let date = new Date();
		date = date.toISOString();
		if (status === "Awaiting confirmation") {
			const response = await fetch(`http://localhost:3000/trades/${tradeId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					status: "completed",
					date: date,
				}),
			});
			const trade = await response.json();
			const response2 = await fetch(
				`http://localhost:3000/cards/${senderCardId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						ownerId: receiverId,
						istrading: false,
					}),
				}
			);
			const card = await response2.json();
			const response3 = await fetch(
				`http://localhost:3000/cards/${receiverCardId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						ownerId: senderId,
						istrading: false,
					}),
				}
			);
			const card2 = await response3.json();
			getTrades();
			if (senderId == id) {
				showCard(receiverCardId);
			} else {
				showCard(senderCardId);
			}
			if (
				window.location.pathname == "/front/mycards.html" ||
				window.location.pathname == "/front/profile.html"
			) {
				getProfile();
			}
		} else {
			const res = await fetch(`http://localhost:3000/trades/${tradeId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					status: "active",
				}),
			});
			data = await res.json();
			getTrades();
		}
	}

	async function declineTrade(tradeId) {
		const res = await fetch(`http://localhost:3000/trades/${tradeId}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
		});
		data = await res.json();
		getTrades();
	}

	async function cancelTrade(tradeId) {
		const res = await fetch(`http://localhost:3000/trades/${tradeId}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
		});
		data = await res.json();
		getTrades();
	}
	async function getTrades() {
		const activetrades = await fetch(`http://localhost:3000/trades/${id}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				senderId: id,
				tab: "activetrades",
			}),
		});
		const activetradesData = await activetrades.json();
		const completedtrades = await fetch(`http://localhost:3000/trades/${id}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				senderId: id,
				tab: "completedtrades",
			}),
		});
		const completedtradesData = await completedtrades.json();
		const pendingtrades = await fetch(`http://localhost:3000/trades/${id}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				senderId: id,
				tab: "pendingtrades",
			}),
		});
		const pendingtradesData = await pendingtrades.json();
		let activetradesString = "";
		let completedtradesString = "";
		let pendingtradesString = "";

		if (activetradesData.length === 0) {
			activetradesString = `<h2>You have no active trades</h2>`;
		}
		if (completedtradesData.length === 0) {
			completedtradesString = `<h2>You have no completed trades</h2>`;
		}
		if (pendingtradesData.length === 0) {
			pendingtradesString = `<h2>You have no pending trades</h2>`;
		}
		activetradesData.reverse().forEach((trade) => {
			let receiverCardName = "None";
			let receiverCardRarity = "";
			if (trade.receiverCard !== null) {
				receiverCardName = trade.receiverCard.name;
				receiverCardRarity = trade.receiverCard.rarity;
			}
			let receiverClass = "user";
			if (trade.receiver.id == id) {
				if (trade.receiverCard === null) {
					receiverClass = "receiver";
				} else {
					receiverClass = "normalreceiver";
				}
			}
			let senderClass = "normalsender";
			if (trade.sender.id == id) {
				senderClass = "sender";
			}
			activetradesString = `${activetradesString}
								<div class="trade">
									<div class="user">
										<h2>Sender : ${trade.sender.name}</h2>			
									</div>
									<div class="${senderClass}">
										<p id="${trade.senderCard.rarity}"> Card: ${trade.senderCard.name}</p>
									</div>
									<div class="user">					
										<h2>Receiver : ${trade.receiver.name}</h2>
									</div>
									<div id="receiver${trade.id}" class="${receiverClass}">
										<p id="${receiverCardRarity}"> Card: ${receiverCardName}</p>
									</div>
									<div class="user">
										<p>Status: ${trade.status}</p>
									</div>
								`;
			if (trade.status == "Awaiting confirmation" && trade.sender.id == id) {
				activetradesString = `${activetradesString}
									<div class="buttons">
										<button id="accept${trade.id}" class="accept">Accept</button>
										<button id="decline${trade.id}" class="decline">Decline</button>
									</div>
								</div>`;
			} else {
				activetradesString = `${activetradesString}
									<div class="buttons">
										<button  id="cancel${trade.id}" class="cancel">Cancel</button>
									</div>
								</div>`;
			}
		});
		completedtradesData.sort((a, b) => {
			return new Date(b.date) - new Date(a.date);
		});
		completedtradesData.forEach((trade) => {
			let receiverCardName = "None";
			let receiverCardRarity = "";
			if (trade.receiverCard !== null) {
				receiverCardName = trade.receiverCard.name;
				receiverCardRarity = trade.receiverCard.rarity;
			}
			let date = trade.date.toString().replace(/T/, " ").replace(/\..+/, "");
			let receiverClass = "receive";
			if (trade.receiver.id == id) {
				if (trade.receiverCard === null) {
					receiverClass = "receiver";
				} else {
					receiverClass = "normalreceiver";
				}
			}
			let senderClass = "normalsender";
			if (trade.sender.id == id) {
				senderClass = "sender";
			}
			completedtradesString = `${completedtradesString}
								<div class="trade">
									<div class="user">
										<h2>Sender : ${trade.sender.name}</h2>			
									</div>
									<div class="${senderClass}">
										<p id="${trade.senderCard.rarity}"> Card: ${trade.senderCard.name}</p>
									</div>
									<div class="user">					
										<h2>Receiver : ${trade.receiver.name}</h2>
									</div>
									<div class="${receiverClass}">
										<p id="${receiverCardRarity}"> Card: ${receiverCardName}</p>
									</div>
									<div class="user">
										<p>Status: ${trade.status}</p>
									</div>
									<div class="user">
										<p>Date: ${date}</p>
									</div>
								</div>
								`;
		});
		pendingtradesData.reverse().forEach((trade) => {
			let receiverCardName = "Waiting...";
			let receiverCardRarity = "";
			if (trade.receiverCard !== null) {
				receiverCardName = trade.receiverCard.name;
				receiverCardRarity = trade.receiverCard.rarity;
			}
			let receiverClass = "receive";
			if (trade.receiver.id == id) {
				if (trade.receiverCard === null) {
					receiverClass = "receiver";
				} else {
					receiverClass = "normalreceiver";
				}
			}
			let senderClass = "normalsender";
			if (trade.sender.id == id) {
				senderClass = "sender";
			}
			pendingtradesString = `${pendingtradesString}
								<div class="trade">
									<div class="user">
										<h2>Sender : ${trade.sender.name}</h2>			
									</div>
									<div class="${senderClass}">
										<p id="${trade.senderCard.rarity}"> Card: ${trade.senderCard.name}</p>
									</div>
									<div class="user">					
										<h2>Receiver : ${trade.receiver.name}</h2>
									</div>
									<div class="${receiverClass}">
										<p id="${receiverCardRarity}"> Card: ${receiverCardName}</p>
									</div>
									<div class="user">
										<p>Status: ${trade.status}</p>
									</div>
									`;
			if (trade.sender.id != id) {
				pendingtradesString = `${pendingtradesString}
									<div class="buttons">
											<button id="accept${trade.id}" class="accept">Accept</button>
											<button id="decline${trade.id}" class="decline">Decline</button>
									</div>
								</div>
									`;
			} else {
				pendingtradesString = `${pendingtradesString}
									<div class="buttons">
										<button  id="cancel${trade.id}" class="cancel">Cancel</button>
									</div>
								</div>`;
			}
		});
		tabContents[1].getElementsByClassName("tab")[0].innerHTML =
			activetradesString;
		tabContents[2].getElementsByClassName("tab")[0].innerHTML =
			pendingtradesString;
		tabContents[3].getElementsByClassName("tab")[0].innerHTML =
			completedtradesString;
		document.querySelectorAll(".accept").forEach((button) => {
			button.addEventListener("click", async function () {
				let tradeId = button.id.slice(6);
				await acceptTrade(tradeId);
			});
		});
		document.querySelectorAll(".decline").forEach((button) => {
			button.addEventListener("click", async function () {
				let tradeId = button.id.slice(7);
				await declineTrade(tradeId);
			});
		});
		document.querySelectorAll(".cancel").forEach((button) => {
			button.addEventListener("click", async function () {
				let tradeId = button.id.slice(6);
				await cancelTrade(tradeId);
			});
		});
		let cardList = await getAllCards(id);
		document.querySelectorAll(".receiver").forEach((receiver) => {
			let tradeId = receiver.id.slice(8);

			let receiverHTML =
				"<select id='receiverchoose'> <option value='' selected disabled hidden>Choose card here.</option>";
			cardList.forEach((card, i) => {
				if (card.istrading) {
					return;
				}
				receiverHTML = `${receiverHTML}
                                <option id="${card.rarity}" value="${i}">${card.name}, ${card.rarity}</option>`;
			});
			receiverHTML = `${receiverHTML}</select>`;
			receiver.innerHTML = receiverHTML;
			receiver.setAttribute("tradenumber", tradeId);
		});
		document.querySelectorAll("#receiverchoose").forEach((receiver) => {
			receiver.addEventListener("change", async function () {
				receiver.classList.remove("common");
				receiver.classList.remove("rare");
				receiver.classList.remove("legendary");
				receiver.classList.remove("mythical");

				receiver.classList.add(receiver.options[receiver.selectedIndex].id);
				let cardValue = receiver.value;
				let cardId = cardList[cardValue].id;
				let tradeId = receiver.parentElement.getAttribute("tradenumber");
				const res = await fetch(`http://localhost:3000/trades/${tradeId}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						receiverCardId: cardId,
						status: "Awaiting confirmation",
					}),
				});
				const data = await fetch(`http://localhost:3000/cards/${cardId}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						istrading: true,
					}),
				});
				getTrades();
			});
		});
	}

	async function showCard(cardId) {
		await setAsyncTimeout(() => cardAppear(cardId), 500);
		console.log("showing card");
	}

	async function cardAppear(cardId) {
		let response = await fetch(`http://localhost:3000/cards/${cardId}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});
		let cardData = await response.json();
		let cardObject = cardData;
		let hpListCharacter = hpList.filter((element) => {
			return element.name == cardObject.name;
		});
		cardObject.actor = await hpListCharacter[0].actor;
		cardObject.house = await hpListCharacter[0].house;
		cardObject.image = await hpListCharacter[0].image;
		cardObject.slug = await hpListCharacter[0].slug;
		let showCard = "";
		console.log(cardObject);
		//on fait apparaître la carte sans les boutons supprimer et favori
		cardObject.isnew = "cardbooster";
		showCard = ` <div id="${cardObject.rarity}" class="card cardbooster appear">  
						<div class="imgcard">
							<img class ="cardimg" src="${cardObject.image}"></img>
						</div>
						<div class="textcard">
							<h2>${cardObject.name}</h2>
							<h3>House: ${cardObject.house}</h3>
							<h3>Actor: ${cardObject.actor}</h3>
							<h3>Rarity: ${cardObject.rarity}</h3>
						</div>
					</div>`;

		document.getElementById("tradingCardContainer").innerHTML = showCard;
		await setAsyncTimeout(() => {
			document.getElementById("tradingCardContainer").innerHTML = "";
		}, 2400);
	}
	async function getUsersAndCards() {
		id = await getUserData();
		allUsers = Object.values(await getAllUsers());
		allUsers = allUsers.filter((user) => {
			return user.id !== id;
		});
		let allCards = Object.values(await getAllCards(id));
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
		let cardString = ` <option value="" selected disabled hidden>Choose card here.</option>
`;

		allCards.forEach((character, i) => {
			if (character.istrading) {
				return;
			}
			//itération à travers la liste des cartes
			cardString = `${cardString}
                                <option id="${character.rarity}" value="${i}">${character.name}, ${character.rarity}</option>
                                `;
		}); //on va créer une option dans la liste par carte
		cardChoose.innerHTML = cardString; //on ajoute le string au code html
		let userString = ` <option value="" selected disabled hidden>Choose user here.</option>
`;
		allUsers.forEach((user, i) => {
			let isactive = "";
			if (user.isactive) {
				isactive = "Active";
			} else {
				isactive = "Inactive";
			}
			let istrading = "";
			if (user.isactive) {
				istrading = "Trading";
			} else {
				istrading = "Not trading";
			}
			//itération à travers la liste des cartes
			userString = `${userString}
                                <option value="${i}">${user.name}, ${isactive}, ${istrading}</option>
                                `;
		}); //on va créer une option dans la liste par carte
		usersChoose.innerHTML = userString; //on ajoute le string au code html
		getTrades();
	}
	usersChoose.addEventListener("change", function () {
		isChosenUser = true;
		if (isChosenUser && isChosenCard) {
			document
				.getElementById("submitExchange")
				.classList.remove("deadgebutton");
		}
	});
	cardChoose.addEventListener("change", function () {
		isChosenCard = true;
		document.getElementById("submitcard").classList.remove("deadgebutton");
		if (isChosenUser && isChosenCard) {
			document
				.getElementById("submitExchange")
				.classList.remove("deadgebutton");
		}
	});
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
	document
		.getElementById("submitcard")
		.addEventListener("click", async function (e) {
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
			let cardId = fullCards[cardValue].id;
			const res = await fetch(`http://localhost:3000/users/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					istrading: true,
					cardtradingid: cardId,
				}),
			});
		});
	document.getElementById("submitcard").classList.add("deadgebutton");
	document
		.getElementById("submitExchange")
		.addEventListener("click", function (e) {
			e.preventDefault();
			let cardValue = cardChoose.value;
			let userValue = usersChoose.value;
			let cardId = fullCards[cardValue].id;
			let userID = allUsers[userValue].id;
			doTrade(cardId, userID);
			getUsersAndCards();
			cardChoose.classList.add("deadgebutton");
			usersChoose.classList.add("deadgebutton");
			document.getElementById("submitcard").classList.add("deadgebutton");
			document.getElementById("showCard").innerHTML = "";
			let popup = document.querySelector(".popup");
			popup.innerHTML = `<h1>Trade request to ${allUsers[userValue].name} sent</h1>`;
			popup.classList.add("show");

			setTimeout(() => {
				getUsersAndCards();
				popup.classList.remove("show");
				popup.classList.add("hide");
				cardChoose.classList.remove("deadgebutton");
				usersChoose.classList.remove("deadgebutton");
				document.getElementById("submitcard").classList.remove("deadgebutton");
			}, 1800);
			setTimeout(() => {
				popup.classList.remove("hide");
				popup.classList.remove("show");
			}, 3000);
		});
	document.getElementById("submitExchange").classList.add("deadgebutton");
	async function doTrade(cardId, userID) {
		await fetch(`http://localhost:3000/trades/`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				senderId: id,
				receiverId: userID,
				senderCardId: cardId,
			}),
		});
		await fetch(`http://localhost:3000/cards/${cardId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				istrading: true,
			}),
		});
		getTrades();
	}
} else {
	//on récupère le bouton pour faire apparaître le modal
	document
		.getElementById("floating-button")
		.addEventListener("click", function () {
			alert("You need to be logged in to trade !");
		});
}

cardchoose.addEventListener("change", function () {
	cardchoose.classList.remove("common");
	cardchoose.classList.remove("rare");
	cardchoose.classList.remove("mythical");
	cardchoose.classList.remove("legendary");

	cardchoose.classList.add(cardchoose.options[cardchoose.selectedIndex].id);
});
// Get the tab buttons
const tabButtons = document.querySelectorAll(".tab-button");

// Get the tab contents
const tabContents = document.querySelectorAll(".tab-content");
tabContents.forEach((content) => {
	content.style.display = "none";
});

tabContents[0].style.display = "block";

// Add click event listener to each tab button
tabButtons.forEach((button, index) => {
	button.addEventListener("click", () => {
		// Remove active class from all tab buttons
		tabButtons.forEach((btn) => {
			btn.classList.remove("active");
		});

		// Add active class to the clicked tab button
		button.classList.add("active");

		// Hide all tab contents
		tabContents.forEach((content) => {
			content.style.display = "none";
		});

		// Show the corresponding tab content based on the index
		tabContents[index].style.display = "block";
	});
});
