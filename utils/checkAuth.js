import jwt from 'jsonwebtoken';

export default (req,res,next) => {
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

    //  res.send(token);

    if(token) {
        try {
            const decoded = jwt.verify(token , 'secret123');

            req.userId = decoded._id;

            next();

        } catch(e) {
            return res.status(403).json({
                message: "No access1"
            })
        }
    } else {
        return res.status(403).json({
            message: "No access"
        })
    }
}