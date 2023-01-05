const mongoose = require("mongoose");

// ,useCreateIndex:true 
const connectMogngoDb = ()=>{
    mongoose.connect(process.env.DB_URL, {useNewUrlParser:true, useUnifiedTopology : true }).then((res)=>{
        console.log(res.connection.host);
        
    })

    // .catch((err)=>{
    //     console.log(err);
        
    // })

    // catc is liye hatay kyun ke hum ne is ko unhandleed rejection se close karwana tha 
}

module.exports= connectMogngoDb