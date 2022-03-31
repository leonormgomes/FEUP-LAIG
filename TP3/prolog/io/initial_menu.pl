/** <module> Initial Menu

Responsible for the inital menu of the game.
*/

%!      initial_menu
%
%       Starts the initial menu.
initial_menu :-
    repeat,
        initial_options_menu(Option),
        process_initial_option(Option).

%!      initial_options_menu(-Option).
%
%       Shows the initial menu.
%
%       @args Option the option the user chooses.
initial_options_menu(Option) :-
    player1(Player1),
    player2(Player2),

    player(Player1, Type1),
    player_type(Name1, Type1),
    player(Player2, Type2),
    player_type(Name2, Type2),

    atom_concat(Player1, ' - ', P1),
    atom_concat(P1, Name1, Opt1),

    atom_concat(Player2, ' - ', P2),
    atom_concat(P2, Name2, Opt2),

    Options = [Opt1, Opt2],

    write_header,
    ask_menu_default_prefix(Options, Option, 'Play', '\t\t\t\t\t').
%!      process_initial_option(0).
%
%       Base case.
process_initial_option(0).
%!      process_initial_option(+Player).
%
%       Processes the choice the user made.
%
%       @args Player the player that is going to change.
process_initial_option(Player) :-
    player1(Player1),
    player2(Player2),
    PNumbers = [Player1, Player2],
    nth1(Player, PNumbers, PlayerNumber),
    ask_player_type(PlayerType),
    set_choice(PlayerNumber, PlayerType),
    initial_menu.

%!      ask_player_type(-Type).
%
%       Asks the user which type of player he/she wants and returns it as Type
%
%       @args Type the type the user chose.
ask_player_type(Type) :-
    write_header,
    players(PlayerTypes),
    ask_menu_question_prefix(PlayerTypes, Index, 'Choose player', '\t\t\t\t\t'), 
    nth1(Index, PlayerTypes, Type).