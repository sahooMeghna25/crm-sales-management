const User = require('../models/User');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const { success } = require('../utils/apiResponse');

async function register(req, res, next) {
  try {
    const { name, email, phone, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, phone, password, role: role || 'Sales Executive' });
    const safe = user.toObject(); delete safe.password;
    return success(res, 'User registered successfully', { user: safe, token: generateToken(user) }, 201);
  } catch (e) { next(e); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const safe = user.toObject(); delete safe.password;
    return success(res, 'Login successful', { user: safe, token: generateToken(user) });
  } catch (e) { next(e); }
}

async function logout(req, res) { return success(res, 'Logout successful'); }
async function me(req, res) { return success(res, 'Profile fetched successfully', req.user); }

module.exports = { register, login, logout, me };
