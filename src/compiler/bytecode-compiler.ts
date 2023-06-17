//make ast into bytecode



//walk ast and make the byte code from it
import {ReturnNode, Statement, FunctionCall, FunctionDecl, VariableAssigment,Expr,IfNode } from "./parser";
import * as par from "./parser"
import { ByteCode } from "../Bytecode";
import {exit} from "process";
import {prettyPrintByteCode} from "../utils/Prettyprint";

interface Imap{
    [name:string]:number
}


export class ByteCodeCompiler{

    private byteCodeArray:number[]=[]

    //key is function name, value is function adress in bytecode array (index)
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

                default:
                    console.log("uncompileable statement :" ,statement)
            }
        }
    }




    public getbytecode():number[]{
        return this.byteCodeArray
    }

    private compileIfStatement( ifn:IfNode, caller:undefined|FunctionDecl ){

        //we need start of else bod (later rn we dont need it)
        //then we need start of true bod
        //then we need to compile this shit and make comparison operators
        //prob gon look like this
        //
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

        let truebodyAdress= this.byteCodeArray.length + falsebody.length+ 2 +1  +2  //2? 1? 2?
        this.byteCodeArray.push(truebodyAdress)

        this.addToBytearray(falsebody)

        this.byteCodeArray.push(ByteCode.JUMP)
        this.byteCodeArray.push(this.byteCodeArray.length + truebody.length + 2 +1 ) //2 since jump and the literal //1 bc ??

        this.addToBytearray(truebody)


        //true body adress is else len+ 2 since were doing jump over true bod at the end

        

        



    }

    //??? idk if there are native alternatives to this fn
    private addToBytearray(list:number[]){
        for (let i =0; i<list.length;i++){
            this.byteCodeArray.push(list[i])
        }
    }

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
            exit(2)
        }

    }


    private compileReturn(stat:ReturnNode, caller:undefined|FunctionDecl){
        //what the fuck is return
        //just push the literal and then RET?
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


    private isArg(name:string,func:FunctionDecl){
        for(let i=0;i<func.parameterC;i++){
            if (func.parameterNames[i]==name){
                return {isin:true,nth:i}
            }
        }
        return {isin:false,nth:0}

    }


    //does this work?
    private compileExpression(expr:Expr, caller :undefined | FunctionDecl){
        
        //check what expression it is


        switch (expr.eDiscriminator){
            case "VariableRefrence":
                //what is var refrence
                //we need to see if it is param or assigned var then calculate the offset
                //needs to be a ware of the function that is calling it
                // do we pass as argument=?
                // then we need to pas the calledt to compiler call
                let vari = expr as par.VariableRefrence

                if (caller ==undefined){
                    //is not argument
                    //prettyPrintByteCode(this.byteCodeArray)
                    console.log("not yet implemented caller undefined (variable refrnece)")
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
                        this.byteCodeArray.push(ByteCode.LOAD) 
                        //we need to know how manyeth variable it is in the scope


                        //where is the variable on the stack 
                        //algo is 1+ how manyeth variable it was declared
                        console.log("not yet implemented")
                        exit()

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
                exit()
        }

    }

    private compileFunctionDecl(decl:FunctionDecl){
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

        this.byteCodeArray.push(ByteCode.JUMP)
        this.byteCodeArray.push(this.byteCodeArray.length+ 1+ subList.length + 3) //1 is to offset this instruction //3 is iconst 0 and ret

        for (let i=0; i<subList.length; i++){
            this.byteCodeArray.push(subList[i])
        }



        this.byteCodeArray.push(ByteCode.ICONST)
        this.byteCodeArray.push(0)
        this.byteCodeArray.push(ByteCode.RET)
        



        //len of function is array.len - addr (array len is at the end of all tokens)
        //or we make a sub list that we then append averything to the main list
        //this way we can construct the list with what we weant
        //also we know the len before we append anuthing to bytecode array

        
        //function declaration
        //first jump over the first make something that jumnps over the function
        //so wse dont exec it when we are trying to define it

    }

    private compileVariableAssigment(assigment:VariableAssigment, caller: undefined|FunctionDecl){
        this.byteCodeArray.push(ByteCode.SAVE)
        this.compileExpression(assigment.val, caller)
    }


    private isCoreFN(name:string):boolean{
        //when more core fns make a datastructure to see if it is corefn
        return name == "print"
    }

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
                exit()
        }

    }


}
