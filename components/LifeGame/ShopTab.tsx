import React, { useState, memo, useCallback, useMemo } from 'react';
import { 
  ShoppingCart, Package, PackagePlus, PackageMinus, RotateCcw, Plus, Minus, 
  Search, Filter, Grid, List, Edit3, Trash2, Star, Heart, Coins, Zap, 
  Shield, Sword, Gem, Shirt, Smartphone, Laptop, Headphones, Camera, 
  Home, Car, Coffee, Apple, Gamepad2, Music, Film, BookOpen, 
  Palette, Eye, Sun, Moon, Activity, TrendingUp, Award, Trophy, 
  Gift, Box, Archive, Tag, Percent, DollarSign, Euro, CreditCard, 
  Wallet, PiggyBank, Scale, EyeOff, Eye as EyeOpen, Lock, Unlock,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MoreHorizontal,
  Check, X, AlertTriangle, Info, Settings, User, Users as UsersIcon,
  Calendar, Clock, Timer, Play, Pause, StopCircle, RotateCcw as RotateCcwIcon,
  Volume2, VolumeX, Download, Upload, Share2, Copy, ExternalLink,
  Send, Mail, MessageCircle, Phone, MapPin, Globe, Wifi, Battery,
  Bluetooth, HardDrive, Server, Database, Cloud, CloudOff, Zap as ZapIcon,
  ShieldCheck, ShieldAlert, ShieldX, Lock as LockIcon, Unlock as UnlockIcon,
  Heart as HeartIcon, Bookmark, Pin, Flag, Bell, BellOff, Moon as MoonIcon,
  Sun as SunIcon, Star as StarIcon, StarHalf, StarOff, Crown, Gem as GemIcon,
  Flame, Sparkles, Sparkle,
  Dice1, Dice2, Dice3, Dice4, Dice5, Dice6
} from 'lucide-react';
import { Theme } from '../../types';
import { getButtonStyle } from '../../utils/styleHelpers';

interface ShopTabProps {
  balance: number;
  theme: Theme;
  isDark: boolean;
  isNeomorphic: boolean;
  cardBg: string;
  textMain: string;
  textSub: string;
}

const ShopTab: React.FC<ShopTabProps> = memo(({
  balance, theme, isDark, isNeomorphic, cardBg, textMain, textSub
}) => {
  const [activeTab, setActiveTab] = useState<'market' | 'inventory'>('market');
  
  // 使用useMemo优化按钮类名计算
  const marketButtonClass = useMemo(() => `px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
    activeTab === 'market' 
      ? 'bg-blue-500 text-white' 
      : getButtonStyle(false, false, isNeomorphic, theme, isDark)
  }`, [activeTab, isNeomorphic, theme, isDark]);
  
  const inventoryButtonClass = useMemo(() => `px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
    activeTab === 'inventory' 
      ? 'bg-blue-500 text-white' 
      : getButtonStyle(false, false, isNeomorphic, theme, isDark)
  }`, [activeTab, isNeomorphic, theme, isDark]);
  
  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* 商店标题和导航 */}
      <div className={`${cardBg} border p-4 rounded-2xl transition-all duration-300 hover:shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <ShoppingCart size={16}/> 补给黑市
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('market')}
              className={marketButtonClass}
            >
              市场
            </button>
            <button 
              onClick={() => setActiveTab('inventory')}
              className={inventoryButtonClass}
            >
              背包
            </button>
          </div>
        </div>
        
        {/* 余额显示 */}
        <div className="flex items-center justify-between p-3 rounded-lg mb-4" 
             style={{
               background: isNeomorphic 
                 ? (theme === 'neomorphic-dark' 
                     ? 'linear-gradient(145deg, #1e1e2e, #2a2a3e)' 
                     : 'linear-gradient(145deg, #e0e5ec, #c5ced9)') 
                 : isDark 
                     ? 'rgba(24, 24, 27, 0.5)' 
                     : 'rgba(241, 245, 249, 0.5)'
             }}>
          <div className="flex items-center gap-2">
            <Coins className="text-yellow-500" size={20} />
            <span className={`font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
              当前余额: {balance} G
            </span>
          </div>
        </div>
        
        {/* 市场/背包内容 */}
        {activeTab === 'market' ? (
          <div className="space-y-4">
            <div className={`${cardBg} border p-4 rounded-2xl transition-all duration-300 hover:shadow-lg`}>
              <h3 className={`text-lg font-bold ${textMain} mb-4`}>商品市场</h3>
              <div className="text-center py-8">
                <Package className={`mx-auto ${textSub}`} size={48} />
                <p className={`mt-2 ${textSub}`}>商品市场内容待完善</p>
                <p className={`text-sm ${textSub}`}>将在后续优化中实现</p>
              </div>
            </div>
          </div>
        ) : (
          <div className={`${cardBg} border p-4 rounded-2xl transition-all duration-300 hover:shadow-lg`}>
            <h3 className={`text-lg font-bold ${textMain} mb-4`}>我的背包</h3>
            <div className="text-center py-8">
              <Package className={`mx-auto ${textSub}`} size={48} />
              <p className={`mt-2 ${textSub}`}>背包空空如也</p>
              <p className={`text-sm ${textSub}`}>去市场购买一些商品吧！</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ShopTab.displayName = 'ShopTab';

export default ShopTab;