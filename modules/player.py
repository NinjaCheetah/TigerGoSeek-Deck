# "deck.py" from RIT Hide and Seek Deck
# Copyright (c) 2026 NinjaCheetah
# https://github.com/NinjaCheetah/RIT-Hide-and-Seek-Deck
#
# Provides the actual backend functions to create and update players' decks.

import json
import random
from typing import Tuple


MAX_HAND_SIZE = 6


def build_deck() -> list:
    deck = []
    with open("cards.json", "r") as file:
        cards = json.loads(file.read())
        for card in cards:
            count = card["count"]
            # This is just to drop the count since it's irrelevant after deck building, will probably change this later.
            card = {
                "id": card["id"],
                "title": card["title"],
                "description": card["description"],
                "cost": card["cost"]
            }
            for _ in range(count):
                deck.append(card)
    return deck


def reset_player_data(username: str) -> Tuple[list, int]:
    with open("players.json", "r") as file:
        original_content = file.read()

    try:
        players = json.loads(original_content)
    except json.JSONDecodeError:
        print("players.json read error, probably empty file")
        players = {}

    players[username] = {
        "deck": build_deck(),
        "hand": []
    }

    new_content = json.dumps(players, indent=4)

    if new_content != original_content:
        with open("players.json", "w") as file:
            file.write(new_content)

    return players[username]["hand"], len(players[username]["deck"])


def get_hand_for_player(username: str) -> Tuple[list, int]:
    with open("players.json", "r") as file:
        original_content = file.read()

    try:
        players = json.loads(original_content)
    except json.JSONDecodeError:
        print("players.json read error, probably empty file")
        players = {}

    # Player already exists, so we just need to ensure they have an empty hand and rebuild their deck if needed.
    if username in players.keys():
        player = players[username]

        if "hand" not in player.keys():
            player["hand"] = []

        if len(player["deck"]) == 0:
            player["deck"] = build_deck()

        players[username] = player

    # Player doesn't exist, so give them an empty hand and deck.
    else:
        player = {"deck": build_deck(), "hand": []}
        players[username] = player

    # Write out updated data and return the player's hand.
    new_content = json.dumps(players, indent=4)
    if new_content != original_content:
        with open("players.json", "w") as file:
            file.write(new_content)

    return players[username]["hand"], len(players[username]["deck"])


def draw_card_for_player(username: str) -> Tuple[list, int] | None:
    with open("players.json", "r") as file:
        original_content = file.read()

    try:
        players = json.loads(original_content)
    except json.JSONDecodeError:
        # Can't even load the JSON most likely means no players, so treat it the same as the requested player
        # not existing.
        return None

    # Player doesn't exist, so they can't have a hand to operate on.
    if username not in players.keys():
        return None

    player = players[username]
    # Deck has no cards, return current hand with no modification.
    if len(player["deck"]) == 0:
        return player["hand"], len(player["deck"])

    # Player is at the maximum hand size, return current hand with no modification.
    if len(player["hand"]) == 6:
        return player["hand"], len(player["deck"])

    target_index = random.randint(0, len(player["deck"]) - 1)
    player["hand"].append(player["deck"].pop(target_index))

    players[username] = player
    new_content = json.dumps(players, indent=4)

    if new_content != original_content:
        with open("players.json", "w") as file:
            file.write(new_content)

    return player["hand"], len(player["deck"])


def discard_card_for_player(username: str, card_id: int) -> Tuple[list, int] | None:
    with open("players.json", "r") as file:
        original_content = file.read()

    try:
        players = json.loads(original_content)
    except json.JSONDecodeError:
        # Can't even load the JSON most likely means no players, so treat it the same as the requested player
        # not existing.
        return None

    # Player doesn't exist, so they can't have a hand to operate on.
    if username not in players.keys():
        return None

    hand = players[username]["hand"]
    for i in range(len(hand)):
        if hand[i]["id"] == card_id:
            del hand[i]
            break

    players[username]["hand"] = hand
    new_content = json.dumps(players, indent=4)

    if new_content != original_content:
        with open("players.json", "w") as file:
            file.write(new_content)

    return hand, len(players[username]["deck"])
