import os
import time
from flask import Flask, jsonify, render_template, request, session

from board import Board
from move import Move
from player import Player


app = Flask(__name__, static_folder="static", template_folder="templates")
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "tic-tac-toe-secret-key")


def snapshot_board(board):
    return [row[:] for row in board.game_board]


def ensure_game_initialized():
    if "player_symbol" not in session:
        session["player_symbol"] = "X"
        session["computer_symbol"] = "O"
    if "board_state" not in session:
        reset_game_state()


def reset_game_state():
    board = Board()
    session["board_state"] = snapshot_board(board)
    session["winner"] = None
    session["last_computer_move"] = None
    return board


def load_board():
    ensure_game_initialized()
    board_state = session.get("board_state")
    board = Board()
    if board_state:
        board.game_board = [row[:] for row in board_state]
    return board


def save_board(board):
    session["board_state"] = snapshot_board(board)


def serialize_board(board):
    return [cell for row in board.game_board for cell in row]


def get_players():
    ensure_game_initialized()
    player_symbol = session.get("player_symbol", "X")
    human = Player(is_human=True, symbol=player_symbol)
    computer = Player(is_human=False, symbol=player_symbol)
    session["computer_symbol"] = computer.marker
    return human, computer


@app.route("/")
def index():
    ensure_game_initialized()
    return render_template("index.html")


@app.get("/api/state")
def api_state():
    board = load_board()
    return jsonify(
        {
            "board": serialize_board(board),
            "winner": session.get("winner"),
            "playerSymbol": session.get("player_symbol"),
            "computerSymbol": session.get("computer_symbol"),
        }
    )


@app.post("/api/dice-roll")
def api_dice_roll():
    import random
    player_roll = random.randint(1, 6)
    computer_roll = random.randint(1, 6)
    player_goes_first = player_roll > computer_roll
    if player_roll == computer_roll:
        # Tie - roll again (player wins ties for simplicity)
        player_goes_first = True
    
    session["player_goes_first"] = player_goes_first
    return jsonify(
        {
            "playerRoll": player_roll,
            "computerRoll": computer_roll,
            "playerGoesFirst": player_goes_first,
        }
    )


@app.post("/api/start")
def api_start():
    data = request.get_json(silent=True) or {}
    symbol = (data.get("symbol") or "X").upper()
    if symbol not in ("X", "O"):
        return jsonify({"error": "Symbol must be X or O."}), 400

    session["player_symbol"] = symbol
    session["computer_symbol"] = "O" if symbol == "X" else "X"
    board = reset_game_state()
    
    # If computer goes first, make computer move
    computer_move_value = None
    winner = None
    if not session.get("player_goes_first", True):
        time.sleep(0.6)
        _, computer = get_players()
        computer_move = computer.get_computer_move(board)
        board.submit_move(computer, computer_move)
        computer_move_value = computer_move.value
        
        if board.check_is_gamme_over(computer, computer_move):
            winner = "computer"
        elif board.check_is_tie():
            winner = "tie"
    
    save_board(board)
    session["winner"] = winner
    
    return jsonify(
        {
            "board": serialize_board(board),
            "winner": winner,
            "playerSymbol": session["player_symbol"],
            "computerSymbol": session["computer_symbol"],
            "computerMove": computer_move_value,
        }
    )


@app.post("/api/reset")
def api_reset():
    board = reset_game_state()
    save_board(board)
    return jsonify({"board": serialize_board(board), "winner": None})


@app.post("/api/move")
def api_move():
    data = request.get_json(silent=True) or {}
    position = data.get("position")
    if not isinstance(position, int):
        return jsonify({"error": "Position must be an integer between 1 and 9."}), 400

    move = Move(position)
    if not move.is_valid():
        return jsonify({"error": "Position must be between 1 and 9."}), 400

    board = load_board()
    player, computer = get_players()

    if not board.is_position_available(move):
        return jsonify({"error": "That square is already taken."}), 400

    board.submit_move(player, move)
    winner = None
    computer_move_value = None

    if board.check_is_gamme_over(player, move):
        winner = "player"
    elif board.check_is_tie():
        winner = "tie"
    else:
        time.sleep(0.6)
        computer_move = computer.get_computer_move(board)
        board.submit_move(computer, computer_move)
        computer_move_value = computer_move.value

        if board.check_is_gamme_over(computer, computer_move):
            winner = "computer"
        elif board.check_is_tie():
            winner = "tie"

    save_board(board)
    session["winner"] = winner
    session["last_computer_move"] = computer_move_value

    return jsonify(
        {
            "board": serialize_board(board),
            "winner": winner,
            "computerMove": computer_move_value,
            "playerSymbol": session.get("player_symbol"),
            "computerSymbol": session.get("computer_symbol"),
        }
    )


if __name__ == "__main__":
    app.run(debug=True)