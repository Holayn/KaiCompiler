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
        /* structure object to represent the loop jumps
        "temp": {
            "jump":
        }
        */
        jumpMap: Map<String, Object>;
        /* structure of map to represent the heap
        "temp": {
            "name":
            "ptr":
        }
        */
        heapMap: Map<String, Object>;
        // pointer to the start of the heap. initially at 0
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
            this.traverseAST(ast.root);
            // return generated code
            return this.generatedCode;
        }
        
        /**
         * Helper to generateCode, performs actual traversing and code generation
         * @param node AST node
         */
        public traverseAST(node) {
            console.log("Current node: ");
            console.log(node);
            console.log("Static table");
            console.log(this.staticMap);
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
                            var scope = node.children[0].value.scope;
                            var tempAddr = this.findVariableInStaticMap(variable, scope);
                            this.generatedCode[this.opPtr++] = tempAddr.substring(0,2);
                            this.generatedCode[this.opPtr++] = tempAddr.substring(2);
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
                    var temp = "T" + this.staticId + "XX";
                    this.staticMap.set(temp, {
                        "name": node.children[1].value.value,
                        "type": node.children[0].value,
                        "at": "",
                        "scope": node.children[1].value.scopeId
                    })
                    // store in accumulator location temp 0, fill in later
                    this.generatedCode[this.opPtr++] = "8D";
                    this.generatedCode[this.opPtr++] = "T" + this.staticId;
                    this.generatedCode[this.opPtr++] = "XX";
                    // increase the static id
                    this.staticId++;
                    break;
                // subtree root is assignment
                case TSC.Production.AssignStmt:
                    // find temp address
                    var variable = node.children[0].value.value;
                    var scope = node.children[0].value.scope;
                    var tempAddr = this.findVariableInStaticMap(variable, scope);
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
                    }
                    // store whatever is in assumulator to memory
                    this.generatedCode[this.opPtr++] = "8D";
                    this.generatedCode[this.opPtr++] = tempAddr.substring(0,2);
                    this.generatedCode[this.opPtr++] = tempAddr.substring(2);
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
         * @param string the string to store
         * @return hex string of pointer
         */
        private allocateStringInHeap(string) {
            // trim off quotes
            string = string.substring(1, string.length-1);
            // first determine length of string.
            let len = string.length;
            // subtract length + 1 from heapStartPtr, +1 because strings are 0 terminated
            this.heapStartPtr = this.heapStartPtr - (len + 1);
            let strPtr = this.heapStartPtr;
            // put in characters converted to hex strings into heap
            for(var i=this.heapStartPtr; i<this.heapStartPtr + len; i++){
                this.generatedCode[i] = string.charCodeAt(i - this.heapStartPtr).toString(16);
            }
            // return pointer to beginning of string. convert to hex string.
            return strPtr.toString(16).toUpperCase();
        }
    }
}
