const express = require('express');
const { User, Contact, CartItem, Product } = require('../models/Project');
const bcrypt = require('bcrypt');
const router = express.Router();

router.use(express.json());
// GET Signup Page
router.get('/signup', (req, res) => {
  res.render('signup', { user: req.session.user || null, success: null, error: null });
});

router.get('/api/products', async (req, res) => {
  try {
    let query = {};
    if (req.query.category) {
      query.category = req.query.category;
    }
    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// POST Signup
router.post('/signup', async (req, res) => {
  try {
    const { password, repeatPassword, ...rest } = req.body;

    // Check if passwords match (client-side also handles this, but server-side check is crucial)
    if (password !== repeatPassword) {
      return res.render('signup', {
        user: req.session.user || null, // Pass user if logged in
        error: 'Passwords do not match',
        success: null,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      ...rest,
      password: hashedPassword,
    });

    await newUser.save();
    res.redirect('/login'); // Redirect to login after successful signup

  } catch (error) {
    if (error.name === 'ValidationError') {
      // Handle validation errors from Mongoose
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.render('signup', {
        user: req.session.user || null,
        error: messages.join('<br>'), // Display all validation errors
        success: null,
      });
    } else if (error.code === 11000) {
      // Handle duplicate email error (unique index in schema)
      return res.render('signup', {
        user: req.session.user || null,
        error: 'Email already exists.',
        success: null,
      });
    } else {
      // Handle other errors
      console.error(error);
      res.status(500).send('An error occurred during signup.');
    }
  }
});

// GET Login Page
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// POST Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('login', { error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('login', { error: 'Invalid email or password.' });
    }

    req.session.user = user; // Store user in session
    res.redirect('/'); // Redirect to home after successful login
  } catch (error) {
    console.error(error);
    res.render('login', { error: 'An error occurred during login.' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

router.get('/', (req, res) => {
  res.render('home', { user: req.session.user || null, success: null, error: null });
});

router.get('/contact', (req, res) => {
  res.render('contact', { user: req.session.user || null, success: null, error: null });
});


router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.render('contact', { user: req.session.user || null, error: 'All fields are required', success: null });
    }

    const newContact = new Contact({
      name,
      email,
      message,
    });

    await newContact.save();
    res.render('contact', { user: req.session.user || null, success: 'Message sent successfully!', error: null });
  } catch (error) {
    console.error(error);
    res.render('contact', { user: req.session.user || null, error: 'An error occurred while sending your message.', success: null });
  }
});

router.get('/about', (req, res) => {
  res.render('about', { user: req.session.user || null });
});

router.get('/shoes', (req, res) => {
  res.render('shoes', { user: req.session.user || null });
});

router.get('/jewellery', (req, res) => {
  res.render('jewellery', { user: req.session.user || null });
});

router.get('/clothes', (req, res) => {
  res.render('clothes', { user: req.session.user || null });
});

router.get('/cart', (req, res) => {
  res.render('cart', { user: req.session.user || null });
});


router.get('/shoesdetails', (req, res) => {
  res.render('shoesdetails', { user: req.session.user || null });
});
router.get('/jewellerydetails', (req, res) => {
  res.render('jewellerydetails', { user: req.session.user || null });
});
router.get('/clothesdetails', (req, res) => {
  res.render('clothesdetails', { user: req.session.user || null });
});


router.get('/api/cart', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'User not logged in' });
  }

  try {
    const cartItems = await CartItem.find({ userId: req.session.user._id })
      .populate('productId'); // Populate to get product details
    res.status(200).json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/api/cart', async (req, res) => {
    const { productId, quantity } = req.body;
  
    if (!req.session.user) {
      return res.status(401).json({ message: 'User not logged in' });
    }
  
    try {
      // Check if the product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      // Check if the item already exists in the cart for the current user
      let cartItem = await CartItem.findOne({
        userId: req.session.user._id,
        productId: productId,
      });
  
      if (cartItem) {
        // If the item exists, update the quantity
        cartItem.quantity += quantity;
        await cartItem.save();
      } else {
        // If the item doesn't exist, create a new cart item
        cartItem = new CartItem({
          userId: req.session.user._id,
          productId: productId,
          quantity: quantity,
        });
        await cartItem.save();
      }
  
      res.status(201).json(cartItem);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      res.status(500).json({ message: 'Failed to add item to cart', error: error.message });
    }
  });



  router.put('/api/cart/:id', async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
  
    if (!req.session.user) {
      return res.status(401).json({ message: 'User not logged in' });
    }
  
    try {
      // Find the cart item by ID and verify ownership
      const cartItem = await CartItem.findOne({
        _id: id,
        userId: req.session.user._id,
      });
  
      if (!cartItem) {
        return res.status(404).json({ message: 'Item not found or not authorized' });
      }
  
      // Update the quantity
      cartItem.quantity = quantity;
      const updatedItem = await cartItem.save();
  
      res.status(200).json(updatedItem);
    } catch (error) {
      console.error('Error updating cart item:', error);
      res.status(500).json({ message: error.message });
    }
  });

  router.delete('/api/cart/:id', async (req, res) => {
    const { id } = req.params;
  
    if (!req.session.user) {
      return res.status(401).json({ message: 'User not logged in' });
    }
  
    try {
      // Find the cart item by ID and verify ownership
      const deletedItem = await CartItem.findOneAndDelete({
        _id: id,
        userId: req.session.user._id,
      });
  
      if (!deletedItem) {
        return res.status(404).json({ message: 'Item not found or not authorized' });
      }
  
      res.status(200).json({ message: 'Item deleted' });
    } catch (error) {
      console.error('Error deleting cart item:', error);
      res.status(500).json({ message: error.message });
    }
  });

// DELETE All Cart Items for User
router.delete('/api/cart', async (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ message: 'User not logged in' });
    }
  
    try {
      await CartItem.deleteMany({ userId: req.session.user._id });
      res.status(200).json({ message: 'All cart items deleted successfully!' });
    } catch (error) {
      console.error('Error deleting cart items:', error);
      res.status(500).json({ message: error.message });
    }
  });

  router.get('/api/deals', async (req, res) => {
    try {
      const deals = await Product.find({ isDealOfTheDay: true });
      res.json(deals);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching deal of the day products' });
    }
  });

module.exports = router;