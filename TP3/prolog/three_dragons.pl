/** <module> Three Dragons

Initial file, reponsible to start and keep the game running.
*/

:-use_module(library(lists)).
:-use_module(library(random)).
:-use_module(library(system)).

:-include('util/operators.pl').
:-include('util/util.pl').
:-include('game/game.pl').
:-include('game/game_state.pl').
:-include('game/bot.pl').
:-include('io/board.pl').
:-include('io/io.pl').
:-include('io/initial_menu.pl').
:-include('io/menu.pl').
:-include('settings/pieces.pl').
:-include('settings/players.pl').

%!          play.
%
%           Shows the initial menu and starts the game engine.
%           Always true.
play :-
    initial_menu,
    initial(GameState),
    play(GameState).

%!          play(+GameState).
%
%           Verifies if the game is over, displaying an informative message if so.
%           True when the game is over.
%
%           @arg GameState  the current game state.
play(GameState) :-
    game_over(GameState, Winner), !,
    game_state(GameState, board, Board),
    display_game(Board),
    write_winner(Winner).

%!          play(+GameState).
%
%           Is an iteration of the game.
%           Runs recursively.
%           True when the game is over.
%
%           @arg GameState  the current game state.
play(GameState) :-
    game_state(GameState, [board-Board, current_player-Player]),

    % repeat the input whenever there is a game
    repeat, 
        % shows the board and makes a move
        display_game(Board),
        get_move(GameState, GameState1),
        !,

    % updates the game state
    next_player(Player, NextPlayer),
    game_state(GameState1, [player_pieces-OpponentPieces, opponent_pieces-PlayerPieces]),
    set_game_state(GameState1, [current_player-NextPlayer, player_pieces-PlayerPieces, opponent_pieces-OpponentPieces], NewGameState),
    
    % runs recursively
    play(NewGameState).

%!          initial(-GameState).
%
%           Initializes the game state with the default initial values.
%           Always true.
%
%           @arg GameState  the game state to initialize.
initial(GameState) :-
    init_board(Board),
    player1(Player),
    initial_amount(PlayerPieces),
    initial_amount(OpponentPieces),
    cave(CaveL, 1, 1),
    cave(CaveM, 1, 5),
    cave(CaveR, 1, 9),
    game_state_construct(Board, Player, PlayerPieces, OpponentPieces, CaveL, CaveM, CaveR, GameState).

%!      display_game(+GameState).
%
%       Displays the current board.
%       Always true.
%
%       @arg GameState          the current game state. Contains the board.
display_game(GameState) :-
    write_header,
    write_board(GameState).

%!      valid_moves(+GameState, +Player:string, -ListOfMoves:list).
%
%       Gets all valid moves for a player in a given game state.
%       Always true.
%
%       @arg GameState          the current game state.
%       @arg Player             the player to get the valid moves from.
%       @arg ListOfMoves        the resulting list of moves.
valid_moves(GameState, Player, ListOfMoves) :-
    game_state(GameState, board, Board),
    all_valid_moves(Board, Player, 1-1, ListOfMoves).

%!      get_move(+GameState, -NewGameState).
%
%       Updates a game state, making a piece move.
%       True when the current player is human.
%
%       @arg GameState          the current game state.
%       @arg NewGameState       the game state that forms after the move.
get_move(GameState, NewGameState) :-
    game_state(GameState, [board-Board, current_player-Player]),
    % verifies if the current player is human
    human(Level),
    player(Player, Level), !,

    % asks and completes the move
    ask_move(Board, Player, Rowi-Coli-Rowf-Colf),
    move(GameState, Rowi-Coli-Rowf-Colf, GameState1),
    ask_capture_strength(GameState1, Rowf-Colf, NewGameState).

%!      get_move(+GameState, -NewGameState).
%
%       Updates a game state, making a piece move.
%       Is only called when the current player is a bot.
%       Always true.
%
%       @arg GameState          the current game state.
%       @arg NewGameState       the game state that forms after the move.
get_move(GameState, NewGameState) :-
    game_state(GameState, [current_player-Player]),
    player(Player, Level),

    % gets the bot to move
    choose_move(GameState, Player, Level, NewGameState),
    
    % waits for user input to continue
    format('~a played~nInput something to continue', [Player]),
    readln _, nl, nl.

%!      move(+GameState, +Move, -NewGameState).
%!      move(+GameState, +Row1-Col1-Row2-Col2, -NewGameState).
%
%       Updates a game state, applying a move to a piece.
%       Always true.
%
%       @arg GameState          the current game state.
%       @arg Move               the move to be applied. In the InitialRow-InitialCol-FinalRow-FinalCow format.
%       @arg NewGameState       the game state that forms after the move.
move(GameState, Row1-Col1-Row2-Col2, NewGameState) :-
    game_state(GameState, [board-Board, current_player-Player, player_pieces-PlayerPieces, opponent_pieces-OpponentPieces, caves-Caves]),

    % moves the piece, inserting in the final position and deleting from the old one
    get_matrix(Board, Row1, Col1, Piece),
    insert_matrix(Piece, Board, Row2, Col2, Board1),
    clear_piece(Board1, Row1-Col1, Board2),

    % verifies if it captures pieces
    game_check_if_captures(Board2, Row2-Col2, Player, OpponentPieces, Board3, NewOpponentPieces),
    % verifies if it summons a dragon
    summon_dragon(Board3, Row2-Col2, Player, PlayerPieces, Caves, Board4, NewPlayerPieces, NewCaveL-NewCaveM-NewCaveR),
    % verifies if a cave position needs to be reset
    reset_caves(Board4, Row1-Col1, Caves, NewBoard),

    % updates the game state
    set_game_state(GameState, [opponent_pieces-NewOpponentPieces, player_pieces-NewPlayerPieces, cave_l-NewCaveL, cave_m-NewCaveM, cave_r-NewCaveR, board-NewBoard], NewGameState).

%!      value(+GameState, +Player:string, -Value:number).
%
%       Calculates the value of a given game state, for a given player.
%       True when the current player is the one to calcule the value to.
%
%       @arg GameState          the current game state.
%       @arg Player             the player to calculate the value to.
%       @arg Value              the calculated value.
value(GameState, Player, Value) :-
    game_state(GameState, [current_player-Player, player_pieces-PlayerPieces, opponent_pieces-OpponentPieces]), !,
    Value is PlayerPieces - OpponentPieces.

%!      value(+GameState, +Player:string, -Value:number).
%
%       Calculates the value of a given game state, for a given player.
%       Is only called when the current player is not the one to calculate the value to.
%       Always true.
%
%       @arg GameState          the current game state.
%       @arg Player             the player to calculate the value to.
%       @arg Value              the calculated value.
value(GameState, _, Value) :-
    game_state(GameState, [player_pieces-PlayerPieces, opponent_pieces-OpponentPieces]), !,
    Value is OpponentPieces - PlayerPieces.

%!      choose_move(+GameState, +Player:string, +Level:number, -Move).
%
%       Chooses and makes the move of a bot using a modified minimax algorithm.
%       Always true.
%
%       @arg GameState          the current game state.
%       @arg Player             the player the bot is playing on.
%       @arg Level              the level of the bot (starting at 0).
%       @arg Move               the updated game state.
choose_move(GameState, Player, Level, Move, MoveMade) :- %add move
    minimax(GameState, Player, Player, Level, _, Move, MoveMade).

%!      game_over(+GameState, -Player:string).
%
%       Verifies if the game is over, setting the Player with the winner.
%       True when the game is over.
%
%       @arg GameState          the current game state.
%       @arg Player             the winner of the game.
game_over(GameState, Player) :-
    game_state(GameState, [current_player-Player, opponent_pieces-1]).

is_move_valid(Board, Player, Row1-Col1-Row2-Col2) :-
    valid_piece_moves(Board, Player, Row1-Col1, ListOfPossibleMoves),
    Row1-Col1-Row2-Col2 in ListOfPossibleMoves.