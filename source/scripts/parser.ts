/**
 * This is the parser, which takes the tokens generated by the lexer
 * and validates their ordering with the provided grammar.
 * Produces a CST.
 * Traverse inorder DFS.
 * Top-down recursive descent parser on an LL(1) grammar.
 */

module TSC {

    export enum Production {
        Program = "Program",
        Block = "Block",
        Expr = "Expression",
        Stmt = "Statement",
        StmtList = "StatementList",
        AssignStmt = "AssignmentStatement",
        PrintStmt = "PrintStatement",
        WhileStmt = "WhileStatement",
        VarDecl = "VarDecl",
        IfStmt = "IfStatement",
        BooleanExpr = "BooleanExpression",
        IntExpr = "IntegerExpression",
        StringExpr = "StringExpression",
        CharList = "CharList",
        Id = "Id"
    }

    export class Parser {

        currentToken: number; // the index of the current token we're looking at
        tokenList; // list of tokens passed from lexer
        log; // log of parser
        error: boolean; // keeps track if the parser has run into an error
        cst: Tree; // pointer to the tree

         // Constructor for parser, passed tokens from lexer. Inits values.
        constructor(tokens){
            this.tokenList = tokens;
            // Set current token to the first token in the list
            this.currentToken = 0;
            // Holds log messages generated by parser
            this.log = [];
            this.error = false;
            this.cst = new Tree();
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
        public parse() {
            if(this.parseProgram()){
                console.log("PARSER: success!");
            }
            else{
                console.log("PARSER: error");
            }
            console.log(this.log);
        }

        /**
         * Parses the tokens to see if they make up a Program, or a Block appended with an EOP marker
         */
        public parseProgram(): boolean {
            if(this.parseBlock(Production.Program, true) && this.matchToken(TokenType.TEop, null, null, true)){
                return true;
            }
            return false;
        }

        public parseBlock(): boolean {
            // if(this.error){
            //     return false;
            // }
            if(this.matchToken(TokenType.TLbrace)){
                this.log.push("VALID - Expecting Block, found Block");
                this.consumeToken(TokenType.TLbrace);
                if(this.parseStatementList()){
                    if(this.matchToken(TokenType.TRbrace)){
                        this.consumeToken(TokenType.TRbrace);
                        return true;
                    }
                }
            }
            return false;
        }

        public parseStatementList() {
            console.log("DEPREPRPERPER");
            if(this.parseStatement() && this.parseStatementList()){
                console.log("hahaDEPREPRPERPER");
                return true;
            }
            // epsilon... return to parseBlock
            else{
                return true;
            }
        }

        public parseStatement() {
            console.log("PARSER: parsing a statement");
            if(this.parsePrintStatement() || this.parseAssignmentStatement() || this.parseVarDecl() || this.parseWhileStatement() || this.parseIfStatement() || this.parseBlock()){
                return true;
            }
            return false;
        }

        public parsePrintStatement() {
            console.log("PARSER: parsing a print");
            // this is why we need to sep match and consume
            if(this.matchToken(TokenType.TPrint)){
                console.log("PARSER: printstatement found");
                this.log.push("VALID - Expecting Statement, found PrintStatement");
                this.log.push("VALID - Expecting Print, found " + this.tokenList[this.currentToken].type);
                this.consumeToken(TokenType.TPrint);
                if(this.matchToken(TokenType.TLparen)){
                    this.consumeToken(TokenType.TLparen);
                    if(this.parseExpr()){
                        if(this.matchToken(TokenType.TRparen)){
                            this.consumeToken(TokenType.TRparen);
                        }
                    }
                    return true;
                }
            }
            return false;
        }

        public parseAssignmentStatement() {
            console.log("PARSER: parsing a assignmentstatement");
            if(this.matchToken(TokenType.TId)){
                this.log.push("VALID - Expecting Statement, found AssignmentStatement");
                this.consumeToken(TokenType.TId);
                if(this.matchToken(TokenType.TAssign)){
                    this.consumeToken(TokenType.TAssign);
                    if(this.parseExpr()){
                        return true;
                    }
                    else{
                        this.error = true;
                        this.log.push("ERROR - Expecting Expr, found " + this.tokenList[this.currentToken].type);
                    }
                }
                else{
                    this.error = true;
                    this.log.push("ERROR - Expecting TAssign, found " + this.tokenList[this.currentToken].type);
                }
            }
            return false;
        }

        public parseVarDecl() {
            console.log("PARSER: parsing a vardecl");
            if(this.matchToken(TokenType.TType)){
                console.log("PARSER: vardecl found");
                this.log.push("VALID - Expecting Statement, found VarDecl");
                this.consumeToken(TokenType.TType);
                if(this.parseId()){
                    return true;
                }
                else{
                    this.error = true;
                    this.log.push("ERROR - Expecting TId, found " + this.tokenList[this.currentToken].type);
                }
            }
            return false;
        }

        public parseWhileStatement() {
            console.log("PARSER: parsing a whilestatement");
            if(this.matchToken(TokenType.TWhile)){
                console.log("PARSER: whilestatement found");
                this.log.push("VALID - Expecting Statement, found VarDecl");
                this.consumeToken(TokenType.TWhile);
                if(this.parseBooleanExpr(Production.While)){
                    if(this.parseBlock()){
                        return true;
                    }
                    this.error = true;
                    this.log.push("ERROR - Expecting Block, found " + this.tokenList[this.currentToken].type);
                }
                else{
                    this.error = true;
                    this.log.push("ERROR - Expecting BooleanExpr, found " + this.tokenList[this.currentToken].type);
                }
            }
            return false;
        }

        public parseIfStatement() {
            console.log("PARSER: parsing an ifstatement");
            if(this.matchToken(TokenType.TIf)){
                this.log.push("VALID - Expecting Statement, found IfStatement");
                this.consumeToken(TokenType.TIf);
                if(this.parseBooleanExpr(Production.If)){
                    console.log("adfasd");
                    return true;
                    // && this.parseBlock()){
                }
                else{
                    this.log.push("ERROR - Expecting BooleanExpr, found " + this.tokenList[this.currentToken].type);
                }
                console.log("PARSER: ifstatement found");
                return true;
            }
            return false;
        }

        public parseExpr() {
            console.log("PARSER: parsing an expr");
            if(this.parseBooleanExpr(Production.Expr)){
                console.log("PARSER: expr found");
                return true;
            }
            else if(this.parseIntExpr()){
                console.log("PARSER: expr found");
                return true;
            }
            else if(this.parseId()){
                console.log("PARSER: expr found");
                return true;
            }
            else if(this.parseStringExpr()){
                console.log("PARSER: expr found");
                return true;
            }
            return false;
        }

        public parseBooleanExpr(production) {
            if (typeof production === 'undefined') { production = 'default'; }
            console.log("PARSER: parsing a booleanexpr");
            if(this.matchToken(TokenType.TLparen)){
                if(production == Production.Expr){
                    this.log.push("VALID - Expecting Expr, found BooleanExpr");
                }
                console.log("PARSER: booleanexpr found");
                this.consumeToken(TokenType.TLparen);
                if(this.parseExpr()){
                    if(this.matchToken(TokenType.TBoolop)){
                        this.consumeToken(TokenType.TBoolop);
                        if(this.parseExpr()){
                            if(this.matchToken(TokenType.TRparen)){
                                this.consumeToken(TokenType.TRparen);
                                return true;
                            }
                            else{
                                this.log.push("ERROR - Expecting TBoolval, found " + this.tokenList[this.currentToken].type);
                            }
                        }
                    }
                    else{
                        this.log.push("ERROR - Expecting TBoolop, found " + this.tokenList[this.currentToken].type);
                        return false;
                    }
                }
            }
            else if(this.matchToken(TokenType.TBoolval)){
                if(production == Production.Expr){
                    this.log.push("VALID - Expecting Expr, found BooleanExpr");
                }
                this.consumeToken(TokenType.TBoolval);
                console.log("PARSER: booleanexpr found");
                return true;
            }
            return false;
        }

        public parseIntExpr() {
            console.log("PARSER: parsing an intexpr");
            // in case after a digit an intop is not found, we accept the digit
            if(this.matchToken(TokenType.TDigit)){
                this.log.push("VALID - Expecting Expr, found IntExpr");
                this.log.push("VALID - Expecting Digit, found " + this.tokenList[this.currentToken].type);
                this.consumeToken(TokenType.TDigit);
                if(this.matchToken(TokenType.TIntop) && this.parseExpr()){
                    this.log.push("VALID - Expecting Intop, found " + this.tokenList[this.currentToken].type);
                    console.log("PARSER: intexpr (digit op expr) found");
                    return true;
                }
                else{
                    console.log("PARSER: intexpr (digit) found");
                    return true;
                }
            }
            return false;
        }

        public parseStringExpr() {
            console.log("PARSER: parsing a stringexpr");
            if(this.matchToken(TokenType.TQuote) && this.parseCharList() && this.matchToken(TokenType.TQuote)){
                console.log("PARSER: stringexpr found");
                return true;
            }
            return false;
        }

        public parseId() {
            console.log("PARSER: parsing an id");
            if(this.matchToken(TokenType.TId)){
                this.consumeToken(TokenType.TId);
                console.log("PARSER: id found");
                return true;
            }
            return false;
        }

        public parseCharList() {
            console.log("PARSER: parsing a charlist");
            // spaces are treated as chars for me
            if(this.matchToken(TokenType.TChar) && this.parseCharList()){
                console.log("PARSER: charlist found");
                return true;
            }
            else{
                // epsilon
                return true;
            }
        }



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
         * @param start production that is being rewritten, if any
         * @param rewrite production that is being rewritten to, if any
         * @param expected flag for if token is expected to be matched
         */
        public matchToken(token: TokenType, start: Production, rewrite: Production, expected: boolean) {
            if(this.error){
                return false;
            }
            if(this.tokenList[this.currentToken].type == token){
                if(start != null) {
                    this.log.push("VALID - Expecting " + start + ", found " + rewrite);
                    // We know every statement is rewritten from StatementList
                    if(start == Production.Stmt){
                        this.cst.addNTNode(Production.StmtList);
                    }
                    this.cst.addNTNode(start);
                    this.cst.addNTNode(rewrite);
                    console.log("add node");
                    console.log(start + "->" + rewrite);
                }
                this.log.push("VALID - Expecting " + token + ", found " + this.tokenList[this.currentToken].type + " " + this.tokenList[this.currentToken].value);
                // Add token to tree
                this.cst.addTNode(this.tokenList[this.currentToken]);
                console.log("Adding " + this.tokenList[this.currentToken].value + " to the tree");
                this.cst.traverseTree();
                // consume token
                this.currentToken++;
                return true;
            }
            // if token was expected and was not present, throw an error
            if(expected){
                this.error = true;
                this.log.push("ERROR - Expecting " + token + ", found " + this.tokenList[this.currentToken].type);
            }
            return false;
        }
    }
}