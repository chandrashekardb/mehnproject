require('dotenv').config();
const express=require("express");
const path=require("path")
const app=express();
require("./db/conn")

const Register=require("./models/registers");
const hbs=require("hbs");
const async = require("hbs/lib/async");
const bcrypt = require("bcryptjs/dist/bcrypt");
const port=process.env.PORT || 8000;

const static_path=path.join(__dirname,"../public");
const template_path=path.join(__dirname,"../templates/views");
const partials_path=path.join(__dirname,"../templates/partials");

app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use(express.static(static_path))

app.set("view engine", "hbs")
app.set("views", template_path)
hbs.registerPartials(partials_path)

console.log(process.env.SECRET_KEY);

app.get("/", (req, res)=>{
    res.render("index")
})

app.get("/register", (req, res)=>{
    res.render("register")
})

//Creat a new user in our Mongodb
app.post("/register", async(req, res)=>{
    try {
       const password=req.body.password;
       const cpassword=req.body.cpassword;

       if(password===cpassword){
            const registerEmployee=new Register({
                firstname:req.body.firstname,
                lastname:req.body.lastname,
                email:req.body.email,
                phone:req.body.phone,
                age:req.body.age,
                password:password,
                cpassword:cpassword
            })


            const token=await registerEmployee.generateAuthToken();

            const registerd=await registerEmployee.save();
            res.status(201).render("index");
       }else{
           res.send("Password are not matching")
       }
    } catch (error) {
        res.status(400).send(error)
    }
})

app.get("/login", (req, res)=>{
    res.render("login")
})

//Creating Login check in mogodb
app.post("/login", async(req, res)=>{
    try {
        const email=req.body.email;
        const password=req.body.password;
        
        const useremail=await Register.findOne({email:email});

        const isMatch=await bcrypt.compare(password, useremail.password);

        const token=await useremail.generateAuthToken();
        console.log("The token part:" + token);

        if(isMatch){
            res.status(201).render("index");
        }else{
            res.send("invalid login details")
        }
    } catch (error) {
        res.status(400).send("Invalid login details")
    }
})


// const bcrypt=require("bcryptjs");
// const secPassword= async(password)=>{
//     const passHash= await bcrypt.hash(password, 10);
//     console.log(passHash);

//     const passMatch= await bcrypt.compare(password, passHash);
//     console.log(passMatch);
// }
// secPassword("thpa@123")



// const jwt=require("jsonwebtoken")

// const createToken=async()=>{
//    const token =await jwt.sign({_id:"62a0c48fdace9ce35754c64d"},"mynameisvinodbahadurthapayoutuber",{expiresIn:"2 seconds"})
//    console.log(token);

//    const userVer=await jwt.verify(token, "mynameisvinodbahadurthapayoutuber");
//    console.log(userVer);
// }
// createToken();

app.listen(port, ()=>{
    console.log(`Server is runnign at prot no ${port}`);
})