import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// In-memory storage for users (in production, use a database)
let users = {};

// Helper function to read users from file
async function readUsersFromFile() {
  try {
    const data = await fs.readFile(path.join(__dirname, 'users.json'), 'utf8');
    users = JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, initialize with empty object
    users = {};
  }
}

// Helper function to write users to file
async function writeUsersToFile() {
  try {
    await fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error writing users to file:', error);
  }
}

// Initialize users from file
readUsersFromFile();

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    if (users[username]) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      data: {} // Personal data storage
    };

    users[username] = newUser;
    await writeUsersToFile();

    // Create user data directory
    const userDataDir = path.join(__dirname, 'user_data', username);
    await fs.mkdir(userDataDir, { recursive: true });

    res.status(201).json({ 
      message: '注册成功',
      user: { username: newUser.username, createdAt: newUser.createdAt }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = users[username];
    if (!user) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '登录成功',
      token,
      user: { username: user.username, createdAt: user.createdAt }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// Get user profile endpoint (requires authentication)
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = users[req.user.username];
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({
      username: user.username,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// Update user profile endpoint (requires authentication)
app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    const currentUser = users[req.user.username];

    if (!currentUser) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // If changing username
    if (username && username !== req.user.username) {
      if (users[username]) {
        return res.status(400).json({ message: '用户名已存在' });
      }

      // Update username in users object
      users[username] = { ...currentUser, username };
      delete users[req.user.username];
      await writeUsersToFile();

      // Rename user data directory if it exists
      const oldUserDataDir = path.join(__dirname, 'user_data', req.user.username);
      const newUserDataDir = path.join(__dirname, 'user_data', username);
      
      try {
        await fs.rename(oldUserDataDir, newUserDataDir);
      } catch (renameError) {
        // If directory doesn't exist, it's ok
        if (renameError.code !== 'ENOENT') {
          throw renameError;
        }
      }

      req.user.username = username;
    }

    // If changing password
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      users[req.user.username].password = hashedPassword;
      await writeUsersToFile();
    }

    res.json({ message: '资料更新成功' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// Get user data endpoint (requires authentication)
app.get('/api/user-data', authenticateToken, async (req, res) => {
  try {
    const user = users[req.user.username];
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // Read user data from file
    const userDataFile = path.join(__dirname, 'user_data', req.user.username, 'data.json');
    let userData = {};
    
    try {
      const data = await fs.readFile(userDataFile, 'utf8');
      userData = JSON.parse(data);
    } catch (error) {
      // If file doesn't exist, return empty object
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    res.json({ data: userData });
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// Save user data endpoint (requires authentication)
app.post('/api/user-data', authenticateToken, async (req, res) => {
  try {
    const { data } = req.body;
    const user = users[req.user.username];
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // Save user data to file
    const userDataDir = path.join(__dirname, 'user_data', req.user.username);
    await fs.mkdir(userDataDir, { recursive: true });
    
    const userDataFile = path.join(userDataDir, 'data.json');
    await fs.writeFile(userDataFile, JSON.stringify(data, null, 2));

    res.json({ message: '数据保存成功' });
  } catch (error) {
    console.error('Save user data error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: '访问被拒绝' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: '令牌无效' });
    }
    req.user = user;
    next();
  });
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: '人生游戏管理系统后端API运行正常' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});