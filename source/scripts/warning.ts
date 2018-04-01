/**
 * Class and Enumeration for Warning that holds information
 * about different types of warnings that may be generated when
 * compiling source code.
 */
module TSC {
    export enum WarningType {
        MissingEOP = "MissingEOP",
        UninitializedVariable = "UninitializedVariable",
        UnusedVariable = "UnusedVariable"
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
}