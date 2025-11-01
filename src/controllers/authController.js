const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const jwt_secret = 'mySuperSercretKey';


// register new user
const register = async (req,res)=>{
    try{
        const {username, name , email ,password,phone} = req.body;

        if(!username || !name || !email || !password){
            res.status(400).json({
                success:false,
                message:"Missing required fields"
            })
        }
        const exsistUser = await prisma.user.findFirst({
            where:{
                OR:[{email},{username}]
            }
    });

        if(exsistUser){
            return res.status(400).send({
                succuss:false,
                message:"Email or username already exists"
            });
        }

        const hash = await bcrypt.hash(password,10);

        const user = await prisma.user.create({
            data : {username,name,email,password:hash,phone}
        });

        res.status(201).json({
            message:"User registered successfully",
            user:{
                id:user.id,
                username:user.username,
                name:user.name,
                email:user.email,
                phone:user.phone
            }
        });


    }catch(error){
        res.status(500).json({
            message:"Error registering user",
            error:error.message
        })
    }
}


//login user

const login = async (req,res)=>{
    try{

        const {email,password} = req.body;

        const user = await prisma.user.findUnique({
            where: {email}
        });

        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }

        //compare password

        const comparedPass = await bcrypt.compare(password,user.password);
        if(!comparedPass){
            return res.status(401).json({
                message:"Invalid password"
            });
        }

        const token = jwt.sign({
            id:user.id,
            email:user.email
        },jwt_secret,{expiresIn:"1h"});

        res.status(200).json({
            message:"Login successful",
            token,
            user:{
                id:user.id,
                username:user.username,
                email:user.email,
                name:user.name
            }
        })



    }catch(error){
        res.status(500).json({
            message:"Error in login API",
            error:error.message
        })
    }

}



module.exports = {
    register,
    login
}