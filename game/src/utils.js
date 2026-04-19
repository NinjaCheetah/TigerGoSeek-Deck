// "app.js" from TigerGoSeek Deck
// Copyright (c) 2026 NinjaCheetah
// https://github.com/NinjaCheetah/TigerGoSeek-Deck
//
// Provides the frontend code for interacting with the backend to display players' cards and trigger updates to them.

// Updates the current URL with the set parameters so that they won't get lost if the page reloads.
// async function updateURL(username) {
//     const usedParams = new URLSearchParams();
//     usedParams.append("username", username);
//     let url = new URL(window.location.href);
//     url.search = usedParams.toString();
//     history.pushState({}, '', url.href);
// }

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
        throw Error("Request could not be completed.")
    }
}

// Parses the URL parameters provided and updates the username field, triggering a call to getHand() if the username
// field is being filled.
// async function parseURLParameters() {
//     const paramsString = window.location.search;
//     const params = new URLSearchParams(paramsString);
//
//     if (params.get("username") !== null) {
//         let usernameEntry = document.getElementById("username_entry");
//         usernameEntry.value = params.get("username");
//         await getHand();
//     }
// }

async function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

async function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

async function logOut() {
    await setCookie("username", "", 1);
    window.location.href = "/";
}

export {
    makeRequest, setCookie, getCookie, logOut
}
