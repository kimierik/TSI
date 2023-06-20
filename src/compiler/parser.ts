//make tokenlist into ast

import { Token } from "./lexer"
import { TokenType } from "./lexer";

import { getOperatorPrecidence } from "../utils/fixTransoformations";
import {exit} from "process";

import {
    Expr, makeExpr ,Statement, 
    FunctionDecl, makeFuncDecl,
    FunctionCall, makeFuncCall,
    VariableRefrence, makeVariableRefrence,
    VariableAssigment, makeVariableAssigment, 
    VariableDecl, makeVariableDecl,
    OpNode, makeOpnode, 
    ILiteralNode, makeILiteralNode,
    IfNode, makeIfNode,
    ReturnNode, makeReturnNode,
} from "./ASTNodes"



class Parser{
    private position=0; //current token position

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

        if (this.tokens[this.position].tokentype==TokenType.Identifier && this.tokens[this.position+1].tokentype==TokenType.Lparen ){ 
            let statement=this.parseFunction()
            return statement
        }

        //parse variable assigment
        if (this.tokens[this.position].tokentype==TokenType.Identifier && this.tokens[this.position+1].tokentype==TokenType.Equals) { 
            let statement=this.parseVariableAssigment()
            return statement
        }

        
        //eof return undefined
        if (this.tokens[this.position].tokentype==TokenType.EOF){
            return undefined
        }


        if (this.tokens[this.position].tokentype==TokenType.KWReturn){
            this.position+=2 //ret and (
            let e = this.parsefunctionparameters()[0]
            this.position++ //)
            return makeReturnNode(e)
        }

        if (this.tokens[this.position].tokentype==TokenType. KWLet){
            return this.parseVariableDecleration()
        }

        if (this.tokens[this.position].tokentype==TokenType.KWIf){
            return this.parseIfStatement()
        }


        //error case
        console.log("prev tok", this.tokens[this.position-1] ,"pos :", this.position-1 )
        console.log("no statement parsed from : ", this.tokens[this.position] ,"pos :", this.position )
        console.log("next tok", this.tokens[this.position+1] ,"pos :", this.position+1 )
        console.log()
        console.trace()
        exit(2)
    }

    //first token is not inside the body.
    //so !={
    private parseBody(){
        let stats:Statement[]=[]
        while( this.tokens[this.position].tokentype!=TokenType.Rsquerly){
            let stat=this.parseStatement()
            if (stat!=undefined){
                stats.push(stat)
            }
        }
        this.position++ //skip}
        return stats
    }


    private parseIfStatement():IfNode{
        //make if statement
        let node=makeIfNode()

        this.position++ //skip if
        this.position++ //skip (

        node.lexpr=this.parsefunctionparameters()[0]
        this.position++ //skip )

        // get the comparison type
        let s=""

        while (this.tokens[this.position].tokentype!=TokenType.Lparen){
            s+= this.tokens[this.position++].val
        }
        node.op=s

        this.position++ //skip (
        node.rexpr=this.parsefunctionparameters()[0]
        this.position++ //skip )


        this.position++ //skip{

        node.Tbody= this.parseBody()
            
        //if next is else kw
        //else statement
        if(this.tokens[this.position].tokentype==TokenType.KWElse){
            this.position++ //skip Elsekw
            this.position++ //skip{

            node.Fbody=this.parseBody()

        }



        return node
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

        decl.body= this.parseBody()


        // give nth's to variable decletarions
        // note nth!=i
        let nth=0
        for (let i =0;i<decl.body.length;i++){
            if(decl.body[i].discriminator=="VariableDecl"){
                (decl.body[i] as VariableDecl).nth=nth++
            }
        }

        //console.log("fn decl name: ",decl.name,". params: ", decl.params, ". body: ",decl.body )

        return decl

    }

    private parseFnCall(){
        let call: FunctionCall= makeFuncCall()
            //{ name:this.tokens[this.position].val, arguments:[] }
        call.name=this.tokens[this.position].val

        this.position+=2 //id and (

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
        console.trace()
        exit()
    }

    // returns list of expressions
    // opps are allready in binary tree form
    //TODO over massive funcdtion should a be split 
    private parsefunctionparameters():Expr[]{

        let expressions:Expr[] = [] // all expressions in the parameters

        let post:Expr[] = [] //buffer what we use when we are evaluating tokens into a tree
        
        //list of operators are needed for algo
        let opps:Token[]=[]


        while( this.tokens[this.position].tokentype!=TokenType.Rparen){
            let tok=this.tokens[this.position]

            //needs to go through al tokens untill )
            if (this.tokens[this.position].tokentype!=TokenType.Comma ){
                if (this.tokens[this.position].tokentype!=TokenType.Operator){
                    //make token into expression
                    let ex = this.parseSingularExpression()
                    //put it on expressions
                    post.push(ex)

                }else{
                    //tok is operator
                    this.position++//next token
                        //logic for postfix notation
                    while(opps.length > 0 && getOperatorPrecidence(tok.val) <= getOperatorPrecidence(opps[opps.length-1].val)){
                        //pop stack put it on the post expr list
                        let a = opps.pop()
                        if (a != undefined){
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


    private parseVariableDecleration():VariableDecl{
        let decl=makeVariableDecl()
        this.position++ //skip let kw
        decl.name= this.tokens[this.position++].val //skip id
        
        //if next token is eq we are initialising the variable
        if (this.tokens[this.position].tokentype==TokenType.Equals){
            this.position++ //skip =
            this.position++ //skip (
            decl.init=this.parsefunctionparameters()[0]
            this.position++ //skip )
        }

        return decl
    }



    private parseVariableAssigment():Statement{
        //a value or operation expression
        let vari:VariableAssigment = makeVariableAssigment()
        vari.name=this.tokens[this.position].val
            //{ name: this.tokens[this.position].val, val:{} } 

        this.position++//jump over var name
        this.position++ //jump over =
        this.position++ //jump over (


        let val=this.parsefunctionparameters()
        vari.val=val[0]
        this.position++ //jump over )

        return vari

    }

} //end of class 

export {Parser, Statement, Expr, FunctionCall,FunctionDecl,VariableRefrence,VariableAssigment, ILiteralNode,OpNode,ReturnNode, IfNode, VariableDecl}


