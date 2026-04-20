// "login.js" from TigerGoSeek
// Copyright (c) 2026 TigerGoSeek Contributors
// https://github.com/NinjaCheetah/TigerGoSeek

import * as utils from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn_login_hider").onclick = loginHider;
    document.getElementById("btn_login_seeker").onclick = loginSeeker;

    loadSavedUsername().then();
});

async function loginHider() {
    let username = document.getElementById("username_entry").value.toLowerCase();

    if (username === "") {
        return;
    }

    console.log(`player ${username} logging in as a hider`);
    await utils.setCookie("username", username, 1);
    window.location.href = "/game/hider.html";
}

async function loginSeeker() {
    let username = document.getElementById("username_entry").value.toLowerCase();

    if (username === "") {
        return;
    }

    console.log(`player ${username} logging in as a seeker`);
    await utils.setCookie("username", username, 1);
    window.location.href = "/game/seeker.html";
}

async function loadSavedUsername() {
    let username = await utils.getCookie("username");

    if (username !== "") {
        document.getElementById("username_entry").value = username;
    }
}
