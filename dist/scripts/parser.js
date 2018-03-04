/**
 * This is the parser, which takes the tokens generated by the lexer
 * and validates their ordering with the provided grammar.
 * Produces a CST.
 * Traverse inorder DFS.
 * Top-down recursive descent parser on an LL(1) grammar.
 */
var TSC;
(function (TSC) {
    var Production;
    (function (Production) {
        Production["Program"] = "Program";
        Production["Block"] = "Block";
        Production["Expr"] = "Expression";
        Production["Stmt"] = "Statement";
        Production["StmtList"] = "StatementList";
        Production["AssignStmt"] = "AssignmentStatement";
        Production["PrintStmt"] = "PrintStatement";
        Production["WhileStmt"] = "WhileStatement";
        Production["VarDecl"] = "VarDecl";
        Production["IfStmt"] = "IfStatement";
        Production["BooleanExpr"] = "BooleanExpression";
        Production["IntExpr"] = "IntegerExpression";
        Production["StringExpr"] = "StringExpression";
        Production["CharList"] = "CharList";
        Production["Id"] = "Id";
        Production["BoolVal"] = "BoolVal";
        Production["Type"] = "Type";
        Production["Char"] = "Char";
        Production["Digit"] = "Digit";
        Production["IntOp"] = "IntOp";
        Production["BoolOp"] = "BoolOp";
    })(Production = TSC.Production || (TSC.Production = {}));
    var Parser = /** @class */ (function () {
        // Constructor for parser, passed tokens from lexer. Inits values.
        function Parser(tokens) {
            this.tokenList = tokens;
            // Set current token to the first token in the list
            this.currentToken = 0;
            // Holds log messages generated by parser
            this.log = [];
            this.error = false;
            this.cst = new TSC.Tree();
        }
        // ---------------------------- NON-TERMINALS -------------------------------- //
        // Due to the brilliance of JavaScript's short-circuit evaluation, our
        // lives are made way easier. i.e. false && (anything) is false, JS
        // will not eval anything after the first expression if it is false. Praise!
        // I'm so lazy and I don't want to write out a million if statements.
        // Top-down recursive descent left->right leftmost derivation parser.
        // Each derivation returns true or false, flagging the success of following a
        // rewrite rule for a production.
        // I think most of the logic of the code is self-documenting if one refers to 
        // the grammar of the language.
        /**
         * Starts the parse of tokens passed in from the lexer
         */
        Parser.prototype.parse = function () {
            if (this.parseProgram()) {
                console.log("PARSER: success!");
            }
            else {
                console.log("PARSER: error");
            }
            console.log(this.log);
        };
        /**
         * Parses the tokens to see if they make up a Program, or a Block appended with an EOP marker
         */
        Parser.prototype.parseProgram = function () {
            if (this.parseBlock([Production.Program], true) && this.matchToken(TSC.TokenType.TEop, null, null, true)) {
                return true;
            }
            return false;
        };
        /**
         * Parses the tokens to see if they make up a Block, or a ( StatementList )
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseBlock = function (production, expected) {
            if (this.matchToken(TSC.TokenType.TLbrace, production, Production.Block, false) && this.parseStatementList(null, false) && this.matchToken(TSC.TokenType.TRbrace, null, null, true)) {
                // ascend the tree after we've derived a block
                this.cst.ascendTree();
                return true;
            }
            if (expected && !this.error) {
                this.error = true;
                this.log.push("ERROR - Expecting Block, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        };
        /**
         * Parses the tokens to see if they make up a StatementList, or a Statement StatementList, or epsilon
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseStatementList = function (production, expected) {
            if (this.parseStatement([Production.StmtList], false) && this.parseStatementList([Production.StmtList], false)) {
                // ascend the tree after we've derived a stmtlist
                this.cst.ascendTree();
                return true;
            }
            else {
                return true;
            }
        };
        /**
         * Parses the tokens to see if they make up a Statement, or a PrintStatement, AssignStatement, WhileStatement, VarDecl, IfStatement, or Block
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseStatement = function (production, expected) {
            if (this.parsePrintStatement([Production.StmtList, Production.Stmt], false) || this.parseAssignmentStatement([Production.StmtList, Production.Stmt], false) ||
                this.parseWhileStatement([Production.StmtList, Production.Stmt], false) || this.parseVarDecl([Production.StmtList, Production.Stmt], false) ||
                this.parseIfStatement([Production.StmtList, Production.Stmt], false) || this.parseBlock([Production.StmtList, Production.Stmt], false)) {
                this.cst.ascendTree();
                return true;
            }
            return false;
        };
        /**
         * Parses the tokens to see if they make up a PrintStatement, or a Print ( Expr )
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parsePrintStatement = function (production, expected) {
            if (this.matchToken(TSC.TokenType.TPrint, production, Production.PrintStmt, false) && this.matchToken(TSC.TokenType.TLparen, null, null, true) &&
                this.parseExpr([Production.Expr], true) && this.matchToken(TSC.TokenType.TRparen, null, null, true)) {
                // ascend the tree after we've derived a printstmt
                this.cst.ascendTree();
                return true;
            }
            if (expected && !this.error) {
                this.log.push("ERROR - Expecting PrintStatement, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        };
        /**
         * Parses the tokens to see if they make up an AssignmentStatement, or an Id = Expr
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseAssignmentStatement = function (production, expected) {
            if (this.parseId(production.concat([Production.AssignStmt]), false) &&
                this.matchToken(TSC.TokenType.TAssign, null, null, true) && this.parseExpr([Production.Expr], true)) {
                // ascend the tree after we've derived a assignstmt
                this.cst.ascendTree();
                return true;
            }
            if (expected && this.error) {
                this.error = true;
                this.log.push("ERROR - Expecting AssignmentStatement, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        };
        /**
         * Parses the tokens to see if they make up a VarDecl, or a Type Id
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseVarDecl = function (production, expected) {
            if (this.parseType(production.concat([Production.VarDecl]), false) && this.parseId(null, true)) {
                // ascend the tree after we've derived a vardecl
                this.cst.ascendTree();
                return true;
            }
            if (expected && !this.error) {
                this.error = true;
                this.log.push("ERROR - Expecting VarDecl, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        };
        /**
         * Parses the tokens to see if they make up a WhileStatement, or a While BooleanExpr Block
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseWhileStatement = function (production, expected) {
            if (this.matchToken(TSC.TokenType.TWhile, production, Production.WhileStmt, false) && this.parseBooleanExpr([Production.BooleanExpr], true) && this.parseBlock(null, true)) {
                // ascend the tree after we've derived a whilestmt
                this.cst.ascendTree();
                return true;
            }
            if (expected && !this.error) {
                this.error = true;
                this.log.push("ERROR - Expecting WhileStatement, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        };
        /**
         * Parses the tokens to see if they make up an IfStatement, or an If BooleanExpr Block
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseIfStatement = function (production, expected) {
            if (this.matchToken(TSC.TokenType.TIf, production, Production.IfStmt, false) && this.parseBooleanExpr([Production.BooleanExpr], true) &&
                this.parseBlock(null, true)) {
                // ascend the tree after we've derived an ifstatement
                this.cst.ascendTree();
                return true;
            }
            if (expected && !this.error) {
                this.error = true;
                this.log.push("ERROR - Expecting IfStatement, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        };
        /**
         * Parses the tokens to see if they make up an Expr, or an IntExpr, StringExpr, BooleanExpr, or Id
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseExpr = function (production, expected) {
            if (this.parseIntExpr(production, false) || this.parseStringExpr(production, false) || this.parseBooleanExpr(production, false) ||
                this.parseId(production, false)) {
                // ascend the tree after we've derived an expr
                this.cst.ascendTree();
                return true;
            }
            // return error if expression not found
            if (!this.error) {
                this.error = true;
                this.log.push("ERROR - Expecting Expr, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        };
        /**
         * Parses the tokens to see if they make up an IntExpr, or a Digit, or Digit Intop Expr
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseIntExpr = function (production, expected) {
            // if(this.matchToken(TokenType.TDigit, production, Production.IntExpr, false)){
            if (this.parseDigit(production.concat([Production.IntExpr]), false)) {
                // ascend the tree after we've derived an intexpr
                // if(this.parseIntop([Production.IntOp], false) && this.parseExpr([Production.Expr], true)){
                if (this.parseIntop(null, false) && this.parseExpr([Production.Expr], true)) {
                    this.cst.ascendTree();
                    return true;
                }
                else {
                    this.cst.ascendTree();
                    return true;
                }
            }
            if (expected && !this.error) {
                this.error = true;
                this.log.push("ERROR - Expecting IntExpr, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        };
        /**
         * Parses the tokens to see if they make up a StringExpr, or a " CharList "
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseStringExpr = function (production, expected) {
            if (this.matchToken(TSC.TokenType.TQuote, production, Production.StringExpr, false) && this.parseCharList([Production.CharList], true) && this.matchToken(TSC.TokenType.TQuote, null, null, true)) {
                // ascend the tree after we've derived a stringexpr
                this.cst.ascendTree();
                return true;
            }
            if (expected && !this.error) {
                this.error = true;
                this.log.push("ERROR - Expecting StringExpr, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        };
        /**
         * Parses the tokens to see if they make up a BooleanExpr, or a Boolval or a ( Expr Boolop Expr )
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseBooleanExpr = function (production, expected) {
            if (this.parseBoolVal(production, false)) {
                // ascend the tree after we've derived a booleanexpr
                this.cst.ascendTree();
                return true;
            }
            else if (this.matchToken(TSC.TokenType.TLparen, production, Production.BooleanExpr, false) && this.parseExpr([Production.Expr], true) &&
                this.parseBoolop(null, true) && this.parseExpr([Production.Expr], true) && this.matchToken(TSC.TokenType.TRparen, null, null, true)) {
                // else if(this.matchToken(TokenType.TLparen, production, Production.BooleanExpr, false) && this.parseExpr([Production.Expr], true) &&
                // this.matchToken(TokenType.TBoolop, null, null, true) && this.parseExpr([Production.Expr], true) && this.matchToken(TokenType.TRparen, null, null, true)){
                // ascend the tree after we've derived a print statement
                this.cst.ascendTree();
                return true;
            }
            if (expected && !this.error) {
                this.error = true;
                this.log.push("ERROR - Expecting BooleanExpr, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        };
        /**
         * Parses the tokens to see if they make up a BoolVal, or true or false
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseBoolVal = function (production, expected) {
            // we add a BooleanExpr to the list of productions rewritten, as Expr is rewritten to BooleanExpr, which is then rewritten to Boolval
            if (this.matchToken(TSC.TokenType.TBoolval, production.concat([Production.BooleanExpr]), Production.BoolVal, false)) {
                // ascend the tree after we've derived a boolval statement
                this.cst.ascendTree();
                return true;
            }
            if (expected && !this.error) {
                this.error = true;
                this.log.push("ERROR - Expecting BoolVal, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        };
        /**
         * Parses the tokens to see if they make up an Id
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseId = function (production, expected) {
            if (this.matchToken(TSC.TokenType.TId, production, Production.Id, false)) {
                // ascend the tree after we've derived an id
                this.cst.ascendTree();
                return true;
            }
            if (expected && !this.error) {
                this.error = true;
                this.log.push("ERROR - Expecting Id, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        };
        /**
         * Parses the tokens to see if they make up a Type, or int, string, or boolean
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseType = function (production, expected) {
            if (this.matchToken(TSC.TokenType.TType, production, Production.Type, false)) {
                // ascend the tree after we've derived a type
                this.cst.ascendTree();
                return true;
            }
            if (expected && !this.error) {
                this.error = true;
                this.log.push("ERROR - Expecting Type, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        };
        /**
         * Parses the tokens to see if they make up a Char, or a, b, c ..., z
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseChar = function (production, expected) {
            if (this.matchToken(TSC.TokenType.TChar, production, Production.Char, false)) {
                this.cst.ascendTree();
                return true;
            }
            if (expected && !this.error) {
                this.error = true;
                this.log.push("ERROR - Expecting Char, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        };
        /**
         * Parses the tokens to see if they make up a Digit, or 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseDigit = function (production, expected) {
            if (this.matchToken(TSC.TokenType.TDigit, production, Production.Digit, false)) {
                this.cst.ascendTree();
                return true;
            }
            if (expected && !this.error) {
                this.error = true;
                this.log.push("ERROR - Expecting Digit, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        };
        /**
         * Parses the tokens to see if they make up an Intop, or +
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseIntop = function (production, expected) {
            if (this.matchToken(TSC.TokenType.TIntop, production, Production.IntOp, false)) {
                this.cst.ascendTree();
                return true;
            }
            if (expected && !this.error) {
                this.error = true;
                this.log.push("ERROR - Expecting Digit, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        };
        /**
         * Parses the tokens to see if they make up an Boolop, or == or !=
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseBoolop = function (production, expected) {
            if (this.matchToken(TSC.TokenType.TBoolop, production, Production.BoolOp, false)) {
                this.cst.ascendTree();
                return true;
            }
            if (expected && !this.error) {
                this.error = true;
                this.log.push("ERROR - Expecting Boolop, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        };
        /**
         * Parses the tokens to see if they make up a CharList, or a Char Charlist, or epsilon
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseCharList = function (production, expected) {
            // spaces are treated as chars for me
            if (this.parseChar(production, false) && this.parseCharList(production, false)) {
                // ascend the tree after we've derived a print statement
                this.cst.ascendTree();
                return true;
            }
            else {
                // epsilon... accept empty
                return true;
            }
        };
        // ---------------------------- TERMINALS -------------------------------- //
        /**
         * Matches and consumes a passed token type.
         * If the next token we're looking at match to a terminal symbol,
         * advance the current token.
         * If error, break out of parse
         * Logs appropriate production that is being derived.
         * Token is expected to be present based on boolean value passed. If
         * the token is not present, throw an error.
         * @param token the token that is being matched and consumed
         * @param start productions that is being rewritten, if any
         * @param rewrite production that is being rewritten to, if any
         * @param expected flag for if token is expected to be matched
         */
        Parser.prototype.matchToken = function (token, start, rewrite, expected) {
            console.log("PRODS");
            console.log(start);
            // If the parser has encountered an error, don't parse anymore tokens mate
            if (this.error) {
                return false;
            }
            if (this.tokenList[this.currentToken].type == token) {
                if (start != null) {
                    // add all productions in start
                    for (var i = 0; i < start.length; i++) {
                        this.cst.addNTNode(start[i]);
                        if (i != 0) {
                            this.log.push("VALID - Expecting " + start[i - 1] + ", found " + start[i]);
                        }
                    }
                    // add final production that was rewritten
                    this.cst.addNTNode(rewrite);
                    this.log.push("VALID - Expecting " + start[start.length - 1] + ", found " + rewrite);
                }
                else if (rewrite != null) {
                    this.cst.addNTNode(rewrite);
                    this.log.push("VALID - Expecting " + rewrite + ", found " + rewrite);
                }
                this.log.push("VALID - Expecting " + token + ", found " + this.tokenList[this.currentToken].value);
                // Add token to tree
                this.cst.addTNode(this.tokenList[this.currentToken]);
                console.log("Adding " + this.tokenList[this.currentToken].value + " to the tree");
                this.cst.traverseTree();
                // consume token
                this.currentToken++;
                return true;
            }
            // if token was expected and was not present, throw an error
            if (expected) {
                this.error = true;
                this.log.push("ERROR - Expecting " + token + ", found " + this.tokenList[this.currentToken].type);
            }
            return false;
        };
        return Parser;
    }());
    TSC.Parser = Parser;
})(TSC || (TSC = {}));
