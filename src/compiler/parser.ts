//make tokenlist into ast

import { Token } from "./lexer"
import { TokenType } from "./lexer";

import { InfixToPostfix } from "../utils/fixTransoformations";




//probably should be interface
interface Expr{}
interface Statement{
    discriminator:string | "RawStatement"
}

type FunctionDecl={
    discriminator:"FunctionDecl"
    name:string
    body:Statement[]
    parameterC:number
}


function makeFuncDecl():FunctionDecl{
    return{
        discriminator:"FunctionDecl",
        name:"",
        body:[],
        parameterC:0,
    }
}


type FunctionCall={
    discriminator:"FunctionCall"
    name:string,
    arguments:Expr[],
}


function makeFuncCall():FunctionCall{
    return{
        discriminator:"FunctionCall",
        name:"",
        arguments:[],
    }
}



type VariableRefrence={
    name:string,
}
type VariableAssigment={
    discriminator:"VariableAssigment"
    name:string,
    val:Expr
}


function makeVariableAssigment():VariableAssigment{
    return{
        discriminator:"VariableAssigment",
        name:"",
        val:{}
    }
}



type ILiteralNode={
    val:number
}

type OpNode={
    l:Expr,
    r:Expr,
    opp:string
}




class Parser{
    private position=0;
    private tokens:Token[]=[];

    //takes tokenlist outs ast
    public parseTokens(tokens:Token[]):Statement[]{
        this.tokens=tokens
        let stats :Statement[]=[]
         
        while (this.position<this.tokens.length){
            let stat =this.parseStatement()
            if (stat==undefined){
                break
            }
            stats.push(stat)
            
            this.position++

        }

        return stats

    }

    private parseStatement():Statement | undefined{
       //could be call or decl
        //fmt.Println("parsing statement from token " , self.tokens[self.currentToken], "at ", self.currentToken)
        if (this.tokens[this.position].tokentype==TokenType.Identifier && this.tokens[this.position+1].tokentype==TokenType.Lparen ){ 
            let statement=this.parseFunction()
            return statement
        }

        //parse variable assigment
        if (this.tokens[this.position].tokentype==TokenType.Identifier && this.tokens[this.position+1].tokentype==TokenType.Equals) { 
            let statement=this.parseVariableAssigment()
            return statement

        }
        
        if (this.tokens[this.position].tokentype==TokenType.EOF){
            return undefined
        }

        console.log("no statement parsed from : ", this.tokens[this.position] ,"pos :", this.position )
    }

    private parseFunction():Statement{
        // go untill we hit the ) then if next is { then its a declt

        let a= this.position
        while (this.tokens[a].tokentype!=TokenType.Rparen){
            a++
        }

        if (this.tokens[a+1].tokentype==TokenType.Lsquerly){
            //parse decl
            return this.parseFnDecl()
        }else{
            //parse call
            return this.parseFnCall()
        }
        


    }


    private parseFnDecl(){
        let decl:FunctionDecl=makeFuncDecl()
            //{ name: this.tokens[this.position++].val, body:[], parameterC:0, }
        decl.name=this.tokens[this.position++].val
        

        while( this.tokens[this.position].tokentype!=TokenType.Rparen){
            //paramcount
            //loop through params untill hit )
            if(this.tokens[this.position].tokentype!=TokenType.Comma){
                decl.parameterC++
            }
            this.position++
        }

        this.position++ //skip)
        this.position++ //skip{

        //this does not stop the thing something jups over it
        while( this.tokens[this.position].tokentype!=TokenType.Rsquerly){
            let stat=this.parseStatement()
            if (stat!=undefined){
                decl.body.push(stat)
            }

        }

          //console.log("fn decl name: ",decl.name,". params: ", decl.params, ". body: ",decl.body )

        return decl

    }

    private parseFnCall(){
        let call: FunctionCall= makeFuncCall()
            //{ name:this.tokens[this.position].val, arguments:[] }
        call.name=this.tokens[this.position].val

        this.position+=2

        call.arguments=this.parseFuncParameters()
        
        this.position++
        return call

    }

    private parseFuncParameters(){

        let expressions:Expr[] = []
    
        //buffer for expressions that we have yet to evaluate 
        //should we instead of []token do []Expr and we collapse this into a op node when we evaluate it


        //TODO this needs to change if we want funcs in expressions
        //TODO variables

        let toEvalueate: Token[]=[]
        while( this.tokens[this.position].tokentype!=TokenType.Rparen){
            //needs to go through al tokens untill )
            if (this.tokens[this.position].tokentype!=TokenType.Comma ){
                toEvalueate.push( this.tokens[this.position++])
            }else{
                if (toEvalueate.length>0){
                    
                    let evalexpr=this.EvaluateExpression(toEvalueate)
                    if (evalexpr!=undefined){
                        expressions.push(evalexpr)
                        toEvalueate.length=0
                    }
                }
                this.position++
            }

        }


        if (toEvalueate.length>0){
            let evalexpr=this.EvaluateExpression(toEvalueate)
            if (evalexpr!=undefined){
                expressions.push(evalexpr)
                toEvalueate.length=0
            }
        }

        
        //console.log("expressions of parse func parameters")
        //console.log(expressions)
        return expressions

    }


    private parseVariableAssigment():Statement{
        //a value or operation expression
        let vari:VariableAssigment = makeVariableAssigment()
        vari.name=this.tokens[this.position].val
            //{ name: this.tokens[this.position].val, val:{} } 

        this.position++//jump over var name
        this.position++ //jump over =

        //is it a function 
        //is it a literal
        //is it an operand expression
        // do i need to add \n to the list of things that we could be looking at so we can determine when do we end var assigmen
        //or do we just do myvar=2*3+123*123*3/1;
        //i think we could do that



        let toEvalueate :Token[]=[]

        while( this.tokens[this.position].tokentype!=TokenType.Semicolon){
            toEvalueate.push( this.tokens[this.position++])
        }

        this.position++ //skip ; //for some reason this was not needed in go
        let a =this.EvaluateExpression(toEvalueate)
        if (a!=undefined){
            vari.val=a
        }


        return vari

    }

    private EvaluateExpression( toEvalueate:Token[]):Expr|undefined{
        //fmt.Println("evaluationg")
        //fmt.Println(toEvalueate)

        if(toEvalueate.length==0){
            return undefined
        }


        if(toEvalueate.length==1){
            let tok=toEvalueate[0]

            switch (tok.tokentype){
            case TokenType.NumLiteral:
                let val=parseInt(tok.val)
                return {val} as ILiteralNode

                /*
            case StringLiteral:
                return Stringliteral{tok.tokenVal}
                    * */

            case TokenType.Identifier:
                return {name:tok.val} as VariableRefrence
            }
        }

        let postfix:Token[]=InfixToPostfix(toEvalueate)

        //fmt.Println("post fix notation of eval is")
        //fmt.Println(postfix)
        //var exprs []Token
        var expressions :Expr[]=[]

        for (let i=0;i<postfix.length;i++){
            if (postfix[i].tokentype!=TokenType.Operator){
                //switch and match what the token is?
                //right now all happens to be ints TODO change
                let val=parseInt(  postfix[i].val)
                expressions.push( {val} as ILiteralNode) //iliteral node
            }else{
                //fmt.Println(expressions)
                let l=expressions.pop()
                let r=expressions.pop()
                expressions.push(  { l,  r, opp: postfix[i].val} as OpNode) //opp node
            }
        }

        
        //fmt.Println("this is the expression tree")
        //fmt.Println(expressions)

        return expressions[0]

    }


}

export {Parser, Statement, Expr, FunctionCall,FunctionDecl,VariableRefrence,VariableAssigment, ILiteralNode}


