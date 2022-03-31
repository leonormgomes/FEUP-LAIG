:-use_module(library(sockets)).
:-use_module(library(lists)).
:-use_module(library(codesio)).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%                                        Server                                                   %%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% To run, enter 'server.' on sicstus command line after consulting this file.
% You can test requests to this server by going to http://localhost:8081/<request>.
% Go to http://localhost:8081/quit to close server.

% Made by Luis Reis (ei12085@fe.up.pt) for LAIG course at FEUP.

port(8081).

% Server Entry Point
server :-
	port(Port),
	write('Opened Server'),nl,nl,
	socket_server_open(Port, Socket),
	server_loop(Socket),
	socket_server_close(Socket),
	write('Closed Server'),nl.

% Server Loop 
% Uncomment writes for more information on incomming connections
server_loop(Socket) :-
	repeat,
	socket_server_accept(Socket, _Client, Stream, [type(text)]),
		% write('Accepted connection'), nl,
	    % Parse Request
		catch((
			read_request(Stream, Request),
			read_header(Stream)
		),_Exception,(
			% write('Error parsing request.'),nl,
			close_stream(Stream),
			fail
		)),
		
		% Generate Response
		handle_request(Request, MyReply, Status),
		format('Request: ~q~n',[Request]),
		format('Reply: ~q~n', [MyReply]),
		
		% Output Response
		format(Stream, 'HTTP/1.0 ~p~n', [Status]),
		format(Stream, 'Access-Control-Allow-Origin: *~n', []),
		format(Stream, 'Content-Type: text/plain~n~n', []),
		format(Stream, '~p', [MyReply]),
	
		% write('Finnished Connection'),nl,nl,
		close_stream(Stream),
	(Request = quit), !.
	
close_stream(Stream) :- flush_output(Stream), close(Stream).

% Handles parsed HTTP requests
% Returns 200 OK on successful aplication of parse_input on request
% Returns 400 Bad Request on syntax error (received from parser) or on failure of parse_input
handle_request(Request, MyReply, '200 OK') :- parse_URI(Request, Parsed), catch(parse_input(Parsed, MyReply),error(_,_),fail), !.
handle_request(syntax_error, 'Syntax Error', '400 Bad Request') :- !.
handle_request(_, 'Bad Request', '400 Bad Request').

% Reads first Line of HTTP Header and parses request
% Returns term parsed from Request-URI
% Returns syntax_error in case of failure in parsing
read_request(Stream, Request) :-
	read_line(Stream, LineCodes),
	print_header_line(LineCodes),
	
	% Parse Request
	atom_codes('GET /',Get),
	append(Get,RL,LineCodes),
	read_request_aux(RL,RL2),	
	
	catch(read_from_codes(RL2, Request), error(syntax_error(_),_), fail), !.
read_request(_,syntax_error).

read_request_aux([32|_],[46]) :- !.
read_request_aux([C|Cs],[C|RCs]) :- read_request_aux(Cs, RCs).

% parses required URIs
parse_URI([], []).
parse_URI([H|T], [RH|RT]) :-
	parse_URI(H, RH),
	parse_URI(T, RT).
% add new parsers below this one
parse_URI('%20%20', '  ').
parse_URI('%22ss%22', '\"ss\"').
parse_URI('%22MM%22', '\"MM\"').
parse_URI('%22x1%22', '\"x1\"').
parse_URI('%22x2%22', '\"x2\"').
parse_URI('%22x3%22', '\"x3\"').
parse_URI('%22x4%22', '\"x4\"').
parse_URI('%22x5%22', '\"x5\"').
parse_URI('%22o1%22', '\"o1\"').
parse_URI('%22o2%22', '\"o2\"').
parse_URI('%22o3%22', '\"o3\"').
parse_URI('%22o4%22', '\"o4\"').
parse_URI('%22o5%22', '\"o5\"').
parse_URI('%22c1%22', '\"c1\"').
parse_URI('%22c0%22', '\"c0\"').
parse_URI('%22A1%22', '\"A1\"').
parse_URI('%22A0%22', '\"A0\"').
parse_URI(X, X).


% Reads and Ignores the rest of the lines of the HTTP Header
read_header(Stream) :-
	repeat,
	read_line(Stream, Line),
	print_header_line(Line),
	(Line = []; Line = end_of_file),!.

check_end_of_header([]) :- !, fail.
check_end_of_header(end_of_file) :- !,fail.
check_end_of_header(_).

% Function to Output Request Lines (uncomment the line bellow to see more information on received HTTP Requests)
% print_header_line(LineCodes) :- catch((atom_codes(Line,LineCodes),write(Line),nl),_,fail), !.
print_header_line(_).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%                                       Commands                                                  %%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% Require your Prolog Files here

:- consult('three_dragons.pl').

parse_input([1, Board, Player, [Row, Col]], [1, List]):- server_possible_moves(Board, Player, Row-Col, List).
parse_input([3, Gamestate, Player], [1]):- game_over(Gamestate, Player),!.
parse_input([3, _, _], [0]).
parse_input([4, Board, Player, Move], [1]):- is_move_valid(Board, Player, Move),!.
parse_input([4, _, _, _], [0]).
parse_input([5, Gamestate, Move], [1, Positions]) :- check_if_captures(Gamestate, Move, Positions), !.
parse_input([5, _, _], [0]).
parse_input([6, Board, Row-Col, Player], [1, [CaveRow,CaveCol]]) :- check_if_summons_dragon(Board, Row-Col, Player, CaveRow-CaveCol), !.
parse_input([6, _, _, _], [0]).
parse_input([7, Gamestate, Player, Level], [1, [[Ri, Ci, Rf, Cf]]]) :- choose_move(Gamestate, Player, Level, _, Ri-Ci-Rf-Cf).

parse_input(handshake, handshake).
parse_input(test(C,N), Res) :- test(C,Res,N).
parse_input(quit, goodbye).

test(_,[],N) :- N =< 0.
test(A,[A|Bs],N) :- N1 is N-1, test(A,Bs,N1).
	