import random
from move import Move
from board import Board


class Player:
    def __init__(self, is_human=True, symbol=None):
        self._is_human=is_human
        self._player_symbol = None
        self._computer_symbol = None
        

        if is_human:
            if symbol in ("X", "O"):
                self._player_symbol = symbol
                self._computer_symbol = "O" if self._player_symbol == "X" else "X"
            else:
                self._choose_symbol() 
            self._marker=self._player_symbol
        else:
            reference_symbol = symbol if symbol in ("X", "O") else "X"
            self._marker="O" if reference_symbol=="X" else "X"


    def _choose_symbol(self):
        while True:
            choice=input("Please pick a symbol  (O or X): ").strip().upper()
            if choice in ("X", "O"): 
                self._player_symbol=choice
                self._computer_symbol="O" if self._player_symbol=="X" else "X"
                break
            print("Invalid input. Please type X or O.")
        # print(f"You chose  {self._player_symbol} and the computer symbol is {self._computer_symbol}")
        # return self._player_symbol , self._computer_symbol
    

    
    @property
    def marker(self):
        return self._marker
        
    def get_move(self, board=None):
        if self._is_human:
            return self.get_human_move(board)
        else:
            return self.get_computer_move(board)

    def get_human_move(self, board=None):
        while True:
            user_input= int(input("Please enter your move (1-9): "))
            move=Move(user_input)
            if move.is_valid():
                # Check if position is available
                if board is not None and not board.is_position_available(move):
                    print("This position is already taken. Please enter another one.")
                    continue
                break
            else:
                print("Invalid input. Please enter an integer between 1 and 9.")
        return move

    
    def get_computer_move(self, board=None):
        if board is not None:
            available_positions = board.get_available_positions()
            if not available_positions:
                # Fallback if no positions available (shouldn't happen)
                random_choice = random.choice(list(range(1,10)))
                move = Move(random_choice)
                print("Computer move (1-9):", move.value )
                return move
            
            # First, check if computer can win in one move
            for position in available_positions:
                move = Move(position)
                if board.would_move_win(move, self._marker):
                    print("Computer move (1-9):", move.value )
                    return move
            
            # Second, check if player can win in one move and block them
            # We need to know the player's marker - we can infer it from available positions
            # Try to find what the opponent's marker is by checking the board
            opponent_marker = None
            for row in board.game_board:
                for cell in row:
                    if cell != Board.EMPTY_CELL and cell != self._marker:
                        opponent_marker = cell
                        break
                if opponent_marker:
                    break
            
            if opponent_marker:
                for position in available_positions:
                    move = Move(position)
                    if board.would_move_win(move, opponent_marker):
                        print("Computer move (1-9):", move.value )
                        return move
            
            # Otherwise, make a random move
            random_choice = random.choice(available_positions)
        else:
            # Fallback if board not provided (backward compatibility)
            random_choice = random.choice(list(range(1,10)))
        
        move = Move(random_choice)
        print("Computer move (1-9):", move.value )
        return move







