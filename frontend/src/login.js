// "login.js" from TigerGoSeek Deck
// Copyright (c) 2026 NinjaCheetah
// https://github.com/NinjaCheetah/TigerGoSeek-Deck

import * as utils from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn_login").onclick = login;
});

async function login() {
    let username = document.getElementById("username_entry").value.toLowerCase();
    console.log(`logging in as ${username}`);
    await utils.setCookie("username", username, 1);
    window.location.href="hider.html";
}
