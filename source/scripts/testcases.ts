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
                case "Semantic Warnings":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* has unused and undeclared variables */
{
    int a
    int b
    a = 3
    b = 4
    {
        string a
        a = "hey"
        print(a)
        print(b)
    }
    print(b)
    string s
    {
        boolean b
        b = false
    }
    string r
    r = "hey"
    int d
    print(d)
    d = 3
}$`;
                    break;
                case "Undeclared Variable":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* Variables being used but not declared first */
{
    int a
    b = 4
}$`;
                    break;
                case "Duplicate Variable":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* Variables being declared again in same scope*/
{
    int a
    {
        string a
        a = "this is fine"
    }
    boolean a /* this is not fine" */
}$`;
                break;
            case "Type Mismatch":
                (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* A variable's type is not compatible with its assignment*/
{
    string s
    s = 4 + 3
}$`;
                break;
            case "Incorrect Type Comparisons":
                (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* Types do not match in Boolean comparison*/
{
    if(4 == false){
        print("this no good")
    }
    if(4 == "hey"){
        print("int to string")
    }
    if(false != "hey"){
        print("bool to string")
    }
    if(4 != 3){
        print("int to int")
    }
}$`;
                break;
            case "Incorrect Integer Expression":
                (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* A digit is added to something other than a digit */
{
int a
a = 4 + false
}$`;
                break;
            case "Tien Test":
                (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* Thx Tien. */       
{
    int a
    a = 0
    string z
    z = "bond"
    while (a != 9) {
        if (a != 5) {
            print("bond")
        }
        {
            a = 1 + a
            string b
            b = "james bond"
            print(b)
        }
    }
    {/*Holy Hell This is Disgusting*/}
    boolean c
    c = true
    boolean d
    d = (true == (true == false))
    d = (a == b)
    d = (1 == a)
    d = (1 != 1)
    d = ("string" == 1)
    d = (a != "string")
    d = ("string" != "string")
    if (d == true) {
        int c
        c = 1 + d
        if (c == 1) {
            print("ugh")
        }
    }
    while ("string" == a) {
        while (1 == true) {
            a = 1 + "string"
        }
    }
}$`;
                break;
            case "Tien Boolean Hell":
                (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* Thanks Tien. Assuming you get past Boolean Hell
- there is a boolean being compared to
- a string which will cause a type error */
{
    int a
    a = 4
    boolean b
    b = true
    boolean c
    string d
    d = "there is no spoon"
    c = (d != "there is a spoon")
    if(c == (false != (b == (true == (a == 3+1))))) {
        print((b != d))
    }
}$`;
                break;
            }
            (<HTMLInputElement>document.getElementById("taOutput")).value = "Inserted Program: " + testcase.innerHTML;
        }
    }
}
    