// "hider.js" from TigerGoSeek Deck
// Copyright (c) 2026 NinjaCheetah
// https://github.com/NinjaCheetah/TigerGoSeek-Deck

import * as utils from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn_draw").onclick = drawCard;
    document.getElementById("btn_discard").onclick = discardSelectedCards;
    document.getElementById("btn_reset").onclick = resetHand;
    document.getElementById("btn_logout").onclick = utils.logOut;

    getCards().then();
});

// comment this later ig
async function getCards() {
    let username = await utils.getCookie("username");

    if (username === "") {
        window.location.href = "/";
    }

    console.log(`getting hand for player ${username}`);

    const targetUrl = `${utils.API_URL}/hider/${username}/hello`
    try {
        const apiResponse = await utils.makeRequest(targetUrl);
        console.log(apiResponse);
        await updateDisplay(apiResponse["hand"]);
    } catch (e) {
        console.error("failed to get player's hand, read error above");
    }
}

// Updates the HTML on the page to show the cards in the player's hand.
async function updateDisplay(hand) {
    console.log("updating HTML");

    document.getElementById("hand_div").innerHTML = `<p id="null_card"></p>`;

    // For each card, add it to a row
    for(let i = 0; i < hand.length; i++) {
        let cardDiv = `
        <div class="col-6">
            <div class="card" id="card${i}div">
                <h2 style="padding-top: 1rem;">${hand[i]["title"]}</h2>
                <p>${hand[i]["description"]}</p>
                <p><b>${hand[i]["cost"]}</b></p>
                <input type="checkbox" id="card${i}" name="card" value="card${hand[i]["id"]}"/>
            </div>
        </div>
        `;

        document.getElementById(`null_card`).insertAdjacentHTML("afterend", cardDiv);

        // Checkbox functionality for clicking the whole card
        document.getElementById(`card${i}div`).addEventListener("click", () => {
            console.log(`card ${i} clicked`);
            document.getElementById(`card${i}`).checked = !document.getElementById(`card${i}`).checked;
        });
    }
}

// Triggers drawing a card for a player on the backend and updates the HTML to display their new hand.
async function drawCard() {
    //let username = document.getElementById("username_entry").value;
    let username = await utils.getCookie("username");
    console.log(`drawing a card for player ${username}`);
    //await updateURL(username);

    const targetUrl = `${utils.API_URL}/hider/${username}/draw`
    try {
        const apiResponse = await utils.makeRequest(targetUrl);
        console.log(apiResponse);
        await updateDisplay(apiResponse["hand"]);
    } catch (e) {
        console.error("failed to draw card for player, read error above");
    }
}

// Triggers discarding selected cards for a player on the backend and updates the HTML to display their new hand.
async function discardSelectedCards() {
    //let username = document.getElementById("username_entry").value;
    let username = await utils.getCookie("username");
    console.log(`discarding cards for player ${username}`);
    //await updateURL(username);

    let apiResponse;
    let checkboxes = document.getElementsByName('card');
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            let targetId = checkboxes[i].value.slice(4);
            const targetUrl = `${utils.API_URL}/hider/${username}/discard/${targetId}`
            try {
                apiResponse = await utils.makeRequest(targetUrl);
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
    //let username = document.getElementById("username_entry").value;
    let username = await utils.getCookie("username");
    console.log(`resetting hand for player ${username}`);
    //await updateURL(username);

    const targetUrl = `${utils.API_URL}/hider/${username}/reset`
    try {
        const apiResponse = await utils.makeRequest(targetUrl);
        console.log(apiResponse);
        await updateDisplay(apiResponse["hand"])
    } catch (e) {
        console.error("failed to reset player's hand, read error above");
    }
}
