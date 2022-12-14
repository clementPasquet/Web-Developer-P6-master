const bcrypt=require('bcrypt');
const jwt = require('jsonwebtoken');


const User = require('../models/user');


// cette fonction enregistre un utilisateur en base de donnée en s'assurant de l'unicité du mail grace au modele user et a uniqueValidator
// on utilise ici bcrypt aui va "hash" notre mot de passe,
// c'est a dire nous renvoyer une chaine de caracteres unique que nous enregistrons a la place du mdp dans la BD
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };




// cette fonction permet la connexion , on compare le mail entré pour retrouver notre utilisateur 
//puis le  mdp rentré par l'utilisteur a la chaine de caracteres emise par bcrypt 
//enfin on fournit un token jwt qui permet le maintien de la connexion et la sécurisation des routes sauces
  exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' })
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' })
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            `${process.env.RND_TKN}`,
                            { expiresIn: '24h' }
                        )
                    })
                })
                .catch(error => res.status(500).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
}
  