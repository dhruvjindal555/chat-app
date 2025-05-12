import mongoose from "mongoose";
require('dotenv')

type ConnectionObject = {
    isConnected?: number
}

const connection : ConnectionObject = {} 

export default async function dbConnect(): Promise<void>{
    if(connection.isConnected){
        console.log("Already Connnected!")
        return ;
    }
    try {
        const res = await mongoose.connect(process.env.MONGO_URI || '')
        // console.log(res.connections[0].readyState);        
        connection.isConnected = res.connections[0].readyState
        console.log("Successfully connected to database.");        
    } catch (error) {
        console.log('Error connecting to database', error);        
        throw new Error('Error connecting to database')
    }
}
