

import { Token } from "../compiler/lexer";
import { TokenType } from "../compiler/lexer";


function getOperatorPrecidence(op :string):number{
    switch (op){

    case "*":
        return 2
    case "/":
        return 2
    case "+":
        return 1
    case "-":
        return 1

    default:
       console.log("token default")
        return 0
    }

}



function InfixToPostfix( tokens:Token[]):Token[]{
    let postfix :Token[]=[]
    let stack :Token[]=[]

    for (let i=0; i<tokens.length;i++){


        if (tokens[i].tokentype!=TokenType.Operator){
            postfix.push(tokens[i])
        }else{
            //the thing is a variable or literal
            //if the precidence of the current opp is more than the precidence of the opp on the top of the stack
            //push it 

            while (stack.length>0&& getOperatorPrecidence(tokens[i].val) <= getOperatorPrecidence( stack[stack.length-1].val ) ){
                let a=stack.pop()
                if (a!=undefined){
                    postfix.push(a)
                }
            }
            stack.push( tokens[i])

        }

    }
    while( stack.length>0){
        let a=stack.pop()
        if (a!=undefined){
            postfix.push(a)
        }
    }



    return postfix

}
export {InfixToPostfix}
