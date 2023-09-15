const createGame=async player=>{
    const data = {name:player.getName()};
    const options = {
        method:"POST",
        headers:{
            "Content-Type":"application/json",
        },
        body:JSON.stringify(data)
    }
    try{
        let repsData = await fetch(`http://localhost:3000/createGame`,options);
        if(repsData.status==201){
            repsData = await repsData.json();
            return repsData;
        }
        return false;
    }catch(err){console.log(err)}
}

const fetchGames=async ()=>{
    let repsData = await fetch(`http://localhost:3000/gamesList`);
    repsData = await repsData.json();
    return repsData;
}

const joinGame=async id=>{
    const options = {
        method:"PUT",
        headers:{
            "Content-Type":"application/json",
        },
        body:JSON.stringify({id:id})
    }
    let repsData = await fetch(`http://localhost:3000/joingame`,options);
    return (repsData.status==200)?true:false;
}

const getMessage=async(name,id)=>{
    let repsData = await fetch(`http://localhost:3000/message?name=${name}&id=${id}`);
    repsData = await repsData.json();
    return repsData;
}

const sendMessage=async(name,id,message)=>{
    const data = {name:name,id:id,message:message};
    const options = {
        method:"POST",
        headers:{
            "Content-Type":"application/json",
        },
        body:JSON.stringify(data)
    }
    let repsData = await fetch(`http://localhost:3000/postMessage`,options);
    if(repsData.status==200){
        return true;
    }
    return false; 
}

module.exports={createGame,getMessage,fetchGames,joinGame,sendMessage}