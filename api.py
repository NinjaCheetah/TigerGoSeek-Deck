# "api.py" from RIT Hide and Seek Deck
# Copyright (c) 2026 NinjaCheetah
# https://github.com/NinjaCheetah/RIT-Hide-and-Seek-Deck
#
# Provides the base API routes required on the backend to manage players' decks.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from modules.player import *


app = FastAPI()
origins = [
    "http://localhost:4000",
    "http://127.0.0.1:4000",
    "https://rithideandseek.ninjacheetah.dev",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get(
    "/hider/{username}/reset",
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
    hand = reset_player_data(username)
    content = {
        "message": "OK",
        "hand": hand,
    }
    return JSONResponse(content=content)


@app.get(
    "/hider/{username}/draw",
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
    hand = draw_card_for_player(username)
    if hand is None:
        content = {
            "message": "Player {} has an invalid hand or deck.".format(username),
            "hand": None
        }
    else:
        content = {
            "message": "OK",
            "hand": hand
        }
    return JSONResponse(content=content)


@app.get(
    "/hider/{username}/discard/{card_id}",
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
    hand = discard_card_for_player(username, card_id)
    if hand is None:
        content = {
            "message": "Player {} has an invalid hand or deck.".format(username),
            "hand": None
        }
    else:
        content = {
            "message": "OK",
            "hand": hand
        }
    return JSONResponse(content=content)


@app.get(
    "/hider/{username}/hello",
    response_class=JSONResponse,
    responses={
        200: {
            "content": {"application/json": {}},
            "description": "Returns the hand of the specified player."
        }
    }
)
def hello(username: str):
    username = username.lower()
    hand = get_hand_for_player(username)
    content = {
        "message": "OK",
        "hand": hand,
    }
    return JSONResponse(content=content)


@app.get(
    "/health",
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


@app.get("/")
def hello_world():
  return "You've reached api.rithideandseek.ninjacheetah.dev. no snooping!"
