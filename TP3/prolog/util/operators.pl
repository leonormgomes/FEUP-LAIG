/** <module> Operators

Defines operators of general use.
*/

:- op(800, fx, readln).
readln X :-
  read(X), skip_line.

:- op(800, xfx, in).
Element in List :-
  member(Element, List).

:- op(900, fx, get).
:- op(800, xfx, asking).

get Answer asking Question :-
  ask_user(Question, Answer).

ask_user(Question, Answer) :-
  write(Question), write(' '),
  readln Answer.

:- op(800, yf, is_even).
X is_even :-
  even(X).

:- op(800, yf, is_odd).
X is_odd :-
  odd(X).

:- op(800, xfx, is_of).
:- op(700, xfx, on).
Row-Col on Board is_of Player :-
  get_matrix(Board, Row, Col, Piece),
  color_value(Piece, Player, _).