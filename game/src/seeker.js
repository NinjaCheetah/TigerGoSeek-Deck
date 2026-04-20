// "seeker.js" from TigerGoSeek
// Copyright (c) 2026 TigerGoSeek Contributors
// https://github.com/NinjaCheetah/TigerGoSeek

import * as utils from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn_switch_to_hider").onclick = switchToHiderView;

    loadSeekerState().then();
});

async function loadSeekerState() {
    let username = await utils.getCookie("username");

    if (username === "") {
        window.location.href = "/";
        return;
    }

    console.log(`loading questions for ${username}`);

    document.getElementById("account_username_display").innerText = username;
}

async function switchToHiderView() {
    window.location.href = "/game/hider.html";
}
