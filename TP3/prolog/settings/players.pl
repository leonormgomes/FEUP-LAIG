
% player types
human(-1).
player_type('Human', X) :-
    human(X).
player_type('Computer Level 0', 0).
player_type('Computer Level 1', 1).

players(List) :-
    findall(Type, player_type(Type, _), List).

% numbers
player1(x).
player2(o).

player_number(x).
player_number(o).

% both
:- dynamic(player/2).

% the initial players are both human
player(x, -1).
player(o, -1).

% alters the type of player
set_choice(PlayerNumber, PlayerType) :-
    player_number(PlayerNumber),
    player_type(PlayerType, PlayerLevel),
    retractall(player(PlayerNumber, _)),
    asserta(player(PlayerNumber, PlayerLevel)).