//make tokenlist into ast

import { Token } from "./lexer"
import { TokenType } from "./lexer";

import { getOperatorPrecidence, InfixToPostfix } from "../utils/fixTransoformations";
import {exit} from "process";
import { prettyPrintAst } from "../utils/Prettyprint";




//probably should be interface
interface Expr{
    eDiscriminator:string | "RAW EXPRESSION"
}

function makeExpr(){
    return{
        eDiscriminator:"RAW EXPRESSION"
    }
}


function intoExpr(e:Expr|undefined):Expr{
    if (e?.eDiscriminator== undefined){
        let a={
            ...e,
            eDiscriminator:"RAW EXPRESSION"
        }
        return a
    }
    return e
}


interface Statement{
    discriminator:string | "RawStatement"
}

type FunctionDecl={
    discriminator:"FunctionDecl"
    name:string
    body:Statement[]
    parameterC:number
    parameterNames:string[]
}


function makeFuncDecl():FunctionDecl{
    return{
        discriminator:"FunctionDecl",
        name:"",
        body:[],
        parameterC:0,
        parameterNames:[]
    }
}


type FunctionCall={
    discriminator:"FunctionCall"
    eDiscriminator:"FunctionCall"
    name:string,
    arguments:Expr[],
}


function makeFuncCall():FunctionCall{
    return{
        discriminator:"FunctionCall",
        eDiscriminator:"FunctionCall",
        name:"",
        arguments:[],
    }
}



type VariableRefrence={
    eDiscriminator:"VariableRefrence"
    name:string,
}

type ReturnNode={
    discriminator:"ReturnStatement"
    rets:Expr
}
function makeReturnNode(e:Expr):ReturnNode{
    return{
        discriminator:"ReturnStatement",
        rets:e
    }
}

function makeVariableRefrence(name:string):VariableRefrence{
    return{
        eDiscriminator:"VariableRefrence",
        name:name,
    }
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
        val: makeExpr(),
    }
}



type ILiteralNode={
    eDiscriminator:"NumLiteral"
    val:number
}

function makeILiteralNode(val:number):ILiteralNode{
    return{
        eDiscriminator:"NumLiteral",
        val:val
    }
}

type OpNode={
    eDiscriminator:"Operation"
    l:Expr,
    r:Expr,
    opp:string
}

function makeOpnode():OpNode{
    return{
        eDiscriminator:"Operation",
        l:makeExpr(),
        r:makeExpr(),
        opp:""

    }

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
            
           // this.position++//this?? this skips it

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

        if (this.tokens[this.position].tokentype==TokenType.KWReturn){
            //handle returning
            //TODO make a function for handling singular expression
            //let e =    //get expression
            this.position+=2 //ret and (
            //let e = this.parseFuncParameters()[0]
            let e = this.parsefunctionparameters()[0]
            //console.log(e)
            this.position++ //)
            return makeReturnNode(e)
        }

        console.log("prev tok", this.tokens[this.position-1] ,"pos :", this.position-1 )
        console.log("no statement parsed from : ", this.tokens[this.position] ,"pos :", this.position )
        console.log("next tok", this.tokens[this.position+1] ,"pos :", this.position+1 )
        console.log()
        return undefined
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
        

        this.position++ //jump (
        while( this.tokens[this.position].tokentype!=TokenType.Rparen){
            //paramcount
            //loop through params untill hit )
            if(this.tokens[this.position].tokentype!=TokenType.Comma){
                decl.parameterC++
                decl.parameterNames.push(this.tokens[this.position].val)
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
        this.position++ //skip }

        return decl

    }

    private parseFnCall(){
        let call: FunctionCall= makeFuncCall()
            //{ name:this.tokens[this.position].val, arguments:[] }
        call.name=this.tokens[this.position].val

        this.position+=2 //id and (

       // call.arguments=this.parseFuncParameters()
        call.arguments=this.parsefunctionparameters()
        
        this.position++ //skip )
        return call

    }


    // this would only parse literals, variables and function calls
    private parseSingularExpression():Expr{

        if(this.tokens[this.position].tokentype==TokenType.NumLiteral){
            return makeILiteralNode( parseInt(this.tokens[this.position++].val) )
        }
        if(this.tokens[this.position].tokentype==TokenType.Identifier){

            if(this.tokens[this.position+1].tokentype==TokenType.Lparen){
                let call=this.parseFnCall()
                //this.position--//hack since parse fn call skips 3 when we need to sskip 2 
                return call
            }
            return makeVariableRefrence(this.tokens[this.position++].val)
        }



        console.log("no expression " , this.tokens[this.position])
        exit()
    }

    // returns list of expressions
    // opps are allready in binary tree form
    //TODO over massive funcdtion should a be split 
    private parsefunctionparameters(){


        let expressions:Expr[] = []
        let post:Expr[] = []
        //list of operators are needed for algo
        let opps:Token[]=[]

        // we need to do the InfixToPostfix conversion in this functiopn
        // when we run into a token that is an opp we do the thing
        // when we run into a token that is not an opp we make an expression from it and do somethign with it

        while( this.tokens[this.position].tokentype!=TokenType.Rparen){
            let tok=this.tokens[this.position]
            //needs to go through al tokens untill )
            if (this.tokens[this.position].tokentype!=TokenType.Comma ){
                if (this.tokens[this.position].tokentype!=TokenType.Operator){
                    let ex = this.parseSingularExpression()
                    post.push(ex)
                    //make token into expression
                    //put it on expressions
                }else{
                    this.position++
                    while(opps.length>0 && getOperatorPrecidence(tok.val) <= getOperatorPrecidence(opps[opps.length-1].val)){
                        //pop stack put it on the post expr list
                        let a =opps.pop()
                        if (a!= undefined){
                            let op=makeOpnode()
                            op.opp=a.val
                            //make post list into bin expr
                            let l=post.pop()
                            let r=post.pop()
                            if (l==undefined || r==undefined){
                                console.log("operrands undefined")
                                exit()
                            }
                            op.l=l
                            op.r=r
                            
                            //console.log("op ", op)

                            post.push(op)
                        }

                    }
                    opps.push(tok)
                    ///is opp
                    // do opp logic from the infix postfix transformation

                }
                

            }else{
                this.position++
                //we hit ',' so we need to end the expression we made
                this.endExpression(opps, post, expressions)

            }

            //skip the token we were looking at
        }

        // end the expression in post 
        this.endExpression(opps, post, expressions)


        //console.log("expressions of parse func parameters")
        //console.log(expressions)

        //console.log("returns parameters at:",this.tokens[this.position], this.position)
        return expressions
    }



    //used by parsefunctionparameters
    private endExpression(opps:Token[],post:Expr[],expressions:Expr[]){
        //the expression we have is complete we need to do something with it now
        //console.log("opps buffer ",opps)

        //the stack probably has something and we should clean it 
        while( opps.length>0){
            let a=opps.pop()
            if (a!= undefined){
                let op=makeOpnode()
                op.opp=a.val
                //make post list into bin expr
                let l=post.pop()
                let r=post.pop()
                if (l==undefined || r==undefined){
                    console.log("operrands undefined")
                    exit()
                }
                op.l=l
                op.r=r

                post.push(op)
            }
        }




        //put postfix should be size 1 and we should push it onto expressionss
        //console.log("post size", post.length)
        let e=post.pop()
        //console.log("e of opps", e)
        if (e!=undefined){
            expressions.push(e)
        }


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

        // TODO !!??!!??!!??!!??!!??!!??!!??!! WTF IS THIS??? HOW DOES THIS WORK, WE DONT HAVE SEMICOLONS
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

    //takes list of tokens [1+2] and makes it into an expression
    private EvaluateExpression( toEvalueate:Token[]):Expr|undefined{

        if(toEvalueate.length==0){
            return undefined
        }


        if(toEvalueate.length==1){
            let tok=toEvalueate[0]

            switch (tok.tokentype){
            case TokenType.NumLiteral:
                let val=parseInt(tok.val)
                return makeILiteralNode(val)

                /*
            case StringLiteral:
                return Stringliteral{tok.tokenVal}
                    * */

            case TokenType.Identifier:
                return makeVariableRefrence(tok.val)
            }
        }
        
        //console.log("evalling")
        //console.log(toEvalueate)

        let postfix:Token[]=InfixToPostfix(toEvalueate)

        //console.log("post")
        //console.log(postfix)



        //var exprs []Token
        var expressions :Expr[]=[]

        for (let i=0;i<postfix.length;i++){
            if (postfix[i].tokentype!=TokenType.Operator){
                //switch and match what the token is?
                switch (postfix[i].tokentype){
                    case TokenType.NumLiteral:
                        let val=parseInt(  postfix[i].val)
                        expressions.push( makeILiteralNode(val)) //iliteral node
                        break
                    case TokenType.Identifier:
                        expressions.push(makeVariableRefrence(postfix[i].val))
                        break

                    default: 
                        console.log("EXPRESSION IS BAD", postfix[0])
                }


            }else{
                //fmt.Println(expressions)
                let l=expressions.pop()
                let r=expressions.pop()
                let opp=makeOpnode()
                opp.l=intoExpr(l)
                opp.r=intoExpr(r)
                opp.opp=postfix[i].val
                expressions.push(opp) //opp node
            }
        }

        
        //fmt.Println("this is the expression tree")
        //fmt.Println(expressions)

        return expressions[0]

    }


}

export {Parser, Statement, Expr, FunctionCall,FunctionDecl,VariableRefrence,VariableAssigment, ILiteralNode,OpNode,ReturnNode}


