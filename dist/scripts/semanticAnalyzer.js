/**
 * This is the semantic analyzer, which produces an AST and performs
 * semantic analysis on the source code.
 * Validates types and scopes.
 */
var TSC;
(function (TSC) {
    var VariableType;
    (function (VariableType) {
        VariableType["Boolean"] = "boolean";
        VariableType["Int"] = "int";
        VariableType["String"] = "string";
    })(VariableType = TSC.VariableType || (TSC.VariableType = {}));
    var SemanticAnalyzer = /** @class */ (function () {
        function SemanticAnalyzer() {
            this.symbol = {}; // object to hold symbol data
            this.warnings = [];
            this.errors = [];
            this.ast = new TSC.Tree();
            this.scopeTree = new TSC.Tree();
            this.symbols = [];
            this.declaredScopes = 0;
            this.scopeLevel = 0;
            this.log = [];
        }
        /**
         * Starts the semantic analysis using the CST produced in parse
         */
        SemanticAnalyzer.prototype.analyze = function (parseResult) {
            // Traverse the CST in a preorder fashion
            // If we find something "important", add it to the CST
            this.traverse(parseResult.cst.root);
            // Traverse scope tree to generate warnings
            this.findWarnings(this.scopeTree.root);
            return {
                "ast": this.ast,
                "scopeTree": this.scopeTree,
                "errors": this.errors,
                "error": this.error,
                "warnings": this.warnings,
                "symbols": this.symbols,
                "log": this.log
            };
        };
        /**
         * Performs preorder traversal given a CST node
         * Creates scope tree along with AST creation
         */
        SemanticAnalyzer.prototype.traverse = function (node) {
            var variableType; // the type of the expression, if applicable
            // Check if "important". If so, add to AST, descend AST.
            switch (node.value) {
                case TSC.Production.Block:
                    // Scope tree: add a scope to the tree whenever we encounter a Block
                    // Increase the number of scopes that have been declared
                    // Increase the scope level as we are on a new one
                    var newScope = new TSC.ScopeNode();
                    newScope.lineNumber = node.lineNumber;
                    newScope.colNumber = node.colNumber;
                    newScope.id = this.declaredScopes;
                    this.declaredScopes++;
                    this.scopeTree.addNode(newScope);
                    this.scopeLevel++;
                    this.ast.addNode(TSC.Production.Block);
                    // Traverse node's children
                    for (var i = 0; i < node.children.length; i++) {
                        this.traverse(node.children[i]);
                    }
                    // Go up the AST once we finish traversing
                    // Don't go up if we're at the root doe. curr is the parent node
                    if (this.ast.curr != null) {
                        this.ast.ascendTree();
                    }
                    // Go up the scope tree as well as we have cleared a scope
                    // Decrease the scope level for we are going up a scope level
                    if (this.scopeTree.curr != null) {
                        this.scopeTree.ascendTree();
                        this.scopeLevel--;
                    }
                    break;
                case TSC.Production.VarDecl:
                    this.ast.addNode(TSC.Production.VarDecl);
                    // We now need to get its children and add to AST
                    // Get the type
                    var token = node.children[0].children[0].value;
                    this.ast.addNode(token.value);
                    this.ast.ascendTree();
                    // Get the id
                    var id = node.children[1].children[0].value;
                    this.ast.addNode(id);
                    this.ast.ascendTree();
                    this.ast.ascendTree();
                    // Add variable declaration to current scope
                    // Check if already declared in current scope
                    if (!this.scopeTree.curr.value.table.hasOwnProperty(id.value)) {
                        this.scopeTree.curr.value.table[id.value] = new TSC.ScopeObject();
                        this.scopeTree.curr.value.table[id.value].value = token;
                        // Add to symbol table
                        this.symbol["type"] = token.value;
                        this.symbol["key"] = id.value;
                        this.symbol["line"] = node.children[1].children[0].lineNumber;
                        this.symbol["col"] = node.children[1].children[0].colNumber;
                        this.symbol["scope"] = this.scopeTree.curr.value.id;
                        this.symbol["scopeLevel"] = this.scopeLevel;
                        this.symbols.push(this.symbol);
                        this.symbol = {};
                    }
                    else {
                        this.error = true;
                        var err = new TSC.ScopeError(TSC.ErrorType.DuplicateVariable, id, node.children[1].children[0].lineNumber, node.children[1].children[0].colNumbe, this.scopeTree.curr.value.table[id.value].value.lineNumber, this.scopeTree.curr.value.table[id.value].value.colNumber);
                        this.errors.push(err);
                    }
                    break;
                case TSC.Production.PrintStmt:
                    this.ast.addNode(TSC.Production.PrintStmt);
                    // figure out expression
                    this.traverse(node.children[2]);
                    this.ast.ascendTree();
                    break;
                case TSC.Production.AssignStmt:
                    // make the "root" an assign statement
                    this.ast.addNode(TSC.Production.AssignStmt);
                    // Get the id
                    this.ast.addNode(node.children[0].children[0].value);
                    // Check if id is in scope and get its type
                    var idType = this.checkScopes(node.children[0].children[0]);
                    this.ast.ascendTree();
                    // figure out the expression and get the type returned by the expression
                    var expressionType = this.traverse(node.children[2]);
                    this.ast.ascendTree();
                    // Check for type match
                    this.checkTypeMatch(node.children[0].children[0].value, idType, expressionType, node.children[0].children[0].lineNumber, node.children[0].children[0].colNumber, node.children[2].lineNumber, node.children[2].colNumber);
                    // Update scope tree node object initialized flag. variable has been initialized.
                    this.markAsInitialized(node.children[0].children[0]);
                    break;
                case TSC.Production.WhileStmt:
                    this.ast.addNode(TSC.Production.WhileStmt);
                    this.traverse(node.children[1]);
                    this.traverse(node.children[2]);
                    break;
                case TSC.Production.IfStmt:
                    this.ast.addNode(TSC.Production.IfStmt);
                    this.traverse(node.children[1]);
                    this.traverse(node.children[2]);
                    break;
                case TSC.Production.Id:
                    this.ast.addNode(node.children[0].value);
                    this.ast.ascendTree();
                    // Check if variable declared in current or parent scopes
                    // If we find it in scope, return the type of the variable
                    var foundType = this.checkScopes(node.children[0]);
                    // Mark id as used
                    this.markAsUsed(node.children[0]);
                    // return the id's type
                    return foundType;
                case TSC.Production.IntExpr:
                    // figure out which intexpr this is
                    // more than just a digit
                    if (node.children.length > 1) {
                        this.ast.addNode("Addition");
                        this.ast.addNode(node.children[0].children[0].value);
                        this.ast.ascendTree();
                        // figure out expression
                        this.traverse(node.children[2]);
                        this.ast.ascendTree();
                    }
                    else {
                        this.ast.addNode(node.children[0].children[0].value);
                        this.ast.ascendTree();
                    }
                    // return the type returned by intexpr
                    return VariableType.Int;
                case TSC.Production.BooleanExpr:
                    // figure out which boolexpr this is.
                    // more than just a boolval
                    if (node.children.length > 1) {
                        if (node.children[2].children[0].value.value == "==") {
                            this.ast.addNode("EqualTo");
                        }
                        else {
                            this.ast.addNode("NotEqualTo");
                        }
                        // Get types returned by the two Expr children and make sure they're the same
                        var firstExprType = this.traverse(node.children[1]);
                        var secondExprType = this.traverse(node.children[3]);
                        if (firstExprType != secondExprType) {
                            this.error = true;
                            this.errors.push(new TSC.TypeError(TSC.ErrorType.IncorrectTypeComparison, node.children[1].value, node.children[1].lineNumber, node.children[1].colNumber, secondExprType, firstExprType));
                        }
                        this.ast.ascendTree();
                    }
                    else {
                        this.ast.addNode(node.children[0].children[0].value);
                        this.ast.ascendTree();
                    }
                    // return the type returned by boolexpr
                    return VariableType.Boolean;
                case TSC.Production.StringExpr:
                    // we have to generate string until we reach the end of the charlist
                    var stringBuilder = [];
                    var currCharList = node.children[1];
                    var lastCharList = false;
                    while (!lastCharList) {
                        stringBuilder.push(currCharList.children[0].children[0].value.value);
                        if (currCharList.children.length == 1) {
                            lastCharList = true;
                            continue;
                        }
                        currCharList = currCharList.children[1];
                    }
                    var resString = stringBuilder.join("");
                    this.ast.addNode(resString);
                    this.ast.ascendTree();
                    // return the type returned by stringexpr
                    return VariableType.String;
                default:
                    // Traverse node's children
                    for (var i = 0; i < node.children.length; i++) {
                        // If node is an Expression, return, so we can properly
                        // return the type of the expression
                        if (node.value == TSC.Production.Expr) {
                            return this.traverse(node.children[i]);
                        }
                        this.traverse(node.children[i]);
                    }
                    break;
            }
        };
        /**
         * Checks to see if id is declared in current or parent scope
         * @param node the node whose value we're checking is in scope or not
         * @return the scope object if any
         */
        SemanticAnalyzer.prototype.checkScopes = function (node) {
            // pointer to current position in scope tree
            var ptr = this.scopeTree.curr;
            // Check current scope
            if (ptr.value.table.hasOwnProperty(node.value.value)) {
                // report our gucciness to the log
                this.log.push("VALID: Variable [" + node.value.value + "] on line " + node.lineNumber + " col " + node.colNumber + " has been declared.");
                return ptr.value.table[node.value.value].value;
            }
            else {
                while (ptr.parent != null) {
                    ptr = ptr.parent;
                    // Check if id in scope
                    if (ptr.value.table.hasOwnProperty(node.value.value)) {
                        // report our gucciness to the log
                        this.log.push("VALID: Variable [" + node.value.value + "] on line " + node.lineNumber + " col " + node.colNumber + " has been declared.");
                        return ptr.value.table[node.value.value].value;
                    }
                }
                // Didn't find id in scope, push error and return false
                this.error = true;
                var err = new TSC.ScopeError(TSC.ErrorType.UndeclaredVariable, node.value, node.lineNumber, node.colNumber, null, null);
                this.errors.push(err);
            }
        };
        /**
         * Checks to see if the id type matches its target type
         * @param idType the type of the id being assigned to
         * @param targetType the type that is being assigned to id
         */
        SemanticAnalyzer.prototype.checkTypeMatch = function (id, idType, targetType, idLine, idCol, targetLine, targetCol) {
            if (targetType != null && idType != null) {
                if (idType.value != targetType) {
                    this.error = true;
                    var err = new TSC.TypeError(TSC.ErrorType.TypeMismatch, id, idLine, idCol, idType, targetType);
                    this.errors.push(err);
                }
                else {
                    // report our gucciness to the log
                    this.log.push("VALID: Variable [" + id.value + "] of type " + idType.value + " matches its assignment type of " + targetType + " at line " + targetLine + " col " + targetCol);
                }
            }
        };
        /**
         * Traverses the scope tree in preorder fashion to find warnings to generate
         */
        SemanticAnalyzer.prototype.findWarnings = function (node) {
            // Iterate through object 
            for (var key in node.value.table) {
                // Look for declared but uninitialized variables
                if (node.value.table[key].initialized == false) {
                    // variable is uninitialized
                    this.warnings.push(new TSC.ScopeWarning(TSC.WarningType.UninitializedVariable, key, node.value.table[key].value.lineNumber, node.value.table[key].value.colNumber, node.value));
                }
                // Look for unused variables
                if (node.value.table[key].used == false && node.value.table[key].initialized == true) {
                    // variable is unused
                    this.warnings.push(new TSC.ScopeWarning(TSC.WarningType.UnusedVariable, key, node.value.table[key].value.lineNumber, node.value.table[key].value.colNumber, node.value));
                }
            }
            // Continue traversing in preorder fashion
            for (var i = 0; i < node.children.length; i++) {
                this.findWarnings(node.children[i]);
            }
        };
        /**
         * Marks an id as initialized in current or parent scope
         * We must stop if we find in current scope, because variable can be redeclared in child scope
         * @param node the node whose value we're marking as init'd
         */
        SemanticAnalyzer.prototype.markAsInitialized = function (node) {
            // pointer to current position in scope tree
            var ptr = this.scopeTree.curr;
            // Check current scope
            if (ptr.value.table.hasOwnProperty(node.value.value)) {
                // Mark as initialized
                ptr.value.table[node.value.value].initialized = true;
                // report our gucciness to the log
                this.log.push("VALID: Variable [" + node.value.value + "] on line " + node.lineNumber + " col " + node.colNumber + " has been initialized.");
                return;
            }
            else {
                while (ptr.parent != null) {
                    ptr = ptr.parent;
                    // Check if id in scope
                    if (ptr.value.table.hasOwnProperty(node.value.value)) {
                        // Mark as initialized
                        ptr.value.table[node.value.value].initialized = true;
                        // report our gucciness to the log
                        this.log.push("VALID: Variable [" + node.value.value + "] on line " + node.lineNumber + " col " + node.colNumber + " has been initialized.");
                        return;
                    }
                }
            }
        };
        /**
         * Marks an id as used in current or parent scope
         * We must stop if we find in current scope, because variable can be redeclared in child scope
         * @param node the node whose value we're marking as init'd
         */
        SemanticAnalyzer.prototype.markAsUsed = function (node) {
            // pointer to current position in scope tree
            var ptr = this.scopeTree.curr;
            // Check current scope
            if (ptr.value.table.hasOwnProperty(node.value.value)) {
                // Mark as initialized
                ptr.value.table[node.value.value].used = true;
                // report our gucciness to the log
                this.log.push("VALID: Variable [" + node.value.value + "] on line " + node.lineNumber + " col " + node.colNumber + " has been used.");
                return;
            }
            else {
                while (ptr.parent != null) {
                    ptr = ptr.parent;
                    // Check if id in scope
                    if (ptr.value.table.hasOwnProperty(node.value.value)) {
                        // Mark as initialized
                        ptr.value.table[node.value.value].used = true;
                        // report our gucciness to the log
                        this.log.push("VALID: Variable [" + node.value.value + "] on line " + node.lineNumber + " col " + node.colNumber + " has been used.");
                        return;
                    }
                }
            }
        };
        return SemanticAnalyzer;
    }());
    TSC.SemanticAnalyzer = SemanticAnalyzer;
})(TSC || (TSC = {}));
