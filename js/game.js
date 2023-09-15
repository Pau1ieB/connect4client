const prompt = require('prompt-sync')();
const c = require('ansi-colors');
const connect = require('./connect');
const Player = require('./player');
const gameGrid = [];
let scoreGrid=[]
let currentPlayer;
let isRunning=false;
let movesRemaining;
let gameId;
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

const getIsRunning=()=>isRunning;

const setIsRunning=run=>isRunning=run;

const getMovesRemaining=()=>movesRemaining;

const isValidMove=(playerMove,c)=>{
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
//                if(CheckBoard(row,col,0,1))return true;
//                if(CheckBoard(row,col,1,1))return true;
//                if(CheckBoard(row,col,1,0))return true;
//                if(CheckBoard(row,col,1,-1))return true;
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

const CheckForMessage=async()=>{
    const name = (currentPlayer.getHost())?currentPlayer.getName():"oppo";
    const response = new Promise((res,rej)=>{
        const stop = setInterval(async()=>{
            let message = await connect.getMessage(name,gameId);
            if(message.length>0){
                clearInterval(stop);
                res(message);
        }
        },10000);
    })
    return response;
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

/*
const run=()=>{
    scoreGrid=[
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0]
    ]
    console.log(CheckForWin());
}
*/


const run= async ()=>{
    const playerName = prompt("Get Player Name: ","Player 1");

    currentPlayer = new Player(playerName);
    console.log(c.yellow(currentPlayer.announce()));
    console.log('');
    let continueGame=true;
    let pickGame=false;
    while(continueGame){
        while(!pickGame){
            const hostGame = prompt(c.blue("Do you want to host (h) or join (j) an existing game: "));
            if(hostGame!=='h' && hostGame!=='j'){
                console.log("Please select again");
            }
            else if(hostGame=='h'){
                let response = await connect.createGame(currentPlayer);
                if(response){
                    console.log(c.blue(response.message));
                    gameId = response.id;
                    const message = await CheckForMessage();
                    currentPlayer.setHost(true);
                    console.log();
                    console.log(c.red(message[0].message));
                    setupGame(true);
                }
                else console.log(c.red(response.message))
                pickGame=true;
            }
            else if(hostGame=='j'){
                let response = await connect.fetchGames();
                console.log(response);
                const selectGame = prompt(c.blue("Enter Game Id to join, or q to quit: "));
                if(selectGame==='q')pickGame=true;
                else{
                    const id = parseInt(selectGame);
                    if(!id && id!==0){
                        console.log(c.magenta("Your choice was not recognised. Please start again"))
                    }
                    else{
                        response = await connect.joinGame(id);
                        if(response){
                            console.log(c.blue("You have successfully connected to the game."))
                            gameId = id;
                            currentPlayer.setHost(false);
                            setupGame(false);
                        }
                        else console.log(c.magenta("Something went horribly wrong"));
                    }
                    pickGame=true;
                }
            }
        }
        console.log('');
        while(isRunning){
            showCurrentBoard();
            console.log();
            if(currentPlayer.getNextMove()){
                let playerMove = prompt(c.green("Your move: pick a column from 0 - 6 to add a counter: "));
                if(playerMove==="q") setIsRunning(false);
                else{
                    playerMove = parseInt(playerMove);
                    if((!playerMove && playerMove!==0) || playerMove<0 || playerMove>6){
                        console.log('');
                        console.log(c.magenta("That is not a valid move. Please try again"));
                    }
                    else{
                        const name = (currentPlayer.getHost)?currentPlayer.getName():'oppo';
                        if(!isValidMove(playerMove,c)){
                            const response = await connect.sendMessage(name,gameId,'1-0-0');
                            showCurrentBoard();
                            ItsADraw();
                            setIsRunning(false);
                        }
                        else {
                            if(CheckForWin()){
                                const response = await connect.sendMessage(name,gameId,`2-${playerMove}-${lastCol}`);
                                showCurrentBoard();
                                YouWin();
                                setIsRunning(false);
                            }
                            else{
                                const response = await connect.sendMessage(name,gameId,`0-${playerMove}-${lastCol}`);
                                currentPlayer.setNextMove();
                            }    
                        }
                    }
                }
            }
            else{
                console.log(c.red("Waiting for opposition move..."));
                const response = await CheckForMessage();
                const move = response[0].message.split('-');
                gameGrid[parseInt(move[2])][parseInt(move[1])]=c.red('[0]');
                if(move[0]==='2'){
                    showCurrentBoard();
                    YouLose();
                    setIsRunning(false);
                }
                else currentPlayer.setNextMove(true);
            }
            console.log('');
            console.log('');
        }
        const playerContinue = prompt(c.blue("Do you want to play another game?(y): "));
        if(playerContinue!=='y'){
            console.log("");
            console.log("");
            console.log(c.blue("Thanks for playing"))
            continueGame=false;
        }
        else pickGame=false;
    }
}

module.exports = {run}