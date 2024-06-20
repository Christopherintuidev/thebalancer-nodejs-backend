//import jsonwebtoken and config
const jwt = require('jsonwebtoken');

//This function verifyToken will verify the token coming from headers 
const verifyToken = async (req, res, next) => {
  // Getting the authorization header
  let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
  const token = req.headers[tokenHeaderKey];
  // console.log(token);
  if (!token) {
    return res.status(400).send('A token is required authentication');
  }

  try {
    // console.log('Just Before verifying the token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // console.log('decoded part : ', decoded);
    req.claims = decoded;
    
  } catch (error) {

    return res.status(401).send("Invalid Token");
    
  }

 
//Synchronously verify given token using a secret or a public key to get a decoded token 
 
  //return next
  next();
};

module.exports = verifyToken;