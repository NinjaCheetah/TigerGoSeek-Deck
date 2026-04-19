# "api.py" from RIT Hide and Seek Deck
# Copyright (c) 2026 NinjaCheetah
# https://github.com/NinjaCheetah/RIT-Hide-and-Seek-Deck
#
# Provides the base API routes required on the backend to manage players' decks.
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from modules.player import *


app = FastAPI()
origins = [
    "http://localhost:4000",
    "http://127.0.0.1:4000",
]

# noinspection PyTypeChecker
# PyCharm thinks CORSMiddleware is the wrong type, it's a confirmed PyCharm bug.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/game", StaticFiles(directory="game", html=True), name="frontend")

@app.get(
    "/api/hider/{username}/reset",
    response_class=JSONResponse,
    responses={
        200: {
            "content": {"application/json": {}},
            "description": "Reset's a player's hand and deck."
        }
    }
)
def reset_player(username: str):
    username = username.lower()
    hand, cards_remaining = reset_player_data(username)
    content = {
        "message": "OK",
        "status": "ok",
        "hand": hand,
        "cards_remaining": cards_remaining
    }
    return JSONResponse(content=content)


@app.get(
    "/api/hider/{username}/draw",
    response_class=JSONResponse,
    responses={
        200: {
            "content": {"application/json": {}},
            "description": "Draws a card from the deck and returns the player's new hand."
        }
    }
)
def draw_card(username: str):
    username = username.lower()
    hand, cards_remaining, status = draw_card_for_player(username)
    if hand is None:
        content = {
            "message": "Player {} has an invalid hand or deck.".format(username),
            "status": "error.handinvalid",
            "hand": None
        }
    else:
        content = {
            "message": "OK",
            "status": status,
            "hand": hand,
            "cards_remaining": cards_remaining
        }
    return JSONResponse(content=content)


@app.get(
    "/api/hider/{username}/discard/{card_id}",
    response_class=JSONResponse,
    responses={
        200: {
            "content": {"application/json": {}},
            "description": "Discards the specified card from the specified player's hand."
        }
    }
)
def discard_card(username: str, card_id: int):
    username = username.lower()
    hand, cards_remaining = discard_card_for_player(username, card_id)
    if hand is None:
        content = {
            "message": "Player {} has an invalid hand or deck.".format(username),
            "status": "ok",
            "hand": None
        }
    else:
        content = {
            "message": "OK",
            "status": "ok",
            "hand": hand,
            "cards_remaining": cards_remaining
        }
    return JSONResponse(content=content)


@app.get(
    "/api/hider/{username}/draw_multi/{count}",
    response_class=JSONResponse,
    responses={
        200: {
            "content": {"application/json": {}},
            "description": "Draws multiple cards and presents them to a player to select from."
        }
    }
)
def draw_multi(username: str, count: int):
    username = username.lower()
    cards, cards_remaining, status = multi_draw_for_player(username, count)
    if cards is None:
        content = {
            "message": "Could not draw cards for selection for {}.".format(username),
            "status": status,
            "cards": None,
            "cards_remaining": cards_remaining
        }
    else:
        content = {
            "message": "OK",
            "status": status,
            "cards": cards,
            "cards_remaining": cards_remaining
        }
    return JSONResponse(content=content)


@app.get(
    "/api/hider/{username}/confirm_pick/{card_id}",
    response_class=JSONResponse,
    responses={
        200: {
            "content": {"application/json": {}},
            "description": "Confirms which multi-selection card should be added to a player's hand."
        }
    }
)
def confirm_pick(username: str, card_id: int):
    username = username.lower()
    hand, cards_remaining = pick_from_pending_for_player(username, card_id)
    if hand is None:
        content = {
            "message": "Player {} has an invalid hand or deck.".format(username),
            "status": "ok",
            "hand": None
        }
    else:
        content = {
            "message": "OK",
            "status": "ok",
            "hand": hand,
            "cards_remaining": cards_remaining
        }
    return JSONResponse(content=content)

@app.get(
    "/api/hider/{username}",
    response_class=JSONResponse,
    responses={
        200: {
            "content": {"application/json": {}},
            "description": "Returns the hand of the specified player."
        }
    }
)
def state(username: str):
    username = username.lower()
    hand, cards_remaining, awaiting_selection = get_state_for_player(username)
    content = {
        "message": "OK",
        "status": "ok",
        "hand": hand,
        "cards_remaining": cards_remaining,
        "awaiting_selection": awaiting_selection
    }
    return JSONResponse(content=content)


@app.get(
    "/api/health",
    response_class=JSONResponse,
    responses={
        200: {
            "content": {"application/json": {"example": {"status": "OK"}}},
            "description": "Indicates that the API is healthy and responding to requests.",
        },
    }
)
def health_check():
    return JSONResponse(status_code=200, content={"status": "OK"})


@app.get(
    "/",
    response_class=RedirectResponse,
    status_code=301,
)
def redirect_to_login():
    return RedirectResponse("/game/login.html")
