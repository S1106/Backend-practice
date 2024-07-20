import express from 'express';
import jwt from 'jsonwebtoken'; 
import bcrypt from 'bcrypt'
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import { registerValidation } from './validations/auth.js';

import UserModel from './modules/User.js';
import checkAuth from './Utils/checkAuth.js';

mongoose
.connect('mongodb+srv://dmitroprojec89:wwwwww@cluster0.dgx6u5t.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster0')
.then(() => console.log('DB is OK'))
.catch((err) => console.log('DB is fault', err))

const app = express();

app.use(express.json());

app.post('/auth/login',async (req,res) => {
    try {
        const user = await UserModel.findOne({email:req.body.email});

        if(!user) {
            return res.status(404).json({
                message: 'Not found user',
            })
        }

        const isValidPass = await bcrypt.compare(req.body.password,user._doc.passwordHash);

        if(!isValidPass) {
            return res.status(400).json({
                message: 'Invalid Password or Login',
            })
        }

        const token = jwt.sign(
            {
            _id: user._id,
            },
            'secret123',
            {
            expiresIn: '30d'
            },
        );

        const {passwordHash, ...userData} = user._doc;
    
        res.json({
            ...userData,
            token,
        });

    } catch(err) {
        res.status(500).json({
            message: 'can`t do registration!',
        })
    }
});

// app.get('/',(req,res) => {
//     res.send('hello world!')
// })

app.post('/auth/register',registerValidation, async (req,res) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json(errors.array())
        }
    
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password,salt);
    
        const doc = new UserModel({
            email: req.body.email,
            fullName: req.body.fullName,
            passwordHash: hash,
        });
    
        const user = await doc.save();

        const token = jwt.sign(
            {
            _id: user._id,
            },
            'secret123',
            {
            expiresIn: '30d'
            },
        );

        const {passwordHash, ...userData} = user._doc;
    
        res.json({
            ...userData,
            token,
        });

    } catch (err){
        console.log(err);
        res.status(500).json({
            message: 'Невозможно зарегистрироваться',
        })
    }
});

// app.post('/auth/login',(req,res) => {
//     console.log(req.body)
//     const token = jwt.sign({
//         email: req.body.email,
//         fullName: "Sergo",
//     },'secret123');
//     res.json({
//         success: true,
//         token,
//     });
// });

// res.json({
//     success: true,
//     token,
// })

app.get('/auth/me',checkAuth,async (req,res) => {
    try{
        const user = await UserModel.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: 'user not found'
            });
        }

        const {passwordHash, ...userData} = user._doc;
    
        res.json(userData);

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message:'No access2',
        })
    }
})

app.listen(4444,(err) => {
    if(err) {
        return console.log(err)
    }

    console.log("server OK")
})