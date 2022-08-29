const Sauce = require('../models/sauce');
const fs = require('fs');
const sauce = require('../models/sauce');

// cette fonction nous permet d'ajouter une sauce a la BD
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;     // on supprime les IDs fournient par le frontend
  delete sauceObject._userId;

  // on crée un objet sauce a partir du modèle Sauce
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  console.log("sauce" + sauce);
// on sauvegarde la sauce
  sauce.save()
    .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
    .catch(error => { res.status(400).json({ error }) })
};

// cette fonction permet de récupérer une seule sauce

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};
// cette fonction permet de modifier une sauce existante
exports.modifySauce = (req, res, next) => {

  //ici on traite les données en fonction de si il recoit une image ou non
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet modifié!' }))
          .catch(error => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};
// cette fonction permet de supprimer une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        const filename = sauce.imageUrl.split('/images/')[1];
        // ici on utilise filesystem pour supprimer l'image du serveur
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
            .catch(error => res.status(401).json({ error }));
        });
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};
// cette fonction permet de récupérer les sauces
exports.getAllSauce = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};
// cette fonction gere les différents scénarios du like (-1,0,1)
exports.likeSauce = (req, res, next) => {
  // on cherche la sauce en BD, on verifie au'elle n'est pas deja liké et on incremente le tableau de like avant de rajouter l'ID du likeur
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (req.body.like === 1) {
        if (sauce.usersLiked.includes(req.body.userId)) {
          res.status(401).json({ error: 'Sauce déja liké' });
        }
        else {
          Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: req.body.like++ }, $push: { usersLiked: req.body.userId } })
            .then((sauce) => res.status(200).json({ message: 'Like ajouté !' }))
            .catch(error => res.status(400).json({ error }))
        }

      }
      // meme scenario avec le dislike
      else if (req.body.like === -1) {
        if (sauce.usersDisliked.includes(req.body.userId)) {
          res.status(401).json({ error: 'Sauce déja disliké' });
        }
        else {
          Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: (req.body.like++) * -1 }, $push: { usersDisliked: req.body.userId } })
            .then((sauce) => res.status(200).json({ message: 'Dislike ajouté !' }))
            .catch(error => res.status(400).json({ error }));
        }
      }

      // ici on regarde dans qu'elle configuration se trouvé l'utilisteur (like, dislike) puis on déincrémente le like ou le dislike
      else {
        if (sauce.usersLiked.includes(req.body.userId)) {
          Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } })
            .then((sauce) => { res.status(200).json({ message: 'Like supprimé !' }) })
            .catch(error => res.status(400).json({ error }));
        }
        else if (sauce.usersDisliked.includes(req.body.userId)) {
          Sauce.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 } })
            .then((sauce) => { res.status(200).json({ message: 'Dislike supprimé !' }) })
            .catch(error => res.status(400).json({ error }));
        }
      }
    })
    .catch(error => res.status(400).json({ error }));
}