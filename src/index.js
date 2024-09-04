import dotenv from 'dotenv';
import ConnectDB from "./db/index.js";
import { app } from './app.js';

dotenv.config({
    path:'./.env'
})

console.log("5555")

ConnectDB()
.then(()=>{
    app.on("error",(err)=>{
     console.log(err);
     throw err;
    })
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("Moogbodb Connection failed!!!",err);
})
    




    // asyn await used here because of the time delay to get the data from the AWS or Other Cloud, etc
// connecting the database
//1 way ttto connect


// (async ()=>{
//     try{
//        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)

//        app.on("error",(error)=>{
//         console.log("Error:",error)
//         throw error;
//        })
//        app.listen(process.env.PORT||4000,()=>{
//         console.log(`app listaning on ${process.env.PORT}`)
//        })
//     } 
//     catch(error)
//     {
//       console.error("Error:",error)
//       throw error;
//     }
// })
