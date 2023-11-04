const prompt = require('prompt-sync')();
const c = require('ansi-colors');
const connect = require('./connect');
const Player = require('./player');

const gameGrid = [];
const scoreGrid=[]
let currentPlayer;
let gameId=-1;
let lastCol;

const emptyGrid = ()=> {
    gameGrid.length=0;
    scoreGrid.length=0;
    for(let row=0; row<6; row++){
        const arr=[];
        const score=[]
        for(let col=0; col<7; col++){
            arr.push('[ ]');
            score.push(0);
        }
        gameGrid.push(arr);
        scoreGrid.push(score);
    }
}

const setupGame=move=>{
    currentPlayer.setNextMove(move);
    emptyGrid();
    isRunning=true;
    movesRemaining=42;
}

const showCurrentBoard=()=>{
    console.log(gameGrid.map(row=>row.join('')).join('\n'));
}

const isValidMove=(playerMove)=>{
    for(let i=gameGrid.length-1; i>-1;i--){
        if(gameGrid[i][playerMove]==='[ ]'){
            gameGrid[i][playerMove]=`[${c.yellow('O')}]`;
            scoreGrid[i][playerMove]=1;
            lastCol=i;
            movesRemaining--;
            return true;
        }
    }
    return false;
}

const CheckForWin=()=>{
    for(let row=5; row>-1; row--){
        for(let col=6; col>-1; col--){
            if(scoreGrid[row][col]==1){
                if(CheckBoard(row,col,0,-1))return true;
                if(CheckBoard(row,col,-1,-1))return true;
                if(CheckBoard(row,col,-1,0))return true;
                if(CheckBoard(row,col,-1,1))return true;
            }
        }
    }
    return false;
}

const CheckBoard=(row,col,dr,dc)=>{
    for(let i=1; i<4; i++){
        const newRow = row + (i*dr);
        if(newRow<0 || newRow>5)return false;
        const newCol = col + (i*dc)
        if(newCol<0 || newCol>6)return false;
        if(scoreGrid[newRow][newCol]==0)return false;
    }
    return true;
}

const YouWin=()=>{
    console.log('');
    console.log('');
    console.log('');
    console.log(c.green('*******************'));
    console.log(c.green('*                 *'));
    console.log(c.green('*     You Win     *'));
    console.log(c.green('*                 *'));
    console.log(c.green('*******************'));
    console.log('');
 }
 
 const YouLose=()=>{
     console.log('');
     console.log('');
     console.log('');
     console.log(c.red('*******************'));
     console.log(c.red('*                 *'));
     console.log(c.red('*     You Lose    *'));
     console.log(c.red('*                 *'));
     console.log(c.red('*******************'));
     console.log('');
 }
 
 const ItsADraw=()=>{
     console.log('');
     console.log('');
     console.log('');
     console.log(c.blue('*******************'));
     console.log(c.blue('*                 *'));
     console.log(c.blue("*   It's A Draw   *"));
     console.log(c.blue('*                 *'));
     console.log(c.blue('*******************'));
     console.log('');
  }

const run = async ()=>{
    const playerName = prompt("Get Player Name: ","Player 1");
    currentPlayer = new Player(playerName);
    let continueGame=true;
    let host='';
    while(continueGame){
        while(host.length==0){
            host = prompt(c.blue("Do you want to host a game (h), join a game (j), or would you like to exit the game(x)?"));
            if(host==='x')continueGame=false;
            else if(host!=='h' && host!=='j'){
                host='';
                console.log("Please select again");
            }
            else if(host=='h'){
                let response = await CreateGame(currentPlayer.getName());
                if(!response)continueGame=false;
                else {
                    currentPlayer.setHost(true);
                    gameId=response.id;
                    console.log(c.blue(response.message));
                    response = await CheckForMessage();
                    if(!response){
                        console.log(c.red("Something went wrong. Exiting game..."));
                        continueGame=false;
                    }
                }
            }
            else if(host=='j'){
                let response = await fetchGames();
                console.log(response);
                if(!response)continueGame=false;
                else{
                    let selectGame='';
                    while(selectGame.length==0){
                        selectGame = prompt(c.blue("Enter Game Id to join, or x to exit: "));
                        if(selectGame==='x')continueGame=false;
                        else{
                            const id = parseInt(selectGame);
                            if(!id && id!==0){
                                console.log(c.magenta("Your choice was not recognised. Please start again"))
                                selectGame='';
                            }
                            else{
                                response = await joinGame(id);
                                console.log(response);
                                if(!response){
                                    console.log(c.magenta("Something went horribly wrong"));
                                    continueGame=false;
                                }
                                else if(response.length==0){
                                    console.log(c.magenta("There are no games to connect to"));
                                    continueGame=false;
                                }
                                else{
                                    console.log(c.blue("You have successfully connected to the game."))
                                    gameId = id;
                                    currentPlayer.setHost(false);
                                    currentPlayer.setNextMove(false);
                                }
                            }
                        }
                    }
                }
            }
        }
        if(continueGame){
            let isRunning=true;
            setupGame(currentPlayer.getNextMove());
            showCurrentBoard();
            console.log();
            while(isRunning){
                if(currentPlayer.getNextMove()){
                    let playerMove = prompt(c.green("Your move: pick a column from 0 - 6 to add a counter (or x to exit): "));
                    if(playerMove==="x"){
                        const response = await sendMessage(`x-x-x`);
                        isRunning=false;
                        gameType='';
                    }
                    else{
                        playerMove = parseInt(playerMove);
                        if((!playerMove && playerMove!==0) || playerMove<0 || playerMove>6 || !isValidMove(playerMove)){
                            console.log('');
                            console.log(c.magenta("That is not a valid move. Please try again"));
                        }
                        else{
                            console.log("");
                            console.log("");
                            showCurrentBoard();
                            if(CheckForWin()) {
                                const response = await sendMessage(`2-${playerMove}-${lastCol}`);
                                YouWin();
                                isRunning=false;
                            }
                            else{
                                movesRemaining--;
                                if(movesRemaining==0){
                                    const response = await sendMessage(`1-${playerMove}-${lastCol}`);
                                    ItsADraw();
                                    isRunning=false;
                                }
                                else {
                                    const response = await sendMessage(`0-${playerMove}-${lastCol}`);
                                    currentPlayer.setNextMove(false);
                                }
                            }
                        }
                    }
                }
                else{
                    console.log(c.red("Waiting for opposition move..."));
                    const response = await CheckForMessage();
                    const move = response[0].message.split('-');
                    if(move[0]==='x'){
                        console.log(c.red('The opposition player has left the game!'));
                        isRunning=false;
                    }
                    else{
                        movesRemaining--;
                        gameGrid[parseInt(move[2])][parseInt(move[1])]=c.red('[0]');
                        showCurrentBoard();
                        if(move[0]==='2'){
                            YouLose();
                            isRunning=false;
                        }
                        else if(move[0]==='1'){
                            ItsADraw();
                            isRunning=false;
                        }
                        else currentPlayer.setNextMove(true);
                    }    
                }
                if(!isRunning){
                    prompt(c.green("Press any key to continue...."));
                }
            }
            host='';
        }
    }
}
const CreateGame= async name=>{
    const response = await connect.post('host',{name});
    return (response);
}

const fetchGames=async ()=>{
    const response = await connect.get(`gamesList`);
    return response;
}

const joinGame=async id=>{
    const response = await connect.put('joingame',{id});
    return response;
}

const CheckForMessage=async()=>{
    const name = (currentPlayer.getHost())?currentPlayer.getName():"oppo";
    const response = new Promise((res,rej)=>{
        const stop = setInterval(async()=>{
            let message = await connect.get(`message/${name}/${gameId}`);
            if(!message || message.length>0){
                clearInterval(stop);
                res(message);
            }
        },10000);
    })
    return response;
}

const sendMessage=async(message)=>{
    const name = (currentPlayer.getHost())?currentPlayer.getName():"oppo";
    const response = await connect.post('sendMessage',{name,id:gameId,message});
    return response;
}

module.exports = {run}