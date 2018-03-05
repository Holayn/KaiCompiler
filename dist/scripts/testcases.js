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
                    document.getElementById("taSourceCode").value = "/* Test case for multiple programs */\n{\n    print(\"i love compilers\")\n    int a\n    a = 2\n    string s\n    s = \"ha\"\n}$\n\n{\n    int b\n    b = 4\n    string s\n    s = \"hey\"\n}$";
                    break;
                case "All Productions thx Tien":
                    document.getElementById("taSourceCode").value = "/* Test case for all productions - thx Tien */\n{\n    /* Int Declaration */\n    int a\n    int b\n    string s\n    boolean z\n    \n    z = true\n    s = \"kai sucks\"\n\n    a = 0\n    b = 0\n\n    /* While Loop */\n    while (a != 3) {\n        print(a)\n        while (b != 3) {\n                print(b)\n                b = 1 + b\n                if (b == 2) {\n                    /* Print Statement */\n                    print(\"kai sucks\"/* This will do nothing */)\n                }\n        }\n\n        b = 0\n        a = 1 + a\n    }\n}$";
                case "Crazy One Liner (Lex Pass)":
                    document.getElementById("taSourceCode").value = "/* Test case for crazy one liner */\n+${hellotruefalse!======trueprinta=3b=0print(\"false true\")whi33leiftruefalsestring!= stringintbooleanaa truewhileif{hi+++==!==}}/*aaahaha*/hahahahaha/*awao*/$";
                    break;
                case "Crazy One Liner Pt. 2 Thx Tien":
                    document.getElementById("taSourceCode").value = "/*Test case for all productions - thx Tien*/{/*IntDeclaration*/intaintbstringsbooleanzz=trues=\"kai sucks\"a=0b=0/*WhileLoop*/while(a!=3){print(a)while(b!=3){print(b)b=1+bif(b==2){/*PrintStatement*/print(\"kai sucks\"/*Thiswilldonothing*/)}}b=0a=1+a}}$";
                    break;
                case "WhileStatement":
                    document.getElementById("taSourceCode").value = "/* Test case for WhileStatement */\n{\n    string s\n    int a\n    a = 1\n    {\n        s = \"hey there sexy\"\n        int a\n        a = 2\n        print(a)\n    }\n    {\n        while (a != 5) {\n            a = 1 + a\n            print(a)\n        }\n        print(3 + a)\n        print(s)\n    }\n} $";
                    break;
                case "IfStatement":
                    document.getElementById("taSourceCode").value = "/* Test case for IfStatement */\n{\n    int a\n    a = 1\n    if(1 == 1){\n        print(\"nums\")\n    }\n    if(a == a){\n        print(\"ids\")\n    }\n    if(\"hey\" == \"hey\"){\n        print(\"strings\")\n    }\n    if(true == (a == a)){\n        print(\"booleans\")\n    }\n} $";
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
                case "Invalid String 4":
                    document.getElementById("taSourceCode").value = "/* Test case for missing ending quote */\nint a\na = 4\nstring s\ns = \"hey there";
                    break;
                case "Invalid Print":
                    document.getElementById("taSourceCode").value = "/* Test case for invalid print */\n{\n    print(\"my name is 11\")\n}$";
                    break;
                case "Missing End Comment Brace":
                    document.getElementById("taSourceCode").value = "/* Test case for missing end comment brace */\n{\n    print(\"my name is eleven\")\n    /* hey i love compilers\n}$";
                    break;
                case "Invalid StatementList":
                    document.getElementById("taSourceCode").value = "/* Test case for invalid StatementList */\n{\n    4 + 2\n}$";
                    break;
                case "Invalid Expr":
                    document.getElementById("taSourceCode").value = "/* Test case for invalid Expr */\n{\n    int a\n    a = a + 2\n}$";
                    break;
                case "Invalid VarDecl":
                    document.getElementById("taSourceCode").value = "/* Test case for invalid VarDecl */\n{\n    int 4\n}$";
                    break;
                case "Invalid Print":
                    document.getElementById("taSourceCode").value = "/* Test case for invalid Print */\n{\n    print($)\n}$";
                    break;
                case "Incomplete BooleanExpr":
                    document.getElementById("taSourceCode").value = "/* Test case for incomplete BooleanExpr */\n{\n    s = \"strb\"\n    print(s)\n    \n    if (a != ) {\n        print(\"true\")\n    }\n}$";
                    break;
                case "Incomplete IntExpr":
                    document.getElementById("taSourceCode").value = "/* Test case for incomplete IntExpr */\n{\n    int a\n    a = 1 +\n    print(a)\n}$";
                    break;
            }
            document.getElementById("taOutput").value = "Inserted Program: " + testcase.innerHTML;
        };
        return Testcases;
    }());
    TSC.Testcases = Testcases;
})(TSC || (TSC = {}));
