class Board():
    EMPTY_CELL = 0

    def __init__(self):
        self.game_board=[[0,0,0],
                         [0,0,0],
                         [0,0,0]]
        

    def print_board(self):
        print("\n Positions:")
        self.print_board_with_position()
        print("Board:")
        for row in self.game_board:
            print("|", end="")
            for column in row:
                if column==Board.EMPTY_CELL:
                    print("   |", end="")
                else:
                    print(f" {column} |", end="" )
            print()
        print()

    def print_board_with_position(self):
        print("| 1 | 2 | 3 |\n| 4 | 5 | 6 |\n| 7 | 8 | 9 |")

    def submit_move(self, player, move):
        row=move.get_row()
        col=move.get_column()
        value=self.game_board[row][col]

        if value==Board.EMPTY_CELL:
            self.game_board[row][col]=player.marker
            return True
        else:
            print("This position is already taken. Please enter another one.")
            return False
        
    


    def  check_is_gamme_over(self, player, last_move):
        return ((self.check_row(player,last_move))
                or (self.check_column(player,last_move))
                or (self.check_diagonal(player))
                or (self.check_antidiagonal(player))
        )

    def check_row(self, player, last_move):
        row_index=last_move.get_row()
        board_row=self.game_board[row_index]
        return board_row.count(player.marker)==3

    def check_column(self, player, last_move):
        col_index=last_move.get_column()
        return all(self.game_board[i][col_index]==player.marker for i in range(3))

    def check_diagonal(self, player):
        return all(self.game_board[i][i]==player.marker for i in range(3))

    def check_antidiagonal(self, player):
        return all(self.game_board[i][2-i]==player.marker for i in range(3))

    def check_is_tie(self):
        empty_counter=0
        for row in self.game_board:
            empty_counter+=row.count(Board.EMPTY_CELL)
        return empty_counter==0
    
    def is_position_available(self, move):
        """Check if a move position is available"""
        row = move.get_row()
        col = move.get_column()
        return self.game_board[row][col] == Board.EMPTY_CELL
    
    def get_available_positions(self):
        """Returns a list of available position numbers (1-9)"""
        available = []
        position = 1
        for row in self.game_board:
            for col in row:
                if col == Board.EMPTY_CELL:
                    available.append(position)
                position += 1
        return available
    
    def would_move_win(self, move, marker):
        """Check if placing a marker at this move position would result in a win"""
        row = move.get_row()
        col = move.get_column()
        
        # Temporarily place the marker
        original_value = self.game_board[row][col]
        self.game_board[row][col] = marker
        
        # Create a temporary player object to check win condition
        class TempPlayer:
            def __init__(self, m):
                self.marker = m
        
        temp_player = TempPlayer(marker)
        would_win = self.check_is_gamme_over(temp_player, move)
        
        # Restore original value
        self.game_board[row][col] = original_value
        
        return would_win
    
    def reset_board(self):
        self.game_board=[[0,0,0],
                         [0,0,0],
                         [0,0,0]]


