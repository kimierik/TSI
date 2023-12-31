//make ast into bytecode



//walk ast and make the byte code from it
import {ReturnNode, Statement, FunctionCall, FunctionDecl, VariableAssigment,Expr,IfNode } from "./parser";
import * as par from "./parser"
import { ByteCode } from "../Bytecode";
import {exit} from "process";

interface Imap{
    [name:string]:number
}


export class ByteCodeCompiler{

    //the program
    private byteCodeArray:number[]=[]

    //key is function name, value is function adress in bytecode array (index)
    //so we know what adress functions start at
    private declaredFunctionsMap:Imap={}


    //takes in list of statements and returns bytecode array. this can be given to the VM
    public compileAst(ast:Statement[],caller:undefined|FunctionDecl){
            
        //what kindof a statement is it

        for (let i=0; i<ast.length;i++){
            let statement=ast[i]

            switch (statement.discriminator){
                case "FunctionCall":
                    this.compileFunctionCall(statement as FunctionCall,caller)
                    break

                case "ReturnStatement":
                    this.compileReturn(statement as ReturnNode,caller)
                    break

                case "FunctionDecl":
                    this.compileFunctionDecl(statement as FunctionDecl)
                    break

                case "VariableAssigment":
                    this.compileVariableAssigment(statement as VariableAssigment, caller)
                    break

                case "IFNODE":
                    this.compileIfStatement(statement as IfNode, caller)
                    break

                case "VariableDecl":
                    this.compileVariableDecleration(statement as par.VariableDecl, caller)
                    break

                default:
                    console.log("uncompileable statement :" ,statement)
                    console.trace()
                    exit(2)
            }
        }
    }

    public getbytecode():number[]{
        return this.byteCodeArray
    }

    private compileVariableDecleration(decl:par.VariableDecl, caller:undefined|FunctionDecl){ //idk if any of these are needed rn
        //push value on to stack
        if (decl.init !=undefined ){
            //console.log("comp",decl)
            this.compileExpression(decl.init, caller)
        }else{
            this.byteCodeArray.push(ByteCode.ICONST)
            this.byteCodeArray.push(0) //init at 0 if nothing 
        }

    }

    private compileIfStatement( ifn:IfNode, caller:undefined|FunctionDecl ){

        //JLE TrueBody-addr
        //(else body)
        //JUMP (over true body)
        //(TrueBody)

        this.compileExpression(ifn.lexpr, caller)
        this.compileExpression(ifn.rexpr, caller)
        this.byteCodeArray.push(this.getComparison(ifn.op))
        //push the adress of true body
        let falsebody=this.getCompiledBody(ifn.Fbody, caller)
        let truebody=this.getCompiledBody(ifn.Tbody, caller)

        let truebodyAdress= this.byteCodeArray.length + falsebody.length+ 2 +1  +2  
        // magic numbers: 
        // 2: we are adding jump over true body at the end of falses body (2 instructions)  
        // 1: jump over the adress itself  
        // 2: = falsebody.length points to last in false body. we need to +1 to jump over it. same with byteCodeArray.length
        
        this.byteCodeArray.push(truebodyAdress)

        this.addToBytearray(falsebody)

        this.byteCodeArray.push(ByteCode.JUMP)
        this.byteCodeArray.push(this.byteCodeArray.length + truebody.length + 2 +1 ) 
        //magic numbers: 
        // 2: = truebody.length points to last in true body. we need to +1 to jump over it. same with byteCodeArray.length
        // 1  jump over the jump adress

        this.addToBytearray(truebody)

    }


    //??? idk if there are native alternatives to this fn
    private addToBytearray(list:number[]){
        for (let i =0; i<list.length;i++){
            this.byteCodeArray.push(list[i])
        }
    }

    //HACK this returns a list of numbers. cannot use compileAst since i have written that function with too many side effects
    private getCompiledBody(statements:Statement[],caller:undefined|FunctionDecl):number[]{
        let p=this.byteCodeArray.length
        let sublist:number[]=[]

        this.compileAst(statements, caller)
        //this.byteCodeArray.length=this.byteCodeArray.length-1  //remove Halt?
        for (let i=p; i<this.byteCodeArray.length; i++){
            sublist.push(this.byteCodeArray[i])
        }
        this.byteCodeArray.length=p


        return sublist
    }


    private getComparison(comp:string){
        switch(comp){
            case "==":
            return ByteCode.JEQ
            case "<":
            return ByteCode.JLT

            default:
            console.log("un implemented comparison in compiler",comp)
            console.trace()
            exit(2)
        }

    }


    private compileReturn(stat:ReturnNode, caller:undefined|FunctionDecl){
        //just push the literal and then RET
        this.compileExpression(stat.rets, caller)
        this.byteCodeArray.push(ByteCode.RET)

    }



    private compileFunctionCall(call:FunctionCall, caller : undefined | FunctionDecl){

        //HACK to do core functions
        if (this.isCoreFN(call.name)){
            this.compileCorefns(call,caller)
            return 
        }


        let fnaddr= this.declaredFunctionsMap[call.name]
        //go through expressions and try to see what we need to do to them
        //if num then ICONST num
        //if operation then we need to do recursion
        for (let i=0;i<call.arguments.length;i++){
            this.compileExpression(call.arguments[i],caller)
        }
        this.byteCodeArray.push(ByteCode.CALL)
        this.byteCodeArray.push(fnaddr)
        this.byteCodeArray.push(call.arguments.length)
    }


    //if {name} of variable is argument not variable
    private isArg(name:string,func:FunctionDecl){
        for(let i=0;i<func.parameterC;i++){
            if (func.parameterNames[i]==name){
                return {isin:true,nth:i}
            }
        }
        return {isin:false,nth:0}

    }

    private getVarPos(name:string, caller:FunctionDecl):number|undefined{
        for (let i=0;i<caller.body.length;i++){
            if(caller.body[i].discriminator=="VariableDecl"){
                let a=(caller.body[i] as par.VariableDecl)
                if(a.name==name){
                    return a.nth
                }
            }
        }
        return undefined
    }


    //does this work?
    private compileExpression(expr:Expr, caller :undefined | FunctionDecl){
        
        //check what expression it is


        switch (expr.eDiscriminator){
            case "VariableRefrence":

                let vari = expr as par.VariableRefrence

                if (caller ==undefined){
                    //variable is not in any function it is written on the "base layer"

                    console.log("not yet implemented can only use variables in function")
                    console.trace()
                    exit()
                    
                }else{
                    if (this.isArg(vari.name , caller).isin){
                        //is argument
                        // fp - 3 is first last param
                        let n=this.isArg(vari.name , caller).nth 
                        this.byteCodeArray.push(ByteCode.LOAD)
                        this.byteCodeArray.push(n +caller.parameterC-1 -3) 

                    }else{
                        //is not argument
                        // fp+1 is first local var
                        //we need to know how manyeth variable it is in the scope
                        let n=this.getVarPos(vari.name, caller)
                        if (n==undefined){
                            console.log("tried to acces undeclared variable :", vari.name)
                            console.trace()
                            exit()
                        }

                        this.byteCodeArray.push(ByteCode.LOAD)
                        this.byteCodeArray.push(n+1) //fp+1 is first local var on the stack 

                    }
                }
                
                break

            case "Operation":
                let op =expr as par.OpNode
                this.compileExpression(op.l,caller)
                this.compileExpression(op.r,caller)
                this.byteCodeArray.push(this.getOperationEquilevalt(op.opp))
                break

            case "NumLiteral":
                this.byteCodeArray.push(ByteCode.ICONST)
                let n =expr as par.ILiteralNode
                this.byteCodeArray.push(n.val)
                break

            case "FunctionCall":
                this.compileFunctionCall(expr as FunctionCall,caller)
                break

            default:
                console.log("uncompileable expression :" ,expr, "in caller: ", caller)
                console.trace()
                exit()
        }

    }


    private getOperationEquilevalt(op:string):ByteCode{
        switch (op){
            case '+':
                return ByteCode.IADD
            case '*':
                return ByteCode.IMUL
            case '-':
                return ByteCode.ISUB
            case '/':
                return ByteCode.IDIV
            default:
                console.log("unknown op: ",op)
                console.trace()
                exit()
        }

    }

    private compileFunctionDecl(decl:FunctionDecl){
        //function declaration
        //first jump over the first make something that jumnps over the function
        //so wse dont exec it when we are trying to define it
        

        //adress is the top of the array +2 since we are goiing to do a goto
        let addr=this.byteCodeArray.length+2
        let subList:number[]=[]

        this.declaredFunctionsMap[decl.name]=addr

        //this is not good. i have made too many side effects to reuse this code
        //were taking what was added to byteCodeArray and adding it to sublist
        //then resetting bytecodearray
        this.compileAst(decl.body, decl)
        //this.byteCodeArray.length=this.byteCodeArray.length-1  //remove Halt?
        for (let i=addr-2; i<this.byteCodeArray.length; i++){
            subList.push(this.byteCodeArray[i])
        }
        this.byteCodeArray.length=addr-2

        //we reset bytecode array so we can add jump instruction before the function's code
        //this way when we walk the ByteCode list we jump over function declerations and dont execute them as functions
        this.byteCodeArray.push(ByteCode.JUMP)
        this.byteCodeArray.push(this.byteCodeArray.length+ 1+ subList.length + 3) //1 is to offset this instruction //3 is iconst 0 and ret

        //re add functions body to byteCodeArray
        for (let i=0; i<subList.length; i++){
            this.byteCodeArray.push(subList[i])
        }

        //if there is no return. return 0
        this.byteCodeArray.push(ByteCode.ICONST)
        this.byteCodeArray.push(0)
        this.byteCodeArray.push(ByteCode.RET)

    }

    private compileVariableAssigment(assigment:VariableAssigment, caller: undefined|FunctionDecl){

        if (caller!=undefined){
            // get pos of variable
            let n = this.getVarPos(assigment.name, caller)
            if (n==undefined){
                console.log("tried to compile assigmen to unknown variable: ", assigment)
                console.log("n undefined" )
                console.trace()
                exit()

            }

            //instruction to push shit on stack
            this.compileExpression(assigment.val, caller)

            //replace n with top of stack
            this.byteCodeArray.push(ByteCode.REPL)
            this.byteCodeArray.push(n+1) 
            //offset by 1 bc nth's start at 0
            

            // push new value on stack
        }else{
            console.log("tried to compile assigmen to unknown variable: ", assigment)
            console.trace()
            exit()
        }

    }


    //check if is core function
    private isCoreFN(name:string):boolean{
        //when more core fns make a datastructure to see if it is corefn
        return name == "print"
    }

    //core functions are functions that i will manually make bytecode for
    //like printing etc
    private compileCorefns(call:FunctionCall,caller:undefined|FunctionDecl){
        switch(call.name){

            case"print":

                for (let i=0; i<call.arguments.length;i++){
                    this.compileExpression(call.arguments[i],caller)
                    this.byteCodeArray.push(ByteCode.PRINT)
                }

                break


            default :
                console.log("unimplemented core function: ", call)
                console.trace()
                exit()
        }

    }

}
