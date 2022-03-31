/** <module> Utilities

Container of predicates of general use.
*/

%!      letter(+N:int, -Letter) is det.
%
%       Gets the Nth letter of the alphabet.
%       True when the amount is non negative and less than 27.
%
%       @arg N          the Nth element of the alphabet
%       @arg Letter     the returning letter
letter(N, Letter) :- nth1(N, [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z], Letter).

%!      fill_list(+Value, +Amount:int, -List:list) is det.
%
%       Fills a list with a given value, a given number of times.
%       True when the amount is non negative.
%
%       @arg Value          the value to fill the list, any type of value
%       @arg Amount         the number of elements to put in the list
%       @arg List           the result list
fill_list(_, 0, []).
fill_list(Value, Amount, List) :-
    Amount > 0,
    NewAmount is Amount - 1,
    fill_list(Value, NewAmount, Rest),
    List = [Value | Rest].

%!      even(+X) is det.
%c
%       Verifies if a number is even.
%       True when the number is even.
%
%       @arg X              the number to verify
even(X) :-
    0 is mod(X, 2).

%!      odd(+X) is det.
%
%       Verifies if a number is odd.
%       True when the number is odd.
%
%       @arg X              the number to verify
odd(X) :-
    1 is mod(X, 2).

%!      insert(+Element, +List:list, +Position:number, -ResList:list) is det.
%
%       Inserts an element in an index of a list.
%       Indexes start at 1.
%       True when the position index is valid and the insertion was valid.
%
%       @arg Element        the element to insert
%       @arg List           the list to insert the element to
%       @arg Position       the index/position where to insert the element. Starts at 1
%       @arg ResList        the resulting list
insert(_, [], _, []).
insert(Element, [_|T], 1, [Element|T]).
insert(Element, [H1|T1], Position, [H1|T2]) :-
    Position > 1,
    Position1 is Position - 1,
    insert(Element, T1, Position1, T2).

%!      insert_matrix(+Element, +Matrix:list, +Row:number, +Column:number, -ResMatrix:list) is det.
%
%       Inserts an element in a matrix given its row and column, replacing the previous one.
%       Indexes start at 1.
%       True when the position index is valid and the insertion was valid.
%
%       @arg Element        the element to insert
%       @arg Matrix         the list of lists (matrix) to insert the element to
%       @arg Row            the row to insert the element. Starts at 1
%       @arg Column         the column to insert the element. Starts at 1
%       @arg ResMatrix      the resulting list of lists (matrix)
insert_matrix(Element, [MH|TH], 1, Column, [Res|TH]) :-
    insert(Element, MH, Column, Res).
insert_matrix(Element, [HT|MT], Row, Column, [HT|Res]) :-
    Row > 1,
    Row1 is Row - 1,
    insert_matrix(Element, MT, Row1, Column, Res).

%!      get_matrix(+Matrix, +Row, +Column, -X) 
%   
%        Base case.
%        Returns in X the value in matrix in row and column.
%
%       @arg Matrix        the matrix.
%       @arg Row           the row where the element is. Starts at 1.
%       @arg Column        the column where the element is. Starts at 1.
%       @arg X             the value in the matrix in row and column.
get_matrix([H|_], 1, Column, X) :-
    nth1(Column, H, X).

%!      get_matrix(+Matrix, +Row, +Column, -X) 
%   
%        Returns in X the value in matrix in row and column.
%
%       @arg Matrix        the matrix.
%       @arg Row           the row where the element is. Starts at 1.
%       @arg Column        the column where the element is. Starts at 1.
%       @arg X             the value in the matrix in row and column.
get_matrix([_|T], Row, Column, X) :-
    Row1 is Row - 1,
    get_matrix(T, Row1, Column, X).

%!      insert_multiple_matrix(+Element, +Matrix, +List, -ResMatrix) 
%   
%        Insert one value in the matrix in multiple positions in List at the same time.
%        Base case.
%
%       @arg Element     the element to be inserted.
%       @arg Matrix      the initial matrix.
%       @arg List        the list where the positions are.
%       @arg ResMatrix   the resulting matrix.
insert_multiple_matrix(_, Matrix, [], Matrix).
%!      insert_multiple_matrix(+Element, +Matrix, +List, -ResMatrix) 
%   
%        Insert one value in the matrix in multiple positions in List at the same time.
%
%       @arg Element     the element to be inserted.
%       @arg Matrix      the initial matrix.
%       @arg List        the list where the positions are.
%       @arg ResMatrix   the resulting matrix.
insert_multiple_matrix(Element, Matrix, [HR-HC|T], ResMatrix) :-
    insert_matrix(Element, Matrix, HR, HC, Matrix1),
    insert_multiple_matrix(Element, Matrix1, T, ResMatrix).

%!      transform_list(+List, +Predicate, -ResList) 
%   
%        Transforms each element of List with Predicate and the result is ResList.
%        Base case.
%
%       @arg List     initial list.
%       @arg Predicate  the predicate that is going to be used to transform the list.
%       @arg ResList   the resulting List.
transform_list([], _, []).
%!      transform_list(+List, +Predicate, -ResList) 
%   
%        Transforms each element of List with Predicate and the result is ResList.
%
%       @arg List     initial list.
%       @arg Predicate  the predicate that is going to be used to transform the list.
%       @arg ResList   the resulting List.
transform_list([H|T], P, [H1|T1]) :-
    Pred =.. [P, H, H1],
    Pred,
    transform_list(T, P, T1).

%!      update_value(+List, +Value, +Index, -ResList). 
%   
%        Alters value in List with Value in Index. Returns in ResList.
%        Base case.
%
%       @arg List     initial list.
%       @arg Value  the updated value.
%       @arg Index the index that needs to be updated.
%       @arg ResList   the resulting List.
update_value([], _, _, []).
%!      update_value(+List, +Value, +Index, -ResList). 
%   
%        Alters value in List with Value in Index. Returns in ResList.
%        Base case.
%
%       @arg List     initial list.
%       @arg Value  the updated value.
%       @arg Index the index that needs to be updated.
%       @arg ResList   the resulting List.
update_value([_|T], Value, 1, [Value|T]).
%!      update_value(+List, +Value, +Index, -ResList). 
%   
%        Alters value in List with Value in Index. Returns in ResList.
%
%       @arg List     initial list.
%       @arg Value  the updated value.
%       @arg Index the index that needs to be updated.
%       @arg ResList   the resulting List.
update_value([H|T], Value, Index, [H|T1]) :-
    Index1 is Index - 1,
    update_value(T, Value, Index1, T1).

%!      push_matrix_element(+Matrix, +Row-Col, +List, -ResList). 
%   
%        Adds Row-Col in ResList if that position exists
%
%       @arg Matrix    the matrix.
%       @arg Row-Col  the position.
%       @arg List      auxiliary list.
%       @arg ResList   the resulting List.
push_matrix_element(Matrix, Row-Col, List, [Row-Col|List]) :-
    get_matrix(Matrix, Row, Col, _).
%!      push_matrix_element(+Matrix, +Row-Col, +List, -ResList). 
%   
%        Adds Row-Col in ResList if that position exists
%        Base case.
%
%       @arg Matrix    the matrix.
%       @arg Row-Col  the position.
%       @arg List      auxiliary list.
%       @arg ResList   the resulting List.
push_matrix_element(_, _, List, List).

cls :- write('\33\[2J').
clear :- write('\33\[2J').