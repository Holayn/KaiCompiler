/* --------
   testcases.ts

   Loads testcases into editor
   -------- */
var TSC;
(function (TSC) {
    var Testcases = /** @class */ (function () {
        function Testcases() {
        }
        Testcases.load = function (testcase) {
            switch (testcase.innerHTML) {
                case "Simple 1":
                    document.getElementById("taSourceCode").value = "/* This is a simple program with no operations */\n{}$";
                    break;
                case "Simple 2":
                    document.getElementById("taSourceCode").value = "/* Test case for print statement */\n{\n    print(\"i love compilers\")\n}$";
                    break;
                case "Regular":
                    document.getElementById("taSourceCode").value = "/* Test case for a 'regular' program*/\n{\n    int a\n    a = 1\n    print(a)\n    boolean b\n    b = true\n    print(b)\n\n    {\n        int a\n        a = 2\n        print(a)\n    }\n\n    {\n        int a\n        a = 3\n        print(a)\n    }\n\n    string s\n    s = \"stra\"\n    print(s)\n\n    s = \"strb\"\n    print(s)\n\n    if (a != 5) {\n        print(\"true\")\n    }\n\n    if (a == 5) {\n        print(\"false\")\n    }\n}$";
                    break;
                case "Multiple":
                    document.getElementById("taSourceCode").value = "/* Test case for multiple programs */\n{\n    print(\"i love compilers\")\n    int a\n    a = 2\n    string s\n    s = \"ha\"\n    \"\n}$\n\n{\n    int b\n    b = 4\n    string s\n    s = \"hey\"\n}$";
                    break;
                case "Crazy One Liner (Lex Pass)":
                    document.getElementById("taSourceCode").value = "/* Test case for crazy one liner */\n+${hellotruefalsetrueprinta=3b=0print(\"false true\")whi33leiftruefalsestring!= stringintbooleanaa truewhileif{hi+++==!==}}/*aaahaha*/hahahahaha/*awao*/$";
                    break;
                case "Missing EOP":
                    document.getElementById("taSourceCode").value = "/* Missing EOP */\n{\n    int b\n    b = 4\n    string s\n    s = \"hey\"\n}";
                    break;
                case "Alan":
                    document.getElementById("taSourceCode").value = "/*  Provided By \n- Compiler Tyrant\n- Alan G Labouseur\n*/\n{}$\t\n{{{{{{}}}}}}$\t\n{{{{{{}}}}}}}$\t\n{int\t@}$";
                    break;
                case "Invalid String 1":
                    document.getElementById("taSourceCode").value = "/* Test case for placing $ in quotes */\n{\n    print(\"i love com$pilers\")\n    int a\n    a = 2\n    string s\n    s = \"ha\"\n    \"\n}$";
                    break;
                case "Invalid String 2":
                    document.getElementById("taSourceCode").value = "/* Test case for invalid characters in string */\n{\n    string s\n    s = \"cookies & cream\"\n}$";
                    break;
                case "Invalid String 3":
                    document.getElementById("taSourceCode").value = "/* Test case for placing \\n in quotes */\n{\n    \"hey\n    there\"\n}$";
                    break;
                case "Invalid Print":
                    document.getElementById("taSourceCode").value = "/* Test case for invalid print */\n{\n    print(\"my name is 11\")\n}$";
                    break;
            }
            document.getElementById("taOutput").value = "Inserted Program: " + testcase.innerHTML;
        };
        return Testcases;
    }());
    TSC.Testcases = Testcases;
})(TSC || (TSC = {}));
