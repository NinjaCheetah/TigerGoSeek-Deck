// "app.js" from TigerGoSeek Deck
// Copyright (c) 2026 NinjaCheetah
// https://github.com/NinjaCheetah/TigerGoSeek-Deck
//
// Provides the frontend code for interacting with the backend to display players' cards and trigger updates to them.

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn_get_hand").onclick = getHand;
    document.getElementById("btn_draw").onclick = drawCard;
    document.getElementById("btn_reset").onclick = resetHand;
    document.getElementById("btn_discard").onclick = discardSelectedCards;

    parseURLParameters().then();
});

//let API_URL = "http://localhost:8000"
let API_URL = "https://api.tigergoseek.ninjacheetah.dev"

// Updates the HTML on the page to show the cards in the player's hand.
async function updateDisplay(hand) {
    console.log("updating HTML");

    document.getElementById("hand_div").innerHTML = `<p id="null_card"></p>`;

    for(let i = 0; i < hand.length; i++) {
        let cardDiv = `<div class="col-5"><div class="card" id="card${i}div"><h2>${hand[i]["title"]}</h2>
        <p>${hand[i]["description"]}</p>
        <p><b>${hand[i]["cost"]}</b></p>
        <input type="checkbox" id="card${i}" name="card" value="card${hand[i]["id"]}"/></div></div>`;

        document.getElementById("null_card").insertAdjacentHTML("afterend", cardDiv);

        // Checkbox functionality for clicking the whole card
        document.getElementById(`card${i}div`).addEventListener("click", () => {
            console.log(`card ${i} clicked`);
            document.getElementById(`card${i}`).checked = !document.getElementById(`card${i}`).checked;
        });
    }

    // for (let i = 0; i < hand.length; i++) {
    //     const newCard = `<p>
    //                                 <input type="checkbox" id="card${i}" name="card" value="card${hand[i]["id"]}"/>
    //                                 <label for="card${i}"><b>${hand[i]["title"]}</b> - ${hand[i]["description"]}</label>
    //                             </p>`;
    //     document.getElementById("null_card").insertAdjacentHTML("afterend", newCard);
    // }
}

// Updates the current URL with the set parameters so that they won't get lost if the page reloads.
async function updateURL(username) {
    const usedParams = new URLSearchParams();
    usedParams.append("username", username);
    let url = new URL(window.location.href);
    url.search = usedParams.toString();
    history.pushState({}, '', url.href);
}

// Gets a player's hand from the backend and updates the HTML with it.
async function getHand() {
    let username = document.getElementById("username_entry").value;
    console.log(`getting hand for player ${username}`);
    await updateURL(username);

    const targetUrl = `${API_URL}/hider/${username}/hello`
    try {
        const apiResponse = await makeRequest(targetUrl);
        console.log(apiResponse);
        await updateDisplay(apiResponse["hand"]);

        // Show main div, hide username
        document.getElementById("mainDiv").style.display = "inline";
        document.getElementById("username_div").style.display = "none";

    } catch (e) {
        console.error("failed to get player's hand, read error above");
    }
}

// Triggers drawing a card for a player on the backend and updates the HTML to display their new hand.
async function drawCard() {
    let username = document.getElementById("username_entry").value;
    console.log(`drawing a card for player ${username}`);
    await updateURL(username);

    const targetUrl = `${API_URL}/hider/${username}/draw`
    try {
        const apiResponse = await makeRequest(targetUrl);
        console.log(apiResponse);
        await updateDisplay(apiResponse["hand"]);
    } catch (e) {
        console.error("failed to draw card for player, read error above");
    }
}

// Triggers discarding selected cards for a player on the backend and updates the HTML to display their new hand.
async function discardSelectedCards() {
    let username = document.getElementById("username_entry").value;
    console.log(`discarding cards for player ${username}`);
    await updateURL(username);

    let apiResponse;
    let checkboxes = document.getElementsByName('card');
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            let targetId = checkboxes[i].value.slice(4);
            const targetUrl = `${API_URL}/hider/${username}/discard/${targetId}`
            try {
                apiResponse = await makeRequest(targetUrl);
                console.log(apiResponse);
            } catch (e) {
                console.error("failed to draw card for player, read error above");
            }
        }
    }

    // We want to wait to update the HTML to make sure deletions are done first, since you can do multiple at once.
    if (apiResponse !== null) {
        await updateDisplay(apiResponse["hand"]);
    }
}

// Triggers resetting a player's hand on the backend and updates the HTML to display their new hand.
async function resetHand() {
    let username = document.getElementById("username_entry").value;
    console.log(`resetting hand for player ${username}`);
    await updateURL(username);

    const targetUrl = `${API_URL}/hider/${username}/reset`
    try {
        const apiResponse = await makeRequest(targetUrl);
        console.log(apiResponse);
        await updateDisplay(apiResponse["hand"])
    } catch (e) {
        console.error("failed to reset player's hand, read error above");
    }
}

// Makes a request against the API and returns the response.
async function makeRequest(api_url) {
    try {
        const response = await fetch(api_url);
        if (!response.ok) {
            console.error(`Response status: ${response.status} with body: ${response.body}`);
            return;
        }
        return await response.json();
    } catch (e) {
        console.error(e);
        throw Error("Download could not be completed.")
    }
}

// Parses the URL parameters provided and updates the username field, triggering a call to getHand() if the username
// field is being filled.
async function parseURLParameters() {
    const paramsString = window.location.search;
    const params = new URLSearchParams(paramsString);

    if (params.get("username") !== null) {
        let usernameEntry = document.getElementById("username_entry");
        usernameEntry.value = params.get("username");
        await getHand();
    }
}
