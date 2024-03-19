import axios from "axios"

const instance = axios.create({
   baseURL: "https://coops-backend.bluetickconsultants.com:8000/",

   headers: {
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS',   
    }
  });
  export default instance