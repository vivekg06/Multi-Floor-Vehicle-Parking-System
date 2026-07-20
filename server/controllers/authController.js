import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { ActivityLog } from '../models/ActivityLog.js';

const JWT_EXPIRE = '30d';

export async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });
  try {
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid username or password' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid username or password' });
    const secret = process.env.JWT_SECRET || 'super_secret_smart_park_key_123!@#';
    const token = jwt.sign({ userId: user._id, username: user.username, role: user.role }, secret, { expiresIn: JWT_EXPIRE });
    const audit = new ActivityLog({ username: user.username, role: user.role, action: 'LOGIN', details: `${user.role.toUpperCase()} logged in successfully` });
    await audit.save();
    return res.json({ token, user: { userId: user._id, username: user.username, role: user.role } });
  } catch (error) { return res.status(500).json({ message: error.message }); }
}

export async function register(req, res) {
  const { username, password, role } = req.body;
  if (!username || !password || !role) return res.status(400).json({ message: 'Username, password, and role are required' });
  try {
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) return res.status(400).json({ message: 'Username is already taken' });
    const newUser = new User({ username, password, role });
    await newUser.save();
    const creator = req.user ? req.user.username : 'system';
    const audit = new ActivityLog({ username: creator, role: req.user ? req.user.role : 'system', action: 'USER_CREATED', details: `Created new user: ${username} with role: ${role}` });
    await audit.save();
    return res.status(201).json({ message: 'User registered successfully', user: { userId: newUser._id, username: newUser.username, role: newUser.role } });
  } catch (error) { return res.status(500).json({ message: error.message }); }
}

export async function getMe(req, res) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (error) { return res.status(500).json({ message: error.message }); }
}

export async function getUsers(req, res) {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) { return res.status(500).json({ message: error.message }); }
}

export async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    const userToDelete = await User.findById(id);
    if (!userToDelete) return res.status(404).json({ message: 'User not found' });
    if (userToDelete.username === 'admin') return res.status(400).json({ message: 'Cannot delete the primary administrator' });
    await User.findByIdAndDelete(id);
    const audit = new ActivityLog({ username: req.user?.username || 'system', role: req.user?.role || 'system', action: 'USER_DELETED', details: `Deleted user: ${userToDelete.username} (role: ${userToDelete.role})` });
    await audit.save();
    return res.json({ message: 'User deleted successfully' });
  } catch (error) { return res.status(500).json({ message: error.message }); }
}
