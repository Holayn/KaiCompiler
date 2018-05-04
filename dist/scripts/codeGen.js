/**
 * This is the code generator, which takes the AST and produces 6502a op codes for it
 */
var TSC;
(function (TSC) {
    var CodeGenerator = /** @class */ (function () {
        function CodeGenerator() {
            // id of static variable. convert to hex? no need because not actually in op codes in the end
            this.staticId = 0;
            // pointer to start of static area
            this.staticStartPtr = 0;
            this.jumpId = 0;
            // pointer to the start of the heap. initially heap is size 0.
            this.heapStartPtr = 256;
            // pointer representing where we are in op code array
            this.opPtr = 0;
            // pointer representing what node we're looking at in scope tree
            // at -1, because our first block will increase the pointer to 0, which is
            // scope 0 in our tree
            this.scopePtr = -1;
            this.generatedCode = [];
            this.staticMap = new Map();
            this.jumpMap = new Map();
            this.heapMap = new Map();
            // fill with 00's
            for (var i = 0; i < 256; i++) {
                this.generatedCode.push("00");
            }
            // load accumulator with 0
            this.generatedCode[this.opPtr++] = "A9";
            this.generatedCode[this.opPtr++] = "00";
            // front load accumulator with "true" and "false"
            this.generatedCode[254] = "e".charCodeAt(0).toString(16).toUpperCase();
            this.generatedCode[253] = "s".charCodeAt(0).toString(16).toUpperCase();
            this.generatedCode[252] = "l".charCodeAt(0).toString(16).toUpperCase();
            this.generatedCode[251] = "a".charCodeAt(0).toString(16).toUpperCase();
            this.generatedCode[250] = "f".charCodeAt(0).toString(16).toUpperCase();
            this.generatedCode[248] = "e".charCodeAt(0).toString(16).toUpperCase();
            this.generatedCode[247] = "u".charCodeAt(0).toString(16).toUpperCase();
            this.generatedCode[246] = "r".charCodeAt(0).toString(16).toUpperCase();
            this.generatedCode[245] = "t".charCodeAt(0).toString(16).toUpperCase();
            // update start of the heap
            this.heapStartPtr = 245;
        }
        /**
         * Traverse AST. Generate correct opcodes on every subtree root
         * Also properly traverse scope tree to make sure we can properly access the correct variables
         * @param analyzeRes the result object from the semantic analyzer, contains the AST and symbol tree
         */
        CodeGenerator.prototype.generateCode = function (analyzeRes) {
            var ast = analyzeRes.ast;
            var scope = analyzeRes.scopeTree;
            // dfs of scope tree array rep
            this.scopeNodes = scope.traverseTree();
            console.log(scope);
            console.log(this.scopeNodes);
            this.traverseAST(ast.root); // generate initial op codes
            this.createStaticArea();
            this.backPatch(); // perform backpatching on op codes
            // return generated code
            return this.generatedCode;
        };
        CodeGenerator.prototype.nextScopeNode = function (scopeNode) {
        };
        // TODO: define code, static, heap areas. throw error if code goes into heap area, code becomes too big, etc.
        /**
         * Helper to generateCode, performs actual traversing and code generation
         * @param astNode AST node
         * @param scopeNodes array of scope nodes in dfs order
         */
        CodeGenerator.prototype.traverseAST = function (astNode) {
            console.log("Current node: ");
            console.log(astNode);
            console.log("Static table");
            console.log(this.staticMap);
            console.log("Heap");
            console.log(this.heapMap);
            // console.log("Current scope node: ");
            // console.log(scopeNode);
            // Determine what kind of production the node is
            switch (astNode.value) {
                // subtree root is block
                case TSC.Production.Block:
                    // every time we encounter a block, we need to traverse to the next scope node so we can look
                    // at that scope
                    this.scopePtr++;
                    // traverse block's children
                    for (var i = 0; i < astNode.children.length; i++) {
                        this.traverseAST(astNode.children[i]);
                    }
                    break;
                // subtree root is a print statement
                case TSC.Production.PrintStmt:
                    // determine type of child
                    switch (astNode.children[0].value.type) {
                        case "TDigit":
                            // load y register with constant of value digit as string
                            this.generatedCode[this.opPtr++] = "A0";
                            this.generatedCode[this.opPtr++] = "0" + astNode.children[0].value.value;
                            // load x regis with 1
                            this.generatedCode[this.opPtr++] = "A2";
                            this.generatedCode[this.opPtr++] = "01";
                            break;
                        case "TString":
                            // put str in heap and get ptr to it
                            var strPtr = this.allocateStringInHeap(astNode.children[0].value.value);
                            // load into y register as constant
                            this.generatedCode[this.opPtr++] = "A0";
                            this.generatedCode[this.opPtr++] = strPtr;
                            // load x regis with 2
                            this.generatedCode[this.opPtr++] = "A2";
                            this.generatedCode[this.opPtr++] = "02";
                            break;
                        case "TBoolval":
                            this.generatedCode[this.opPtr++] = "A0";
                            if (astNode.children[0].value.value == "true") {
                                // load into y register address of true in heap
                                this.generatedCode[this.opPtr++] = (245).toString(16).toUpperCase();
                            }
                            else if (astNode.children[0].value.value == "false") {
                                // load into y register address of false in heap
                                this.generatedCode[this.opPtr++] = (250).toString(16).toUpperCase();
                            }
                            // load x regis with 2
                            this.generatedCode[this.opPtr++] = "A2";
                            this.generatedCode[this.opPtr++] = "02";
                            break;
                        case "TId":
                            // load the variable temporary address into y register
                            this.generatedCode[this.opPtr++] = "AC";
                            var variable = astNode.children[0].value.value;
                            var scope = astNode.children[0].value.scopeId;
                            var tempAddr = this.findVariableInStaticMap(variable, scope);
                            this.generatedCode[this.opPtr++] = tempAddr;
                            this.generatedCode[this.opPtr++] = "00";
                            // load 1 or 2 into x register depending on variable type being printed
                            // check the type
                            if (this.staticMap.get(tempAddr)["type"] == TSC.VariableType.String || this.staticMap.get(tempAddr)["type"] == TSC.VariableType.Boolean) {
                                // load x regis with 2
                                this.generatedCode[this.opPtr++] = "A2";
                                this.generatedCode[this.opPtr++] = "02";
                            }
                            else {
                                // load x regis with 1
                                this.generatedCode[this.opPtr++] = "A2";
                                this.generatedCode[this.opPtr++] = "01";
                            }
                            break;
                        case "TEquals":
                            // loads x register with lhs, gives back rhs
                            var addr = this.generateEquals(astNode.children[0]);
                            // perform comparison of x register to temp address
                            this.generatedCode[this.opPtr++] = "EC";
                            this.generatedCode[this.opPtr++] = addr;
                            this.generatedCode[this.opPtr++] = "00";
                            // if equal, don't branch, print true
                            // if not equal, branch to print false
                            this.generatedCode[this.opPtr++] = "D0";
                            this.generatedCode[this.opPtr++] = "0A";
                            // load y with true
                            this.generatedCode[this.opPtr++] = "A0";
                            this.generatedCode[this.opPtr++] = (245).toString(16).toUpperCase();
                            // set x register to address, compare same address to x register to set z to zero
                            // load 1 into acc, set x to 0, stores acc in some address
                            // compares that address and x register, branches if unequal
                            // we know last address and the address before will always be unequal, so compare those
                            this.generatedCode[this.opPtr++] = "AE";
                            this.generatedCode[this.opPtr++] = "FF";
                            this.generatedCode[this.opPtr++] = "00";
                            this.generatedCode[this.opPtr++] = "EC";
                            this.generatedCode[this.opPtr++] = "FE";
                            this.generatedCode[this.opPtr++] = "00";
                            this.generatedCode[this.opPtr++] = "D0";
                            this.generatedCode[this.opPtr++] = "02";
                            // load y with false
                            this.generatedCode[this.opPtr++] = "A0";
                            this.generatedCode[this.opPtr++] = (250).toString(16).toUpperCase();
                            // load x register with 2
                            this.generatedCode[this.opPtr++] = "A2";
                            this.generatedCode[this.opPtr++] = "02";
                            break;
                        case "TAddition":
                            var temp = this.generateAddition(astNode.children[0]);
                            // print what is in accumulator, by storing result (in memory) into y register
                            // load y register from memory
                            this.generatedCode[this.opPtr++] = "AC";
                            this.generatedCode[this.opPtr++] = temp;
                            this.generatedCode[this.opPtr++] = "00";
                            // set x reg to 1
                            this.generatedCode[this.opPtr++] = "A2";
                            this.generatedCode[this.opPtr++] = "01";
                    }
                    // sys call
                    this.generatedCode[this.opPtr++] = "FF";
                    break;
                // subtree root is var decl
                case TSC.Production.VarDecl:
                    // need to make entry in static table for variable
                    var temp = "T" + this.staticId;
                    this.staticMap.set(temp, {
                        "name": astNode.children[1].value.value,
                        "type": astNode.children[0].value,
                        "at": "",
                        "scopeId": astNode.children[1].value.scopeId
                    });
                    // store in accumulator location temp 0, fill in later
                    this.generatedCode[this.opPtr++] = "8D";
                    this.generatedCode[this.opPtr++] = "T" + this.staticId;
                    this.generatedCode[this.opPtr++] = "00";
                    // increase the static id
                    this.staticId++;
                    break;
                // subtree root is assignment
                case TSC.Production.AssignStmt:
                    // figure out what is being assigned to it
                    switch (astNode.children[1].value.type) {
                        case "TDigit":
                            // load digit as constant into accumulator
                            this.generatedCode[this.opPtr++] = "A9";
                            this.generatedCode[this.opPtr++] = "0" + astNode.children[1].value.value;
                            break;
                        case "TString":
                            // put str in heap and get ptr to it
                            var strPtr = this.allocateStringInHeap(astNode.children[1].value.value);
                            // load into accumulator as constant
                            this.generatedCode[this.opPtr++] = "A9";
                            this.generatedCode[this.opPtr++] = strPtr;
                            break;
                        case "TBoolval":
                            if (astNode.children[1].value.value == "true") {
                                // load address of true in heap into accumulator as constant
                                this.generatedCode[this.opPtr++] = "A9";
                                this.generatedCode[this.opPtr++] = (245).toString(16).toUpperCase();
                            }
                            else if (astNode.children[1].value.value == "false") {
                                // load address of false in heap into accumulator as constant
                                this.generatedCode[this.opPtr++] = "A9";
                                this.generatedCode[this.opPtr++] = (250).toString(16).toUpperCase();
                            }
                            break;
                        case "TId":
                            // look up variable we're assigning to something else in static table, get its temp address
                            // load it into accumulator
                            this.generatedCode[this.opPtr++] = "AD";
                            var variable = astNode.children[1].value.value;
                            var scope = astNode.children[1].value.scopeId;
                            var addr = this.findVariableInStaticMap(variable, scope);
                            this.generatedCode[this.opPtr++] = addr;
                            this.generatedCode[this.opPtr++] = "00";
                            break;
                        case "TAddition":
                            // result ends up in accumulator
                            this.generateAddition(astNode.children[1]);
                            break;
                    }
                    // find temp address of variable we're assigning to
                    var variable = astNode.children[0].value.value;
                    var scope = astNode.children[0].value.scopeId;
                    console.log(scope);
                    console.log(variable);
                    console.log(astNode);
                    var tempAddr = this.findVariableInStaticMap(variable, scope);
                    console.log("ASSIGNING VALUE TO " + tempAddr);
                    // store whatever is in accumulator to memory
                    this.generatedCode[this.opPtr++] = "8D";
                    this.generatedCode[this.opPtr++] = tempAddr;
                    this.generatedCode[this.opPtr++] = "00";
                    break;
                // subtree root is while statement
                case TSC.Production.WhileStmt:
                    // keep ptr to start of while loop
                    var whileStartPtr = this.opPtr;
                    // evaluate lhs first, which is the boolean result
                    var address;
                    switch (astNode.children[0].value.type) {
                        // if lhs is a boolean value, set zero flag to 1 if true, set zero flag to 0 if false
                        case "TBoolval":
                            // load heap address of true into x register
                            if (astNode.children[0].value.value == "true") {
                                address = (245).toString(16).toUpperCase();
                                this.generatedCode[this.opPtr++] = "AE";
                                this.generatedCode[this.opPtr++] = address;
                                this.generatedCode[this.opPtr++] = "00";
                            }
                            else {
                                address = (250).toString(16).toUpperCase();
                                this.generatedCode[this.opPtr++] = "AE";
                                this.generatedCode[this.opPtr++] = address;
                                this.generatedCode[this.opPtr++] = "00";
                            }
                            // compare to address of true. we need to set z flag if not equal later
                            this.generatedCode[this.opPtr++] = "EC";
                            this.generatedCode[this.opPtr++] = (245).toString(16).toUpperCase();
                            this.generatedCode[this.opPtr++] = "00";
                            break;
                        // if lhs is a boolean expression equality
                        case "TEquals":
                            // get back the address we're comparing to the x register, which is already loaded
                            address = this.generateEquals(astNode.children[0]);
                            // perform comparison of x register to temp address
                            this.generatedCode[this.opPtr++] = "EC";
                            this.generatedCode[this.opPtr++] = address;
                            this.generatedCode[this.opPtr++] = "00";
                            break;
                    }
                    // z flag has now been assigned, set acc to 1
                    this.generatedCode[this.opPtr++] = "A9";
                    this.generatedCode[this.opPtr++] = "01";
                    // branch if not equal
                    this.generatedCode[this.opPtr++] = "D0";
                    this.generatedCode[this.opPtr++] = "02";
                    // (if equal, then set accumulator to zero)
                    this.generatedCode[this.opPtr++] = "A9";
                    this.generatedCode[this.opPtr++] = "00";
                    // set x register to 0
                    this.generatedCode[this.opPtr++] = "A2";
                    this.generatedCode[this.opPtr++] = "00";
                    // store acc in new address so we can compare its value with x register
                    var temp = "T" + this.staticId;
                    this.staticMap.set(temp, {
                        "name": "",
                        "type": "",
                        "at": "",
                        "scopeId": ""
                    });
                    this.staticId++;
                    this.generatedCode[this.opPtr++] = "8D";
                    this.generatedCode[this.opPtr++] = temp;
                    this.generatedCode[this.opPtr++] = "00";
                    // compare address to x register, branch if unequal
                    this.generatedCode[this.opPtr++] = "EC";
                    this.generatedCode[this.opPtr++] = temp;
                    this.generatedCode[this.opPtr++] = "00";
                    // jump
                    // need to make entry in jump table
                    var endWhileJump = "J" + this.jumpId;
                    this.jumpId++;
                    var startOfBranchPtr = this.opPtr;
                    // store in accumulator location temp 0, fill in later
                    this.generatedCode[this.opPtr++] = "D0";
                    this.generatedCode[this.opPtr++] = endWhileJump;
                    // increase the jump id
                    // now we need to put op codes in to evaluate the block
                    // evaluate the RHS, which is just recursing to generate proper codes
                    this.traverseAST(astNode.children[1]);
                    // generate end of while loop codes, which is the unconditional jump to top of loop
                    // load 0 into acc
                    this.generatedCode[this.opPtr++] = "A9";
                    this.generatedCode[this.opPtr++] = "00";
                    // store 0 value in accumulator to some new address in memory
                    var uncond = "T" + this.staticId;
                    this.staticMap.set(uncond, {
                        "name": "",
                        "type": "",
                        "at": "",
                        "scopeId": ""
                    });
                    this.staticId++;
                    this.generatedCode[this.opPtr++] = "8D";
                    this.generatedCode[this.opPtr++] = uncond;
                    this.generatedCode[this.opPtr++] = "00";
                    // load 1 into x reg
                    this.generatedCode[this.opPtr++] = "A2";
                    this.generatedCode[this.opPtr++] = "01";
                    // compare x reg and uncond to always branch
                    this.generatedCode[this.opPtr++] = "EC";
                    this.generatedCode[this.opPtr++] = uncond;
                    this.generatedCode[this.opPtr++] = "00";
                    var whileJump = "J" + this.jumpId;
                    this.jumpId++;
                    this.generatedCode[this.opPtr++] = "D0";
                    this.generatedCode[this.opPtr++] = whileJump;
                    // figure out how much to jump based on current opPtr and where the op codes for the while loop start
                    // (size-current) + start. OS will take care of modulus
                    // store as hex value
                    var jumpValue = ((this.generatedCode.length - (this.opPtr)) + whileStartPtr).toString(16).toUpperCase();
                    if (jumpValue.length < 2) {
                        // pad with 0
                        jumpValue = "0" + jumpValue;
                    }
                    this.jumpMap.set(whileJump, {
                        "jump": jumpValue // needs to be a hex value
                    });
                    // insert jump value for end of while loop
                    // we have to account for d0 and xx so hence +2
                    jumpValue = (this.opPtr - (startOfBranchPtr + 2)).toString(16).toUpperCase();
                    if (jumpValue.length < 2) {
                        // pad with 0
                        jumpValue = "0" + jumpValue;
                    }
                    this.jumpMap.set(endWhileJump, {
                        "jump": jumpValue // needs to be a hex value
                    });
                    break;
                // subtree root is if statement
                case TSC.Production.IfStmt:
                    // look at its left and right children
                    switch (astNode.children[0].value.type) {
                        // if lhs is a boolean value, set zero flag to 1 if true, set zero flag to 0 if false
                        case "TBoolval":
                            // load heap address of true into x register
                            if (astNode.children[0].value.value == "true") {
                                this.generatedCode[this.opPtr++] = "AE";
                                this.generatedCode[this.opPtr++] = (245).toString(16).toUpperCase();
                                this.generatedCode[this.opPtr++] = "00";
                            }
                            else {
                                this.generatedCode[this.opPtr++] = "AE";
                                this.generatedCode[this.opPtr++] = (250).toString(16).toUpperCase();
                                this.generatedCode[this.opPtr++] = "00";
                            }
                            // compare to address of true
                            this.generatedCode[this.opPtr++] = "EC";
                            this.generatedCode[this.opPtr++] = (245).toString(16).toUpperCase();
                            this.generatedCode[this.opPtr++] = "00";
                            break;
                        // if lhs is a boolean expression equality 
                        // might be null because equalto isn't stored in my ast with a type
                        case "TEquals":
                            // get back the address we're comparing to the x register
                            var addr = this.generateEquals(astNode.children[0]);
                            // perform comparison of x register to temp address
                            this.generatedCode[this.opPtr++] = "EC";
                            this.generatedCode[this.opPtr++] = addr;
                            this.generatedCode[this.opPtr++] = "00";
                            break;
                    }
                    // jump
                    // need to make entry in jump table
                    var temp = "J" + this.jumpId;
                    var startOfBranchPtr = this.opPtr;
                    // store in accumulator location temp 0, fill in later
                    this.generatedCode[this.opPtr++] = "D0";
                    this.generatedCode[this.opPtr++] = temp;
                    // increase the jump id
                    this.jumpId++;
                    // now we need to put op codes in to evaluate the block
                    this.traverseAST(astNode.children[1]);
                    // figure out how much to jump based on current opPtr and where the op code for the branch is
                    // + 2 for offset because we use 2 op codes to store branch
                    // store as hex value
                    var jumpValue = (this.opPtr - (startOfBranchPtr + 2)).toString(16).toUpperCase();
                    if (jumpValue.length < 2) {
                        // pad with 0
                        jumpValue = "0" + jumpValue;
                    }
                    this.jumpMap.set(temp, {
                        "jump": jumpValue // needs to be a hex value
                    });
                    break;
            }
        };
        /**
         * Generates opcodes for an Equals expression
         * @param equalsNode takes in the equals node
         */
        CodeGenerator.prototype.generateEquals = function (equalsNode) {
            console.log("HEY");
            console.log(equalsNode);
            // LHS: load what is in lhs into x register
            switch (equalsNode.children[0].value.type) {
                case "TDigit":
                    // load digit as constant into x register
                    this.generatedCode[this.opPtr++] = "A2";
                    this.generatedCode[this.opPtr++] = "0" + equalsNode.children[0].value.value;
                    break;
                case "TString":
                    // we will compare strings based on what address is in heap
                    // put ptr of string in heap to x register as constant
                    var strPtr = this.allocateStringInHeap(equalsNode.children[0].value.value);
                    this.generatedCode[this.opPtr++] = "A2";
                    this.generatedCode[this.opPtr++] = strPtr;
                    break;
                case "TBoolval":
                    // put ptr of boolean val to x register as constant
                    if (equalsNode.children[0].value.value == "true") {
                        // load address of true 
                        this.generatedCode[this.opPtr++] = "A2";
                        this.generatedCode[this.opPtr++] = (245).toString(16).toUpperCase();
                    }
                    else if (equalsNode.children[0].value.value == "false") {
                        // load address of false
                        this.generatedCode[this.opPtr++] = "A2";
                        this.generatedCode[this.opPtr++] = (250).toString(16).toUpperCase();
                    }
                    break;
                case "TId":
                    // look up variable in static table, get its temp address
                    // load it into x register 
                    this.generatedCode[this.opPtr++] = "AE";
                    var variable = equalsNode.children[0].value.value;
                    var scope = equalsNode.children[0].value.scopeId;
                    var tempAddr = this.findVariableInStaticMap(variable, scope);
                    this.generatedCode[this.opPtr++] = tempAddr;
                    this.generatedCode[this.opPtr++] = "00";
                    break;
                case "TAddition":
                    // load result of addition in accumulator (which was stored in static storage) to x register
                    var memAddr = this.generateAddition(equalsNode.children[0]); // get mem addr of result from static storage
                    this.generatedCode[this.opPtr++] = "AE";
                    this.generatedCode[this.opPtr++] = memAddr;
                    this.generatedCode[this.opPtr++] = "00";
                    break;
                case "TEquals":
                    // TODO: BOOLEAN HELL!
                    break;
            }
            // RHS: compare to address of what rhs is. actually, just return mem address of rhs
            switch (equalsNode.children[1].value.type) {
                case "TDigit":
                    // put this value into the accumulator, store it in somewhere
                    // need to make entry in static table for value
                    this.generatedCode[this.opPtr++] = "A9";
                    this.generatedCode[this.opPtr++] = "0" + equalsNode.children[1].value.value;
                    var temp = "T" + this.staticId;
                    this.staticMap.set(temp, {
                        "name": equalsNode.children[1].value.value,
                        "type": equalsNode.children[1].value.type,
                        "at": "",
                        "scopeId": ""
                    });
                    // store in accumulator location temp, fill in later
                    this.generatedCode[this.opPtr++] = "8D";
                    this.generatedCode[this.opPtr++] = temp;
                    this.generatedCode[this.opPtr++] = "00";
                    // increase the static id
                    this.staticId++;
                    return temp;
                case "TString":
                    // we will compare strings based on what address is in heap
                    // perform comparison of x register to this temp address
                    var strPtr = this.allocateStringInHeap(equalsNode.children[1].value.value);
                    // need to make entry in static table for value
                    this.generatedCode[this.opPtr++] = "A9";
                    this.generatedCode[this.opPtr++] = strPtr;
                    var temp = "T" + this.staticId;
                    this.staticMap.set(temp, {
                        "name": equalsNode.children[1].value.value,
                        "type": equalsNode.children[1].value.type,
                        "at": "",
                        "scopeId": ""
                    });
                    // store in accumulator location temp, fill in later
                    this.generatedCode[this.opPtr++] = "8D";
                    this.generatedCode[this.opPtr++] = temp;
                    this.generatedCode[this.opPtr++] = "00";
                    // increase the static id
                    this.staticId++;
                    return temp;
                case "TBoolval":
                    // generate address to hold address to true/false
                    if (equalsNode.children[1].value.value == "true") {
                        // compare to address of true 
                        // need to store address of true into memory
                        // need to make entry in static table for value
                        this.generatedCode[this.opPtr++] = "A9";
                        this.generatedCode[this.opPtr++] = (245).toString(16).toUpperCase();
                        var temp = "T" + this.staticId;
                        this.staticMap.set(temp, {
                            "name": equalsNode.children[1].value.value,
                            "type": equalsNode.children[1].value.type,
                            "at": "",
                            "scopeId": ""
                        });
                        // store in accumulator location temp, fill in later
                        this.generatedCode[this.opPtr++] = "8D";
                        this.generatedCode[this.opPtr++] = temp;
                        this.generatedCode[this.opPtr++] = "00";
                        // increase the static id
                        this.staticId++;
                        return temp;
                    }
                    else if (equalsNode.children[1].value.value == "false") {
                        // compare to address of false
                        // need to store address of false into memory
                        // need to make entry in static table for value
                        this.generatedCode[this.opPtr++] = "A9";
                        this.generatedCode[this.opPtr++] = (250).toString(16).toUpperCase();
                        var temp = "T" + this.staticId;
                        this.staticMap.set(temp, {
                            "name": equalsNode.children[1].value.value,
                            "type": equalsNode.children[1].value.type,
                            "at": "",
                            "scopeId": ""
                        });
                        // store in accumulator location temp, fill in later
                        this.generatedCode[this.opPtr++] = "8D";
                        this.generatedCode[this.opPtr++] = temp;
                        this.generatedCode[this.opPtr++] = "00";
                        // increase the static id
                        this.staticId++;
                        return temp;
                    }
                    break;
                case "TId":
                    // compare x register to address of id
                    var variable = equalsNode.children[1].value.value;
                    var scope = equalsNode.children[1].value.scopeId;
                    var temp = this.findVariableInStaticMap(variable, scope);
                    return temp;
                case "TAddition":
                    // return result of addition in accumulator (which was stored in static storage)
                    var memAddr = this.generateAddition(equalsNode.children[1]); // get mem addr of result from static storage
                    return memAddr;
                case "TEquals":
                    // TODO: BOOLEAN HELL!
                    break;
            }
        };
        /**
         * Generates op codes for an addition node
         * We evaluate from right-left
         * @param node the addition node
         */
        CodeGenerator.prototype.generateAddition = function (additionNode) {
            // RHS: load whatever it is into some new address in static memory
            var temp = "T" + this.staticId;
            this.staticMap.set(temp, {
                "name": additionNode.children[1].value.value,
                "type": additionNode.children[1].value.type,
                "at": "",
                "scopeId": ""
            });
            this.staticId++;
            switch (additionNode.children[1].value.type) {
                case "TDigit":
                    this.generatedCode[this.opPtr++] = "A9";
                    this.generatedCode[this.opPtr++] = "0" + additionNode.children[1].value.value;
                    this.generatedCode[this.opPtr++] = "8D";
                    this.generatedCode[this.opPtr++] = temp;
                    this.generatedCode[this.opPtr++] = "00";
                    break;
                case "TId":
                    var variable = additionNode.children[1].value.value;
                    var scope = additionNode.children[1].value.scopeId;
                    var addr = this.findVariableInStaticMap(variable, scope);
                    this.generatedCode[this.opPtr++] = "AD";
                    this.generatedCode[this.opPtr++] = addr;
                    this.generatedCode[this.opPtr++] = "00";
                    this.generatedCode[this.opPtr++] = "8D";
                    this.generatedCode[this.opPtr++] = temp;
                    this.generatedCode[this.opPtr++] = "00";
                    break;
                case "TAddition":
                    // well, we're going to have to generate those op codes first ?
                    // generate op codes, which will generate that result in the accumulator
                    // use that result and add it to lhs of current (current is loaded into accumulator)
                    // so we have to put accumulator result in some memory address? then access it?
                    // call generateAddition on rhs, get back memory address holding result of it
                    var memAddrResult = this.generateAddition(additionNode.children[1]);
                    temp = memAddrResult;
            }
            // LHS: can only be a digit
            switch (additionNode.children[0].value.type) {
                case "TDigit":
                    this.generatedCode[this.opPtr++] = "A9";
                    this.generatedCode[this.opPtr++] = "0" + additionNode.children[0].value.value;
                    break;
            }
            // addition opcodes - add what in temp address to accumulator
            this.generatedCode[this.opPtr++] = "6D";
            this.generatedCode[this.opPtr++] = temp;
            this.generatedCode[this.opPtr++] = "00";
            // store acc in memory
            var temp = "T" + this.staticId;
            this.staticMap.set(temp, {
                "name": "",
                "type": "",
                "at": "",
                "scopeId": ""
            });
            this.staticId++;
            this.generatedCode[this.opPtr++] = "8D";
            this.generatedCode[this.opPtr++] = temp;
            this.generatedCode[this.opPtr++] = "00";
            // return temp
            return temp;
        };
        /**
         * Creates area after code in opcodes as static area
         * Insert break between code and static area (hence opPtr + 1) so we can differentiate it
         * This area is after code but before heap
         * Makes sure does not run into heap ptr. If does, throw error, not enough static space for variables.
         */
        CodeGenerator.prototype.createStaticArea = function () {
            this.staticStartPtr = this.opPtr + 1;
            // need to figure out how many variables we need to store in the static area. for now, size of map.
            var numberOfVariables = this.staticMap.size;
            // check if runs into heap ptr
            if (this.staticStartPtr + numberOfVariables >= this.heapStartPtr) {
                console.log("ERROR");
                // TODO: throw an error
                return;
            }
            // Start assigning memory addresses for variables in statics table
            var itr = this.staticMap.keys();
            for (var i = 0; i < this.staticMap.size; i++) {
                var temp = itr.next();
                var newAddr = this.staticStartPtr.toString(16).toUpperCase(); // convert to hex string
                // pad with 0 with necessary
                if (newAddr.length < 2) {
                    newAddr = "0" + newAddr;
                }
                this.staticMap.get(temp.value)["at"] = newAddr;
                this.staticStartPtr++;
            }
        };
        /**
         * Goes through the code looking for things to backpatch
         * i.e. placeholders for variables
         */
        CodeGenerator.prototype.backPatch = function () {
            // When coming across placeholders for variables, lookup in map, replace with its "at"
            for (var i = 0; i < this.generatedCode.length; i++) {
                // found a placeholder for static variable
                if (this.generatedCode[i].charAt(0) == 'T') {
                    var temp = this.generatedCode[i];
                    // lookup in map and get mem address
                    var memAddr = this.staticMap.get(temp)["at"];
                    // replace
                    this.generatedCode[i] = memAddr;
                }
                // found a placeholder for jump
                if (this.generatedCode[i].charAt(0) == 'J') {
                    var temp = this.generatedCode[i];
                    // lookup in map and get mem address
                    var jumpAmount = this.jumpMap.get(temp)["jump"];
                    // replace
                    this.generatedCode[i] = jumpAmount;
                }
            }
        };
        /**
         * Given a variable and scope, looks for it in the static map
         * @param variable the variable name
         * @param scope the scope the variable is in
         */
        CodeGenerator.prototype.findVariableInStaticMap = function (variable, scope) {
            console.log("FINDING " + variable + scope);
            var itr = this.staticMap.entries();
            while (true) {
                for (var i = 0; i < this.staticMap.size; i++) {
                    var staticObject = itr.next();
                    console.log(staticObject);
                    if (staticObject.value[1]["name"] == variable && staticObject.value[1]["scopeId"] == scope) {
                        console.log("FOUND IT");
                        // when finding appropriate variable, return its temp address
                        return staticObject.value[0].toString();
                    }
                }
                console.log("CAN'T FIND VARIABLE IN CURRENT SCOPE, LOOK ABOVE" + variable + scope);
                itr = this.staticMap.entries();
                // if can't find with that scope id, look in above scopes to see if there, return when it found
                var currScope = this.scopeNodes[this.scopePtr];
                // set currScope to its parent
                currScope = currScope.parent;
                // set scope id
                scope = currScope.value.id;
            }
        };
        /**
         * Given a string, put it in the heap and return a pointer to beginning of string
         * TODO: make sure heap ptr doesn't collide with op ptr
         * @param string the string to store
         * @return hex string of pointer
         */
        CodeGenerator.prototype.allocateStringInHeap = function (string) {
            // trim off quotes
            string = string.substring(1, string.length - 1);
            // see if string already exists in heap. if so, return its address
            console.log("ALLOCATING FOR " + string);
            if (this.heapMap.has(string)) {
                console.log("STRING ALREADY IN HEAP");
                return this.heapMap.get(string)["ptr"];
            }
            // first determine length of string.
            var len = string.length;
            // subtract length + 1 from heapStartPtr, +1 because strings are 0 terminated
            this.heapStartPtr = this.heapStartPtr - (len + 1);
            var strPtr = this.heapStartPtr;
            // put in characters converted to hex strings into heap
            for (var i = this.heapStartPtr; i < this.heapStartPtr + len; i++) {
                this.generatedCode[i] = string.charCodeAt(i - this.heapStartPtr).toString(16).toUpperCase();
            }
            // store in heap map
            this.heapMap.set(string, {
                "ptr": strPtr.toString(16).toUpperCase()
            });
            // return pointer to beginning of string. convert to hex string.
            return strPtr.toString(16).toUpperCase();
        };
        return CodeGenerator;
    }());
    TSC.CodeGenerator = CodeGenerator;
})(TSC || (TSC = {}));
