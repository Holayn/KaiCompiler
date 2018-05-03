/**
 * This is the code generator, which takes the AST and produces 6502a op codes for it
 */

module TSC {

    export class CodeGenerator {
        // holds the generated op codes
        generatedCode: Array<String>;
        /* structure of map to represent a table of static variables
        "temp" : {
            "name":
            "type":
            "at":
            "scope":
        }
        */
        staticMap: Map<String, Object>;
        // id of static variable. convert to hex? no need because not actually in op codes in the end
        staticId: number = 0;
        // pointer to start of static area
        staticStartPtr: number = 0;
        /* structure object to represent the loop jumps
        "temp": {
            "jump":
        }
        */
        jumpMap: Map<String, Object>;
        jumpId: number = 0;
        /* structure of map to represent the heap
        "name": {
            "ptr":
        }
        */
        heapMap: Map<String, Object>;
        // pointer to the start of the heap. initially heap is size 0.
        heapStartPtr: number = 256;
        // pointer representing where we are in op code array
        opPtr: number = 0;
        constructor() {
            this.generatedCode = [];
            this.staticMap = new Map<String, Object>();
            this.jumpMap = new Map<String, Object>();
            this.heapMap = new Map<String, Object>();
            // fill with 00's
            for(var i=0; i<256; i++){
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

        // traverse the ast in preorder fashion.
        // based on subtree root, perform certain action
        /**
         * Traverse AST. Generate correct opcodes on every subtree root
         * @param analyzeRes the result object from the semantic analyzer, contains the AST and symbol tree
         */
        public generateCode(analyzeRes) {
            let ast: Tree = analyzeRes.ast;
            this.traverseAST(ast.root); // generate initial op codes
            this.createStaticArea();
            this.backPatch(); // perform backpatching on op codes
            // return generated code
            return this.generatedCode;
        }
        
        // TODO: define code, static, heap areas. throw error if code goes into heap area, code becomes too big, etc.
        /**
         * Helper to generateCode, performs actual traversing and code generation
         * @param node AST node
         */
        private traverseAST(node) {
            console.log("Current node: ");
            console.log(node);
            console.log("Static table");
            console.log(this.staticMap);
            console.log("Heap");
            console.log(this.heapMap);
            // Determine what kind of production the node is
            switch(node.value){
                // subtree root is block
                case TSC.Production.Block:
                    // traverse block's children
                    for(var i=0; i<node.children.length; i++){
                        this.traverseAST(node.children[i]);
                    }
                    break;
                // subtree root is a print statement
                case TSC.Production.PrintStmt:
                    // determine type of child
                    switch(node.children[0].value.type){
                        case "TDigit":
                            // load y register with constant of value digit as string
                            this.generatedCode[this.opPtr++] = "A0";
                            this.generatedCode[this.opPtr++] = "0" + node.children[0].value.value;
                            // load x regis with 1
                            this.generatedCode[this.opPtr++] = "A2";
                            this.generatedCode[this.opPtr++] = "01";
                            // sys call
                            this.generatedCode[this.opPtr++] = "FF";
                            break;
                        case "TString":
                            // put str in heap and get ptr to it
                            let strPtr = this.allocateStringInHeap(node.children[0].value.value);
                            // load into y register as constant
                            this.generatedCode[this.opPtr++] = "A0";
                            this.generatedCode[this.opPtr++] = strPtr;
                            // load x regis with 2
                            this.generatedCode[this.opPtr++] = "A2";
                            this.generatedCode[this.opPtr++] = "02";
                            // sys call
                            this.generatedCode[this.opPtr++] = "FF";
                            break;
                        case "TBoolval":
                            this.generatedCode[this.opPtr++] = "A0";
                            if(node.children[0].value.value == "true"){
                                // load into y register address of true in heap
                                this.generatedCode[this.opPtr++] = (245).toString(16).toUpperCase();
                            }
                            else if(node.children[0].value.value == "false"){
                                // load into y register address of false in heap
                                this.generatedCode[this.opPtr++] = (250).toString(16).toUpperCase();
                            }
                            // load x regis with 2
                            this.generatedCode[this.opPtr++] = "A2";
                            this.generatedCode[this.opPtr++] = "02";
                            // sys call
                            this.generatedCode[this.opPtr++] = "FF";
                            break;
                        case "TId":
                            // load the variable temporary address into y register
                            this.generatedCode[this.opPtr++] = "AC";
                            var variable = node.children[0].value.value;
                            var scope = node.children[0].value.scopeId;
                            var tempAddr = this.findVariableInStaticMap(variable, scope);
                            this.generatedCode[this.opPtr++] = tempAddr;
                            this.generatedCode[this.opPtr++] = "00";
                            // load 1 or 2 into x register depending on variable type being printed
                            // check the type
                            if(this.staticMap.get(tempAddr)["type"] == TSC.VariableType.String || this.staticMap.get(tempAddr)["type"] == TSC.VariableType.Boolean){
                                // load x regis with 2
                                this.generatedCode[this.opPtr++] = "A2";
                                this.generatedCode[this.opPtr++] = "02";
                            }
                            else{
                                // load x regis with 1
                                this.generatedCode[this.opPtr++] = "A2";
                                this.generatedCode[this.opPtr++] = "01";
                            }
                            // sys call
                            this.generatedCode[this.opPtr++] = "FF";
                            break;
                    }
                    break;
                // subtree root is var decl
                case TSC.Production.VarDecl:
                    // need to make entry in static table for variable
                    var temp = "T" + this.staticId;
                    this.staticMap.set(temp, {
                        "name": node.children[1].value.value,
                        "type": node.children[0].value,
                        "at": "",
                        "scopeId": node.children[1].value.scopeId
                    })
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
                    switch(node.children[1].value.type){
                        case "TDigit":
                            // load digit as constant into accumulator
                            this.generatedCode[this.opPtr++] = "A9";
                            this.generatedCode[this.opPtr++] = "0" + node.children[1].value.value;
                            break;
                        case "TString":
                            // put str in heap and get ptr to it
                            let strPtr = this.allocateStringInHeap(node.children[1].value.value);
                            // load into accumulator as constant
                            this.generatedCode[this.opPtr++] = "A9";
                            this.generatedCode[this.opPtr++] = strPtr;
                            break;
                        case "TBoolval":
                            if(node.children[1].value.value == "true"){
                                // load address of true in heap into accumulator as constant
                                this.generatedCode[this.opPtr++] = "A9";
                                this.generatedCode[this.opPtr++] = (245).toString(16).toUpperCase();
                            }
                            else if(node.children[1].value.value == "false"){
                                // load address of false in heap into accumulator as constant
                                this.generatedCode[this.opPtr++] = "A9";
                                this.generatedCode[this.opPtr++] = (250).toString(16).toUpperCase();
                            }
                            break;
                        case "TId":
                            // look up variable we're assigning to something else in static table, get its temp address
                            // load it into accumulator
                            this.generatedCode[this.opPtr++] = "AD";
                            var variable = node.children[1].value.value;
                            var scope = node.children[1].value.scopeId;
                            var tempAddr = this.findVariableInStaticMap(variable, scope);
                            this.generatedCode[this.opPtr++] = tempAddr;
                            this.generatedCode[this.opPtr++] = "00";
                            break;
                    }
                    // find temp address of variable we're assigning to
                    var variable = node.children[0].value.value;
                    var scope = node.children[0].value.scopeId;
                    var tempAddr = this.findVariableInStaticMap(variable, scope);
                    // store whatever is in accumulator to memory
                    this.generatedCode[this.opPtr++] = "8D";
                    this.generatedCode[this.opPtr++] = tempAddr;
                    this.generatedCode[this.opPtr++] = "00";
                    break;
                // subtree root is if statement
                case TSC.Production.IfStmt:
                    // look at its left and right children
                    switch(node.children[0].value.type){
                        // if lhs is a boolean value, set zero flag to 1 if true, set zero flag to 0 if false
                        case "TBoolval":
                            // load heap address of true into x register
                            if(node.children[0].value.value == "true"){
                                this.generatedCode[this.opPtr++] = "AE";
                                this.generatedCode[this.opPtr++] = (245).toString(16).toUpperCase();
                                this.generatedCode[this.opPtr++] = "00";
                            }
                            else{
                                this.generatedCode[this.opPtr++] = "AE";
                                this.generatedCode[this.opPtr++] = (250).toString(16).toUpperCase();
                                this.generatedCode[this.opPtr++] = "00"
                            }
                            // compare to address of true
                            this.generatedCode[this.opPtr++] = "EC";
                            this.generatedCode[this.opPtr++] = (245).toString(16).toUpperCase();
                            this.generatedCode[this.opPtr++] = "00";
                            break;
                        // if lhs is a boolean expression equality 
                        // might be null because equalto isn't stored in my ast with a type
                        default:
                            switch(node.children[0].value){
                                case "EqualTo":
                                    // LHS: load what is in lhs into x register
                                    switch(node.children[0].children[0].value.type){
                                        case "TDigit":
                                            // load digit as constant into x register
                                            this.generatedCode[this.opPtr++] = "A2";
                                            this.generatedCode[this.opPtr++] = "0" + node.children[0].children[0].value.value;
                                            break;
                                        case "TString":
                                            // we will compare strings based on what address is in heap
                                            // put ptr of string in heap to x register as constant
                                            let strPtr = this.allocateStringInHeap(node.children[0].children[0].value.value);
                                            this.generatedCode[this.opPtr++] = "A2";
                                            this.generatedCode[this.opPtr++] = strPtr;
                                            break;
                                        case "TBoolval":
                                            // put ptr of boolean val to x register as constant
                                            if(node.children[0].children[0].value.value == "true"){
                                                // load address of true 
                                                this.generatedCode[this.opPtr++] = "A2";
                                                this.generatedCode[this.opPtr++] = (245).toString(16).toUpperCase();
                                            }
                                            else if(node.children[0].children[0].value.value == "false"){
                                                // load address of false
                                                this.generatedCode[this.opPtr++] = "A2";
                                                this.generatedCode[this.opPtr++] = (250).toString(16).toUpperCase();
                                            }
                                            break;
                                        case "TId":
                                            // look up variable in static table, get its temp address
                                            // load it into x register 
                                            this.generatedCode[this.opPtr++] = "AE";
                                            var variable = node.children[0].children[0].value.value;
                                            var scope = node.children[0].children[0].value.scopeId;
                                            var tempAddr = this.findVariableInStaticMap(variable, scope);
                                            this.generatedCode[this.opPtr++] = tempAddr;
                                            this.generatedCode[this.opPtr++] = "00";
                                            break;
                                    }
                                    // RHS: compare to address of what rhs is
                                    switch(node.children[0].children[1].value.type){
                                        case "TDigit":
                                            // put this value into the accumulator, store it in somewhere
                                            // need to make entry in static table for value
                                            this.generatedCode[this.opPtr++] = "A9";
                                            this.generatedCode[this.opPtr++] = "0" + node.children[0].children[1].value.value;
                                            var temp = "T" + this.staticId;
                                            this.staticMap.set(temp, {
                                                "name": node.children[0].children[1].value.value,
                                                "type": node.children[0].children[1].value.type,
                                                "at": "",
                                                "scopeId": ""
                                            })
                                            // store in accumulator location temp, fill in later
                                            this.generatedCode[this.opPtr++] = "8D";
                                            this.generatedCode[this.opPtr++] = temp;
                                            this.generatedCode[this.opPtr++] = "00";
                                            // increase the static id
                                            this.staticId++;
                                            // perform comparison of x register to this temp address
                                            this.generatedCode[this.opPtr++] = "EC";
                                            this.generatedCode[this.opPtr++] = temp;
                                            this.generatedCode[this.opPtr++] = "00";
                                            break;
                                        case "TString":
                                            // we will compare strings based on what address is in heap
                                            // perform comparison of x register to this temp address
                                            let strPtr = this.allocateStringInHeap(node.children[0].children[1].value.value);
                                            // need to make entry in static table for value
                                            this.generatedCode[this.opPtr++] = "A9";
                                            this.generatedCode[this.opPtr++] = strPtr;
                                            var temp = "T" + this.staticId;
                                            this.staticMap.set(temp, {
                                                "name": node.children[0].children[1].value.value,
                                                "type": node.children[0].children[1].value.type,
                                                "at": "",
                                                "scopeId": ""
                                            })
                                            // store in accumulator location temp, fill in later
                                            this.generatedCode[this.opPtr++] = "8D";
                                            this.generatedCode[this.opPtr++] = temp;
                                            this.generatedCode[this.opPtr++] = "00";
                                            // increase the static id
                                            this.staticId++;
                                            // perform comparison of x register to this temp address
                                            this.generatedCode[this.opPtr++] = "EC";
                                            this.generatedCode[this.opPtr++] = temp;
                                            this.generatedCode[this.opPtr++] = "00";
                                            break;
                                        case "TBoolval":
                                            // compare to x register with address of boolval
                                            if(node.children[0].children[1].value.value == "true"){
                                                // compare to address of true 
                                                // need to store address of true into memory
                                                // need to make entry in static table for value
                                                this.generatedCode[this.opPtr++] = "A9";
                                                this.generatedCode[this.opPtr++] = (245).toString(16).toUpperCase();
                                                var temp = "T" + this.staticId;
                                                this.staticMap.set(temp, {
                                                    "name": node.children[0].children[1].value.value,
                                                    "type": node.children[0].children[1].value.type,
                                                    "at": "",
                                                    "scopeId": ""
                                                })
                                                // store in accumulator location temp, fill in later
                                                this.generatedCode[this.opPtr++] = "8D";
                                                this.generatedCode[this.opPtr++] = temp;
                                                this.generatedCode[this.opPtr++] = "00";
                                                // increase the static id
                                                this.staticId++;
                                                this.generatedCode[this.opPtr++] = "EC";
                                                this.generatedCode[this.opPtr++] = temp;
                                                this.generatedCode[this.opPtr++] = "00";
                                            }
                                            else if(node.children[0].children[1].value.value == "false"){
                                                // compare to address of false
                                                // need to store address of false into memory
                                                // need to make entry in static table for value
                                                this.generatedCode[this.opPtr++] = "A9";
                                                this.generatedCode[this.opPtr++] = (250).toString(16).toUpperCase();
                                                var temp = "T" + this.staticId;
                                                this.staticMap.set(temp, {
                                                    "name": node.children[0].children[1].value.value,
                                                    "type": node.children[0].children[1].value.type,
                                                    "at": "",
                                                    "scopeId": ""
                                                });
                                                 // store in accumulator location temp, fill in later
                                                this.generatedCode[this.opPtr++] = "8D";
                                                this.generatedCode[this.opPtr++] = temp;
                                                this.generatedCode[this.opPtr++] = "00";
                                                // increase the static id
                                                this.staticId++;
                                                this.generatedCode[this.opPtr++] = "EC";
                                                this.generatedCode[this.opPtr++] = temp;
                                                this.generatedCode[this.opPtr++] = "00";
                                            }
                                            break;
                                        case "TId":
                                            // compare x register to address of id
                                            var variable = node.children[0].children[1].value.value;
                                            var scope = node.children[0].children[1].value.scopeId;
                                            var temp = this.findVariableInStaticMap(variable, scope);
                                            this.generatedCode[this.opPtr++] = "EC";
                                            this.generatedCode[this.opPtr++] = temp;
                                            this.generatedCode[this.opPtr++] = "00";
                                            break;
                                    }
                                    break;
                            }
                            
                            // // we need to determine what lhs is..digit, variable (load whatever stored in mem address), another boolean expr
                            // if another boolean expr, need to generate whole set of opcodes for that boolean expr, then store result of that somewhere
                            // in memory, then need to use that to compare to whatever is being compared to in boolean expr
                            // probably can just allocate a single space maybe?
                            // actually, we know this will always evaluate to a boolean val so can just return address of true/false, compare to addr of true
                            // this.determineLHSEqualTo(node);
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
                    this.traverseAST(node.children[1]);
                    // figure out how much to jump based on current opPtr and where the op code for the branch is
                    // + 2 for offset because we use 2 op codes to store branch
                    // store as hex value
                    var jumpValue = (this.opPtr - (startOfBranchPtr + 2)).toString(16).toUpperCase();
                    if(jumpValue.length < 2){
                        // pad with 0
                        jumpValue = "0" + jumpValue;
                    }
                    this.jumpMap.set(temp, {
                        "jump": jumpValue // needs to be a hex value
                    });
                    break;
            }
        }

        /**
         * Creates area after code in opcodes as static area
         * Insert break between code and static area (hence opPtr + 1) so we can differentiate it
         * This area is after code but before heap
         * Makes sure does not run into heap ptr. If does, throw error, not enough static space for variables.
         */
        private createStaticArea() {
            this.staticStartPtr = this.opPtr + 1;
            // need to figure out how many variables we need to store in the static area. for now, size of map.
            let numberOfVariables = this.staticMap.size;
            // check if runs into heap ptr
            if(this.staticStartPtr + numberOfVariables >= this.heapStartPtr){
                console.log("ERROR");
                // TODO: throw an error
                return;
            }
             // Start assigning memory addresses for variables in statics table
             var itr = this.staticMap.keys();
             for(var i=0; i<this.staticMap.size; i++){
                 var temp = itr.next();
                 this.staticMap.get(temp.value)["at"] = this.staticStartPtr.toString(16).toUpperCase(); // convert to hex string
                 this.staticStartPtr++;
             }
        }

        /**
         * Goes through the code looking for things to backpatch
         * i.e. placeholders for variables
         */
        private backPatch() {
            // When coming across placeholders for variables, lookup in map, replace with its "at"
            for(var i=0; i<this.generatedCode.length; i++){
                // found a placeholder for static variable
                if(this.generatedCode[i].charAt(0) == 'T'){
                    var temp = this.generatedCode[i];
                    // lookup in map and get mem address
                    var memAddr = this.staticMap.get(temp)["at"];
                    // replace
                    this.generatedCode[i] = memAddr;
                }
                // found a placeholder for jump
                if(this.generatedCode[i].charAt(0) == 'J'){
                    var temp = this.generatedCode[i];
                    // lookup in map and get mem address
                    var jumpAmount = this.jumpMap.get(temp)["jump"];
                    // replace
                    this.generatedCode[i] = jumpAmount;
                }
            }
        }
        
        /**
         * Given a variable and scope, looks for it in the static map
         * @param variable the variable name
         * @param scope the scope the variable is in
         */
        private findVariableInStaticMap(variable, scope) {
            var itr = this.staticMap.entries();
            for(var i=0; i<this.staticMap.size; i++){
                var staticObject = itr.next();
                if(staticObject.value[1]["name"] == variable && staticObject.value[1]["scopeId"] == scope){
                    // when finding appropriate variable, return its temp address
                    return staticObject.value[0].toString();
                }
            }
        }

        /**
         * Given a string, put it in the heap and return a pointer to beginning of string
         * TODO: make sure heap ptr doesn't collide with op ptr
         * @param string the string to store
         * @return hex string of pointer
         */
        private allocateStringInHeap(string) {
            // trim off quotes
            string = string.substring(1, string.length-1);
            // see if string already exists in heap. if so, return its address
            console.log("ALLOCATING FOR " + string);
            if(this.heapMap.has(string)){
                console.log("STRING ALREADY IN HEAP");
                return this.heapMap.get(string)["ptr"];
            }
            // first determine length of string.
            let len = string.length;
            // subtract length + 1 from heapStartPtr, +1 because strings are 0 terminated
            this.heapStartPtr = this.heapStartPtr - (len + 1);
            let strPtr = this.heapStartPtr;
            // put in characters converted to hex strings into heap
            for(var i=this.heapStartPtr; i<this.heapStartPtr + len; i++){
                this.generatedCode[i] = string.charCodeAt(i - this.heapStartPtr).toString(16);
            }
            // store in heap map
            this.heapMap.set(string, {
                "ptr": strPtr.toString(16).toUpperCase()
            });
            // return pointer to beginning of string. convert to hex string.
            return strPtr.toString(16).toUpperCase();
        }
    }
}
