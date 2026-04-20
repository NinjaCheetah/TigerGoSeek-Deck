# "api.py" from TigerGoSeek
# Copyright (c) 2026 TigerGoSeek Contributors
# https://github.com/NinjaCheetah/TigerGoSeek
#
# Provides the actual backend functions to create and update players' decks.

import json
import random
from typing import Tuple

from .deck import build_deck


MAX_HAND_SIZE = 6


def reset_player_data(username: str) -> Tuple[list, int]:
    with open("players.json", "r") as file:
        original_content = file.read()

    try:
        players = json.loads(original_content)
    except json.JSONDecodeError:
        print("players.json read error, probably empty file")
        players = {}

    players[username] = {
        "deck": build_deck("default"),
        "hand": [],
        "awaiting_selection": [],
    }

    new_content = json.dumps(players, indent=4)

    if new_content != original_content:
        with open("players.json", "w") as file:
            file.write(new_content)

    return players[username]["hand"], len(players[username]["deck"])


def get_state_for_player(username: str) -> Tuple[list, int, list]:
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

        players[username] = player

    # Player doesn't exist, so give them an empty hand and deck.
    else:
        player = {"deck": build_deck("default"), "hand": [], "awaiting_selection": []}
        players[username] = player

    # Write out updated data and return the player's hand.
    new_content = json.dumps(players, indent=4)
    if new_content != original_content:
        with open("players.json", "w") as file:
            file.write(new_content)

    return players[username]["hand"], len(players[username]["deck"]), players[username]["awaiting_selection"]


def draw_card_for_player(username: str) -> Tuple[list, int, str] | None:
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
        return player["hand"], len(player["deck"]), "warn.deckempty"

    # Player is at the maximum hand size, return current hand with no modification.
    if len(player["hand"]) == 6:
        return player["hand"], len(player["deck"]), "warn.handfull"

    target_index = random.randint(0, len(player["deck"]) - 1)
    player["hand"].append(player["deck"].pop(target_index))

    players[username] = player
    new_content = json.dumps(players, indent=4)

    if new_content != original_content:
        with open("players.json", "w") as file:
            file.write(new_content)

    return player["hand"], len(player["deck"]), "ok"


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


def multi_draw_for_player(username: str, count: int) -> Tuple[list | None, int | None, str]:
    with open("players.json", "r") as file:
        original_content = file.read()

    try:
        players = json.loads(original_content)
    except json.JSONDecodeError:
        return None, None, "error.internal"

    if username not in players.keys():
        return None, None, "error.playernotfound"

    player = players[username]

    if len(player["deck"]) < count:
        return None, len(player["deck"]), "warn.decktoosmall"

    if len(player["hand"]) == 6:
        return None, len(player["deck"]), "warn.handfull"

    if len(player["awaiting_selection"]) != 0:
        return None, len(player["deck"]), "warn.multiinprogress"

    for _ in range(count):
        target_index = random.randint(0, len(player["deck"]) - 1)
        player["awaiting_selection"].append(player["deck"].pop(target_index))

    players[username] = player
    new_content = json.dumps(players, indent=4)

    if new_content != original_content:
        with open("players.json", "w") as file:
            file.write(new_content)

    return player["awaiting_selection"], len(player["deck"]), "ok"


def pick_from_pending_for_player(username: str, card_id: int) -> Tuple[list| None, int | None]:
    with open("players.json", "r") as file:
        original_content = file.read()

    try:
        players = json.loads(original_content)
    except json.JSONDecodeError:
        # Can't even load the JSON most likely means no players, so treat it the same as the requested player
        # not existing.
        return None, None

    # Player doesn't exist, so they can't have a hand to operate on.
    if username not in players.keys():
        return None, None

    player = players[username]
    if len(player["awaiting_selection"]) == 0:
        return None, len(player["deck"])

    choices = player["awaiting_selection"]
    for i in range(len(choices)):
        if choices[i]["id"] == card_id:
            player["hand"].append(player["awaiting_selection"].pop(i))
            break

    player["awaiting_selection"] = []

    players[username] = player
    new_content = json.dumps(players, indent=4)

    if new_content != original_content:
        with open("players.json", "w") as file:
            file.write(new_content)

    return players[username]["hand"], len(players[username]["deck"])
