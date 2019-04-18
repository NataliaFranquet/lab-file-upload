const express = require('express');
const passport = require('passport');
const router = express.Router();
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');
const multer = require('multer');
const Picture = require('../models/picture');
const upload = multer({ dest: './public/uploads/' });
const User = require("../models/user");

router.get('/login', ensureLoggedOut(), (req, res) => {
    res.render('authentication/login', { message: req.flash('error') });
});

router.post('/login', ensureLoggedOut(), passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

router.get('/signup', ensureLoggedOut(), (req, res) => {
    res.render('authentication/signup', { message: req.flash('error') });
});

router.post('/signup', ensureLoggedOut(), upload.single("picture"), passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true
}));

// endpoint for image upload using multer
router.post('/uploads', upload.single('picture'), (req, res) => {
    //mongo save action via mongoose
    const pic = new Picture({
        name: req.body.name,
        path: `/uploads/${req.file.filename}`,
        originalName: req.file.originalname
    });
    
    //actual db save via mongoose
    pic.save((err) => {
        res.redirect('/');
    });
});

//image rendering
router.get('/signup', function (req, res, next) {
    //mongoose finds all the photos in the db and passes them to the view
    Picture.find((err, pictures) => {
        //here we pass the pictures array to the view
        res.render('index', {
            pictures
        })
    })
  });

router.get('/profile', ensureLoggedIn('/login'), (req, res) => {
    res.render('authentication/profile', {
        user: req.user
    });
});

router.get('/logout', ensureLoggedIn('/login'), (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;
