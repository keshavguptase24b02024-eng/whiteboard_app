const {check, validationResult} = require('express-validator');

const validateRegister = [
    check("name")
    .notEmpty().withMessage("Name is required")
    .isLength({min:3}).withMessage("Name must be atleast 3 characters"),

    check("email")
    .isEmail().withMessage("Enter a valid email"),

    check("password")
    .isLength({min:6}).withMessage("Password must be atleast 6 characters"),

    (req,res,next)=>{
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }
        
        next();
    },
];

module.exports = {validateRegister};