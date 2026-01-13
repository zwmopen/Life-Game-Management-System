import React, { useState, useEffect } from 'react';
import { useGameState } from '../hooks/useGameState';
import { Theme } from '../types';

interface UserData {
  [key: string]: any;
}

interface UserProfile {
  username: string;
  createdAt: string;
}

interface UserAuthManagerProps {
  theme?: Theme;
}

const UserAuthManager: React.FC<UserAuthManagerProps> = ({ theme = 'light' }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData>({});
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  
  const isDark = theme === 'dark';
  const isNeomorphic = theme === 'neomorphic';
  const isNeomorphicDark = theme === 'neomorphic-dark';
  
  // 为拟态主题添加额外的样式变量
  const neomorphicContainerBg = isNeomorphic
    ? 'bg-[#e0e5ec] shadow-[12px_12px_24px_rgba(163,177,198,0.6),-12px_-12px_24px_rgba(255,255,255,1)] hover:shadow-[14px_14px_28px_rgba(163,177,198,0.7),-14px_-14px_28px_rgba(255,255,255,1)] active:shadow-[inset_8px_8px_16px_rgba(163,177,198,0.6),inset_-8px_-8px_16px_rgba(255,255,255,1)]'
    : isNeomorphicDark
    ? 'bg-[#1e1e2e] shadow-[12px_12px_24px_rgba(0,0,0,0.3),-12px_-12px_24px_rgba(30,30,46,0.8)] hover:shadow-[14px_14px_28px_rgba(0,0,0,0.4),-14px_-14px_28px_rgba(30,30,46,1)] active:shadow-[inset_8px_8px_16px_rgba(0,0,0,0.3),inset_-8px_-8px_16px_rgba(30,30,46,0.8)]'
    : '';
  
  const containerBg = isNeomorphic || isNeomorphicDark
    ? neomorphicContainerBg
    : isDark 
    ? 'bg-zinc-800' 
    : 'bg-slate-50';

  const innerContainerBg = isNeomorphic
    ? 'bg-[#e0e5ec] shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]'
    : isNeomorphicDark
    ? 'bg-[#1e1e2e] shadow-[inset_6px_6px_12px_rgba(0,0,0,0.3),inset_-6px_-6px_12px_rgba(30,30,46,0.8)]'
    : isDark
    ? 'bg-zinc-700'
    : 'bg-slate-100';
    
  const inputBg = isNeomorphic
    ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)] hover:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.7),inset_-6px_-6px_12px_rgba(255,255,255,1)] focus:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.7),inset_-6px_-6px_12px_rgba(255,255,255,1)]'
    : isNeomorphicDark
    ? 'bg-[#1e1e2e] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(30,30,46,0.8)] hover:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.4),inset_-6px_-6px_12px_rgba(30,30,46,0.9)] focus:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.4),inset_-6px_-6px_12px_rgba(30,30,46,0.9)]'
    : isDark
    ? 'bg-zinc-700 hover:bg-zinc-600'
    : 'bg-slate-200 hover:bg-slate-300';
    
  const textMain = isDark || isNeomorphicDark ? 'text-zinc-100' : 'text-zinc-800';
  const textSub = isDark || isNeomorphicDark ? 'text-zinc-300' : 'text-zinc-600';
  const textError = isDark || isNeomorphicDark ? 'text-red-400' : 'text-red-600';
  const textSuccess = isDark || isNeomorphicDark ? 'text-green-400' : 'text-green-600';
  
  const buttonBg = isNeomorphic
    ? 'bg-[#e0e5ec] border-transparent shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)] transition-all duration-300 text-blue-600 hover:text-blue-700'
    : isNeomorphicDark
    ? 'bg-[#1e1e2e] border-transparent shadow-[10px_10px_20px_rgba(0,0,0,0.3),-10px_-10px_20px_rgba(30,30,46,0.8)] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.4),-12px_-12px_24px_rgba(30,30,46,1)] active:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.3),inset_-6px_-6px_12px_rgba(30,30,46,0.8)] transition-all duration-300 text-blue-400 hover:text-blue-300'
    : isDark
    ? 'bg-zinc-700 hover:bg-zinc-600 transition-all duration-300 text-white'
    : 'bg-slate-200 hover:bg-slate-300 transition-all duration-300 text-slate-800';
    
  const linkColor = isNeomorphicDark ? 'text-blue-400' : isDark ? 'text-blue-400' : 'text-blue-600';
  
  // 为表单元素添加更明确的拟态深色模式样式
  const formInputBorder = isNeomorphic
    ? 'border border-transparent'
    : isNeomorphicDark
    ? 'border border-transparent'
    : isDark
    ? 'border border-zinc-600'
    : 'border border-slate-300';
    
  // 标签文本颜色
  const labelColor = isDark || isNeomorphicDark ? 'text-zinc-200' : 'text-zinc-700';
  
  // 为容器添加更清晰的边界
  const containerBorder = isNeomorphicDark
    ? 'border border-transparent'
    : isNeomorphic
    ? 'border border-transparent'
    : isDark
    ? 'border border-zinc-700'
    : 'border border-slate-200';
  
  const { day, balance, xp, checkInStreak, transactions, reviews, handleUpdateBalance, isDataLoaded, setDay, setBalance, setXp, setCheckInStreak, setTransactions, setReviews } = useGameState();

  // Check if user is already logged in on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUsername = localStorage.getItem('username');
    
    if (storedToken && storedUsername) {
      setAuthToken(storedToken);
      setIsLoggedIn(true);
      setUsername(storedUsername);
      fetchUserProfile(storedToken);
      fetchUserData(storedToken);
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('注册成功！请登录。');
        setIsLoginMode(true);
        setPassword('');
      } else {
        setMessage(data.message || '注册失败');
      }
    } catch (error) {
      setMessage('网络错误，请稍后重试');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const { token, user } = data;
        localStorage.setItem('authToken', token);
        localStorage.setItem('username', user.username);
        setAuthToken(token);
        setIsLoggedIn(true);
        setProfile(user);
        setMessage('登录成功！');
        
        // Fetch user data after login
        fetchUserData(token);
      } else {
        setMessage(data.message || '登录失败');
      }
    } catch (error) {
      setMessage('网络错误，请稍后重试');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    setAuthToken(null);
    setIsLoggedIn(false);
    setProfile(null);
    setUserData({});
    setUsername('');
    setPassword('');
    setMessage('已退出登录');
  };

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/user-data', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const { data } = await response.json();
        setUserData(data);
        
        // Update game state with user data if it exists
        if (data.day !== undefined) setDay(data.day);
        if (data.balance !== undefined) setBalance(data.balance);
        if (data.xp !== undefined) setXp(data.xp);
        if (data.checkInStreak !== undefined) setCheckInStreak(data.checkInStreak);
        if (data.transactions !== undefined) setTransactions(data.transactions);
        if (data.reviews !== undefined) setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const saveUserData = async () => {
    if (!authToken) return;

    setLoading(true);
    setMessage('');

    try {
      // Prepare data to save - combine current game state with other user data
      const dataToSave = {
        day,
        balance,
        xp,
        checkInStreak,
        transactions,
        reviews,
        ...userData
      };

      const response = await fetch('http://localhost:3001/api/user-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ data: dataToSave }),
      });

      if (response.ok) {
        setMessage('数据保存成功！');
      } else {
        setMessage('数据保存失败');
      }
    } catch (error) {
      setMessage('网络错误，数据保存失败');
      console.error('Error saving user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!authToken) return;

    setLoading(true);
    setMessage('');

    try {
      const updateData: { username?: string; newPassword?: string } = {};
      
      if (username && username !== profile?.username) {
        updateData.username = username;
      }
      
      if (newPassword && newPassword === confirmNewPassword) {
        updateData.newPassword = newPassword;
      } else if (newPassword) {
        setMessage('两次输入的密码不一致');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3001/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setMessage('资料更新成功！');
        
        // If username was changed, update localStorage
        if (updateData.username) {
          localStorage.setItem('username', updateData.username);
        }
        
        // Refresh profile
        fetchUserProfile(authToken);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || '更新失败');
      }
    } catch (error) {
      setMessage('网络错误，更新失败');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setMessage('');
  };

  if (isLoggedIn) {
    return (
      <div className={`p-4 ${containerBg} ${containerBorder} max-w-4xl mx-auto rounded-2xl`}>
        <h2 className={`text-xl font-bold mb-4 ${textMain}`}>账户管理</h2>
        
        <div className={`mb-4 p-3 ${innerContainerBg} rounded-lg ${textMain}`}>
          <p className={`${textMain}`}><strong className={`${textMain}`}>用户名:</strong> {profile?.username}</p>
          <p className={`${textMain}`}><strong className={`${textMain}`}>注册时间:</strong> {profile?.createdAt ? new Date(profile.createdAt).toLocaleString() : ''}</p>
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium mb-1 ${labelColor}`}>新用户名 (可选)</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full px-3 py-2 ${inputBg} ${formInputBorder} rounded-md ${textMain} transition-all duration-200`}
            placeholder="输入新用户名"
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium mb-1 ${labelColor}`}>新密码 (可选)</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={`w-full px-3 py-2 ${inputBg} ${formInputBorder} rounded-md ${textMain} transition-all duration-200`}
            placeholder="留空则不更改密码"
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium mb-1 ${labelColor}`}>确认新密码</label>
          <input
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className={`w-full px-3 py-2 ${inputBg} ${formInputBorder} rounded-md ${textMain} transition-all duration-200`}
            placeholder="再次输入新密码"
          />
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={updateProfile}
            disabled={loading}
            className={`px-4 py-2 ${buttonBg} text-white rounded-lg disabled:opacity-50 ${textMain} transition-all duration-200`}
          >
            {loading ? '更新中...' : '更新资料'}
          </button>
          
          <button
            onClick={saveUserData}
            disabled={loading}
            className={`px-4 py-2 ${buttonBg} text-white rounded-lg disabled:opacity-50 ${textMain} transition-all duration-200`}
          >
            {loading ? '保存中...' : '保存数据'}
          </button>
          
          <button
            onClick={handleLogout}
            className={`px-4 py-2 ${buttonBg} text-white rounded-lg ${textMain} transition-all duration-200`}
          >
            退出登录
          </button>
        </div>

        {message && (
          <div className={`mt-4 p-2 rounded ${innerContainerBg} ${message.includes('成功') ? textSuccess : textError} transition-all duration-200`}>
            {message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`p-4 ${containerBg} ${containerBorder} rounded-2xl max-w-4xl mx-auto`}>
      <h2 className={`text-xl font-bold mb-4 ${textMain}`}>{isLoginMode ? '登录' : '注册'}</h2>
      
      <form onSubmit={isLoginMode ? handleLogin : handleRegister}>
        <div className="mb-4">
          <label className={`block text-sm font-medium mb-1 ${labelColor}`}>用户名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full px-3 py-2 ${inputBg} ${formInputBorder} rounded-md ${textMain} transition-all duration-200`}
            required
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium mb-1 ${labelColor}`}>密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-3 py-2 ${inputBg} ${formInputBorder} rounded-md ${textMain} transition-all duration-200`}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-2 ${buttonBg} text-white rounded-lg disabled:opacity-50 ${textMain} transition-all duration-200`}
        >
          {loading ? (isLoginMode ? '登录中...' : '注册中...') : (isLoginMode ? '登录' : '注册')}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={toggleMode}
          className={`${linkColor} hover:underline transition-all duration-200`}
        >
          {isLoginMode 
            ? '还没有账户？点击注册' 
            : '已有账户？点击登录'}
        </button>
      </div>

      {message && (
        <div className={`mt-4 p-2 rounded ${innerContainerBg} ${message.includes('成功') ? textSuccess : textError} transition-all duration-200`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default UserAuthManager;