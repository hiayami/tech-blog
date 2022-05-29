const router = require('express').Router();
const { Project, User, Post, Comment } = require('../models');
const withAuth = require('../utils/auth');

router.get('/', async (req, res) => {
  try {

    const postData = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ['name'],
        },
      ],
    });

    // Serialize data so the template can read it
    const posts = postData.map((post) => post.get({ plain: true }));

    // Pass serialized data and session flag into template
    res.render('homepage', { 
      posts,
      logged_in: req.session.logged_in,
      at_home: true
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/post/create', async (req, res) => {
  try {
    res.render('upsert-post', {
      logged_in: req.session.logged_in,
      at_dashboard: true,
    });
  } catch (err) {
    console.error(err)
    res.status(500).json(err);
  }
});

router.get('/post/:id', async (req, res) => {
  try {
    const postData = await Post.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['name'],
        },
        {
          model: Comment,
          include: [{ model: User }]
        }
      ],
    });

    const post = postData.get({ plain: true });

    res.render('post', {
      ...post,
      logged_in: req.session.logged_in,
      at_home: true,
    });
  } catch (err) {
    console.error(err)
    res.status(500).json(err);
  }
});

router.get('/login', (req, res) => {
  // If the user is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    res.redirect('/');
    return;
  }

  res.render('login', {
    at_login: true
  });
});

router.get('/dashboard', async (req, res) => {
  const postData = await Post.findAll({
    include: [
      {
        model: User,
        attributes: ['name'],
      },
    ],
    where: {
      user_id: req.session.user_id
    }
  })
  const posts = postData.map((post) => post.get({ plain: true }));
  res.render('dashboard', {
    posts,
    logged_in: req.session.logged_in,
    at_dashboard: true,
  });
});

router.get('/post/:id/edit', async (req, res) => {
  try {
    const postData = await Post.findByPk(req.params.id);

    const post = postData.get({ plain: true });

    res.render('upsert-post', {
      ...post,
      logged_in: req.session.logged_in,
      at_dashboard: true,
      is_updating: true,
    });
  } catch (err) {
    console.error(err)
    res.status(500).json(err);
  }
});

module.exports = router;