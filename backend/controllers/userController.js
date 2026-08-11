const bcrypt = require("bcrypt");

const userModel = require("../models/userModel");


// ======================================
// Liste des utilisateurs
// ======================================

async function getUsers(req, res) {

    try {

        const users = await userModel.getAllUsers();

        res.json(users);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            message: "Erreur serveur"

        });

    }

}


// ======================================
// Statistiques
// ======================================

async function getStats(req, res) {

    try {

        const stats = await userModel.getStats();

        res.json(stats);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            message: "Erreur serveur"

        });

    }

}


// ======================================
// Ajouter
// ======================================

async function createUser(req, res) {

    try {

        const body = req.body;

        body.password_hash = await bcrypt.hash(

            body.password,

            10

        );

        delete body.password;

        const user = await userModel.create(body);

        res.status(201).json(user);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            message: "Erreur serveur"

        });

    }

}


// ======================================
// Modifier
// ======================================

async function updateUser(req, res) {

    try {

        const user = await userModel.update(

            req.params.id,

            req.body

        );

        res.json(user);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            message: "Erreur serveur"

        });

    }

}


// ======================================
// Supprimer
// ======================================

async function deleteUser(req, res) {

    try {

        await userModel.remove(

            req.params.id

        );

        res.json({

            message: "Utilisateur supprimé"

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            message: "Erreur serveur"

        });

    }

}


module.exports = {

    getUsers,

    getStats,

    createUser,

    updateUser,

    deleteUser

};