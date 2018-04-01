module TSC {
    // these make up the value of the key:value pair in the table in the ScopeNode
    export class ScopeObject {
        value: any;
        initialized: boolean; // flag for if id is initialized
        used: boolean; // flag for if used
        constructor(){
            this.initialized = false;
        }
    }
    // makes up the scope tree
    export class ScopeNode {
        table: Object;
        lineNumber: number;
        colNumber: number;
        id: number; // id of the scope
        constructor(){
            this.table = {};
        }
    }
}