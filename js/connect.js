//const urlHost = 'http://localhost:3000/';
const urlHost = 'https://connect4-u9ff.onrender.com/';


const CreateOptions=(method,data)=>{
    return{
        method:method,
        headers:{
            "Content-Type":"application/json",
        },
        body:JSON.stringify(data)
    }
}

const get= async (url)=>{
    let response = await fetch(urlHost+url);
    return (response.status!=200)?false:await response.json();
}

const post = async (url,data)=>{
    const options = CreateOptions('POST',data);
    let response = await fetch(urlHost+url,options);
    return (response.status!=201)?false:await response.json();
}

const put = async (url,data)=>{
    const options = CreateOptions('PUT',data);
    let response = await fetch(urlHost+url,options);
    return (response.status!=200)?false:await response.json();
}

module.exports={post,get,put}