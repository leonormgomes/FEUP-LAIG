/** <module> Bot

Responsible for holding rules that manipulate the bots moves.
*/

%!          minimax(+GameState, +CurrentPlayer:string, +Player:string, +Level:number, -Strength:number, -NewGameState).
%
%           Calculates a random move for the bot.
%           This predicate is only called when the level of the bot is 0.
%           Always true.
%
%           @arg GameState      the current game state.
%           @arg CurrentPlayer  the player that is playing next.
%           @arg Player         the player to calculate the move to.
%           @arg Level          the level of the bot.
%           @arg Strength       the resulting strength of the play, this is, the new value of the board.
%           @arg NewGameState   the resulting game state.
minimax(GameState, Player, Player, 0, Strength, NewGameState, Move) :-
    % calculates the possible future game states
    possible_game_states(GameState, Player, GameStates),
    % gets a random move from that ones
    random_member(NewGameState-Move, GameStates),
    % gets the new strength of the boatd
    value(GameState, Player, Strength).

%!          minimax(+GameState, +CurrentPlayer:string, +Player:string, +Level:number, -Strength:number, -NewGameState).
%
%           Calculates the best immediate move for the bot.
%           This predicate is only called when the level of the bot is 1 and the player playing is the same as the one calculating it to.
%           Always true.
%
%           @arg GameState      the current game state.
%           @arg CurrentPlayer  the player that is playing next.
%           @arg Player         the player to calculate the move to.
%           @arg Level          the level of the bot.
%           @arg Strength       the resulting strength of the play, this is, the new value of the board.
%           @arg NewGameState   the resulting game state.
minimax(GameState, Player, Player, 1, Strength, NewGameState, Move) :-
    % calculates the possible future game states
    possible_game_states(GameState, Player, GameStates),
    % gets the best ones into BestMoves
    best_moves(GameState, Player, GameStates, BestMoves),
    % chooses a random one for the best ones
    random_member(Strength-NewGameState-Move, BestMoves).

%!          minimax(+GameState, +CurrentPlayer:string, +Player:string, +Level:number, -Strength:number, -NewGameState).
%
%           Calculates the best immediate move for the bot.
%           This predicate is only called when the level of the bot is 1.
%           True when the current player is different from the player in which we are calculating it to.
%
%           @arg GameState      the current game state.
%           @arg CurrentPlayer  the player that is playing next.
%           @arg Player         the player to calculate the move to.
%           @arg Level          the level of the bot.
%           @arg Strength       the resulting strength of the play, this is, the new value of the board.
%           @arg NewGameState   the resulting game state.
minimax(GameState, CurrentPlayer, Player, 1, Strength, NewGameState, Move) :-
    % only when it is calculating for the opponent
    CurrentPlayer \= Player,
    % calculates the best possible future game states
    possible_game_states(GameState, Player, GameStates),
    best_moves(GameState, Player, GameStates, BestMoves),
    % chooses a random one from the best game states
    random_member(OpponentStrength-NewGameState-Move, BestMoves),
    % calculates the strength for the current player (which is the opposite)
    Strength is 0 - OpponentStrength.

%!          minimax(+GameState, +CurrentPlayer:string, +Player:string, +Level:number, -Strength:number, -NewGameState).
%
%           Calculates the best move for the bot, calculating it a number of iterations ahead.
%           Is the recursive step.
%           Not used in the server!
%           True when the level is > 1.
%
%           @arg GameState      the current game state.
%           @arg CurrentPlayer  the player that is playing next.
%           @arg Player         the player to calculate the move to.
%           @arg Level          the level of the bot.
%           @arg Strength       the resulting strength of the play, this is, the new value of the board.
%           @arg NewGameState   the resulting game state.
minimax(GameState, _, Player, Level, Strength, NewGameState) :-
    Level > 1,
    % gets the possible immediate game states
    possible_game_states(GameState, Player, AllGameStates),

    % uses minimax in which one of them, storing the Strength-ImmediateGameState-DepthGameState in a list in Values, sorted by value
    get_game_states_values(AllGameStates, Player, Level, Values),
    sort(Values, V1),
    reverse(V1, V2),

    % selects only the moves with the best value in BestMoves and chooses only one of them randomly
    select_only_best_moves_past_game_state(V2, BestMoves),
    random_member(Strength-NewGameState-_, BestMoves).

%!          get_game_states_values(+GameStates:list, +Player:string, +Level:number, -Values:list).
%
%           Runs minimax recursively, getting the values in an array.
%           Is the recursive step.
%           Alays true
%
%           @arg GameState      the game state to calculate to.
%           @arg Player         the player to calculate the move to.
%           @arg Level          the level of the bot.
%           @arg Values         the resulting values list.
get_game_states_values([], _, _, []).
get_game_states_values([H|T], Player, Level, [V-H-HRes|TR]) :-
    Level1 is Level - 1,
    next_player(Player, Next),
    minimax(H, Player, Next, Level1, V, HRes),
    get_game_states_values(T, Player, Level, TR).

%!          possible_game_states(+GameState, +Player:string, -GameStates:list).
%
%           Calculates the possible immediate game states after a game state and any move.
%           Always true.
%
%           @arg GameState      the game state to calculate it to.
%           @arg Player         the player moving a piece.
%           @arg GameStates     the resulting game states.
possible_game_states(GameState, Player, GameStates) :-
    valid_moves(GameState, Player, ListOfMoves),
    new_game_states(GameState, ListOfMoves, GameStates).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%  Private predicates below  %%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

new_game_states(_, [], []).
new_game_states(GameState, [Move|T], Res) :-
    Move = _Ri-_Ci-Rf-Cf,
    move(GameState, Move, GS),
    get_surrounded_lower_strength(GS, Rf-Cf, SurroundedLower),
    get_surrounded_lower_game_states(GS , Move, SurroundedLower, GameStates),
    append([GS-Move], GameStates, ListOfGS),
    new_game_states(GameState, T, T2),
    append(ListOfGS, T2, Res).

get_surrounded_lower_game_states(_, _, [], []).
get_surrounded_lower_game_states(GameState, Move, [Pos|T], GameStates) :-
    Move = _Ri-_Ci-Rf-Cf,
    actually_remove_strength(GameState, Rf-Cf, Pos, GS),
    get_surrounded_lower_game_states(GameState, Move, T, T1),
    GameStates = [GS-Move|T1].

best_moves(_, _, [], []).
best_moves(GameState, Player, GameStates, BestMoves) :-
    moves_values(GameState, Player, GameStates, Values),
    keysort(Values, V1),
    reverse(V1, V2),
    select_only_best_moves(V2, BestMoves).

select_only_best_moves([V-GS-Mv | T], Res) :-
    select_only_best_moves([V-GS-Mv | T], V, Res).

select_only_best_moves([], _, []).
select_only_best_moves([V-GS-MV | T], V, [V-GS-MV | TR]) :-
    !, select_only_best_moves(T, V, TR).
select_only_best_moves(_, _, []).

select_only_best_moves_past_game_state([V-GS-GO | T], Res) :-
    select_only_best_moves_past_game_state([V-GS-GO | T], V, Res).
select_only_best_moves_past_game_state([], _, []).
select_only_best_moves_past_game_state([V-OGS-RGS | T], V, [V-OGS-RGS | TR]) :-
    !, select_only_best_moves_past_game_state(T, V, TR).
select_only_best_moves_past_game_state(_, _, []).

moves_values(_, _, [], []).
moves_values(GameState, Player, [GS-Move|T], [Value-GS-Move|TV]) :-
    value(GS, Player, Value),
    moves_values(GameState, Player, T, TV).