// NOTE TO SELF ALLOCATE A SEPERATE LOCATION IN MEMORY TO STORE MEMORY ADDRESS VARIABLES FOR SYMBOLIC ADDRESSING AND RELATIVE ADDRESSING

let input    = document.getElementById('inputarea');
let acc      = document.getElementById('accumulator');
let ix       = document.getElementById('ix');
let hexd     = document.getElementById('hexd');
let reset    = document.getElementById('reset');
let output   = document.getElementById('output');
let p        = document.getElementById('p');
let zeroFlag = document.getElementById('zf')

let runButton    = document.getElementById('run');
let assembleBtn  = document.getElementById('asm');
let hexdButton   = document.getElementById('hexdb');
let db           = document.getElementById('dn');


let opcodes = {
    engC: ['LDM', 'LDX', 'STO', 'ADD', 'INC', 'DEC', 'CMP', 'JPE', 'JPN', 'JMP', 'OUT', 'END', 'CMI', 'SUB', 'LSL', 'LSR', 'LDD', 'LDR', 'LDI', 'MOV'],
    hexC: [0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0A,0x0B,0x0C,0x0D,0x0E,0x0F,0x10,0x11,0x12,0x13,0x14],
    desC: ['Load immediate value into the accumulator', 'Store the value in address which is (operand + index register) into the accumulator', 'Store value in the accumulator at address (operand) given', 'Add immediate value into the accumulator OR Add value at given address into the accumulator', 'Increment value at the given register ACC OR IX', 'Decrement value at the given register ACC OR IX', 'Compare immediate value with the value in the accumulator returns a value 1 (true) or 0 (false) in the zero flag', 'Jumps to the address in memory if the last compare was true (if 1 is stored in the zero flag)', 'Jumps to the address in memory if the last compare was false (if 0 was stored in the zero flag)', 'Conditionless jump to the address in memory given as the operand', 'Outputs the value in the accumulator to the output screen as an ASCII character', 'Ends the program', 'Compares (indirect addressing) the value in the accumulator with the value of the memory address given by the value stored in the memory address that is given in the operand', 'Subtract immediate value from the value int he accumulator OR Subtract value given at the address in the operand withe the value in the accumulator', 'Logical shift left with the shift ammount given by the operand', 'Logical shift right with the shift ammount given by the operand', 'Load value in the address given by the operand into the accumulator', 'Loads immediate value into the IX (index register)', 'Load value given at the address into the accumulator the address being stored at the address given by the operand', 'Move contents of the accumulator into the IX (index register)']
}

let pContent = "";
for(let i = 0; i < opcodes.engC.length; i++){
    pContent += `<br> ${opcodes.hexC[i]} <b> ${opcodes.engC[i]} </b> ${opcodes.desC[i]}\n`
}

let hexdumpContent = "";
let outAreaContent = "";

p.innerHTML = pContent;

let MEMORY = [];
let MEMORY_SIZE = 256;

let ACC = 0;
let IX  = 0;
let ZF  = 0;

acc.value      = ACC;
ix.value       = IX;
zeroFlag.value = ZF;

initializeMemory(MEMORY, MEMORY_SIZE, 'i');


// MAKES EACH INSTRUCTION ON A NEW LINE INTO A SEPERATE CHUNK : RETURNS ARRAY CONTAINTING ALL THE CHUNKS IN THE PROGRAM
/*
    -- EXAMPLE --
    
    PROGRAM:
    1| LDM #4
    2| OUT
    3| MOV IX

    RETURNS:
    ['LDM #4', 'OUT', 'MOV IX']

    NOTE:
    EACH ELEMENT IN THE ARRAY RETURNED IS A CHUNK
*/

function convertToChunks_newline(program){
    let tokenizedProgram_n = program.split('\n');
    return tokenizedProgram_n;
}

// TOKENIZES THE CHUNKS AND CHECKS FOR IMMEDIATE VALUES : RETURNS ARRAY CONTAINTING THE TOKENS IN THE CHUNK GIVEN
/*
    -- EXAMPLE --
    
    CHUNK:
    'LDM #4'

    RETURNS 
    ['LDM', '#', '4]
*/

function tokenizeChunks(chunk){
    tokenizedChunk = chunk.split(' ');
    for(let i = 0; i < tokenizedChunk.length; i++){
        let element = tokenizedChunk[i];
        if(element.includes('#')){
            let parts = element.split('#');
        
            tokenizedChunk.splice(i, 1, ...parts);
            tokenizedChunk.splice(i, 1);
            tokenizedChunk.splice(i ,0, '#');
            i += parts.length - 1;
        }
    }
    console.log(tokenizedChunk)
    return tokenizedChunk;
}

// DEPENDING ON THE INITIALIZATION MODE (THE 'INIT_MODE' ARGUMENT) WHICH CAN EITHER BE 'r' (RESET) or 'i' (INITIALIZE), IT RESETS OR INITIALIZES THE MEMORY : RETURNS MEMORY ARRAY
/*
    -- EXAMPLE --

    ----------------------------------------------

    INIT MODE 'r'

    BEFORE : MEMORY = [1,5,6 ... ] - 256
    AFTER  : MEMORY = [0,0,0 ... ] - 256

    ----------------------------------------------

    INIT MODE 'i'
    
    BEFORE : MEMORY = []          - 0
    AFTER  : MEMORY = [0,0,0 ...] - 256

    ----------------------------------------------

    NOTE:
    USE INIT MODE 'i' THE FIRST TIME THE PROGRAM LOADS, USE INIT MODE 'r' EVERY TIME YOU WANT TO RESET MEMORY I.E RESET BUTTON
*/

function initializeMemory(MEMORY, MEMORY_SIZE, INIT_MODE){
    if(INIT_MODE == 'r'){
        for(let i = 0; i < MEMORY_SIZE; i++){
            MEMORY[i] = '00';
        }
    }else if (INIT_MODE == 'i'){
        for(let i = 0; i < MEMORY_SIZE; i++){
            MEMORY.push('00');
        }
    }else{
        return;
    }
    
    return MEMORY;
}

// CONVERTS ALL THE HEX VALUES IN MEMORY TO DECIMAL : RETURNS MEMORY ARRAY

function memoryToDecimal(MEMORY){
    for(let i = 0; i < MEMORY.length; i++){
        MEMORY[i] = parseInt(MEMORY[i], 16);
    }

    return MEMORY;
}

// CONVERTS ALL DECIMAL TO HEX : RETURNS MEMORY ARRAY

function memoryToHex(MEMORY){
    for(let i = 0; i < MEMORY.length; i++){
        MEMORY[i] = MEMORY[i].toString(16);
    }

    return MEMORY;
}



function executeInstructionsFromMemory(MEMORY){ 
    MEMORY = memoryToDecimal(MEMORY);
    for(let i = 0; i < MEMORY.length; i++){
        // HERE i IS THE PROGRAM COUNTER
        //LDM
        if(MEMORY[i] == 1){
            if(MEMORY[i+2] == 255){
                ACC = MEMORY[i+1];
                i += 2;
                continue;
            }
        }
        //LDX
        if(MEMORY[i] == 2){
            i++;
            let TARGET_ADDRESS = MEMORY[i] + IX
            ACC = MEMORY[TARGET_ADDRESS];
            continue;
            
        }
        //STO
        if(MEMORY[i] == 3){
            i++;
            MEMORY[MEMORY[i]] = ACC;
            continue;
        }
        //ADD
        if(MEMORY[i] == 4){
            if(MEMORY[i+2] == 255){
                ACC += MEMORY[i+1];
                i += 2;
                continue;
            }else{
                ACC += MEMORY[MEMORY[i+1]];
                continue;
            }
        }
        //INC
        if(MEMORY[i] == 5){
            i++;
            if(MEMORY[i] == 1){
                ACC++;
            }else if(MEMORY[i] == 2){
                IX++;
            }

            continue;

        }
        //DEC
        if(MEMORY[i] == 6){
            i++;
            if(MEMORY[i] == 1){
                ACC--;
            }else if(MEMORY[i] == 2){
                IX--;
            }

            continue;

        }
        //CMP
        if(MEMORY[i] == 7){
            if(MEMORY[i+2] == 255){
                if(MEMORY[i+1] == ACC){
                    ZF = 1;
                }else{
                    ZF = 0;
                }
                continue;
            }else{
                if(MEMORY[MEMORY[i+1]] == ACC){
                    ZF = 1;
                }else{
                    ZF = 0;
                }
                continue;
            }

        }
        //JPE
        if(MEMORY[i] == 8){
            if(ZF == 1){
                i++;
                i = MEMORY[i]-2;
                continue;
            }
        }
        //JPN
        if(MEMORY[i] == 9){
            if(ZF == 0){
                i++;
                i = MEMORY[i]-2;
            }
            continue;
        }
        //JMP
        if(MEMORY[i] == 10){
            i++;
            i = MEMORY[i]-2;
            continue;
        }
        //OUT
        if(MEMORY[i] == 11){
            outAreaContent += String.fromCharCode(ACC);
            continue;
        }
        //END
        if(MEMORY[i] == 12){
            i = MEMORY.length;
            break;
        }
        //CMI
        if(MEMORY[i] == 13){
            i++;
            if(ACC == MEMORY[MEMORY[MEMORY[i]]]){
                ZF = 1;
            }else{
                ZF = 0;
            }

            continue;
        }
        //SUB
        if(MEMORY[i] == 14){
            if(MEMORY[i+2] == 255){
                ACC -= MEMORY[i+1];
                i += 2;
                continue;
            }else{
                ACC -= MEMORY[MEMORY[i+1]];
                continue;
            }
        }
        //LSL
        if(MEMORY[i] == 15){
            if(MEMORY[i+2] == 255){
                ACC = ACC << MEMORY[i+1];
                i+=2;
                continue;
            }else{
                ACC = ACC << MEMORY[MEMORY[i+1]];
                i+=2;
                continue;
            }
        }
        //LSR
        if(MEMORY[i] == 16){
            if(MEMORY[i+2] == 255){
                ACC = ACC >>> MEMORY[i+1];
                i+=2;
                continue;
            }else{
                ACC = ACC >>> MEMORY[MEMORY[i+1]];
                i+=2;
                continue;
            }

            continue;
        }
        //LDD
        if(MEMORY[i] == 17){
            i++;
            ACC = MEMORY[MEMORY[i]];
            continue;
        }
        //LDR
        if(MEMORY[i] == 18){
            if(MEMORY[i+2] == 255){
                IX = MEMORY[i+1];
                i+=2;
                continue;
            }
        }
        //LDI
        if(MEMORY[i] == 19){
            i++;
            ACC = MEMORY[MEMORY[MEMORY[i]]];
            continue;
        }
        //MOV
        if(MEMORY[i] == 20){
            i++;
            if(MEMORY[i] = 2){
                IX = ACC;
                continue;
            }


            continue;
        }







        

    }

    MEMORY = memoryToHex(MEMORY);
}

assembleBtn.addEventListener('click', function(){
    MEMORY = initializeMemory(MEMORY, MEMORY_SIZE, 'r');
    
    let usedMemLocations = 0;
    let program  = input.value;
    let p_chunks = convertToChunks_newline(program);
    
    for(let i = 0; i < p_chunks.length; i++){
        let t_chunks = tokenizeChunks(p_chunks[i]);

        if(t_chunks[0] == 'LDM'){
            t_chunks[0] = '1';
            if(t_chunks[1] == '#'){
                let buffer = t_chunks[2];

                t_chunks[2] = 'ff'
                t_chunks[1] = parseInt(buffer).toString(16);

                
            }

        }

        if(t_chunks[0] == 'LDX'){
            t_chunks[0] = '2';
            t_chunks[1] = parseInt(t_chunks[1]).toString(16);
        }

        if(t_chunks[0] == 'STO'){
            t_chunks[0] = '3';
            t_chunks[1] = parseInt(t_chunks[1]).toString(16);
        }

        if(t_chunks[0] == 'ADD'){
            t_chunks[0] = '4';
            if(t_chunks[1] == '#'){
                let buffer = t_chunks[2];

                t_chunks[2] = 'ff'
                t_chunks[1] = parseInt(buffer).toString(16);

                
            }else{
                t_chunks[1] = parseInt(t_chunks[1]).toString(16);
            }

        }

        if(t_chunks[0] == 'INC'){
            t_chunks[0] = '5';
            if(t_chunks[1] == 'ACC'){
                t_chunks[1] = '1';
            }else if(t_chunks[1] == 'IX'){
                t_chunks[1] = '2';
            }
        }

        if(t_chunks[0] == 'DEC'){
            t_chunks[0] = '6';
            if(t_chunks[1] == 'ACC'){
                t_chunks[1] = '1';
            }else if(t_chunks[1] == 'IX'){
                t_chunks[1] = '2';
            }
        }

        if(t_chunks[0] == 'CMP'){
            t_chunks[0] = '7';
            if(t_chunks[1] == '#'){
                let buffer = t_chunks[2];

                t_chunks[2] = 'ff'
                t_chunks[1] = parseInt(buffer).toString(16);

                
            }else{
                t_chunks[1] = parseInt(t_chunks[1]).toString(16);
            }

        }

        if(t_chunks[0] == 'JPE'){
            t_chunks[0] = '8';
            t_chunks[1] = parseInt(t_chunks[1]).toString(16);
        }

        if(t_chunks[0] == 'JPN'){
            t_chunks[0] = '9';
            t_chunks[1] = parseInt(t_chunks[1]).toString(16);
        }

        if(t_chunks[0] == 'JMP'){
            t_chunks[0] = 'a';
            t_chunks[1] = parseInt(t_chunks[1]).toString(16);
        }

        if(t_chunks[0] == 'OUT'){
            t_chunks[0] = 'b';
        }

        if(t_chunks[0] == 'END'){
            t_chunks[0] = 'c';
        }

        if(t_chunks[0] == 'CMI'){
            t_chunks[0] = 'd';
            t_chunks[1] = parseInt(t_chunks[1]).toString(16);
        }

        if(t_chunks[0] == 'SUB'){
            t_chunks[0] = 'e';
            if(t_chunks[1] == '#'){
                let buffer = t_chunks[2];

                t_chunks[2] = 'ff'
                t_chunks[1] = parseInt(buffer).toString(16);

                
            }else{
                t_chunks[1] = parseInt(t_chunks[1]).toString(16);
            }
        }

        if(t_chunks[0] == 'LSL'){
            t_chunks[0] = 'f';
            if(t_chunks[1] == '#'){
                let buffer = t_chunks[2];

                t_chunks[2] = 'ff'
                t_chunks[1] = parseInt(buffer).toString(16);

                
            }else{
                t_chunks[1] = parseInt(t_chunks[1]).toString(16);
            }
        }

        if(t_chunks[0] == 'LSR'){
            t_chunks[0] = '10';
            if(t_chunks[1] == '#'){
                let buffer = t_chunks[2];

                t_chunks[2] = 'ff'
                t_chunks[1] = parseInt(buffer).toString(16);

                
            }else{
                t_chunks[1] = parseInt(t_chunks[1]).toString(16);
            }
        }

        if(t_chunks[0] == 'LDD'){
            t_chunks[0] = '11';
            t_chunks[1] = parseInt(t_chunks[1]).toString(16);
        }

        if(t_chunks[0] == 'LDR'){
            t_chunks[0] = '12';
            t_chunks[1] = parseInt(t_chunks[1]).toString(16);
        }

        if(t_chunks[0] == 'LDI'){
            t_chunks[0] = '13';
            if(t_chunks[1] == '#'){
                let buffer = t_chunks[2];

                t_chunks[2] = 'ff'
                t_chunks[1] = parseInt(buffer).toString(16);

                
            }

        }

        if(t_chunks[0] == 'MOV'){
            t_chunks[0] = '14';
            t_chunks[1] = parseInt(t_chunks[1]).toString(16);
        }


       





        for(let k = 0; k < t_chunks.length; k++){
            for(let j = (usedMemLocations); j < MEMORY_SIZE; j++){
                MEMORY[j] = t_chunks[k];
                usedMemLocations++;
                break;
            }
        }

        
        

    }
});

runButton.addEventListener('click', function(){
    executeInstructionsFromMemory(MEMORY);

    acc.value = ACC;
    ix.value  = IX;
    zeroFlag.value = ZF;
    output.value = outAreaContent;
})

hexdButton.addEventListener('click', function(){
    hexd.value     = "";
    hexdumpContent = "";

    for(let i  = 0; i < MEMORY_SIZE; i++){
        if(i == 0 || i % 10 == 0){
            hexdumpContent += `\n${i}: `
        }
        hexdumpContent += `${MEMORY[i]} `;
        

    }

    hexd.value = hexdumpContent;
});


// DEBUGGING PURPOSES
db.addEventListener('click', function(){
    let tp = convertToChunks_newline(input.value);
    for(let i = 0 ; i < tp.length; i++){
        let tc = tokenizeChunks(tp[i]);
        output.value += `${tc}\n`;
    }
});


