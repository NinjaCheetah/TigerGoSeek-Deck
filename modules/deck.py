# "api.py" from TigerGoSeek
# Copyright (c) 2026 TigerGoSeek Contributors
# https://github.com/NinjaCheetah/TigerGoSeek
#
# Module for managing decks.

import json
import pathlib


def validate_deck(deck: dict) -> bool:
    if not "name" in deck.keys():
        return False

    if not "description" in deck.keys():
        return False

    if not "cards" in deck.keys():
        return False

    cards = deck["cards"]
    if len(cards) == 0:
        return False

    return True


def get_decks() -> dict[str, dict]:
    decks = {}

    json_files = list(pathlib.Path("decks").glob("*.[jJ][sS][oO][nN]"))

    for file in json_files:
        with open(file, "r") as f:
            deck = json.loads(f.read())
            # Only add deck to the list if it validates successfully.
            if validate_deck(deck):
                print(f"Found valid deck \"{deck['name']}\"!")
                decks[file.stem] = deck

    return decks


def load_deck(name: str) -> dict:
    with open(pathlib.Path("decks").joinpath(f"{name}.json"), "r") as f:
        deck = json.loads(f.read())
        # Only add deck to the list if it validates successfully.
        if validate_deck(deck):
            print(f"Loading deck \"{deck['name']}\"!")
            return deck
    raise ValueError


def build_deck(name: str) -> list:
    try:
        deck = load_deck(name)
    except ValueError:
        try:
            deck = load_deck("default")
            print("warn: specified deck was invalid, falling back on default deck")
        except ValueError:
            print("error: specified deck was invalid, and the default deck could not be loaded!")
            raise ValueError

    cards = []
    for card in deck["cards"]:
        count = card["count"]
        card = {
            "id": card["id"],
            "title": card["title"],
            "description": card["description"],
            "cost": card["cost"],
            "expires-in": card["expires-in"],
        }
        for _ in range(count):
            cards.append(card)

    return cards
