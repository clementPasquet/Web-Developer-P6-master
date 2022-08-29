const jwt = require('jsonwebtoken');
 // ce middleware nous permet de decoder le jwt de nos utilisateurs pour en verifier l'origine a l'aide de la clé secrète puis valide l'userID 
 // il passe ensuite a la fonction suivante
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, `${process.env.RND_TKN}`);
       const userId = decodedToken.userId;
       req.auth = {userId};
       if (req.body.userId && req.body.userId !== userId){
        throw 'userId non valide';
       }
       else{
        next();
       }
	
   } catch(error) {
       res.status(401).json({ error : error | 'requéte non identifié' });
   }
};