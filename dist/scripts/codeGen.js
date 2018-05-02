/**
 * This is the code generator, which takes the AST and produces 6502a op codes for it
 */
var TSC;
(function (TSC) {
    var CodeGenerator = /** @class */ (function () {
        function CodeGenerator() {
            /* structure object to represent a table of static variables
            {
                "temp":
                "name":
                "at":
            }
            */
            this.staticTable = {};
            /* structure object to represent the loop jumps
            {
                "temp":
                "jump":
            }
            */
            this.loopJumps = {};
            /* structure object to represent the heap
            {
                "temp":
                "name":
                "ptr":
            }
            */
            this.heapTable = {};
            // pointer to the start of the heap. initially at 0
            this.heapStartPtr = 256;
            // pointer representing where we are in op code array
            this.opPtr = 0;
            this.generatedCode = [];
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
        // traverse the ast in preorder fashion.
        // based on subtree root, perform certain action
        /**
         * Traverse AST. Generate correct opcodes on every subtree root
         * @param analyzeRes the result object from the semantic analyzer, contains the AST and symbol tree
         */
        CodeGenerator.prototype.generateCode = function (analyzeRes) {
            var ast = analyzeRes.ast;
            this.traverseAST(ast.root);
            // return generated code
            return this.generatedCode;
        };
        /**
         * Helper to generateCode, performs actual traversing and code generation
         * @param node AST node
         */
        CodeGenerator.prototype.traverseAST = function (node) {
            // Determine what kind of production the node is
            switch (node.value) {
                // subtree root is block
                case TSC.Production.Block:
                    // traverse block's children
                    for (var i = 0; i < node.children.length; i++) {
                        this.traverseAST(node.children[i]);
                    }
                    break;
                // subtree root is a print statement
                case TSC.Production.PrintStmt:
                    // determine type of child
                    switch (node.children[0].value.type) {
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
                            var strPtr = this.allocateStringInHeap(node.children[0].value.value);
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
                            if (node.children[0].value.value == "true") {
                                // load into y register address of true in heap
                                this.generatedCode[this.opPtr++] = (245).toString(16).toUpperCase();
                            }
                            else if (node.children[0].value.value == "false") {
                                // load into y register address of false in heap
                                this.generatedCode[this.opPtr++] = (250).toString(16).toUpperCase();
                            }
                            // load x regis with 2
                            this.generatedCode[this.opPtr++] = "A2";
                            this.generatedCode[this.opPtr++] = "02";
                            // sys call
                            this.generatedCode[this.opPtr++] = "FF";
                            break;
                    }
                    console.log(node);
                    break;
            }
        };
        /**
         * Given a string, put it in the heap and return a pointer to beginning of string
         * @param string the string to store
         * @return hex string of pointer
         */
        CodeGenerator.prototype.allocateStringInHeap = function (string) {
            // trim off quotes
            string = string.substring(1, string.length - 1);
            // first determine length of string.
            var len = string.length;
            // subtract length + 1 from heapStartPtr, +1 because strings are 0 terminated
            this.heapStartPtr = this.heapStartPtr - (len + 1);
            var strPtr = this.heapStartPtr;
            // put in characters converted to hex strings into heap
            for (var i = this.heapStartPtr; i < this.heapStartPtr + len; i++) {
                this.generatedCode[i] = string.charCodeAt(i - this.heapStartPtr).toString(16);
            }
            // return pointer to beginning of string. convert to hex string.
            return strPtr.toString(16).toUpperCase();
        };
        return CodeGenerator;
    }());
    TSC.CodeGenerator = CodeGenerator;
})(TSC || (TSC = {}));
