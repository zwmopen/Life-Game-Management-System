/**
 * 商品目录常量
 * 从LifeGame.tsx中提取的SHOP_CATALOG商品数据
 */

import React from 'react';
import { 
  Smartphone, Laptop, Headphones, Layout, Camera, Tablet, Wind, 
  Armchair, Sofa, Footprints, Glasses, Sun, Utensils, Coffee, 
  Gift, Fish, BookOpen, Video, Scissors, Ticket, Music, Dumbbell,
  Wifi, Box, Calendar, Mountain, Home, Car, Heart, Shirt, Users,
  Globe, Palette
} from 'lucide-react';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'physical' | 'leisure' | 'rights';
  owned: boolean;
  icon: React.ReactNode;
  category: string;
  image: string;
}

export const SHOP_CATALOG: ShopItem[] = [
  // 数码产品
  { id: 'p_dig_1', name: 'iPhone 16 Pro', description: '顶级通讯终端', cost: 8999, type: 'physical', owned: false, icon: <Smartphone size={24} className="text-zinc-300"/>, category: '数码', image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=400&h=400&fit=crop' },
  { id: 'p_dig_2', name: 'MacBook Pro M4', description: '生产力核心武器', cost: 16000, type: 'physical', owned: false, icon: <Laptop size={24} className="text-zinc-400"/>, category: '数码', image: 'https://images.unsplash.com/photo-1517336712461-701df368a519?w=400&h=400&fit=crop' },
  { id: 'p_dig_3', name: '降噪耳机', description: '主动降噪，物理结界', cost: 2000, type: 'physical', owned: false, icon: <Headphones size={24} className="text-blue-400"/>, category: '数码', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop' },
  { id: 'p_dig_5', name: '机械键盘', description: '输入体验升级', cost: 800, type: 'physical', owned: false, icon: <Layout size={24} className="text-purple-400"/>, category: '数码', image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400&h=400&fit=crop' },
  { id: 'p_dig_6', name: '大疆pocket 3', description: '便携稳定器', cost: 2590, type: 'physical', owned: false, icon: <Camera size={24} className="text-yellow-500"/>, category: '数码', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop' },
  { id: 'p_dig_8', name: 'AirPods', description: '无线耳机', cost: 189, type: 'physical', owned: false, icon: <Headphones size={24} className="text-blue-400"/>, category: '数码', image: 'https://images.unsplash.com/photo-1588423770574-91993ca06f11?w=400&h=400&fit=crop' },
  { id: 'p_dig_9', name: 'MacBook Pro', description: '高端笔记本电脑', cost: 6499, type: 'physical', owned: false, icon: <Laptop size={24} className="text-zinc-400"/>, category: '数码', image: 'https://images.unsplash.com/photo-1517336712461-701df368a519?w=400&h=400&fit=crop' },
  { id: 'p_dig_10', name: 'iPad', description: '平板电脑', cost: 3299, type: 'physical', owned: false, icon: <Tablet size={24} className="text-purple-400"/>, category: '数码', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop' },
  { id: 'p_dig_11', name: '扫地机器人', description: '智能清扫，解放双手', cost: 7200, type: 'physical', owned: false, icon: <Layout size={24} className="text-blue-400"/>, category: '数码', image: 'https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?w=400&h=400&fit=crop' },
  { id: 'p_dig_12', name: '戴森吹风机', description: '高端吹风机', cost: 1999, type: 'physical', owned: false, icon: <Wind size={24} className="text-pink-500"/>, category: '数码', image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop' },
  
  // 装备
  { id: 'p_gear_1', name: '人体工学椅', description: '脊椎防御系统', cost: 1500, type: 'physical', owned: false, icon: <Armchair size={24} className="text-orange-400"/>, category: '家居', image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=400&fit=crop' },
  { id: 'p_gear_2', name: '乳胶枕头', description: '深度睡眠加速器', cost: 300, type: 'physical', owned: false, icon: <Sofa size={24} className="text-purple-400"/>, category: '家居', image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400&h=400&fit=crop' },
  { id: 'p_gear_3', name: '新战靴 (鞋子)', description: '行动力 +10%', cost: 800, type: 'physical', owned: false, icon: <Footprints size={24} className="text-yellow-600"/>, category: '形象设计与穿搭', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' },
  { id: 'p_gear_4', name: '防蓝光眼镜', description: '护眼 Buff', cost: 400, type: 'physical', owned: false, icon: <Glasses size={24} className="text-cyan-400"/>, category: '形象设计与穿搭', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop' },
  { id: 'p_gear_5', name: '智能台灯', description: '护眼照明，专注模式', cost: 350, type: 'physical', owned: false, icon: <Sun size={24} className="text-yellow-500"/>, category: '数码', image: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=400&h=400&fit=crop' },
  
  // 饮食
  { id: 's_food_1', name: '辣条一包', description: '廉价多巴胺 (慎用)', cost: 1, type: 'leisure', owned: false, icon: <Utensils size={24} className="text-red-500"/>, category: '吃喝', image: 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=400&h=400&fit=crop' },
  { id: 's_food_2', name: '快乐水', description: '瞬间恢复心情', cost: 5, type: 'leisure', owned: false, icon: <Coffee size={24} className="text-amber-700"/>, category: '饮食', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop' },
  { id: 's_food_3', name: '疯狂星期四', description: '高热量补给', cost: 68, type: 'leisure', owned: false, icon: <Gift size={24} className="text-yellow-500"/>, category: '饮食', image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=400&h=400&fit=crop' },
  { id: 's_food_6', name: '买一瓶饮料', description: '解渴又提神', cost: 5, type: 'leisure', owned: false, icon: <Coffee size={24} className="text-blue-500"/>, category: '饮食', image: 'https://images.unsplash.com/photo-1527960669566-f882ba85a4c6?w=400&h=400&fit=crop' },
  { id: 's_food_7', name: '烤全羊', description: '豪华美食', cost: 800, type: 'leisure', owned: false, icon: <Utensils size={24} className="text-red-500"/>, category: '饮食', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=400&fit=crop' },
  { id: 's_food_8', name: '烧烤', description: '街头美食', cost: 60, type: 'leisure', owned: false, icon: <Utensils size={24} className="text-orange-500"/>, category: '饮食', image: 'https://images.unsplash.com/photo-1529193591184-b1d58b3fffc9?w=400&h=400&fit=crop' },
  { id: 's_food_9', name: '烤鱼', description: '美味烤鱼', cost: 100, type: 'leisure', owned: false, icon: <Fish size={24} className="text-blue-500"/>, category: '饮食', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=400&fit=crop' },
  { id: 's_food_10', name: '烤鸭', description: '传统美食', cost: 30, type: 'leisure', owned: false, icon: <Utensils size={24} className="text-yellow-500"/>, category: '饮食', image: 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=400&h=400&fit=crop' },
  { id: 's_food_11', name: '奶茶', description: '休闲饮品', cost: 10, type: 'leisure', owned: false, icon: <Coffee size={24} className="text-pink-500"/>, category: '饮食', image: 'https://images.unsplash.com/photo-1544787210-2283dc61ba0c?w=400&h=400&fit=crop' },
  { id: 's_food_12', name: '正新鸡排', description: '快餐美食', cost: 13, type: 'leisure', owned: false, icon: <Utensils size={24} className="text-red-500"/>, category: '饮食', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=400&fit=crop' },
  { id: 's_food_13', name: '香辣大鸡腿', description: '香辣可口', cost: 1.99, type: 'leisure', owned: false, icon: <Utensils size={24} className="text-red-500"/>, category: '饮食', image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=400&fit=crop' },
  
  // 娱乐
  { id: 's_ent_1', name: '看小说半小时', description: '沉浸式阅读体验', cost: 30, type: 'leisure', owned: false, icon: <BookOpen size={24} className="text-purple-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop' },
  { id: 's_ent_2', name: '刷短视频半小时', description: '短平快的娱乐方式', cost: 30, type: 'leisure', owned: false, icon: <Video size={24} className="text-red-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=400&fit=crop' },
  { id: 's_ent_3', name: '看小说一小时', description: '长时间沉浸式阅读', cost: 60, type: 'leisure', owned: false, icon: <BookOpen size={24} className="text-purple-600"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop' },
  { id: 's_ent_4', name: '刷短视频一小时', description: '长时间刷短视频', cost: 60, type: 'leisure', owned: false, icon: <Video size={24} className="text-red-600"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1516280440614-37939bb92583?w=400&h=400&fit=crop' },
  
  // 服务
  { id: 's_hair_1', name: '理发', description: '魅力值回升', cost: 48, type: 'leisure', owned: false, icon: <Scissors size={24} className="text-pink-400"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop' },
  { id: 's_spa_1', name: '按摩放松', description: '缓解疲劳，恢复精力', cost: 198, type: 'leisure', owned: false, icon: <Armchair size={24} className="text-blue-400"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1544161515-4ae6ce6fe858?w=400&h=400&fit=crop' },
  { id: 's_books_1', name: '书籍购买', description: '知识获取，思维升级', cost: 98, type: 'leisure', owned: false, icon: <BookOpen size={24} className="text-amber-600"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=400&fit=crop' },
  
  // 票务
  { id: 'r_tick_1', name: '旅游车票 x1', description: '探索新地图', cost: 298, type: 'rights', owned: false, icon: <Ticket size={24} className="text-green-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=400&fit=crop' },
  { id: 'r_tick_2', name: '电影票', description: '娱乐放松，情感共鸣', cost: 45, type: 'rights', owned: false, icon: <Video size={24} className="text-red-600"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=400&fit=crop' },
  { id: 'r_tick_3', name: '演唱会门票', description: '音乐盛宴，情感释放', cost: 498, type: 'rights', owned: false, icon: <Music size={24} className="text-purple-600"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1459749411177-042180cefa7d?w=400&h=400&fit=crop' },
  
  // 会员
  { id: 'r_vip_1', name: '网易云 VIP (月)', description: '听觉享受', cost: 15, type: 'rights', owned: false, icon: <Music size={24} className="text-red-600"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop' },
  { id: 'r_vip_3', name: '健身会员 (月)', description: '健身特权，健康生活', cost: 298, type: 'rights', owned: false, icon: <Dumbbell size={24} className="text-blue-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop' },
  { id: 'r_vip_4', name: '网课论坛会员', description: '学习资源，交流平台', cost: 99, type: 'rights', owned: false, icon: <BookOpen size={24} className="text-purple-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=400&fit=crop' },
  { id: 'r_vip_5', name: '小众社群', description: '兴趣交流，人脉拓展', cost: 99, type: 'rights', owned: false, icon: <Users size={24} className="text-green-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=400&fit=crop' },
  { id: 'r_vip_6', name: '知识星球会员', description: '优质知识分享社群', cost: 199, type: 'rights', owned: false, icon: <BookOpen size={24} className="text-amber-600"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop' },
  { id: 'r_vip_7', name: '行业交流群', description: '专业人脉拓展平台', cost: 299, type: 'rights', owned: false, icon: <Users size={24} className="text-blue-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=400&fit=crop' },
  { id: 'r_vip_8', name: '兴趣爱好社群', description: '志同道合者的聚集地', cost: 88, type: 'rights', owned: false, icon: <Users size={24} className="text-pink-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=400&fit=crop' },
  { id: 'r_vip_9', name: '专业论坛会员', description: '深度专业交流平台', cost: 159, type: 'rights', owned: false, icon: <BookOpen size={24} className="text-cyan-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=400&fit=crop' },
  { id: 'r_vip_10', name: '线下活动社群', description: '定期线下聚会活动', cost: 399, type: 'rights', owned: false, icon: <Users size={24} className="text-orange-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=400&fit=crop' },
  
  // 充值
  { id: 'r_char_1', name: '话费充值卡', description: '通讯保障', cost: 99, type: 'rights', owned: false, icon: <Wifi size={24} className="text-blue-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=400&h=400&fit=crop' },
  { id: 'r_char_1_50', name: '话费充值卡50元', description: '通讯保障', cost: 50, type: 'rights', owned: false, icon: <Wifi size={24} className="text-blue-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=400&h=400&fit=crop' },
  { id: 'r_char_3', name: '云存储空间', description: '数据安全，便捷访问', cost: 118, type: 'rights', owned: false, icon: <Box size={24} className="text-purple-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=400&fit=crop' },
  
  // 新增商品
  { id: 'r_misc_1', name: '365天日历', description: '时间管理，记录生活', cost: 9.9, type: 'physical', owned: false, icon: <Calendar size={24} className="text-yellow-500"/>, category: '家居', image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=400&h=400&fit=crop' },
  { id: 'r_misc_2', name: '约人爬山', description: '户外活动，锻炼身体', cost: 9.9, type: 'leisure', owned: false, icon: <Mountain size={24} className="text-green-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=400&fit=crop' },
  { id: 'r_misc_3', name: '智能手表', description: '健康监测与通讯', cost: 1299, type: 'physical', owned: false, icon: <Smartphone size={24} className="text-blue-400"/>, category: '数码', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop' },
  { id: 'r_misc_4', name: '咖啡机', description: '自制美味咖啡', cost: 899, type: 'physical', owned: false, icon: <Coffee size={24} className="text-amber-700"/>, category: '家居', image: 'https://images.unsplash.com/photo-1520970014086-2208d157c9e2?w=400&h=400&fit=crop' },
  { id: 'r_misc_5', name: '瑜伽垫', description: '居家健身必备', cost: 89, type: 'physical', owned: false, icon: <Dumbbell size={24} className="text-purple-500"/>, category: '家居', image: 'https://images.unsplash.com/photo-1592432676556-3bc1a1f1b268?w=400&h=400&fit=crop' },
  { id: 'r_misc_6', name: '电影会员年卡', description: '全年电影观看特权', cost: 199, type: 'rights', owned: false, icon: <Video size={24} className="text-red-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=400&fit=crop' },
  { id: 'r_misc_7', name: '在线课程', description: '专业技能提升', cost: 399, type: 'rights', owned: false, icon: <BookOpen size={24} className="text-blue-600"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=400&fit=crop' },
  { id: 'r_misc_8', name: '演唱会周边', description: '限量版演唱会纪念品', cost: 199, type: 'physical', owned: false, icon: <Music size={24} className="text-purple-600"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400&h=400&fit=crop' },
  { id: 'r_misc_9', name: '定制T恤', description: '个性化服装定制', cost: 129, type: 'physical', owned: false, icon: <Shirt size={24} className="text-pink-500"/>, category: '形象设计与穿搭', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop' },
  { id: 'r_misc_10', name: '宠物食品', description: '优质宠物粮', cost: 159, type: 'physical', owned: false, icon: <Fish size={24} className="text-orange-500"/>, category: '家居', image: 'https://images.unsplash.com/photo-1589924691995-ad0029ecbb68?w=400&h=400&fit=crop' },
    
  // 新增用户要求商品
  // 家居类
  { id: 'p_home_1', name: '室内炉锅桌子', description: '家居生活必备', cost: 1299, type: 'physical', owned: false, icon: <Utensils size={24} className="text-amber-500"/>, category: '家居', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=400&fit=crop' },
  { id: 'p_home_2', name: '厨房套装', description: '全套厨房设备', cost: 3500, type: 'physical', owned: false, icon: <Utensils size={24} className="text-blue-500"/>, category: '家居', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=400&fit=crop' },
    
  // 房产类
  { id: 'p_property_1', name: '房子一间', description: '温馨小屋', cost: 500000, type: 'physical', owned: false, icon: <Home size={24} className="text-red-500"/>, category: '家居', image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&h=400&fit=crop' },
    
  // 车辆类
  { id: 'p_car_1', name: '理想汽车', description: '新能源汽车', cost: 250000, type: 'physical', owned: false, icon: <Car size={24} className="text-green-500"/>, category: '家居', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=400&fit=crop' },
    
  // 饮食类
  { id: 's_food_14', name: '酱骨头套餐', description: '酱骨头、牛骨头、调料一条龙', cost: 158, type: 'leisure', owned: false, icon: <Utensils size={24} className="text-red-500"/>, category: '吃喝', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=400&fit=crop' },
  { id: 's_food_15', name: '烧烤套餐（自制）', description: '自己动手做烧烤', cost: 88, type: 'leisure', owned: false, icon: <Utensils size={24} className="text-orange-500"/>, category: '吃喝', image: 'https://images.unsplash.com/photo-1529193591184-b1d58b3fffc9?w=400&h=400&fit=crop' },
  { id: 's_food_16', name: '烧烤套餐（外买）', description: '购买现成烧烤', cost: 158, type: 'leisure', owned: false, icon: <Utensils size={24} className="text-orange-500"/>, category: '吃喝', image: 'https://images.unsplash.com/photo-1529193591184-b1d58b3fffc9?w=400&h=400&fit=crop' },
  { id: 's_food_17', name: '烤鱼（外买）', description: '美味烤鱼188元', cost: 188, type: 'leisure', owned: false, icon: <Fish size={24} className="text-blue-500"/>, category: '吃喝', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=400&fit=crop' },
  { id: 's_food_18', name: '烤鱼（自制）', description: '自己做烤鱼55元', cost: 55, type: 'leisure', owned: false, icon: <Fish size={24} className="text-blue-500"/>, category: '吃喝', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=400&fit=crop' },
  { id: 's_food_19', name: '临沂炒鸡', description: '正宗临沂炒鸡', cost: 33, type: 'leisure', owned: false, icon: <Utensils size={24} className="text-yellow-500"/>, category: '吃喝', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=400&fit=crop' },
    
  // 旅游类
  { id: 'r_tick_4', name: '挪威旅行', description: '去挪威旅行一次', cost: 15000, type: 'rights', owned: false, icon: <Mountain size={24} className="text-blue-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1520540733426-ca963197f6ce?w=400&h=400&fit=crop' },
  { id: 'r_tick_5', name: '家庭旅游', description: '带家人出去旅游', cost: 3000, type: 'rights', owned: false, icon: <Users size={24} className="text-green-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop' },
    
  // 服务类
  { id: 's_service_1', name: '体检套餐', description: '带爸爸妈妈做体检', cost: 1200, type: 'rights', owned: false, icon: <Heart size={24} className="text-red-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1505751172107-573225a917bb?w=400&h=400&fit=crop' },
    
  // 运动类
  { id: 's_sport_1', name: '爬山', description: '去爬山30分钟', cost: 20, type: 'leisure', owned: false, icon: <Mountain size={24} className="text-green-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=400&fit=crop' },
  { id: 's_sport_2', name: '跑步', description: '去跑步30分钟', cost: 10, type: 'leisure', owned: false, icon: <Footprints size={24} className="text-blue-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=400&fit=crop' },
  { id: 's_sport_3', name: '健身', description: '去健身房30分钟', cost: 50, type: 'leisure', owned: false, icon: <Dumbbell size={24} className="text-red-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop' },
    
  // 服装类
  { id: 'p_cloth_1', name: '衣服一件', description: '时尚服装', cost: 299, type: 'physical', owned: false, icon: <Shirt size={24} className="text-purple-500"/>, category: '形象设计与穿搭', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop' },
  { id: 'p_cloth_2', name: '裤子一条', description: '休闲裤子', cost: 199, type: 'physical', owned: false, icon: <Shirt size={24} className="text-blue-500"/>, category: '形象设计与穿搭', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop' },
  { id: 'p_cloth_3', name: '家人衣服', description: '给家人买衣服', cost: 399, type: 'physical', owned: false, icon: <Users size={24} className="text-pink-500"/>, category: '形象设计与穿搭', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop' },
  { id: 'p_cloth_4', name: '家人裤子', description: '给家人买裤子', cost: 299, type: 'physical', owned: false, icon: <Users size={24} className="text-green-500"/>, category: '形象设计与穿搭', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop' },
    
  // 礼品类
  { id: 'p_gift_1', name: '朋友礼物', description: '常用但贵的小礼物', cost: 1000, type: 'physical', owned: false, icon: <Gift size={24} className="text-yellow-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop' },
  
  // 第一批新增商品（饮食类/休闲娱乐类）
  { id: 's_food_20', name: '一桶泡面', description: '方便快捷的美食', cost: 5, type: 'leisure', owned: false, icon: <Utensils size={24} className="text-red-500"/>, category: '吃喝', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop' },
  { id: 'r_tick_6', name: '说走就走的短途旅行', description: '短途旅行，放松心情', cost: 1100, type: 'rights', owned: false, icon: <Mountain size={24} className="text-green-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop' },
  { id: 'r_tick_7', name: '说走就走的长途旅行', description: '长途旅行，探索世界', cost: 5000, type: 'rights', owned: false, icon: <Mountain size={24} className="text-blue-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=400&fit=crop' },
  { id: 'r_tick_8', name: '说走就走的国际旅行', description: '国际旅行，开阔视野', cost: 50000, type: 'rights', owned: false, icon: <Globe size={24} className="text-purple-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1520540733426-ca963197f6ce?w=400&h=400&fit=crop' },
  
  // 第二批新增商品（娱乐类/形象设计与穿搭类）
  { id: 's_spa_2', name: '按摩', description: '缓解疲劳，放松身心', cost: 200, type: 'leisure', owned: false, icon: <Armchair size={24} className="text-blue-400"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1544161515-4ae6ce6fe858?w=400&h=400&fit=crop' },
  { id: 'r_tick_9', name: '兴趣组队门票', description: '加入兴趣组队活动', cost: 50, type: 'rights', owned: false, icon: <Users size={24} className="text-yellow-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=400&fit=crop' },
  { id: 'p_cloth_5', name: '素颜霜', description: '提升气色，自然妆容', cost: 100, type: 'physical', owned: false, icon: <Palette size={24} className="text-pink-500"/>, category: '形象设计与穿搭', image: 'https://images.unsplash.com/photo-1596462502278-27bfac4033c8?w=400&h=400&fit=crop' },
  { id: 'p_cloth_6', name: '夹板', description: '打造百变发型', cost: 30, type: 'physical', owned: false, icon: <Scissors size={24} className="text-purple-500"/>, category: '形象设计与穿搭', image: 'https://images.unsplash.com/photo-1522337360788-8b13df7727c6?w=400&h=400&fit=crop' },
  { id: 'p_cloth_7', name: '头发烫染', description: '时尚发型，提升魅力', cost: 100, type: 'physical', owned: false, icon: <Scissors size={24} className="text-red-500"/>, category: '形象设计与穿搭', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop' },
  { id: 'r_vip_11', name: '社群门票(1000元)', description: '加入高端社群', cost: 1000, type: 'rights', owned: false, icon: <Users size={24} className="text-green-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=400&fit=crop' },
  { id: 'r_vip_12', name: '社群门票(3000元)', description: '加入精英社群', cost: 3000, type: 'rights', owned: false, icon: <Users size={24} className="text-blue-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=400&fit=crop' },
  { id: 'r_vip_13', name: '社群门票(5000元)', description: '加入顶级社群', cost: 5000, type: 'rights', owned: false, icon: <Users size={24} className="text-purple-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop' },
  { id: 'r_vip_14', name: '社群门票(10000元)', description: '加入尊享社群', cost: 10000, type: 'rights', owned: false, icon: <Users size={24} className="text-yellow-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=400&fit=crop' },
  { id: 'r_vip_15', name: '社群门票(20000元)', description: '加入至尊社群', cost: 20000, type: 'rights', owned: false, icon: <Users size={24} className="text-red-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=400&fit=crop' },
];

export default SHOP_CATALOG;
