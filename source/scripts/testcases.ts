/* --------  
   testcases.ts

   Loads testcases into editor
   -------- */

   module TSC {
    
        export class Testcases {
    
        public static load(testcase: any){
            switch(testcase.innerHTML){
                case "Simple 1":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* This is a simple program with no operations */\n{}$`;
                    break;
                case "Simple 2":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* Test case for print statement */
{
    print("i love compilers")
}$`;
                    break;
                case "Regular":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* Test case for a 'regular' program*/
{
    int a
    a = 1
    print(a)
    boolean b
    b = true
    print(b)

    {
        int a
        a = 2
        print(a)
    }

    {
        int a
        a = 3
        print(a)
    }

    string s
    s = "stra"
    print(s)

    s = "strb"
    print(s)

    if (a != 5) {
        print("true")
    }

    if (a == 5) {
        print("false")
    }
}$`;
                    break;
                case "Multiple":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* Test case for multiple programs */
{
    print("i love compilers")
    int a
    a = 2
    string s
    s = "ha"
}$

{
    int b
    b = 4
    string s
    s = "hey"
}$`;
                    break;
                case "All Productions thx Tien":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* Test case for all productions - thx Tien */
{
    /* Int Declaration */
    int a
    int b
    string s
    boolean z
    
    z = true
    s = "kai sucks"

    a = 0
    b = 0

    /* While Loop */
    while (a != 3) {
        print(a)
        while (b != 3) {
                print(b)
                b = 1 + b
                if (b == 2) {
                    /* Print Statement */
                    print("kai sucks"/* This will do nothing */)
                }
        }

        b = 0
        a = 1 + a
    }
}$`;
                    break;
                case "Crazy One Liner (Lex Pass)":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* Test case for crazy one liner */\n+\${hellotruefalse!======trueprinta=3b=0print(\"false true\")whi33leiftruefalsestring!= stringintbooleanaa truewhileif{hi+++==!==}}/*aaahaha*/hahahahaha/*awao*/$`;
                    break;
                case "Crazy One Liner Pt. 2 Thx Tien":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/*Test case for all productions - thx Tien*/{/*IntDeclaration*/intaintbstringsbooleanzz=trues="kai sucks"a=0b=0/*WhileLoop*/while(a!=3){print(a)while(b!=3){print(b)b=1+bif(b==2){/*PrintStatement*/print("kai sucks"/*Thiswilldonothing*/)}}b=0a=1+a}}$`;
                    break;
                case "WhileStatement":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* Test case for WhileStatement */
{
    string s
    int a
    a = 1
    {
        s = "hey there sexy"
        int a
        a = 2
        print(a)
    }
    {
        while (a != 5) {
            a = 1 + a
            print(a)
        }
        print(3 + a)
        print(s)
    }
} $`;
                    break;
                    case "IfStatement":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* Test case for IfStatement */
{
    int a
    a = 1
    if(1 == 1){
        print("nums")
    }
    if(a == a){
        print("ids")
    }
    if("hey" == "hey"){
        print("strings")
    }
    if(true == (a == a)){
        print("booleans")
    }
} $`;
                    break;
                case "Missing EOP":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* Missing EOP */
{
    int b
    b = 4
    string s
    s = "hey"
}`;
                    break;
                case "Alan":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/*  Provided By 
- Compiler Tyrant
- Alan G Labouseur
*/
{}$	
{{{{{{}}}}}}$	
{{{{{{}}}}}}}$	
{int	@}$`;
                    break;
                case "Invalid String 1":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* Test case for placing $ in quotes */
{
    print("i love com$pilers")
    int a
    a = 2
    string s
    s = "ha"
    "
}$`;
                    break;
                case "Invalid String 2":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* Test case for invalid characters in string */
{
    string s
    s = "cookies & cream"
}$`;
                    break;
                case "Invalid String 3":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* Test case for placing \\n in quotes */
{
    "hey
    there"
}$`;
                    break;
                case "Invalid String 4":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value =`/* Test case for missing ending quote */
int a
a = 4
string s
s = "hey there`;
                    break;
                case "Invalid Print":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* Test case for invalid print */
{
    print("my name is 11")
}$`;
                    break;
                case "Missing End Comment Brace":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* Test case for missing end comment brace */
{
    print("my name is eleven")
    /* hey i love compilers
}$`;
                    break;
                case "Invalid StatementList":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* Test case for invalid StatementList */
{
    4 + 2
}$`;
                    break;
                case "Invalid Expr":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* Test case for invalid Expr */
{
    int a
    a = a + 2
}$`;
                    break;
                case "Invalid VarDecl":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* Test case for invalid VarDecl */
{
    int 4
}$`;
                    break;
                case "Invalid Print Pt. 2":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* Test case for invalid Print pt. 2 */
{
    print("$)
}$`;
                    break;
                case "Incomplete BooleanExpr":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* Test case for incomplete BooleanExpr */
{
    s = "strb"
    print(s)
    
    if (a != ) {
        print("true")
    }
}$`;
                    break;
                case "Incomplete IntExpr":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* Test case for incomplete IntExpr */
{
    int a
    a = 1 +
    print(a)
}$`;
                    break;
            }
            (<HTMLInputElement>document.getElementById("taOutput")).value = "Inserted Program: " + testcase.innerHTML;
        }
    }
}
    