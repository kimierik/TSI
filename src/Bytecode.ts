//ints
export enum ByteCode{
    ICONST,
    PRINT,
    HALT,
    JUMP,

    LOAD,


    IADD,
    IMUL,
    ISUB,
    IDIV,

    CALL,
    RET,
}


/*
    *
    * ICONST        next value is pushed on to the stack
    * PRINT         prints top of stack
    * HALT          ends program
    * JUMP          jumps to next value
    * LOAD          loads value from stack
    * IADD          pop's 2 and applies propper operrand
    * ISUB          pop's 2 and applies propper operrand
    * IMUL          pop's 2 and applies propper operrand
    * IDIB          pop's 2 and applies propper operrand
    * CALL          jumps to address with paramcount
    * RET           returns
    *
    * */






