import mongoose from "mongoose";
import { DB_NAME } from '../constant.js';





const ConnectDB = async () => {
    try {
        console.log(DB_NAME)
        console.log(process.env.MONGODB_URI)
        
         const connectINstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
         // here we see the host we have connected(production,teasting)
            console.log(`\n MongoDB Is Connected!! ${connectINstance.Connection.host}`)
    }
    catch (error) {
    console.log("MOONGO Connection Nahi zala",error);
    process.exit(1)
    }
}

export default ConnectDB; 