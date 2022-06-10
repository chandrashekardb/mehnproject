const bcrypt = require("bcryptjs/dist/bcrypt");
const async = require("hbs/lib/async");
const mongoose= require("mongoose");
const jwt=require("jsonwebtoken");
const res = require("express/lib/response");

const employeeSchema=new mongoose.Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:Number,
        required:true,
        unique:true
    },
    age:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    cpassword:{
        type:String,
        required:true
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
})
//Middleware for jwt attentication
employeeSchema.methods.generateAuthToken=async function(){
    try {
        const token=jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
        this.tokens=this.tokens.concat({token:token})
        await this.save();
        return token;
    } catch (error) {
        res.send("The error part"+ error)
        console.log("The error part"+ error);
    }
}
//Middleware encription-converting password into hash
employeeSchema.pre("save", async function(next){

    if(this.isModified("password")){        
        this.password=await bcrypt.hash(this.password, 10);
        console.log(`this current password is ${this.password}`);
        this.cpassword=await bcrypt.hash(this.password, 10);
    }
    next();    
})

//Creat a Collections
const Register=new mongoose.model("Register", employeeSchema);

module.exports=Register;