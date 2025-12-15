const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');


//get all users
const getAllUsers = async (req,res)=>{
try{
    const users = await prisma.user.findMany();
    res.status(200).json({
        success:true,
        message:"Users reterived successfully",
        data:users
    });


}catch(error){
    res.status(500).send({
        success:false,
        message:"Error in getting users",
        error:error.message
    });
}

};

//get user by id
const getUserById = async (req,res)=>{
    try{
        const id = + req.params.userId;
        const user = await prisma.user.findUnique(
            {where : { id }}
        );

        if(!user){
            return res.status(404).send({
                success:false,
                message:"No user found"
            })
        }

        res.status(200).json({
            success:true,
            data:user
        });

    }catch(error){
        res.status(500).send({
            success:false,
            message:"Error in get user by id API",
            error:error.message
        })
    }

}

// create new user
const createUser = async (req,res)=>{
    try{
        const {username,name,email,password,phone}=req.body;

        if(!username || !name || !email || !password){
            return res.status(400).json({
                success:false,
                message:"Missing required fields"
            })
        }
        
        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await prisma.user.create({
            data:{username,name,email,password:hashedPassword,phone}
        })
        res.status(201).json({
            success:true,
            message:"User created successfully",
            data:user
        });

    }catch(error){
        res.status(500).send({
            success:false,
            message:"Error in create user API",
            error:error.message
        })
    }
}

//update user
const updateUser = async (req,res)=>{
    try{
        const id = + req.params.userId;
        const {username,name,email,password,phone} = req.body;

        // Prepare update data
        const updateData = {username,name,email,phone};
        
        // Only hash and update password if provided
        if(password){
            updateData.password = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where:{id},
            data: updateData
        });

        res.status(200).json({
            success:true,
            message:"User updated succesfully",
            data:user
        });

    }catch(error){
        res.status(500).send({
            success:false,
            message:"Error in update user API",
            error:error.message
        })
    }

}

// delete user
const deleteUser = async (req,res)=>{
    try{
        const id = +req.params.userId;
        if(!id){
          return  res.status(400).json({
                success:false,
                message:"No Id provided",
            })
        }

        const user = await prisma.user.delete({
            where : {id},
            
        });

        res.status(200).json({
            success:true,
            message:"User deleted succesfully",
        });

    }catch(error){
        res.status(500).send({
            success:false,
            message:"Error in delete user API",
            error:error.message
        })
    }
}


module.exports ={
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
}