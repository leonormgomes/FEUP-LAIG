/** <module> Input / Output

Coordinates all operations that deal with reading and writing.
*/

%!      write_header is det.
%
%       Writes the header of the game.
%       True always.
write_header :-
    clear,
    write('  _______ _                     _____                                                                               '), nl,
    write(' |__   __| |                   |  __ \\                                                                              '), nl,
    write('    | |  | |__  _ __ ___  ___  | |  | |_ __ __ _  __ _  ___  _ __  ___                                              '), nl,
    write('    | |  | ''_ \\| ''__/ _ \\/ _ \\ | |  | | ''__/ _` |/ _` |/ _ \\| ''_ \\/ __|                                             '), nl,
    write('    | |  | | | | | |  __/  __/ | |__| | | | (_| | (_| | (_) | | | \\__ \\                                             '), nl,
    write('  __|_|_ |_|_|_|_|  \\___|\\___| |_____/|_|  \\__,_|\\__, |\\___/|_| |_|___/        _      _           _ _           _   '), nl,
    write(' |  \\/  | /_/          (_)         ___    | |     __/ |                       | |    (_)         (_) |         | |  '), nl,
    write(' | \\  / | __ _ _ __ ___ _  ___    ( _ )   | |    |___/ ___  _ __   ___  _ __  | |     _ _ __ ___  _| |_ ___  __| |  '), nl,
    write(' | |\\/| |/ _` | ''__/ __| |/ _ \\   / _ \\/\\ | |    / _ \\/ _ \\| ''_ \\ / _ \\| ''__| | |    | | ''_ ` _ \\| | __/ _ \\/ _` |  '), nl,
    write(' | |  | | (_| | | | (__| | (_) | | (_>  < | |___|  __/ (_) | | | | (_) | |    | |____| | | | | | | | ||  __/ (_| |_ '), nl,
    write(' |_|  |_|\\__,_|_|  \\___|_|\\___/   \\___/\\/ |______\\___|\\___/|_| |_|\\___/|_|    |______|_|_| |_| |_|_|\\__\\___|\\__,_(_)'), nl,
    nl, nl.

%!      ask_move(+Board,+Player,-Row1-Col1-Row2-Col2)
%
%       Ask the player in the board which piece does he want to move (in Row1-Col1) and where to (Row2-Col2).
%
%       @arg Board  the board of the game.
%       @arg Player the current player.
%       @arg Row1-Col1-Row2-Col2 where the piece is and where does the user want to move.
ask_move(Board, Player, Row1-Col1-Row2-Col2) :-
    write_next_player(Player),
    board_prefix(P), write(P),
    get PiecePosition asking 'What piece will you move?\n\t\t\tExample: a-1: ',
    get_move(Board, Player, PiecePosition, Row1-Col1-Row2-Col2).

%!      ask_move(+Board,+Player, +ReadableCoordinates, -Row1-Col1-Row2-Col2)
%
%       Checks if the coordinates that the user inserts are readable and asks where the user wants to move the piece.
%
%       @arg Board  the board of the game.
%       @arg Player the current player.
%       @arg ReadableCoordinates the piece that the user wants to move in readable mode.
%       @arg Row1-Col1-Row2-Col2 where the piece is and where does the user want to move.
get_move(Board, Player, ReadableCoordinates, Row1-Col1-Row2-Col2) :-
    readable_to_coordinates(ReadableCoordinates, Row1-Col1),
    valid_piece_moves(Board, Player, Row1-Col1, ListOfPossibleMoves),
    possible_move_representation(PossibleMove),
    get_destinations(ListOfPossibleMoves, Destinations),
    insert_multiple_matrix(PossibleMove, Board, Destinations, DemoMatrix),
    write_board(DemoMatrix),
    board_prefix(P), write(P),
    get Move asking 'Where to? ', !,
    readable_to_coordinates(Move, Row2-Col2),
    Row1-Col1-Row2-Col2 in ListOfPossibleMoves.

%!      ask_capture_strength(+GameState, +Position, -NewGameState).
%
%       Ask the player in the board which surrounded piece to capture.
%       True when the user input is correct.
%
%       @arg GameState      the current game state.
%       @arg Position       the position of the played piece.
%       @arg NewGameState   the resulting game state.
ask_capture_strength(GameState, Position, NewGameState) :-
    get_surrounded_lower_strength(GameState, Position, List),
    ask_strength_piece(GameState, Position, List, NewGameState).    

%!      readable_to_coordinates(+Readable, -Coordinate).
%
%       Transforms a readable coordinate (a-3) into a real coordinate (3-1).
%       Always true.
%
%       @arg Readable   the readable coordinate.
%       @arg Coordinate the resulting coordinate.
readable_to_coordinates(Cola-Row, Row-Col) :-
    letter(Col, Cola).

%!      repeat_string(+String:string, +Amount:int) is det.
%
%       Writes a string a given number of times.
%       True when the amount is non negative.
repeat_string(_, 0) :-
    nl.
repeat_string(String, Amount) :-
    Amount > 0,
    write(String),
    Amount1 is Amount - 1,
    repeat_string(String, Amount1).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%  Private predicates below  %%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

ask_strength_piece(GameState, _, [], GameState).
ask_strength_piece(GameState, Position, List, NewGameState) :-
    game_state(GameState, board, Board),
    write_board(Board),
    transform_list(ReadableList, readable_to_coordinates, List),
    board_prefix(P),
    ask_menu_question_prefix(ReadableList, Ans, 'Capture piece by strength?', P),
    remove_strength_asked(GameState, Position, Ans, ReadableList, NewGameState).

remove_strength_asked(GameState, OwnPosition, Ans, ReadableList, NewGameState) :-
    Ans > 0,
    nth1(Ans, ReadableList, ReadablePos),
    readable_to_coordinates(ReadablePos, Pos),
    actually_remove_strength(GameState, OwnPosition, Pos, NewGameState).
remove_strength_asked(GameState, _, 0, _, GameState).

actually_remove_strength(GameState, OwnPosition, Pos, NewGameState) :-
    game_state(GameState, [board-Board, opponent_pieces-OpponentPieces]),
    clear_piece(Board, Pos, Board1),
    NewOpponentPieces is OpponentPieces - 1,
    lower_strength(Board1, OwnPosition, NewBoard),
    set_game_state(GameState, [board-NewBoard, opponent_pieces-NewOpponentPieces], NewGameState).