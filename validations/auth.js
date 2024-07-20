import {body} from 'express-validator';

export const registerValidation = [
    body('email','Неверный формат почты').isEmail(),
    body('password','Пароль не менее 5 символов').isLength({min:5}),
    body('fullName','Имя не менее 3 символов').isLength({min:3}),
] 