/**
 * Class and Enumeration for Warning that holds information
 * about different types of warnings that may be generated when
 * compiling source code.
 */
module TSC {
    export enum WarningType {
        MissingEOP = "MissingEOP",
        UninitializedVariable = "UninitializedVariable",
        UnusedVariable = "UnusedVariable",
        UsedUninitialized = "UsedUninitialized"
    }
    export class Warning {
        type: WarningType;
        value: String;
        lineNumber: number;
        colNumber: number;

        constructor(tokenType: WarningType, value: String, lineNumber: number, colNumber: number) {
            this.type = tokenType;
            this.value = value;
            this.lineNumber = lineNumber;
            this.colNumber = colNumber;
        }
    }

    export class ScopeWarning extends Warning {
        scopeLine: number;
        scopeCol: number;
        scopeId: number;
        constructor(tokenType: WarningType, value: String, lineNumber: number, colNumber: number, node: ScopeNode){
            super(tokenType, value, lineNumber, colNumber);
            this.scopeLine = node.lineNumber;
            this.scopeCol = node.colNumber;
            this.scopeId = node.id;
        }
    }
}