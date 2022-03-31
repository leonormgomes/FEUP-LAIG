/** <module> Game

Responsible for all game related predicates.
*/

/* The board dimensions */

% use an odd width if possible to avoid errors
board_width(9).
board_height(9).

%!      init_board(-Board:list)
%
%       True whenever the board_witdth and board_height are larger than 4 and the widht is odd.
%
%       @arg Board      the board to init. A list of lists
init_board(Board) :-
    player2(Second),
    init_board_half(Second, Half1),

    init_middle_row(MiddleRow),
    append(Half1, [MiddleRow], Board1),

    player1(First),
    init_board_half(First, Half2Reversed),
    reverse(Half2Reversed, Half2),

    append(Board1, Half2, Board).

%!      empty_board(-Board:list) 
%
%       Gets an empty board.
%       True whenever the board_witdth and board_height are larger than 4 and the widht is odd.
%
%       @arg Board      the board to init. A list of lists
empty_board(Board) :-
    empty(Cell),
    init_board_half(Cell, Half1),

    init_middle_row(MiddleRow),
    append(Half1, [MiddleRow], Board1),

    init_board_half(Cell, Half2Reversed),
    reverse(Half2Reversed, Half2),

    append(Board1, Half2, Board).

%!          all_valid_moves(+Board, +Player, +Row-Col, -ListOfMoves).
%  
%           Base case.
%
%           @arg Board  the board of the game.
%           @arg Player the current player of the game.
%           @arg Row-Col the cell that we want the valid moves.
%           @arg ListOfMoves list that returns the result.
all_valid_moves(_, _, Row-_, []) :-
    board_height(Height),
    Row > Height.
%!          all_valid_moves(+Board, +Player, +Row-Col, -ListOfMoves).
%  
%           Verifies if the col above is part of the board.
%           Gets possible moves (empty cells) in List1. 
%           Calculates all valid moves for col above.
%           Appends possible moves with valid moves for cell above.
%
%           @arg Board  the board of the game.
%           @arg Player the current player of the game.
%           @arg Row-Col the cell that we want the valid moves.
%           @arg ListOfMoves list that returns the result.
all_valid_moves(Board, Player, Row-Col, ListOfMoves) :-
    Col1 is Col + 1,
    board_width(Width),
    Col1 =< Width, !,
    possible_moves(Board, Player, Row-Col, List1),
    all_valid_moves(Board, Player, Row-Col1, List2),
    append(List1, List2, ListOfMoves).
%!          all_valid_moves(+Board, +Player, +Row-Col, -ListOfMoves).
%  
%           Gets possible moves (empty cells) in List1. 
%           Calculates all valid moves for right row.
%           Appends possible moves with valid moves for cell on the right.
%
%           @arg Board  the board of the game.
%           @arg Player the current player of the game.
%           @arg Row-Col the cell that we want the valid moves.
%           @arg ListOfMoves list that returns the result.
all_valid_moves(Board, Player, Row-Col, ListOfMoves) :-
    Row1 is Row + 1,
    possible_moves(Board, Player, Row-Col, List1),
    all_valid_moves(Board, Player, Row1-0, List2),
    append(List1, List2, ListOfMoves).

%!          possible_moves(+Board, +Player, +Row-Col, -List).
%  
%           Gets possible moves (empty cells) in List1. 
%           Calculates possible moves up, down, right and left of Row-Col. 
%           Appends all possible moves.
%
%           @arg Board  the board of the game.
%           @arg Player the current player of the game.
%           @arg Row-Col the cell that we want the possible moves.
%           @arg List list that returns the result.
possible_moves(Board, Player, Row-Col, List) :-
    Row-Col on Board is_of Player,
    possible_moves_up(Board, Row-Col, Row-Col, ListUp),
    possible_moves_right(Board, Row-Col, Row-Col, ListRight),
    possible_moves_down(Board, Row-Col, Row-Col, ListDown),
    possible_moves_left(Board, Row-Col, Row-Col, ListLeft),
    append(ListUp, ListRight, List1),
    append(List1, ListDown, List2),
    append(List2, ListLeft, List3),
    delete(List3, Row-Col-Row-Col, List4),  % deletes self position
    sort(List4, List).                 % sort removes duplicates 
%!          possible_moves(+Board, +Player, +Row-Col, -List).
%  
%           Base case.
%
%           @arg Board  the board of the game.
%           @arg Player the current player of the game.
%           @arg Row-Col the cell that we want the possible moves.
%           @arg List list that returns the result.
possible_moves(_, _, _, []).

server_possible_moves(Board, Player, Row-Col, List) :-
    Row-Col on Board is_of Player,
    server_possible_moves_up(Board, Row-Col, Row-Col, ListUp),
    server_possible_moves_right(Board, Row-Col, Row-Col, ListRight),
    server_possible_moves_down(Board, Row-Col, Row-Col, ListDown),
    server_possible_moves_left(Board, Row-Col, Row-Col, ListLeft),
    append(ListUp, ListRight, List1),
    append(List1, ListDown, List2),
    append(List2, ListLeft, List3),
    delete(List3, Row-Col-Row-Col, List4),  % deletes self position
    sort(List4, List).                 % sort removes duplicates 

server_possible_moves(_, _, _, []).

check_if_captures(GameState, _-_-Row-Col, Positions) :-
    game_state(GameState, [board-Board, current_player-Player]),
    get_matrix(Board, Row, Col, Piece),
    capture_surrounded_up(Board, Row-Col, Piece, Player, Up),
    capture_surrounded_down(Board, Row-Col, Piece, Player, Down),
    capture_surrounded_left(Board, Row-Col, Piece, Player, Left),
    capture_surrounded_right(Board, Row-Col, Piece, Player, Right),
    append(Up, Down, L1), append(L1, Left, L2), append(L2, Right, Positions).

%!          check_if_captures(+Board, +Row-Col, +Player, +OpponentPieces, -NewBoard, -NewOpponentPieces).
%  
%           Checks if captured up, down, left and right of Row-Col.
%
%           @arg Board  the board of the game.
%           @arg Row-Col the cell where the piece is.
%           @arg Player the current player of the game.
%           @arg OpponentPieces the number of opponent pieces.
%           @arg NewBoard the updated board.
%           @arg NewOpponentPieces the updated number of opponent pieces.
game_check_if_captures(Board, Row-Col, Player, OpponentPieces, NewBoard, NewOpponentPieces) :-
    get_matrix(Board, Row, Col, Piece),
    game_capture_surrounded_up(Board, Row-Col, Piece, Player, OpponentPieces, Board1, OPieces1),
    game_capture_surrounded_down(Board1, Row-Col, Piece, Player, OPieces1, Board2, OPieces2),
    game_capture_surrounded_left(Board2, Row-Col, Piece, Player, OPieces2, Board3, OPieces3),
    game_capture_surrounded_right(Board3, Row-Col, Piece, Player, OPieces3, NewBoard, NewOpponentPieces).    

% TODO
game_capture_surrounded_up(Board, Row-Col, Piece, Player, OpponentPieces, NewBoard, NewOpponentPieces) :-
    Row1 is Row-1,
    Row2 is Row-2,
    game_clear_surrounded_cell(Board, Piece, Row1-Col, Row2-Col, Player, OpponentPieces, NewBoard, NewOpponentPieces).

game_capture_surrounded_right(Board, Row-Col, Piece, Player, OpponentPieces, NewBoard, NewOpponentPieces) :-
    Col1 is Col+1,
    Col2 is Col+2,
    game_clear_surrounded_cell(Board, Piece, Row-Col1, Row-Col2, Player, OpponentPieces, NewBoard, NewOpponentPieces).

game_capture_surrounded_down(Board, Row-Col, Piece, Player, OpponentPieces, NewBoard, NewOpponentPieces) :-
    Row1 is Row+1,
    Row2 is Row+2,
    game_clear_surrounded_cell(Board, Piece, Row1-Col, Row2-Col, Player, OpponentPieces, NewBoard, NewOpponentPieces).

game_capture_surrounded_left(Board, Row-Col, Piece, Player, OpponentPieces, NewBoard, NewOpponentPieces) :-
    Col1 is Col-1,
    Col2 is Col-2,
    game_clear_surrounded_cell(Board, Piece, Row-Col1, Row-Col2, Player, OpponentPieces, NewBoard, NewOpponentPieces).

% TODO
game_clear_surrounded_cell(Board, OwnPiece, Row-Col, Row2-Col2, Player, OpponentPieces, NewBoard, NewOpponentPieces) :-
    next_player(Player, OtherPlayer),
    get_matrix(Board, Row, Col, OpPiece),
    color_value(OpPiece, OtherPlayer, _),
    game_remove_piece(Board, OwnPiece, Row-Col, OpPiece, Row2-Col2, Player, OpponentPieces, NewBoard, NewOpponentPieces).

game_clear_surrounded_cell(Board, _, _, _, _, OpponentPieces, Board, OpponentPieces).

game_remove_piece(Board, _, Row-Col, _, Row2-Col2, Player, OpponentPieces, NewBoard, NewOpponentPieces) :-
    get_matrix(Board, Row2, Col2, Piece2),
    (color_value(Piece2, Player, _) ; object(Piece2)), !,
    clear_piece(Board, Row-Col, NewBoard),
    NewOpponentPieces is OpponentPieces - 1.
game_remove_piece(Board, OwnPiece, _, OpPiece, _, _, OpponentPieces, Board, OpponentPieces) :-
    color_value(OwnPiece, _, OwnStrength),
    color_value(OpPiece, _, OpStrength),
    OwnStrength > OpStrength, !.

%!          summon_dragon(+Board, +Row-Col, +Player, +PlayerPieces, +Caves, -NewBoard, -NewPlayerPieces, -NewCaves).
%  
%           Checks if a dragon is summoned and, in that case, creates it and updates the player pieces.
%
%           @arg Board  the board of the game.
%           @arg Row-Col the cell where the piece is.
%           @arg Player the current player of the game.
%           @arg PlayerPieces the number of player pieces.
%           @arg Caves the caves of the game.
%           @arg NewBoard the updated board.
%           @arg NewPlayerPieces the updated number of player pieces.
%           @arg NewCaves the updated caves.
summon_dragon(Board, Row-Col, Player, PlayerPieces, Caves, NewBoard, NewPlayerPieces, NewCaves) :-
    check_if_summons_dragon(Board, Row-Col, Player, CaveRow-CaveCol), !,
    create_dragon(Board, Player, CaveRow-CaveCol, Caves, NewCaves, NewBoard),
    NewPlayerPieces is PlayerPieces + 1.
%!          summon_dragon(+Board, +Row-Col, +Player, +PlayerPieces, +Caves, -NewBoard, -NewPlayerPieces, -NewCaves).
%  
%           Base case.
%
%           @arg Board  the board of the game.
%           @arg Row-Col the cell where the piece is.
%           @arg Player the current player of the game.
%           @arg PlayerPieces the number of player pieces.
%           @arg Caves the caves of the game.
%           @arg NewBoard the updated board.
%           @arg NewPlayerPieces the updated number of player pieces.
%           @arg NewCaves the updated caves.
summon_dragon(Board, _, _, PlayerPieces, Caves, Board, PlayerPieces, Caves).

%!          reset_caves(+Board, +Row-Col, +Cave-_-_, -NewBoard).
%  
%           Resets the left cave.
%
%           @arg Board  the board of the game.
%           @arg Row-Col the cell where the cave is.
%           @arg Cave-_-_ the left cave.
%           @arg NewBoard the updated board.
reset_caves(Board, Row-Col, Cave-_-_, NewBoard) :-
    caves_row(Row),
    left_cave_col(Col), !,
    insert_matrix(Cave, Board, Row, Col, NewBoard).

%!          reset_caves(+Board, +Row-Col, +_-Cave-_, -NewBoard).
%  
%           Resets the middle cave.
%
%           @arg Board  the board of the game.
%           @arg Row-Col the cell where the cave is.
%           @arg _-Cave-_ the middle cave.
%           @arg NewBoard the updated board.
reset_caves(Board, Row-Col, _-Cave-_, NewBoard) :-
    caves_row(Row),
    middle_cave_col(Col), !,
    insert_matrix(Cave, Board, Row, Col, NewBoard).

%!          reset_caves(+Board, +Row-Col, +_-_-Cave, -NewBoard).
%  
%           Resets the right cave.
%
%           @arg Board  the board of the game.
%           @arg Row-Col the cell where the cave is.
%           @arg _-_-RIght the right cave.
%           @arg NewBoard the updated board.
reset_caves(Board, Row-Col, _-_-Cave, NewBoard) :-
    caves_row(Row),
    right_cave_col(Col), !,
    insert_matrix(Cave, Board, Row, Col, NewBoard).

%!          reset_caves(+Board, _, _, -Board).
%  
%           Base case.
%
%           @arg Board  the board of the game.
reset_caves(Board, _, _, Board).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%  Private predicates below  %%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% TODO
create_dragon(Board, Player, Row-Col, Caves, NewCaves, NewBoard) :-
    get_matrix(Board, Row, Col, Cave),
    small_cave(Cave, _), !,
    small_dragon(Player, Piece),
    insert_matrix(Piece, Board, Row, Col, NewBoard),
    update_caves(Cave, Col, Caves, NewCaves).

create_dragon(Board, Player, Row-Col, Caves, NewCaves, NewBoard) :-
    get_matrix(Board, Row, Col, Cave),
    large_cave(Cave, _),
    large_dragon(Player, Piece),
    insert_matrix(Piece, Board, Row, Col, NewBoard),
    update_caves(Cave, Col, Caves, NewCaves).

% TODO
update_caves(CaveL, Col, CaveL-CaveM-CaveR, NewCaveL-CaveM-CaveR) :-
    left_cave_col(Col), !,
    cut_cave(CaveL, Col, NewCaveL).

update_caves(CaveM, Col, CaveL-CaveM-CaveR, CaveL-NewCaveM-CaveR) :-
    middle_cave_col(Col), !,
    cut_cave(CaveM, Col, NewCaveM).

update_caves(CaveR, Col, CaveL-CaveM-CaveR, CaveL-CaveM-NewCaveR) :-
    right_cave_col(Col),
    cut_cave(CaveR, Col, NewCaveR).

% TODO
check_if_summons_dragon(Board, Row-Col, Player, Row-CaveCol) :-
    CaveCol is Col + 1,
    get_matrix(Board, Row, CaveCol, Piece),
    cave(Piece, 1),
    surrounded_by(Board, Row-CaveCol, Player).

check_if_summons_dragon(Board, Row-Col, Player, Row-CaveCol) :-
    CaveCol is Col - 1,
    get_matrix(Board, Row, CaveCol, Piece),
    cave(Piece, 1),
    surrounded_by(Board, Row-CaveCol, Player).

check_if_summons_dragon(Board, Row-Col, Player, CaveRow-Col) :-
    CaveRow is Row - 1,
    get_matrix(Board, CaveRow, Col, Piece),
    cave(Piece, 1),
    surrounded_by(Board, CaveRow-Col, Player).

check_if_summons_dragon(Board, Row-Col, Player, CaveRow-Col) :-
    CaveRow is Row + 1,
    get_matrix(Board, CaveRow, Col, Piece),
    cave(Piece, 1),
    surrounded_by(Board, CaveRow-Col, Player).

% TODO    
surrounded_by(Board, Row-Col, Player) :-
    ColUp is Col + 1,
    ColDown is Col - 1,
    RowLeft is Row - 1,
    RowRight is Row + 1,

    \+is_clear(Board, Row-ColUp, Player),
    \+is_clear(Board, Row-ColDown, Player),
    \+is_clear(Board, RowLeft-Col, Player),
    \+is_clear(Board, RowRight-Col, Player).

is_clear(Board, Row-Col, Player) :-
    get_matrix(Board, Row, Col, Piece),

    \+color_value(Piece, Player, _).

% TODO
possible_moves_up(Board, Row1-Col1, Row-Col, List) :-
    empty(Empty),
    NextRow is Row - 1,
    get_matrix(Board, NextRow, Col, X),
    X == Empty, !, % TODO prolog this
    possible_moves_up(Board, Row1-Col1, NextRow-Col, List1),
    List = [Row1-Col1-Row-Col | List1].
possible_moves_up(_, Row1-Col1, Row-Col, [Row1-Col1-Row-Col]).

% TODO
possible_moves_right(Board, Row1-Col1, Row-Col, List) :-
    empty(Empty),
    NextCol is Col + 1,
    get_matrix(Board, Row, NextCol, X),
    X == Empty, !,
    possible_moves_right(Board, Row1-Col1, Row-NextCol, List1),
    List = [Row1-Col1-Row-Col | List1].
possible_moves_right(_, Row1-Col1, Row-Col, [Row1-Col1-Row-Col]).

% TODO
possible_moves_down(Board, Row1-Col1, Row-Col, List) :-
    empty(Empty),
    NextRow is Row + 1,
    get_matrix(Board, NextRow, Col, X),
    X == Empty, !,
    possible_moves_down(Board, Row1-Col1, NextRow-Col, List1),
    List = [Row1-Col1-Row-Col | List1].
possible_moves_down(_, Row1-Col1, Row-Col, [Row1-Col1-Row-Col]).

% TODO
possible_moves_left(Board, Row1-Col1, Row-Col, List) :-
    empty(Empty),
    NextCol is Col - 1,
    get_matrix(Board, Row, NextCol, X),
    X == Empty, !,
    possible_moves_left(Board, Row1-Col1, Row-NextCol, List1),
    List = [Row1-Col1-Row-Col | List1].
possible_moves_left(_, Row1-Col1, Row-Col, [Row1-Col1-Row-Col]).

% TODO
server_possible_moves_up(Board, Row1-Col1, Row-Col, List) :-
    empty(Empty),
    NextRow is Row - 1,
    get_matrix(Board, NextRow, Col, X),
    X == Empty, !, % TODO prolog this
    server_possible_moves_up(Board, Row1-Col1, NextRow-Col, List1),
    List = [[Row1,Col1,Row,Col] | List1].
server_possible_moves_up(_, Row1-Col1, Row-Col, [[Row1,Col1,Row,Col]]).

% TODO
server_possible_moves_right(Board, Row1-Col1, Row-Col, List) :-
    empty(Empty),
    NextCol is Col + 1,
    get_matrix(Board, Row, NextCol, X),
    X == Empty, !,
    server_possible_moves_right(Board, Row1-Col1, Row-NextCol, List1),
    List = [[Row1,Col1,Row,Col] | List1].
server_possible_moves_right(_, Row1-Col1, Row-Col, [[Row1,Col1,Row,Col]]).

% TODO
server_possible_moves_down(Board, Row1-Col1, Row-Col, List) :-
    empty(Empty),
    NextRow is Row + 1,
    get_matrix(Board, NextRow, Col, X),
    X == Empty, !,
    server_possible_moves_down(Board, Row1-Col1, NextRow-Col, List1),
    List = [[Row1,Col1,Row,Col] | List1].
server_possible_moves_down(_, Row1-Col1, Row-Col, [[Row1,Col1,Row,Col]]).

% TODO
server_possible_moves_left(Board, Row1-Col1, Row-Col, List) :-
    empty(Empty),
    NextCol is Col - 1,
    get_matrix(Board, Row, NextCol, X),
    X == Empty, !,
    server_possible_moves_left(Board, Row1-Col1, Row-NextCol, List1),
    List = [[Row1,Col1,Row,Col] | List1].
server_possible_moves_left(_, Row1-Col1, Row-Col, [[Row1,Col1,Row,Col]]).

% TODO
find_piece(Board, Player, Piece, Row-Col) :-
    Row1-Col1 = 1-1,
    find_piece1(Board, Player, Piece, Row1-Col1, Row-Col).

% TODO
find_piece1([H|_], Player, Piece, Row1-Col1, Row-Col) :-
    find_piece_row(H, Player, Piece, Row1-Col1, Row-Col).
find_piece1([_|T], Player, Piece, Row1-Col1, Row-Col) :-
    Row2 is Row1 + 1,
    find_piece1(T, Player, Piece, Row2-Col1, Row-Col).

% TODO
find_piece_row([H|_], Player, H, Row-Col, Row-Col) :-
    color_value(H, Player, _).
find_piece_row([_|T], Player, Piece, Row1-Col1, Row-Col) :-
    Col2 is Col1 + 1,
    find_piece_row(T, Player, Piece, Row1-Col2, Row-Col).

%!      init_board_half(+Color:string, -Half:list) is det.
%
%       True whenever the board_witdth and board_height are larger than 4 and the widht is odd.
%
%       @arg Color      the color that the pieces have in the respective half
%       @arg Half       the half to init. A list of lists
init_board_half(Color, Half) :-
    % first row
    init_border_row(Color, Row1),

    % second row
    init_second_row(Color, Row2),
    append([Row1], [Row2], PiecesHalf),
    
    % number of empty rows
    board_height(Height),
    EmptyRowsAmount is div(Height - 1, 2) - 2,

    % adds the empty rows
    init_empty_row(EmptyRow),
    fill_list(EmptyRow, EmptyRowsAmount, AllEmptyRows),

    append(PiecesHalf, AllEmptyRows, Half).

%!      init_middle_row(-Row:list) is det.
%
%       True always.
%
%       @arg Row        the row to init that represents the middle row of a board
init_middle_row(Row) :-
    small_cave(SC, 1),
    large_cave(LC, 1),
    empty(Empty),

    Row1 = [SC],

    board_width(Width),
    EmptyCellsAmount is div((Width - 1), 2) - 1,
    fill_list(Empty, EmptyCellsAmount, EmptyCells),
    append(Row1, EmptyCells, Row2),

    append(Row2, [LC], Row3),

    append(Row3, EmptyCells, Row4),

    append(Row4, [SC], Row).

%!      init_border_row(+Color:string, -Row:list) is det.
%
%       True always.
%
%       @arg Color      the color that the pieces have in the row
%       @arg Row        the row to init that represents the closest row to its plyer (being it on the top or bottom)
init_border_row(Color, Row) :-
    mountain(Mountain),
    Row1 = [Mountain],

    color_value(C3, Color, 3),
    append(Row1, [C3], Row2),
    
    board_width(Width),
    W2Size is Width - 4,
    color_value(C2, Color, 2),
    fill_list(C2, W2Size, W2List),
    append(Row2, W2List, Row3),

    append(Row3, [C3], Row4),

    append(Row4, [Mountain], Row).

%!      init_second_row(+Color:string, -Row:list) is det.
%
%       True whenever the board_witdth and board_height are larger than 4 and the widht is odd.
%
%       @arg Color      the color that the pieces have in the row
%       @arg Row        the row to init that represents the 2nd closest row to its plyer (being it on the top or bottom)
init_second_row(Color, Row) :-
    % verifies if the width of the board is odd
    board_width(Width),
    Width is_odd,

    % gets the values to fill
    empty(Empty),
    EmptyCells is div((Width - 1), 2),
    color_value(C4, Color, 4),

    fill_list(Empty, EmptyCells, EmptyCellsList),
    Row1 = EmptyCellsList,

    append(Row1, [C4], Row2),

    append(Row2, Row1, Row).

%!      init_empty_row(-Row:list) is det.
%
%       True always.
%
%       @arg Row        the row to init that represents one of the empty rows of the board
init_empty_row(Row) :-
    empty(Empty),
    board_width(Width),

    fill_list(Empty, Width, Row).

% TODO
valid_piece_moves(Board, Player, Row-Col, ListOfMoves) :-
    get_matrix(Board, Row, Col, Piece), % gets the piece in the Row-Col position
    color_value(Piece, Player, _),          % verifies if the piece belongs to the player
    possible_moves(Board, Player, Row-Col, ListOfMoves).

% TODO
clear_piece(Board, Row-Col, NewBoard) :-
    empty(EmptyCell),
    insert_matrix(EmptyCell, Board, Row, Col, NewBoard).

% TODO
capture_surrounded_up(Board, Row-Col, Piece, Player, Returning) :-
    Row1 is Row-1,
    Row2 is Row-2,
    clear_surrounded_cell(Board, Piece, Row1-Col, Row2-Col, Player, Returning).

capture_surrounded_right(Board, Row-Col, Piece, Player, Returning) :-
    Col1 is Col+1,
    Col2 is Col+2,
    clear_surrounded_cell(Board, Piece, Row-Col1, Row-Col2, Player, Returning).

capture_surrounded_down(Board, Row-Col, Piece, Player, Returning) :-
    Row1 is Row+1,
    Row2 is Row+2,
    clear_surrounded_cell(Board, Piece, Row1-Col, Row2-Col, Player, Returning).

capture_surrounded_left(Board, Row-Col, Piece, Player, Returning) :-
    Col1 is Col-1,
    Col2 is Col-2,
    clear_surrounded_cell(Board, Piece, Row-Col1, Row-Col2, Player, Returning).

% TODO
clear_surrounded_cell(Board, OwnPiece, Row-Col, Row2-Col2, Player, Piece) :-
    write(Piece),
    next_player(Player, OtherPlayer),
    get_matrix(Board, Row, Col, OpPiece),
    color_value(OpPiece, OtherPlayer, _),
    remove_piece(Board, OwnPiece, Row-Col, OpPiece, Row2-Col2, Player, Piece).
clear_surrounded_cell(_, _, _, _, _, []).

remove_piece(Board, _, Row-Col, _, Row2-Col2, Player, Piece) :-
    get_matrix(Board, Row2, Col2, Piece2),
    (color_value(Piece2, Player, _) ; object(Piece2)), !,
    Piece = [[Row, Col]].
remove_piece(_, _, _, _, _, _, []).

% TODO
lower_strength(Board, Row-Col, NewBoard) :-
    get_matrix(Board, Row, Col, Piece),
    \+empty(Piece),
    color_value(Piece, Player, Strength),
    Strength > 1,
    NewStrength is Strength - 1,
    color_value(NewPiece, Player, NewStrength),
    insert_matrix(NewPiece, Board, Row, Col, NewBoard).

% TODO
get_destinations([], []).
get_destinations([_-_-MR2-MC2 | MovesT], [MR2-MC2 | DestinationsT]) :-
    get_destinations(MovesT, DestinationsT).

get_surrounded_lower_strength(GameState, Row-Col, List):-
    game_state(GameState, board, Board),
    get_matrix(Board, Row, Col, Piece),
    color_value(Piece, _, Value),
    
    LeftCol is Col-1,
    RightCol is Col+1,
    TopRow is Row + 1,
    BottomRow is Row - 1,

    push_matrix_element(Board, Row-LeftCol, [], L1),
    push_matrix_element(Board, Row-RightCol, L1, L2),
    push_matrix_element(Board, TopRow-Col, L2, L3),
    push_matrix_element(Board, BottomRow-Col, L3, AuxList),

    less_than(AuxList, GameState, Value, List).

less_than([], _, _, []).
less_than([Row-Col|T1], GameState, Value, [Row-Col|T2] ) :-
    game_state(GameState, [board-Board, current_player-Current]),
    next_player(Current, Opponent),
    get_matrix(Board, Row, Col, Piece),
    color_value(Piece, Opponent, PieceValue),
    PieceValue < Value,
    less_than(T1, GameState,Value, T2).
less_than([_|T], GameState, Value, List):-
    less_than(T, GameState, Value, List).


