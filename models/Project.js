const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, 'Firstname is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // Ensure email is unique in the database
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please enter a valid email address',
    ],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [
      /^[0-9]{10}$/, // Changed to 10 digits
      'Please enter a valid 10-digit phone number',
    ],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'], // Increased minimum length to 8
  },
});

// Pre-save hook to remove repeatPassword before saving
userSchema.pre('save', function (next) {
  if (this.isModified('password') || this.isNew) {
      this.repeatPassword = undefined; // Remove repeatPassword
  }
  next();
});

// Compare entered password with hashed password in the database
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model('User', userSchema);

const productSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: String }, // You might want to make this a Number as well
  description: { type: String, required: true },
});

const Product = mongoose.model('Product', productSchema);

const cartItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
});

const CartItem = mongoose.model('CartItem', cartItemSchema);


const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  });

const Contact = mongoose.model('Contact', contactSchema);
  
module.exports = { User, Contact, CartItem, Product }; 