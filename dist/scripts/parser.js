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
            if (this.parseBlock(Production.Program, true) && this.matchToken(TSC.TokenType.TEop, null, null, true)) {
                return true;
            }
            return false;
        };
        Parser.prototype.parseBlock = function () {
            // if(this.error){
            //     return false;
            // }
            if (this.matchToken(TSC.TokenType.TLbrace)) {
                this.log.push("VALID - Expecting Block, found Block");
                this.consumeToken(TSC.TokenType.TLbrace);
                if (this.parseStatementList()) {
                    if (this.matchToken(TSC.TokenType.TRbrace)) {
                        this.consumeToken(TSC.TokenType.TRbrace);
                        return true;
                    }
                }
            }
            return false;
        };
        Parser.prototype.parseStatementList = function () {
            console.log("DEPREPRPERPER");
            if (this.parseStatement() && this.parseStatementList()) {
                console.log("hahaDEPREPRPERPER");
                return true;
            }
            else {
                return true;
            }
        };
        Parser.prototype.parseStatement = function () {
            console.log("PARSER: parsing a statement");
            if (this.parsePrintStatement() || this.parseAssignmentStatement() || this.parseVarDecl() || this.parseWhileStatement() || this.parseIfStatement() || this.parseBlock()) {
                return true;
            }
            return false;
        };
        Parser.prototype.parsePrintStatement = function () {
            console.log("PARSER: parsing a print");
            // this is why we need to sep match and consume
            if (this.matchToken(TSC.TokenType.TPrint)) {
                console.log("PARSER: printstatement found");
                this.log.push("VALID - Expecting Statement, found PrintStatement");
                this.log.push("VALID - Expecting Print, found " + this.tokenList[this.currentToken].type);
                this.consumeToken(TSC.TokenType.TPrint);
                if (this.matchToken(TSC.TokenType.TLparen)) {
                    this.consumeToken(TSC.TokenType.TLparen);
                    if (this.parseExpr()) {
                        if (this.matchToken(TSC.TokenType.TRparen)) {
                            this.consumeToken(TSC.TokenType.TRparen);
                        }
                    }
                    return true;
                }
            }
            return false;
        };
        Parser.prototype.parseAssignmentStatement = function () {
            console.log("PARSER: parsing a assignmentstatement");
            if (this.matchToken(TSC.TokenType.TId)) {
                this.log.push("VALID - Expecting Statement, found AssignmentStatement");
                this.consumeToken(TSC.TokenType.TId);
                if (this.matchToken(TSC.TokenType.TAssign)) {
                    this.consumeToken(TSC.TokenType.TAssign);
                    if (this.parseExpr()) {
                        return true;
                    }
                    else {
                        this.error = true;
                        this.log.push("ERROR - Expecting Expr, found " + this.tokenList[this.currentToken].type);
                    }
                }
                else {
                    this.error = true;
                    this.log.push("ERROR - Expecting TAssign, found " + this.tokenList[this.currentToken].type);
                }
            }
            return false;
        };
        Parser.prototype.parseVarDecl = function () {
            console.log("PARSER: parsing a vardecl");
            if (this.matchToken(TSC.TokenType.TType)) {
                console.log("PARSER: vardecl found");
                this.log.push("VALID - Expecting Statement, found VarDecl");
                this.consumeToken(TSC.TokenType.TType);
                if (this.parseId()) {
                    return true;
                }
                else {
                    this.error = true;
                    this.log.push("ERROR - Expecting TId, found " + this.tokenList[this.currentToken].type);
                }
            }
            return false;
        };
        Parser.prototype.parseWhileStatement = function () {
            console.log("PARSER: parsing a whilestatement");
            if (this.matchToken(TSC.TokenType.TWhile)) {
                console.log("PARSER: whilestatement found");
                this.log.push("VALID - Expecting Statement, found VarDecl");
                this.consumeToken(TSC.TokenType.TWhile);
                if (this.parseBooleanExpr(Production.While)) {
                    if (this.parseBlock()) {
                        return true;
                    }
                    this.error = true;
                    this.log.push("ERROR - Expecting Block, found " + this.tokenList[this.currentToken].type);
                }
                else {
                    this.error = true;
                    this.log.push("ERROR - Expecting BooleanExpr, found " + this.tokenList[this.currentToken].type);
                }
            }
            return false;
        };
        Parser.prototype.parseIfStatement = function () {
            console.log("PARSER: parsing an ifstatement");
            if (this.matchToken(TSC.TokenType.TIf)) {
                this.log.push("VALID - Expecting Statement, found IfStatement");
                this.consumeToken(TSC.TokenType.TIf);
                if (this.parseBooleanExpr(Production.If)) {
                    console.log("adfasd");
                    return true;
                    // && this.parseBlock()){
                }
                else {
                    this.log.push("ERROR - Expecting BooleanExpr, found " + this.tokenList[this.currentToken].type);
                }
                console.log("PARSER: ifstatement found");
                return true;
            }
            return false;
        };
        Parser.prototype.parseExpr = function () {
            console.log("PARSER: parsing an expr");
            if (this.parseBooleanExpr(Production.Expr)) {
                console.log("PARSER: expr found");
                return true;
            }
            else if (this.parseIntExpr()) {
                console.log("PARSER: expr found");
                return true;
            }
            else if (this.parseId()) {
                console.log("PARSER: expr found");
                return true;
            }
            else if (this.parseStringExpr()) {
                console.log("PARSER: expr found");
                return true;
            }
            return false;
        };
        Parser.prototype.parseBooleanExpr = function (production) {
            if (typeof production === 'undefined') {
                production = 'default';
            }
            console.log("PARSER: parsing a booleanexpr");
            if (this.matchToken(TSC.TokenType.TLparen)) {
                if (production == Production.Expr) {
                    this.log.push("VALID - Expecting Expr, found BooleanExpr");
                }
                console.log("PARSER: booleanexpr found");
                this.consumeToken(TSC.TokenType.TLparen);
                if (this.parseExpr()) {
                    if (this.matchToken(TSC.TokenType.TBoolop)) {
                        this.consumeToken(TSC.TokenType.TBoolop);
                        if (this.parseExpr()) {
                            if (this.matchToken(TSC.TokenType.TRparen)) {
                                this.consumeToken(TSC.TokenType.TRparen);
                                return true;
                            }
                            else {
                                this.log.push("ERROR - Expecting TBoolval, found " + this.tokenList[this.currentToken].type);
                            }
                        }
                    }
                    else {
                        this.log.push("ERROR - Expecting TBoolop, found " + this.tokenList[this.currentToken].type);
                        return false;
                    }
                }
            }
            else if (this.matchToken(TSC.TokenType.TBoolval)) {
                if (production == Production.Expr) {
                    this.log.push("VALID - Expecting Expr, found BooleanExpr");
                }
                this.consumeToken(TSC.TokenType.TBoolval);
                console.log("PARSER: booleanexpr found");
                return true;
            }
            return false;
        };
        Parser.prototype.parseIntExpr = function () {
            console.log("PARSER: parsing an intexpr");
            // in case after a digit an intop is not found, we accept the digit
            if (this.matchToken(TSC.TokenType.TDigit)) {
                this.log.push("VALID - Expecting Expr, found IntExpr");
                this.log.push("VALID - Expecting Digit, found " + this.tokenList[this.currentToken].type);
                this.consumeToken(TSC.TokenType.TDigit);
                if (this.matchToken(TSC.TokenType.TIntop) && this.parseExpr()) {
                    this.log.push("VALID - Expecting Intop, found " + this.tokenList[this.currentToken].type);
                    console.log("PARSER: intexpr (digit op expr) found");
                    return true;
                }
                else {
                    console.log("PARSER: intexpr (digit) found");
                    return true;
                }
            }
            return false;
        };
        Parser.prototype.parseStringExpr = function () {
            console.log("PARSER: parsing a stringexpr");
            if (this.matchToken(TSC.TokenType.TQuote) && this.parseCharList() && this.matchToken(TSC.TokenType.TQuote)) {
                console.log("PARSER: stringexpr found");
                return true;
            }
            return false;
        };
        Parser.prototype.parseId = function () {
            console.log("PARSER: parsing an id");
            if (this.matchToken(TSC.TokenType.TId)) {
                this.consumeToken(TSC.TokenType.TId);
                console.log("PARSER: id found");
                return true;
            }
            return false;
        };
        Parser.prototype.parseCharList = function () {
            console.log("PARSER: parsing a charlist");
            // spaces are treated as chars for me
            if (this.matchToken(TSC.TokenType.TChar) && this.parseCharList()) {
                console.log("PARSER: charlist found");
                return true;
            }
            else {
                // epsilon
                return true;
            }
        };
        // ---------------------------- TERMINALS -------------------------------- //
        // if next token we're looking at match to a terminal symbol, advance the current token
        // if error, break out of parse
        // Matches to passed token type
        Parser.prototype.matchToken = function (token) {
            // Check if there has been an error. If so, stop
            // if(this.error){
            //     return false;
            // }
            console.log("PARSER: testing match of " + this.tokenList[this.currentToken].type + " to token: " + token);
            if (this.tokenList[this.currentToken].type == token) {
                console.log("PARSER: TOKEN " + token + " found");
                return true;
            }
            // maybe don't have invalid here?
            // this.log.push("INVALID - Expecting " + token + ", found " + this.tokenList[this.currentToken].type);
            return false;
        };
        // Consumes a token
        Parser.prototype.consumeToken = function (token) {
            if (this.tokenList[this.currentToken].type == token) {
                console.log("PARSER: CONSUME TOKEN " + token);
                this.log.push("VALID - Expecting " + token + ", found " + this.tokenList[this.currentToken].type);
                this.currentToken++;
            }
        };
        return Parser;
    }());
    TSC.Parser = Parser;
})(TSC || (TSC = {}));
