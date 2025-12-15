const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwt_secret = process.env.JWT_SECRET || 'mySuperSecretKey';


// Register new child (requires parent authentication)
const childRegister = async (req, res) => {
    try {
        const { username, name, password, dateOfBirth } = req.body;
        
        // Get motherId from authenticated user
        const motherId = req.user?.id;

        if (!motherId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please log in as a parent."
            });
        }

        // Validate required fields
        if (!username || !name || !password) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: username, name, and password are required"
            });
        }

        // Check if username already exists
        const existingChild = await prisma.child.findUnique({
            where: { username }
        });

        if (existingChild) {
            return res.status(400).json({
                success: false,
                message: "Username already exists"
            });
        }

        // Verify that the authenticated user exists
        const mother = await prisma.user.findUnique({
            where: { id: motherId }
        });

        if (!mother) {
            return res.status(404).json({
                success: false,
                message: "Parent user not found"
            });
        }

        // Hash password
        const hash = await bcrypt.hash(password, 10);

        // Create child
        const child = await prisma.child.create({
            data: {
                username,
                name,
                password: hash,
                motherId,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null
            }
        });

        res.status(201).json({
            success: true,
            message: "Child registered successfully",
            child: {
                id: child.id,
                username: child.username,
                name: child.name,
                dateOfBirth: child.dateOfBirth,
                motherId: child.motherId,
                createdAt: child.createdAt
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error registering child",
            error: error.message
        });
    }
};
// Child login
const childLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }

        const child = await prisma.child.findUnique({
            where: { username }
        });

        if (!child) {
            return res.status(404).json({
                success: false,
                message: "Child not found"
            });
        }

        // Compare password
        const comparedPass = await bcrypt.compare(password, child.password);
        if (!comparedPass) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        // Generate JWT token for child
        const token = jwt.sign({
            id: child.id,
            username: child.username,
            type: 'child' // Add type to distinguish from user tokens
        }, jwt_secret, { expiresIn: "1h" });

        res.status(200).json({
            success: true,
            message: "Child login successful",
            token,
            child: {
                id: child.id,
                username: child.username,
                name: child.name,
                dateOfBirth: child.dateOfBirth,
                motherId: child.motherId
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in child login API",
            error: error.message
        });
    }
};


module.exports = {
    childLogin,
    childRegister
};
