/**
 * This is the semantic analyzer, which produces an AST and performs
 * semantic analysis on the source code.
 * Validates types and scopes.
 */
module TSC {
    export class SemanticAnalyzer {

        // What if we took in a list of productions and symbols found and assembled AST from that?
        // Skip over stuff we don't care about.
        // We know that since this passed parse, we don't have to worry about correct syntax.
        // Add to AST when find something "important"
        
        // VarDecl? Add to child of Block and descend to it.
        // We in VarDecl now. Look for Type and Id and add to child of VarDecl. Ascend tree.
        
        // PrintStatement? Add to child of Block and descend to it.
        // We in PrintStatement now. Look for print and some expression and add to child of PrintStatement. Ascend tree.

        // IntExpr? Look ahead to see if there is IntOp. If so, make it a node descend to it. Else, make digit a node. Return node. 
        // We in IntOp now. Add Digit and other expression to child of IntOp. Ascend tree.

        // If expr, we have to figure out what it is. evalExpr(): returns node, which is added to tree.

        // Block? Add to child of Block and descend to it.
        // We in Block now. Do Block stuff, aka main loop.

        // Nah, fuck that. Let's just reuse parser ahahahah...?

        // Let's just go through source code again, assume everything correct
        // On "important" things, add to tree.

        currentToken: number; // the index of the current token we're looking at
        tokenList: Array<Token>; // list of tokens passed from lexer
        log: Array<String>; // log of parser
        error: boolean; // keeps track if the parser has run into an error
        cst: Tree; // pointer to the tree

        symbol: Object = {}; // object to hold symbol data
        symbols: Array<Object>; // keeps array of symbols found

         // Constructor for parser, passed tokens from lexer. Inits values.
        constructor(tokens){
            this.tokenList = tokens;
            // Set current token to the first token in the list
            this.currentToken = 0;
            // Holds log messages generated by parser
            this.log = [];
            // Holds symbols found by parser
            this.symbols = [];
            // Flag for parser error
            this.error = false;
            // Tree data structure
            this.cst = new Tree();
        }

        // ---------------------------- NON-TERMINALS -------------------------------- //
        
        /**
         * Starts the parse of tokens passed in from the lexer
         */
        public parse() {
            if(this.parseProgram()){
            }
            else{
            }
            // Return the parser log
            console.log(this.log);
            return {
                "log": this.log,
                "cst": this.cst,
                "symbols": this.symbols,
                "error": this.error
            }
        }

        /**
         * Parses the tokens to see if they make up a Program, or a Block appended with an EOP marker
         */
        public parseProgram(): boolean {
            if(this.parseBlock([Production.Program], true) && this.matchToken(TokenType.TEop, null, null, true)){
                return true;
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up a Block, or a ( StatementList )
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseBlock(production: Array<Production>, expected: boolean): boolean {
            if(this.matchToken(TokenType.TLbrace, production, Production.Block, false) && this.parseStatementList(null, false) && this.matchToken(TokenType.TRbrace, null, null, true)){
                return true;
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up a StatementList, or a Statement StatementList, or epsilon
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseStatementList(production: Array<Production>, expected: boolean) {
            if(this.parseStatement([Production.StmtList], false) && this.parseStatementList([Production.StmtList], false)){
                // ascend the tree after we've derived a stmtlist
                this.cst.ascendTree();
                return true;
            }
            // epsilon... accept empty and return to parseBlock
            else{
                return true;
            }
        }

        /**
         * Parses the tokens to see if they make up a Statement, or a PrintStatement, AssignStatement, WhileStatement, VarDecl, IfStatement, or Block
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseStatement(production: Array<Production>, expected: boolean) {
            if(this.parsePrintStatement([Production.StmtList, Production.Stmt], false) || this.parseAssignmentStatement([Production.StmtList, Production.Stmt], false) || 
            this.parseWhileStatement([Production.StmtList, Production.Stmt], false) || this.parseVarDecl([Production.StmtList, Production.Stmt], false) || 
            this.parseIfStatement([Production.StmtList, Production.Stmt], false) || this.parseBlock([Production.StmtList, Production.Stmt], false)){
                this.cst.ascendTree();
                return true;
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up a PrintStatement, or a Print ( Expr )
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parsePrintStatement(production: Array<Production>, expected: boolean) {
            if(this.matchToken(TokenType.TPrint, production, Production.PrintStmt, false) && this.matchToken(TokenType.TLparen, null, null, true) &&
            this.parseExpr([Production.Expr], true) && this.matchToken(TokenType.TRparen, null, null, true)){
                return true;
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up an AssignmentStatement, or an Id = Expr
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseAssignmentStatement(production: Array<Production>, expected: boolean) {
            if(this.parseId(production.concat([Production.AssignStmt]), false) && 
            this.matchToken(TokenType.TAssign, null, null, true) && this.parseExpr([Production.Expr], true)){
                return true;
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up a VarDecl, or a Type Id
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseVarDecl(production: Array<Production>, expected: boolean) {
            if(this.parseType(production.concat([Production.VarDecl]), false) && this.parseId(null, true)){
                // If we've found a VarDecl, add the last two tokens to the symbol table
                console.log(this.tokenList[this.currentToken-1]);
                this.symbol["type"] = this.tokenList[this.currentToken-2].value;
                this.symbol["key"] = this.tokenList[this.currentToken-1].value;
                this.symbol["line"] = this.tokenList[this.currentToken-1].lineNumber;
                this.symbols.push(this.symbol);
                this.symbol = {};
                console.log(this.symbols);
                return true;
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up a WhileStatement, or a While BooleanExpr Block
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseWhileStatement(production: Array<Production>, expected: boolean) {
            if(this.matchToken(TokenType.TWhile, production, Production.WhileStmt, false) && this.parseBooleanExpr([], true) && this.parseBlock(null, true)){
                return true;
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up an IfStatement, or an If BooleanExpr Block
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseIfStatement(production: Array<Production>, expected: boolean) {
            // we let parseBooleanExpr derive appropriate rewrite rules by passing empty production array
            if(this.matchToken(TokenType.TIf, production, Production.IfStmt, false) && this.parseBooleanExpr([], true) &&
            this.parseBlock(null, true)){
                return true;
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up an Expr, or an IntExpr, StringExpr, BooleanExpr, or Id
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseExpr(production: Array<Production>, expected: boolean) {
            if(this.parseIntExpr(production, false) || this.parseStringExpr(production, false) || this.parseBooleanExpr(production, false) || 
            this.parseId(production, false)){
                return true;
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up an IntExpr, or a Digit, or Digit Intop Expr
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseIntExpr(production: Array<Production>, expected: boolean) {
            // if(this.matchToken(TokenType.TDigit, production, Production.IntExpr, false)){
            if(this.parseDigit(production.concat([Production.IntExpr]), false)){
                // ascend the tree after we've derived an intexpr
                // if(this.parseIntop([Production.IntOp], false) && this.parseExpr([Production.Expr], true)){
                if(this.parseIntop(null, false) && this.parseExpr([Production.Expr], true)){
                    return true;
                }
                else{
                    return true;
                }
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up a StringExpr, or a " CharList "
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseStringExpr(production: Array<Production>, expected: boolean) {
            if(this.matchToken(TokenType.TQuote, production, Production.StringExpr, false) && this.parseCharList([Production.CharList], true) && this.matchToken(TokenType.TQuote, null, null, true)){
                return true;
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up a BooleanExpr, or a Boolval or a ( Expr Boolop Expr )
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseBooleanExpr(production: Array<Production>, expected: boolean) {
            if(this.parseBoolVal(production, false)){
                return true;
            }
            else if(this.matchToken(TokenType.TLparen, production, Production.BooleanExpr, false) && this.parseExpr([Production.Expr], true) &&
            this.parseBoolop(null, true) && this.parseExpr([Production.Expr], true) && this.matchToken(TokenType.TRparen, null, null, true)){
                return true;
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up a BoolVal, or true or false
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseBoolVal(production: Array<Production>, expected: boolean) {
            // we add a BooleanExpr to the list of productions rewritten, as Expr is rewritten to BooleanExpr, which is then rewritten to Boolval
            if(this.matchToken(TokenType.TBoolval, production.concat([Production.BooleanExpr]), Production.BoolVal, false)){
                return true;
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up an Id
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseId(production: Array<Production>, expected: boolean) {
            if(this.matchToken(TokenType.TId, production, Production.Id, false)){
                return true;
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up a Type, or int, string, or boolean
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseType(production: Array<Production>, expected: boolean) {
            if(this.matchToken(TokenType.TType, production, Production.Type, false)){
                return true;
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up a Char, or a, b, c ..., z
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseChar(production: Array<Production>, expected: boolean) {
            if(this.matchToken(TokenType.TChar, production, Production.Char, false)){
                return true;
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up a Digit, or 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseDigit(production: Array<Production>, expected: boolean) {
            if(this.matchToken(TokenType.TDigit, production, Production.Digit, false)){
                return true;
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up an Intop, or +
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseIntop(production: Array<Production>, expected: boolean) {
            if(this.matchToken(TokenType.TIntop, production, Production.IntOp, false)){
                return true;
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up an Boolop, or == or !=
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseBoolop(production: Array<Production>, expected: boolean) {
            if(this.matchToken(TokenType.TBoolop, production, Production.BoolOp, false)){
                return true;
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up a Space, or a " "
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseSpace(production: Array<Production>, expected: boolean) {
            if(this.matchToken(TokenType.TSpace, production, Production.Space, false)){
                return true;
            }
            return false;
        }
        

        /**
         * Parses the tokens to see if they make up a CharList, or a Char Charlist, or epsilon
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseCharList(production: Array<Production>, expected: boolean) {
            // spaces are treated as chars for me
            if(this.parseChar(production, false) && this.parseCharList(production, false)){
                return true;
            }
            else if(this.parseSpace(production, false) && this.parseCharList(production, false)){
                return true;
            }
            else{
                // epsilon... accept empty
                return true;
            }
        }


        public matchToken(token: TokenType, production: Production) {
            // Check to see if production is an "important" one. Add it to the tree if it is.
            if(this.tokenList[this.currentToken].type == token){
                // consume token
                this.currentToken++;
                return true;
            }
            return false;
        }

    }
}