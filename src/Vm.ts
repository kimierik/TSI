    
import {exit, stdin, stdout} from "process";
import { ByteCode } from "./Bytecode";
import {prettyPrintOpCode} from "./utils/Prettyprint";


type VM = {
    instructions:number[],
    stack:number[],
    data:number[],

    ip:number,
    fp:number,
    sp:number,
    debug:boolean,
}

function makeVM():VM{
    return {
        instructions:[],
        stack:[],
        data:[],
        ip:0,
        fp:0,
        sp:-1,
        debug:false
    }
}


function startVm(code : ByteCode[],debug:undefined|boolean){

    let vm=makeVM();
    vm.instructions=code;
    if (debug!=undefined){
        vm.debug=debug
    }
    
    //i should be ip as it is instrucion pointer
    while(vm.ip<vm.instructions.length) {
        interpret_next_command(vm)
    }
}




function interpret_next_command(vm:VM){
    if (vm.debug){
        stdout.write("adress : "+vm.ip+"\t")
        prettyPrintOpCode(vm.instructions[vm.ip])
    }
    let opcode= vm.instructions[vm.ip++];


    //i will purpoisly use as many preincrement and increment operations in indexing as possible
    switch (opcode){
        
        //load next val into stack
        case ByteCode.ICONST:
            vm.stack[++vm.sp]=vm.instructions[vm.ip++]
            break;

        case ByteCode.PRINT:
            console.log(vm.stack[vm.sp--])
            break;

        //pop 2 from stack and add
        case ByteCode.IADD:
            let aa=vm.stack[vm.sp--]
            let ba=vm.stack[vm.sp--]
            vm.stack[++vm.sp] = aa+ba
            break;

        case ByteCode.IMUL:
            let am=vm.stack[vm.sp--]
            let bm=vm.stack[vm.sp--]
            vm.stack[++vm.sp] = am*bm
            break;

        case ByteCode.ISUB:
            let as=vm.stack[vm.sp--]
            let bs=vm.stack[vm.sp--]
            vm.stack[++vm.sp] = as-bs
            break;
        case ByteCode.IDIV:
            let ad=vm.stack[vm.sp--]
            let bd=vm.stack[vm.sp--]
            vm.stack[++vm.sp] = ad/bd
            break;

        case ByteCode.LOAD:
            let offset=vm.instructions[vm.ip++]
            vm.stack[++vm.sp]=vm.stack[vm.fp+offset]
            break

        //push val on stack
        case ByteCode.SAVE:
            vm.stack[++vm.sp]=vm.instructions[vm.ip++]
            break

        case ByteCode.REPL:
            let roffset=vm.instructions[vm.ip++]
            //stack at adress   is top of stack
            vm.stack[vm.fp+roffset] = vm.stack[vm.sp--]
        break


        case ByteCode.JUMP:
            vm.ip=vm.instructions[vm.ip]
            break

        case ByteCode.JEQ:
            let eql=vm.stack[vm.sp--]
            let eqr=vm.stack[vm.sp--]
            if (eql==eqr){
                vm.ip=vm.instructions[vm.ip]
            }else{
                //if we are not jumping we need to jump over the jump adress
                vm.ip+=1
            }
            break

        case ByteCode.JLT:
            let ltr=vm.stack[vm.sp--]
            let ltl=vm.stack[vm.sp--]
            if (ltl<ltr){
                vm.ip=vm.instructions[vm.ip]
            }else{
                //if we are not jumping we need to jump over the jump adress
                vm.ip+=1
            }
            break

        case ByteCode.CALL:
            //all arguments should allready be on the stack
            let fnAddr=vm.instructions[vm.ip++]             // next on stack is adress of the function on the vm.instructions array (index)
            let fnArgsN=vm.instructions[vm.ip++]            // next on the stack is the number of arguments that this function is called with
            vm.stack[++vm.sp]=fnArgsN                       // push the amount of arguments on the stack
            vm.stack[++vm.sp]=vm.fp                         // push the frame pointer on the stac (so that when we exit the function we know whare we were on the stack)
            vm.stack[++vm.sp]=vm.ip                         // push instruction pointer on stack (this is the return adress)
            vm.fp=vm.sp                                     // fp points to return addr on stack
            vm.ip=fnAddr                                    // jump to fn addr
            break;


            //return from function
        case ByteCode.RET:
            let rValue= vm.stack[vm.sp--]                   // every function returns what ever is on top of the stack.. all functions must return somethign
            vm.sp = vm.fp                                   // reset sp
            vm.ip=vm.stack[vm.sp--]                         // top of stack is the return adress
            vm.fp=vm.stack[vm.sp--]                         // top of stack is the frame pointer (to the callier function)
            vm.sp-=vm.stack[vm.sp--]                        // top of stack is number of arguments .. pop it and sub it from the stack pointer (basically pop all arguments that were provided to this function)
            vm.stack[++vm.sp] = rValue                      // leave the return value of this function on the stack
            break


        case ByteCode.HALT:
            return
        default: 
            console.log("VM cannot interpret " ,opcode, "at adress :", vm.ip-1)
            exit(2)
    }

    if (vm.debug){
        console.log(vm.stack)
    }
}



export {startVm}
