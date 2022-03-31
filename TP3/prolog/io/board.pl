/** <module> Board

Responsible for the board of the game.
*/
board_prefix('\t\t\t').

%!      write_board(+Board:list) is det.
%
%       Writes a horizontal border, followed by the actual board (game state) and the next player.
%       True when the board is well defined.
%
%       @arg Board          the board to be written
write_board(Board) :-
    write_border,
    board_height(Rows),
    write_pieces(Board, Rows),
    write_columns_names.

%!      write_end_board(+Board:list, +Winner) is det.
%
%       Writes a horizontal border, followed by the actual board (game state) and and indication to the winner of the
%       game.
%       True when the board is well defined.
%
%       @arg Board          the board to be written
%       @arg Winner         the winner of the game
write_end_board(Board, Winner) :-
    write_border,
    board_height(Rows),
    write_pieces(Board, Rows),
    write_winner(Winner).

%!      write_pieces(+Board:list, +Rows:int) is det.
%
%       Writes the board withtout a top border.
%       True when the board is well defined.
%
%       @arg Board      the board to be written
write_pieces([], 0).
write_pieces([H|T], Rows) :-
    write_empty_board_row,
    board_prefix(P), write(P),
    write('|'), write_array(H), write('  '),
    board_height(Height),
    RowNumber is Height - Rows + 1,
    write(RowNumber), nl,
    write_line,
    Rows1 is Rows - 1,
    write_pieces(T, Rows1).

%!      write_array(+Array:list) is det.
%
%       Writes the elements of a board row with the appropriate padding and separator.
%       True when the board is weel defind.
%
%       @arg Array      the board row to be written
write_array([]).
write_array([H|T]) :-
    write('  '), write(H), write('  |'),
    write_array(T).

write_columns_names :-
    board_prefix(P), write(P),
    write_columns_names(1).
write_columns_names(Column) :-
    board_width(TotalColumns),
    Column > TotalColumns,
    !, nl, nl.
write_columns_names(Column) :-
    write('    '),
    letter(Column, Letter),
    write(Letter),
    write('  '),
    Next is Column + 1,
    write_columns_names(Next).

%!      write_next_player(+Player) is det.
%
%       Writes an indication to the next player.
%       True when the Player is defined.
%
%       @arg Player     the next player
write_next_player(Player):-
    board_prefix(P), write(P),
    write('Next player: '), write(Player), nl, nl.

%!      write_winner(+Player) is det.
%
%       Writes an indication to the winner of the game.
%       True when the Player is defined.
%
%       @arg Player     the winner of the game
write_winner(Player):-
    write(Player), write(' won!!'), nl, nl.

write_empty_board_row :-
    board_width(Width),
    Width1 is Width + 1,
    board_prefix(P),
    write(P), repeat_string('|      ', Width1).

%!      write_border is det.
%
%       Writes an appropriated size border in underscores ('_').
%       True when the board width is well defined.
write_border :-
    board_width(Width),
    Amount is Width * 7 + 1,
    board_prefix(P), write(P),
    repeat_string('_', Amount).

%!      write_line is det.
%
%       Writes an appropriated size border in hyphens underscores ('-').
%       True when the board width is well defined.
write_line :-
    board_width(Width),
    Amount is Width * 7 + 1,
    board_prefix(P), write(P),
    repeat_string('-', Amount).