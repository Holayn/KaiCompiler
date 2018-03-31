/**
 * This is the semantic analyzer, which produces an AST and performs
 * semantic analysis on the source code.
 * Validates types and scopes.
 */
module TSC {
    export class SemanticAnalyzer {

        warnings: Array<Warning>; // array to hold warnings
        errors: Array<Error>; // array to hold errors
        ast: Tree; // pointer to the ast
        scopeTree: Tree; // pointer to the scope tree, which will just be a 
        error: boolean; // flag for error
        declaredScopes: number; // keeps track of number of scopes declared so we can assign new scopes proper ids
        scopeLevel: number; // keeps track of current level of the scope that we're on

        symbol: Object = {}; // object to hold symbol data
        symbols: Array<Object>; // keeps array of symbols found

        constructor(){
            this.warnings = [];
            this.errors = [];
            this.ast = new Tree();
            this.scopeTree = new Tree();
            this.symbols = [];
            this.declaredScopes = 0;
            this.scopeLevel = 0;
        }

        /**
         * Starts the semantic analysis using the CST produced in parse
         */
        public analyze(parseResult){
            // Traverse the CST in a preorder fashion
            // If we find something "important", add it to the CST
            this.traverse(parseResult.cst.root);
            return {
                "ast": this.ast,
                "scopeTree": this.scopeTree,
                "errors": this.errors,
                "error": this.error,
                "symbols": this.symbols
            }
        }

        /**
         * Performs preorder traversal given a CST node
         * Creates scope tree along with AST creation
         */
        public traverse(node){
            // Check if "important". If so, add to AST, descend AST.
            switch(node.value){
                case Production.Block:
                    // Scope tree: add a scope to the tree whenever we encounter a Block
                    // Increase the number of scopes that have been declared
                    // Increase the scope level as we are on a new one
                    let newScope = new ScopeNode();
                    newScope.lineNumber = node.lineNumber;
                    newScope.colNumber = node.colNumber;
                    newScope.id = this.declaredScopes;
                    this.declaredScopes++;
                    this.scopeTree.addNode(newScope);
                    this.scopeLevel++;
                    this.ast.addNode(Production.Block);
                    // Traverse node's children
                    for(var i=0; i<node.children.length; i++){
                        this.traverse(node.children[i]);
                    }
                    // Go up the AST once we finish traversing
                    // Don't go up if we're at the root doe. curr is the parent node
                    if(this.ast.curr != null){
                        this.ast.ascendTree();
                    }
                    // Go up the scope tree as well as we have cleared a scope
                    // Decrease the scope level for we are going up a scope level
                    if(this.scopeTree.curr != null){
                        this.scopeTree.ascendTree();
                        this.scopeLevel--;
                    }
                    break;
                case Production.VarDecl:
                    this.ast.addNode(Production.VarDecl);
                    // We now need to get its children and add to AST
                    // Get the type
                    let type = node.children[0].children[0].value
                    this.ast.addNode(type);
                    this.ast.ascendTree();
                    // Get the id
                    let id = node.children[1].children[0].value
                    this.ast.addNode(id);
                    this.ast.ascendTree();
                    this.ast.ascendTree();
                    // Add variable declaration to current scope
                    // Check if already declared in current scope
                    if(!this.scopeTree.curr.value.table.hasOwnProperty(id.value)){
                        this.scopeTree.curr.value.table[id.value] = new ScopeObject();
                        this.scopeTree.curr.value.table[id.value].type = type;
                        // Add to symbol table
                        this.symbol["type"] = type.value;
                        this.symbol["key"] = id.value;
                        this.symbol["line"] = node.children[1].children[0].lineNumber;
                        this.symbol["scope"] = this.scopeTree.curr.value.id;
                        this.symbol["scopeLevel"] = this.scopeLevel;
                        this.symbols.push(this.symbol);
                        this.symbol = {};
                    }
                    // Throw error if variable already declared in scope
                    else{
                        this.error = true;
                        let err = new ScopeError(ErrorType.UndeclaredVariable, node.value, node.lineNumber, node.colNumber);
                        // Couldn't make this part of the constructor for some reason
                        err.setScopeLineCol(this.scopeTree.curr.value.lineNumber, this.scopeTree.curr.value.colNumber);
                        this.errors.push(err);
                    }
                    break;
                case Production.PrintStmt:
                    this.ast.addNode(Production.PrintStmt);
                    // figure out expression
                    this.traverse(node.children[2]);
                    this.ast.ascendTree();
                    break;
                case Production.AssignStmt:
                    // make the "root" an assign statement
                    this.ast.addNode(Production.AssignStmt);
                    // Get the id
                    this.ast.addNode(node.children[0].children[0].value);
                    // Check if id is in scope
                    this.checkScopes(node.children[0].children[0]);
                    this.ast.ascendTree();
                    // figure out the expression
                    this.traverse(node.children[2]);
                    this.ast.ascendTree();
                    break;
                case Production.WhileStmt:
                    this.ast.addNode(Production.WhileStmt);
                    this.traverse(node.children[1]);
                    this.traverse(node.children[2]);
                    break;
                case Production.IfStmt:
                    this.ast.addNode(Production.IfStmt);
                    this.traverse(node.children[1]);
                    this.traverse(node.children[2]);
                    break;
                case Production.Id:
                    this.ast.addNode(node.children[0].value);
                    this.ast.ascendTree();
                    // Check if variable declared in current or parent scopes
                    this.checkScopes(node.children[0]);
                    break;
                case Production.IntExpr:
                    // figure out which intexpr this is
                    // more than just a digit
                    if(node.children.length > 1){
                        this.ast.addNode("Addition");
                        this.ast.addNode(node.children[0].children[0].value);
                        this.ast.ascendTree();
                        // figure out expression
                        this.traverse(node.children[2]);
                        this.ast.ascendTree();
                    }
                    // just a digit
                    else{
                        this.ast.addNode(node.children[0].children[0].value);
                        this.ast.ascendTree();
                    }
                    break;
                case Production.BooleanExpr:
                    // figure out which boolexpr this is.
                    // more than just a boolval
                    if(node.children.length > 1){
                        if(node.children[2].children[0].value.value == "=="){
                            this.ast.addNode("EqualTo");
                        }
                        else{
                            this.ast.addNode("NotEqualTo");
                        }
                        this.traverse(node.children[1]);
                        this.traverse(node.children[3]);
                        this.ast.ascendTree();
                    }
                    // just a boolval
                    else{
                        this.ast.addNode(node.children[0].children[0].value);
                        this.ast.ascendTree();
                    }
                    break;
                case Production.StringExpr:
                    // we have to generate string until we reach the end of the charlist
                    let stringBuilder = [];
                    let currCharList = node.children[1];
                    let lastCharList = false;
                    while(!lastCharList){
                        stringBuilder.push(currCharList.children[0].children[0].value.value);
                        if(currCharList.children.length == 1){
                            lastCharList = true;
                            continue;
                        }
                        currCharList = currCharList.children[1];
                    }
                    let resString = stringBuilder.join("");
                    this.ast.addNode(resString);
                    this.ast.ascendTree();
                    break;
                default:
                    // Traverse node's children
                    for(var i=0; i<node.children.length; i++){
                        this.traverse(node.children[i]);
                    }
                    break;
            }
        }
        /**
         * Checks to see if id is in current or parent scope
         * @param node the node whose value we're checking is in scope or not
         */
        public checkScopes(node): boolean{
            console.log("checking scope");
            // pointer to current position in scope tree
            let ptr = this.scopeTree.curr;
            console.log(node);
            // Check current scope
            if(this.scopeTree.curr.value.table.hasOwnProperty(node.value.value)){
                return true;
            }
            // Check parent scopes
            else{
                while(ptr.parent != null){
                    ptr = ptr.parent;
                    // Check if id in scope
                    if(this.scopeTree.curr.value.table.hasOwnProperty(node.value.value)){
                        return true;
                    }
                }
                // Didn't find id in scope, push error and return false
                this.error = true;
                let err = new ScopeError(ErrorType.UndeclaredVariable, node.value, node.lineNumber, node.colNumber);
                // Couldn't make this part of the constructor for some reason
                err.setScopeLineCol(this.scopeTree.curr.value.lineNumber, this.scopeTree.curr.value.colNumber);
                this.errors.push(err);
                return false;
            }
        }
    }
}