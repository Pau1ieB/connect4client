class Player{
    constructor(name){
        this.name=name;
        this.score=0;
        this.host=true;
        this.nextMove=false;
    }

    getName(){return this.name;}

    getScore(){return this.score;}

    announce(){return `${this.name} is ready`}

    getHost(){return this.host;}

    setHost(host){this.host=host;}

    getNextMove(){return this.nextMove}

    setNextMove(move){this.nextMove=move}
}

module.exports=Player