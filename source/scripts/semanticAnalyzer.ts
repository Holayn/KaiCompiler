/**
 * This is the semantic analyzer, which produces an AST and performs
 * semantic analysis on the source code.
 * Validates types and scopes.
 */
module TSC {
    export class SemanticAnalyzer {

        warnings: Array<WarningType>; // array to hold warnings
        errors: Array<ErrorType>; // array to hold errors
        ast: Tree; // pointer to the ast
        scopeTree: Tree; // pointer to the scope tree, which will just be a 
        error: boolean; // flag for error

        constructor(){
            this.warnings = [];
            this.errors = [];
            this.ast = new Tree();
            this.scopeTree = new Tree();
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
                "scopeTree": this.scopeTree
            }
        }

        /**
         * Performs preorder traversal given a CST node
         * Creates scope tree along with AST creation
         */
        public traverse(node){
            // If we have an error, break
            if(this.error){
                return;
            }
            // Check if "important". If so, add to AST, descend AST.
            switch(node.value){
                case Production.Block:
                    console.log("found block");
                    // Scope tree: add a scope to the tree whenever we encounter a Block
                    this.scopeTree.addNode(new Object());
                    this.ast.addNode(Production.Block);
                    // Traverse node's children
                    for(var i=0; i<node.children.length; i++){
                        this.traverse(node.children[i]);
                    }
                    // Go up the AST once we finish traversing
                    // Don't go up if we're at the root doe
                    if(this.ast.curr != null){
                        this.ast.ascendTree();
                    }
                    break;
                case Production.VarDecl:
                    console.log("found vardecl");
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
                    if(!this.scopeTree.curr.value.hasOwnProperty(id)){
                        this.scopeTree.curr.value.id = new ScopeObject();
                        this.scopeTree.curr.value.id.type = type;
                    }
                    // Throw error if variable already declared in scope
                    else{
                        this.error = true;
                    }
                    break;
                case Production.PrintStmt:
                    console.log("found wendy");
                    this.ast.addNode(Production.PrintStmt);
                    // figure out expression
                    this.traverse(node.children[2]);
                    this.ast.ascendTree();
                    break;
                case Production.AssignStmt:
                    console.log("found assign");
                    // make the "root" an assign statement
                    this.ast.addNode(Production.AssignStmt);
                    // Get the id
                    this.ast.addNode(node.children[0].children[0].value);
                    this.ast.ascendTree();
                    // figure out the expression
                    this.traverse(node.children[2]);
                    this.ast.ascendTree();
                    break;
                case Production.WhileStmt:
                    console.log("found while");
                    this.ast.addNode(Production.WhileStmt);
                    this.traverse(node.children[1]);
                    this.traverse(node.children[2]);
                    break;
                case Production.IfStmt:
                    console.log("found if");
                    this.ast.addNode(Production.IfStmt);
                    this.traverse(node.children[1]);
                    this.traverse(node.children[2]);
                    break;
                case Production.Id:
                    console.log("found id");
                    this.ast.addNode(node.children[0].value);
                    this.ast.ascendTree();
                    break;
                case Production.IntExpr:
                    console.log("found intexpr");
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
                    console.log("found boolexpr");
                    // figure out which boolexpr this is.
                    // more than just a boolval
                    if(node.children.length > 1){
                        console.log(node.children[2].children[0].value.value);
                        if(node.children[2].children[0].value.value == "=="){
                            this.ast.addNode("EqualTo");
                        }
                        else{
                            this.ast.addNode("NotEqualTo");
                        }
                        console.log("left expr");
                        this.traverse(node.children[1]);
                        console.log("right expr");
                        this.traverse(node.children[3]);
                        console.log("done boolexpr");
                        this.ast.ascendTree();
                    }
                    // just a boolval
                    else{
                        this.ast.addNode(node.children[0].children[0].value);
                        this.ast.ascendTree();
                    }
                    break;
                case Production.StringExpr:
                    console.log("found stringexpr");
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
    }
}