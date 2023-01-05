const nodemailer = require("nodemailer");

async function sendEmail(email , subject , text , html ){


    const transporter = nodemailer.createTransport({
        host:'smtp.gmail.com',
        secure:false,
        service: 'gmail',
        port:587,
        auth: {
            user:process.env.EMAIL,
            pass:process.env.EMAIL_APP_PASSWORD
        }
    });
    const mailOptions={
        from: `Ahmad Mobiles`, // sender address
        to: email, // list of receivers
        subject:subject, // Subject line
        text: text, // plain text body
        html: html, // html body
      }
console.log(transporter);
console.log('sending Mail');
    await transporter.sendMail(mailOptions , (err, info)=>{
        if(err){
            console.log('sad Messeging');
            console.log(err);
            return err;
            
        }else{

            console.log('Happy Messeging');
            console.log(info);
            return info;
            
        }
    });
    
    
}

module.exports =  sendEmail;