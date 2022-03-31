/** <module> Pieces

Defines all pieces.
*/

/* Inanimate pieces */

empty('ss').
mountain('MM').
possible_move_representation('<>').

% caves
caves_row(5).

% the column where the caves are
left_cave_col(1).
middle_cave_col(5).
right_cave_col(9).

% the caves of the game, their columns and if they can generate dragons (0 or 1)
cave('c1', 1, 1).
cave('c0', 0, 1).
cave('A1', 1, 5).
cave('A0', 0, 5).
cave('c1', 1, 9).
cave('c0', 0, 9).

% initial values of the caves.
small_cave(Piece, Value) :- cave(Piece, Value, 1).
small_cave(Piece, Value) :- cave(Piece, Value, 9).
large_cave(Piece, Value) :- cave(Piece, Value, 5).

% checks if piece is small cave
cave(Piece, Value) :-
  small_cave(Piece, Value).
% checks if piece is large cave
cave(Piece, Value) :-
  large_cave(Piece, Value).

% Alters the value of cave from 1 to 0
cut_cave(Cave, Col, NewCave) :-
  cave(Cave, Number, Col),
  Number > 0,
  Number1 is Number - 1,
  cave(NewCave, Number1, Col).

% if the piece is a montain or a cave.
object(Piece) :-
  mountain(Piece);
  small_cave(Piece, _);
  large_cave(Piece, _).

/* Playable pieces */

% players of the game
next_player(x, o).
next_player(o, x).

% values of the pieces
% if they are o or x - indication of the player
% their value(1-5)
color_value('o1', o, 1).
color_value('o2', o, 2).
color_value('o3', o, 3).
color_value('o4', o, 4).
color_value('o5', o, 5).
color_value('x1', x, 1).
color_value('x2', x, 2).
color_value('x3', x, 3).
color_value('x4', x, 4).
color_value('x5', x, 5).
color_value('ss', 'ss', _).

% if the piece is a small dragon
small_dragon(Player, Piece) :-
  color_value(Piece, Player, 3).

% if the piece is a large dragon
large_dragon(Player, Piece) :-
  color_value(Piece, Player, 5).

% number of initial pieces for each player
initial_amount(8).