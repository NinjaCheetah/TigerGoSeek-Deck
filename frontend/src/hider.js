// "hider.js" from TigerGoSeek Deck
// Copyright (c) 2026 NinjaCheetah
// https://github.com/NinjaCheetah/TigerGoSeek-Deck

import * as utils from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn_draw").onclick = drawCard;
    document.getElementById("btn_discard").onclick = discardSelectedCards;
    document.getElementById("btn_reset").onclick = resetHand;
    document.getElementById("btn_logout").onclick = utils.logOut;
    document.getElementById("btn_draw_2_pick_1").onclick = drawPick2;
    document.getElementById("btn_draw_3_pick_1").onclick = drawPick3;
    document.getElementById('btn_confirm_multi_select').onclick = multiSelectConfirm;

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

        // Handle a situation where there is still a pending multi selection so that
        // the player doesn't get softlocked.
        const awaitingSelection = apiResponse["awaiting_selection"];
        if (awaitingSelection.length !== 0) {
            console.log("multi-select was in progress, displaying modal");
            await displayMultiSelect(awaitingSelection);
        }
    } catch (e) {
        console.error(e);
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
    let username = await utils.getCookie("username");
    console.log(`drawing a card for player ${username}`);

    const targetUrl = `${utils.API_URL}/hider/${username}/draw`
    try {
        const apiResponse = await utils.makeRequest(targetUrl);
        console.log(apiResponse);
        await updateDisplay(apiResponse["hand"]);
    } catch (e) {
        console.error(e);
        console.error("failed to draw card for player, read error above");
    }
}

// Triggers discarding selected cards for a player on the backend and updates the HTML to display their new hand.
async function discardSelectedCards() {
    let username = await utils.getCookie("username");
    console.log(`discarding cards for player ${username}`);

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
                console.error(e);
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
    let username = await utils.getCookie("username");
    console.log(`resetting hand for player ${username}`);

    const targetUrl = `${utils.API_URL}/hider/${username}/reset`
    try {
        const apiResponse = await utils.makeRequest(targetUrl);
        console.log(apiResponse);
        await updateDisplay(apiResponse["hand"])
    } catch (e) {
        console.error(e);
        console.error("failed to reset player's hand, read error above");
    }
}

async function displayMultiSelect(cards) {
    console.log("updating multi-select HTML");

    document.getElementById("multi_select_div").innerHTML = `<p id="multi_select_null_card"></p>`;

    // For each card, add it to a row
    for(let i = 0; i < cards.length; i++) {
        let cardDiv = `
        <div class="col-6">
            <div class="card" id="selectcard${i}div">
                <h2 style="padding-top: 1rem;">${cards[i]["title"]}</h2>
                <p>${cards[i]["description"]}</p>
                <p><b>${cards[i]["cost"]}</b></p>
                <input type="checkbox" id="selectcard${i}" name="selectcard" value="selectcard${cards[i]["id"]}"/>
            </div>
        </div>
        `;

        document.getElementById(`multi_select_null_card`).insertAdjacentHTML("afterend", cardDiv);

        // Checkbox functionality for clicking the whole card
        document.getElementById(`selectcard${i}div`).addEventListener("click", () => {
            console.log(`multi-select card ${i} clicked`);
            document.getElementById(`selectcard${i}`).checked = !document.getElementById(`selectcard${i}`).checked;
        });
    }

    let modal = new bootstrap.Modal(document.getElementById("multiSelectChoose"));
    modal.show();
}

async function drawPick2() {
    await drawPickX(2);
}

async function drawPick3() {
    await drawPickX(3);
}

async function drawPickX(count) {
    let username = await utils.getCookie("username");
    console.log(`drawing ${count} cards to choose from for player ${username}`);

    const targetUrl = `${utils.API_URL}/hider/${username}/draw_pick/${count}`
    try {
        const apiResponse = await utils.makeRequest(targetUrl);
        console.log(apiResponse);
        const cards = apiResponse["cards"];
        await displayMultiSelect(cards);
    } catch (e) {
        console.error(e);
        console.error("failed to draw cards for selection for player, read error above");
    }
}

async function multiSelectConfirm() {
    let username = await utils.getCookie("username");
    console.log(`confirming multi-select choice for player ${username}`);

    let modal = bootstrap.Modal.getInstance(document.getElementById("multiSelectChoose"));

    if (document.getElementById("multi_select_div").children.length < 2) {
        console.log("confirm pressed with no options loaded");
        modal.hide();
        return;
    }

    let checked = [];
    let checkboxes = document.getElementsByName('selectcard');
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            let targetId = checkboxes[i].value.slice(10);
            checked.push(targetId);
        }
    }

    if (checked.length !== 1) {
        console.log("confirmed pressed with invalid number of cards selected");
        return;
    }

    const targetUrl = `${utils.API_URL}/hider/${username}/confirm_pick/${checked[0]}`
    try {
        let apiResponse = await utils.makeRequest(targetUrl);
        console.log(apiResponse);
        console.log("successfully confirmed selection");
        await updateDisplay(apiResponse["hand"]);
    } catch (e) {
        console.error(e);
        console.error("failed to draw card for player, read error above");
    }

    modal.hide();
}
