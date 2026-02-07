import React from 'react';
import { Dice5, Calendar, Target, Zap, Clock, Wallet, ShoppingBag, BarChart2, Settings, Layout, User, BookOpen, Crosshair, Activity, Trophy, Hammer, Gift, Music } from 'lucide-react';

export interface HelpContentItem {
  title: string;
  icon: React.ReactNode;
  productIntro: string; // 产品介绍
  underlyingPrinciple: string; // 底层原理
  coreRules: string; // 核心规则
  usageMethods: string; // 使用方法
  detailedContent?: string; // 详细内容
  updateTime: string;
}

export const helpContent: Record<string, HelpContentItem> = {
  // 商品分类与管理指南
  shop: {
    title: '【商品分类与管理】行动指南',
    icon: <ShoppingBag size={24} className="text-yellow-500" />,
    productIntro: '商品分类与管理系统是补给黑市的核心功能模块，用于管理和分类平台上的各类商品。该系统支持商品的购买、管理和分类筛选，为用户提供便捷的商品管理体验。',
    underlyingPrinciple: '基于电商平台的商品分类和管理逻辑设计，将商品分为不同的功能分类，方便用户根据需求进行筛选和管理。结合游戏化元素，通过商品分类和管理功能，增强用户的游戏体验和参与感。',
    coreRules: '商品分为多个功能分类，包括吃喝、形象设计与穿搭、休闲娱乐、数码、家居、会员/权益/充值等；实物类商品购买后永久拥有，存入军械库；权益类商品购买即消耗，代表获得一次享受的权利；金币仅通过完成任务获得；商品分类可通过分类按钮进行筛选，各按钮显示对应分类的商品数量；支持商品的添加、编辑和删除操作（仅管理模式）；社群类商品统一归类到会员/权益/充值分类。',
    usageMethods: '1. 查看商品分类与管理模块了解当前商品状态；2. 点击分类按钮筛选对应分类的商品，各按钮显示商品数量；3. 点击商品卡片查看商品详情；4. 购买商品消耗金币，获得相应的商品或权益；5. 管理模式下可添加、编辑和删除商品；6. 结合任务管理系统，通过完成任务获得金币购买商品；7. 使用盲盒功能可随机获得商品。',
    updateTime: '2026-01-17'
  },
  
  // 补充的商品帮助内容
  'shop-product-intro': {
    title: '【商品系统入门】指南',
    icon: <ShoppingBag size={24} className="text-blue-500" />,
    productIntro: '商品系统是人生游戏化平台的重要组成部分，通过金币购买各类商品来提升生活质量。系统分为实物商品、权益商品和盲盒商品三类，满足用户不同层面的需求。',
    underlyingPrinciple: '基于游戏化经济系统设计，通过任务完成获得金币，再用金币购买心仪商品，形成正向激励循环。结合现实与虚拟商品概念，让虚拟奖励也能带来实际价值感。',
    coreRules: '1. 金币来源：仅通过完成任务、成就解锁、签到等系统行为获得；2. 商品分类：数码、家居、休闲娱乐、形象设计、会员权益等；3. 商品类型：实物类（永久拥有）、权益类（一次性享受）、盲盒类（随机奖励）；4. 管理功能：仅在管理模式下可添加、编辑、删除商品。',
    usageMethods: '1. 进入商品系统浏览各类商品；2. 点击商品查看详情和购买选项；3. 确保金币充足后点击购买；4. 实物商品将存入军械库；5. 权益商品购买后即刻生效；6. 使用管理模式添加自定义商品；7. 定期查看盲盒功能获取随机奖励。',
    updateTime: '2026-01-17'
  },
  
  'shop-management': {
    title: '【商品管理】指南',
    icon: <Hammer size={24} className="text-purple-500" />,
    productIntro: '商品管理功能允许用户自定义商品，创建符合个人需求的奖励机制。通过管理模式，您可以添加、编辑、删除商品，甚至创建新的商品分类。',
    underlyingPrinciple: '基于个人化定制理念，允许用户根据自身目标和喜好创建专属的商品体系。通过自主管理商品，增强对奖励系统的归属感和参与度。',
    coreRules: '1. 管理入口：点击“管理商品”按钮进入管理模式；2. 商品信息：包含名称、描述、价格、分类、类型、图片链接；3. 分类管理：支持创建和编辑商品分组；4. 数据持久：商品数据本地存储，重启后依然保留。',
    usageMethods: '1. 点击“管理商品”进入管理模式；2. 点击“上架新商品”添加商品；3. 点击商品上的编辑按钮修改信息；4. 点击删除按钮移除商品；5. 点击“添加分组”创建新分类；6. 编辑完成后点击“完成管理”退出模式。',
    updateTime: '2026-01-17'
  },
  
  'shop-categories': {
    title: '【商品分类】指南',
    icon: <Layout size={24} className="text-green-500" />,
    productIntro: '商品分类系统将所有商品按照用途和性质进行归类，方便用户快速找到所需商品。系统预设了多个常用分类，同时也支持用户自定义分类。',
    underlyingPrinciple: '基于信息架构学原理，通过合理的分类体系提升信息查找效率。分类标准综合考虑了用户使用习惯和商品特性，确保分类的实用性和直观性。',
    coreRules: '1. 预设分类：数码、家居、休闲娱乐、形象设计与穿搭、会员充值、运动健康、服装礼品等；2. 分类筛选：点击分类按钮即可显示该分类下的所有商品；3. 数量显示：分类按钮显示该分类商品的数量；4. 自定义：可在管理模式下添加新的分类。',
    usageMethods: '1. 浏览顶部分类按钮；2. 点击特定分类查看该类商品；3. 点击“全部”查看所有商品；4. 点击“已购买”查看拥有的商品；5. 在管理模式下添加新分类。',
    updateTime: '2026-01-17'
  },
  
  'shop-blindbox': {
    title: '【盲盒系统】指南',
    icon: <Gift size={24} className="text-red-500" />,
    productIntro: '盲盒系统提供随机商品购买体验，用户支付固定费用后随机获得一件商品。这种不确定性增加了购物的乐趣，同时也有机会获得高价值商品。',
    underlyingPrinciple: '基于随机奖励机制，利用不确定性带来的兴奋感增强用户参与度。结合概率分布算法，确保盲盒体验既有惊喜又相对公平。',
    coreRules: '1. 固定价格：盲盒价格固定，购买后随机获得商品；2. 随机性：无法预知将获得哪件商品；3. 价值区间：获得商品价值通常在投入金额的0.5-1.5倍之间；4. 乐趣导向：注重购物过程的娱乐性而非性价比。',
    usageMethods: '1. 点击“盲盒”分类进入盲盒页面；2. 查看不同价位的盲盒选项；3. 选择盲盒并支付相应费用；4. 等待系统随机分配商品；5. 获得商品后查看详情。',
    updateTime: '2026-01-17'
  },
  
  // 角色系统帮助卡片
  character: {
    title: '【角色系统】行动指南',
    icon: <User size={24} className="text-green-500" />,
    productIntro: '角色系统是人生游戏化平台的核心成长模块，通过经验、专注、财富三个维度的等级体系，记录用户的成长历程和成就。该系统与任务管理、积分系统深度联动，为用户提供清晰的成长路径和持续的行动激励。',
    underlyingPrinciple: '基于RPG游戏角色成长机制和马斯洛需求层次理论设计，通过多维度的等级体系满足用户的成就需求和成长欲望。结合游戏化设计心理学，将用户的日常行为转化为角色成长数据，增强用户的参与感和归属感。',
    coreRules: '角色等级分为经验等级、专注等级、财富等级三大类；经验等级通过完成任务获得经验值提升；专注等级通过番茄钟专注时间积累提升；财富等级通过任务奖励和积分积累提升；每个等级对应不同的称号和特权；等级提升可解锁新的功能和内容。',
    usageMethods: '1. 查看角色系统卡片了解当前等级状态；2. 完成任务、使用番茄钟积累专注时间、获得积分奖励可提升对应等级；3. 双击等级数值可手动调整等级（仅开发模式）；4. 等级提升后会自动解锁对应勋章和特权；5. 定期查看等级进度，设定合理的成长目标；6. 结合任务管理系统，制定针对性的等级提升策略。',
    updateTime: '2025-12-31'
  },
  
  // 番茄钟系统帮助卡片
  pomodoro: {
    title: '【番茄钟系统】行动指南',
    icon: <Clock size={24} className="text-red-500" />,
    productIntro: '番茄钟系统是一款基于番茄工作法的时间管理工具，通过25分钟专注+5分钟休息的循环模式，帮助用户提高专注力，避免拖延，平衡工作与休息，提升工作效率。该系统与任务管理、积分系统深度联动，为用户提供多维度的专注反馈。',
    underlyingPrinciple: '基于番茄工作法和注意力管理理论设计，通过固定的时间周期训练用户的专注能力。结合游戏化元素，将专注时间转化为积分和经验奖励，增强用户的持续动力。通过休息间隔设计，避免用户过度疲劳，保持长期高效状态。',
    coreRules: '默认专注时长25分钟，休息时长5分钟；支持自定义专注和休息时长；专注完成后获得积分和经验奖励；连续完成多个番茄钟可获得额外奖励；支持暂停、重置、跳过等操作；专注状态下支持全面屏沉浸式模式，隐藏所有无关界面元素，提供极致专注环境；全面屏模式下可通过快捷键或指定操作退出。',
    usageMethods: '1. 进入番茄钟系统，设置合适的专注时长；2. 点击"开始"按钮进入专注模式；3. 点击"全面屏"按钮或勾选"沉浸式模式"选项进入全屏专注状态，系统会隐藏所有无关界面元素，仅显示核心计时信息；4. 全面屏模式下可通过点击屏幕或按下ESC键（部分设备）退出全屏；5. 专注结束后自动进入休息模式，休息时长结束后可选择继续专注或结束；6. 查看专注统计数据，了解自身专注习惯；7. 结合任务管理系统，将番茄钟与具体任务关联，提升任务完成效率；8. 建议在安静环境下使用全面屏模式，获得最佳专注体验。',
    updateTime: '2026-01-09'
  },
  
  // 命运骰子帮助卡片
  fateDice: {
    title: '【命运骰子】行动指南',
    icon: <Dice5 size={24} className="text-blue-500" />,
    productIntro: '命运骰子模块是一款以RPG游戏随机事件为核心的行动辅助工具，通过轻量化随机任务/奖励机制，帮助用户降低行动启动门槛，打破规划焦虑，提升执行趣味性，平衡任务压力与休闲反馈。该模块与任务管理系统、积分系统深度联动，为用户提供多样化的行动激励方式。',
    underlyingPrinciple: '基于福格行为模型和可变比率强化原理设计，通过随机奖励机制触发用户的多巴胺分泌，增强行动动力。结合游戏化设计心理学，将复杂任务拆解为微小行动，降低启动摩擦力，同时通过积分反馈机制建立正向行为循环。',
    coreRules: '每日可点击10次骰子，每次点击消耗1次机会；任务分为休闲类（奖励2-5分）、健康类（3-6分）、效率类（5-10分）三种类型；支持"已完成/稍后做/跳过"操作，避免重复抽取历史任务；完成任务可获得对应积分，积分可用于兑换奖励或提升等级；每日凌晨0点重置次数。',
    usageMethods: '1. 点击命运骰子图标启动模块；2. 点击骰子按钮生成随机任务；3. 根据任务类型选择执行方式；4. 完成任务后点击"已完成"领取积分；5. 若当前任务不适合，可选择"稍后做"或"跳过"；6. 查看任务历史记录了解完成情况；7. 结合任务管理系统，将重要任务与随机任务结合执行，提升整体效率。',
    updateTime: '2025-12-26'
  },
  
  // 任务管理帮助卡片
  tasks: {
    title: '【任务管理系统】行动指南',
    icon: <Layout size={24} className="text-green-500" />,
    productIntro: '任务管理系统是人生游戏化平台的核心功能模块，用于创建、管理和追踪用户的日常任务、主线任务和随机任务。通过游戏化元素（如经验值、金币、勋章、等级）激励用户完成任务，提升执行力和目标达成率。该系统支持任务分类、拖拽排序、进度可视化、时间管理等核心功能。',
    underlyingPrinciple: '基于GTD（Getting Things Done）时间管理方法论和游戏化激励机制设计，将复杂目标拆解为可执行的任务单元，通过明确的视觉反馈和即时奖励，增强用户的任务完成动力。结合习惯养成心理学，帮助用户建立持续的行动习惯，同时引入随机任务机制降低行动启动门槛。',
    coreRules: '任务分为三大类：日常任务、主线任务和随机任务（命运骰子）；日常任务支持重复设置，每日自动重置；主线任务可包含多个子任务，支持层级管理和拖拽排序；随机任务由命运骰子生成，每日可获得10次随机任务机会；任务可设置优先级、预计时长、奖励等属性；完成任务获得对应经验值和金币；经验值累计达到阈值自动提升等级；连续完成任务可获得额外奖励。',
    usageMethods: '1. 进入作战中心，通过顶部分类按钮切换日常任务、主线任务和随机任务；2. 日常任务：点击任务左侧的圆形按钮标记完成，完成后获得经验和金币奖励；3. 主线任务：点击展开查看子任务，完成所有子任务后主线任务自动完成；4. 随机任务：通过命运骰子生成，可选择立即完成、稍后做或跳过；5. 拖拽任务卡片可调整任务顺序；6. 点击"管理"按钮进入任务管理模式，可创建、编辑、删除任务；7. 查看任务进度条了解整体完成情况；8. 结合番茄钟系统，点击任务右侧的播放按钮直接启动对应时长的专注模式；9. 定期查看任务统计，分析任务完成情况，优化任务策略。',
    updateTime: '2026-01-09'
  },
  
  // 思维中心帮助卡片
  thinkingCenter: {
    title: '【思维中心】行动指南',
    icon: <BookOpen size={24} className="text-blue-500" />,
    productIntro: '思维中心是全系统的智慧引擎，汇集了人类历史上经典的思维模型与底层逻辑。通过结构化的模型解析与可视化设计，协助你升级认知系统，在复杂问题面前实现降维打击。系统采用上图下文的布局设计，为每个思维模型提供完整的知识体系。',
    underlyingPrinciple: '基于查理·芒格的"多元思维模型"理论。将不同学科的底层规律进行跨界整合，构建多维度的认知格栅，从而避免单一视角的盲点，实现更客观、高效的判断与决策。每个思维模型都包含完整的知识结构，确保用户能够全面理解和应用。',
    coreRules: '包含三大核心能力：1. 模型库：检索并学习各领域的经典思维工具；2. 深度解析：每个模型提供完整的知识结构，包括模型描述、核心原则、应用范围、使用技巧、实践建议；3. 可视化：通过直观图表辅助理解复杂抽象的概念，采用上图下文的布局设计，增强学习体验。',
    usageMethods: '1. 通过搜索栏快速定位所需的思维模型；2. 浏览模型分类，系统学习特定领域的决策工具；3. 查看可视化图表（上图），快速捕捉模型的核心逻辑和视觉表达；4. 研读深度解析（下文），掌握模型的完整知识结构：模型描述：理解模型的基本概念和核心思想；核心原则：掌握模型的底层逻辑和关键规则；应用范围：了解模型适用于哪些场景和问题；使用技巧：学习如何高效应用模型的实用方法；实践建议：获取具体的实施步骤和注意事项；5. 结合当前面临的难题，选择合适的模型进行推演和应用；6. 三击模型按钮可将其添加到收藏，方便后续快速访问。',
    updateTime: '2026-01-30'
  },
  
  // 成就系统帮助卡片
  achievements: {
    title: '【勋章系统】行动指南',
    icon: <Target size={24} className="text-yellow-500" />,
    productIntro: '勋章系统是人生游戏化平台的核心激励机制，通过达成特定条件解锁勋章，记录用户的成长历程和成就。该系统包含六大分类勋章，覆盖用户在平台上的各类行为，为用户提供长期的奋斗目标和荣誉感。',
    underlyingPrinciple: '基于成就激励理论和收集癖心理学设计，通过可视化的勋章展示，满足用户的成就感和收藏欲望。结合渐进式难度设计，从简单到复杂的勋章解锁路径，持续激励用户提升自我，探索平台更多功能。',
    coreRules: '勋章分为等级、专注、财富、战斗、签到、消费六大类；每种勋章有不同的解锁条件和奖励；达成条件后自动解锁，显示通知并记录；勋章解锁后永久保存，不可撤销；部分高级勋章需要完成特定组合条件；勋章数量和等级是用户在平台成就的重要衡量标准。',
    usageMethods: '1. 进入荣誉大厅查看所有勋章分类；2. 点击勋章查看详细解锁条件；3. 根据自身目标选择适合的勋章挑战；4. 完成对应行为自动解锁勋章；5. 查看勋章墙展示已获得的勋章；6. 分享勋章成就到社交平台；7. 追踪未解锁勋章的进度，制定针对性的达成策略。',
    updateTime: '2025-12-26'
  },
  
  // 主题切换帮助卡片
  theme: {
    title: '【主题切换】行动指南',
    icon: <Zap size={24} className="text-purple-500" />,
    productIntro: '主题切换功能允许用户在浅色、深色和拟态主题之间自由切换，根据个人偏好和使用场景调整界面风格。该功能支持实时预览和自动保存，为用户提供舒适的视觉体验。',
    underlyingPrinciple: '基于用户体验设计原则和色彩心理学设计，提供多种主题选择以适应不同环境和个人偏好。拟态主题采用现代设计风格，通过柔和的阴影和凸起效果营造层次感；深色主题适合夜间使用，减少眼睛疲劳；浅色主题适合白天使用，提供清晰的视觉体验。',
    coreRules: '支持三种主题模式：浅色、深色、拟态；主题设置实时生效，无需重启应用；主题偏好自动保存，下次打开时保持上次选择；所有模块界面均会同步应用主题设置；支持手动切换和自动跟随系统主题（未来版本）。',
    usageMethods: '1. 进入设置中心，找到"主题设置"选项；2. 点击主题预览图切换主题；3. 观察界面实时变化，选择心仪的主题；4. 主题设置自动保存，下次打开应用时自动应用；5. 根据使用场景随时切换主题，如夜间使用深色主题保护眼睛，白天使用浅色主题提高清晰度。',
    updateTime: '2025-12-26'
  },
  
  // 音效设置帮助卡片
  sound: {
    title: '【音效系统】行动指南',
    icon: <Clock size={24} className="text-red-500" />,
    productIntro: '音效系统为人生游戏化平台提供沉浸式的听觉体验，通过不同场景的音效反馈，增强用户的交互体验和情感连接。该系统支持音效类型选择、音量调整和静音功能，满足用户的个性化需求。',
    underlyingPrinciple: '基于多媒体交互设计原则和听觉反馈心理学设计，通过声音信号增强用户对操作的感知和记忆。不同类型的音效（如成功、通知、点击）能够传递不同的情感信息，增强用户的参与感和沉浸感。',
    coreRules: '支持多种音效类型，包括成功、通知、点击等；可调整全局音效音量或单独设置特定音效；支持完全关闭音效；点击"试听"按钮可预览所选音效；音效设置自动保存，下次打开应用时保持上次选择；部分高级音效需要解锁特定勋章才能使用。',
    usageMethods: '1. 进入设置中心，找到"音效设置"选项；2. 调整全局音量滑块设置总体音量；3. 点击具体音效类型旁的"试听"按钮预览效果；4. 根据个人喜好开启或关闭特定音效；5. 若需要安静环境，可点击"静音"按钮关闭所有音效；6. 完成设置后自动保存，下次打开应用时自动应用。',
    updateTime: '2025-12-26'
  },
  
  // 显示设置帮助卡片
  display: {
    title: '【显示设置】行动指南',
    icon: <Layout size={24} className="text-indigo-500" />,
    productIntro: '显示设置允许用户自定义界面元素的显示/隐藏状态，根据个人需求调整界面复杂度，简化视觉干扰，提升使用体验。该功能支持实时预览和自动保存，为用户提供个性化的界面定制能力。',
    underlyingPrinciple: '基于极简设计原则和用户认知负荷理论设计，允许用户根据自身需求调整界面元素，减少不必要的视觉干扰，提升信息获取效率。通过个性化定制，增强用户对平台的掌控感和归属感。',
    coreRules: '支持对各类界面元素（如模块入口、统计卡片、动画效果等）进行显示/隐藏设置；所有显示选项默认全部打开；设置实时生效，无需重启应用；显示设置自动保存，下次打开应用时保持上次选择；隐藏特定模块不会影响其功能，仅隐藏入口。',
    usageMethods: '1. 进入设置中心，找到"显示设置"选项；2. 查看所有可调整的显示选项；3. 点击开关按钮开启或关闭对应元素；4. 观察界面实时变化，调整到满意的状态；5. 若需要恢复默认设置，可点击"重置显示设置"按钮；6. 根据使用习惯定期调整显示设置，保持界面简洁高效。',
    updateTime: '2025-12-26'
  },
  
  // 数据管理帮助卡片
  data: {
    title: '【数据管理】行动指南',
    icon: <Wallet size={24} className="text-emerald-500" />,
    productIntro: '数据管理功能允许用户备份、恢复和重置游戏数据，保障数据安全，支持跨设备迁移和数据重置。该功能为用户提供全面的数据管理能力，确保游戏进度和个人信息的安全可靠。',
    underlyingPrinciple: '基于数据安全和用户隐私保护原则设计，提供完善的数据备份和恢复机制，防止数据丢失。结合用户需求，支持灵活的数据管理选项，包括全量备份、选择性恢复和数据重置等功能。',
    coreRules: '支持将游戏数据导出为JSON文件备份；可从备份文件中恢复数据，回到之前的游戏状态；重置所有数据会清空所有游戏进度，包括经验、财富、任务记录等；数据操作不可逆，执行前需确认；备份文件包含所有游戏数据，建议定期备份；支持手动备份和自动备份（未来版本）；支持通过WebDAV和百度网盘进行云端备份。',
    usageMethods: '1. 进入设置中心，找到"数据管理"选项；2. 点击"导出数据"按钮将当前游戏数据备份到本地；3. 保存备份文件到安全位置，如云端存储或外部硬盘；4. 若需要恢复数据，点击"导入数据"按钮，选择之前的备份文件；5. 确认恢复操作，等待数据导入完成；6. 若需要重新开始游戏，点击"重置所有数据"按钮，注意此操作不可逆；7. 定期备份数据，确保游戏进度安全。\n\n【WebDAV云端备份教程】\n1. 进入设置中心，找到"数据管理"选项，切换到"云端备份"标签；2. 选择"WebDAV"作为云服务提供商；3. 输入WebDAV服务器地址（如：https://dav.jianguoyun.com/dav/）；4. 输入WebDAV服务器的用户名和密码；5. 点击"保存WebDAV配置"按钮；6. 点击"备份到WebDAV"按钮，将数据备份到云端；7. 若需要从WebDAV恢复数据，点击"从WebDAV恢复"按钮。\n\n【百度网盘云端备份教程】\n1. 登录百度开放平台（https://developer.baidu.com/），创建一个应用；2. 在应用详情页的"安全设置"中，设置"OAuth授权回调"为：http://localhost:3000/baidu-netdisk-callback；3. 等待1小时让回调地址生效；4. 在设置中心，找到"数据管理"选项，切换到"云端备份"标签；5. 选择"百度网盘"作为云服务提供商；6. 输入百度开放平台上的AppKey和SecretKey；7. 点击"授权百度网盘"按钮，在新打开的页面中完成授权；8. 授权成功后，点击"备份到百度网盘"按钮，将数据备份到云端；9. 若需要从百度网盘恢复数据，点击"从百度网盘恢复"按钮。',
    updateTime: '2026-02-07'
  },
  
  // 图表汇总帮助卡片
  charts: {
    title: '【图表汇总】行动指南',
    icon: <BarChart2 size={24} className="text-orange-500" />,
    productIntro: '图表汇总模块提供多种数据可视化图表，帮助用户直观了解自身的行为模式、任务完成情况和成长历程。通过图表分析，用户可以更好地认识自己，优化行动策略，提升目标达成率。',
    underlyingPrinciple: '基于数据可视化理论和用户认知心理学设计，将复杂的行为数据转化为直观的图表形式，帮助用户快速理解数据背后的规律。结合游戏化元素，通过图表展示用户的成长轨迹，增强成就感和动力。',
    coreRules: '提供多种图表类型，包括马斯洛需求层次图、福格行为模型、任务完成趋势图等；图表支持交互操作，如点击查看详细信息、拖拽排序等；图表数据实时更新，反映最新状态；支持自定义图表显示顺序；部分高级图表需要解锁特定勋章才能查看。',
    usageMethods: '1. 进入图表汇总模块，查看各类图表；2. 点击图表按钮查看详细信息和深度解析；3. 拖拽图表调整显示顺序，将常用图表放在前面；4. 结合任务管理系统，根据图表分析结果调整任务策略；5. 定期查看图表，追踪自身成长轨迹；6. 分享有价值的图表分析到社交平台，与他人交流成长经验。',
    updateTime: '2025-12-26'
  },
  
  // 图表深度解析帮助卡片
  chartDetail: {
    title: '【图表深度解析模块】指南',
    icon: <BarChart2 size={24} className="text-blue-500" />,
    productIntro: '图表深度解析模块用于对当前展示的图表进行全面解析，包含核心原理、适用范围、操作建议、实践案例和可视化设计描述五个部分，帮助用户深入理解图表背后的思维模型和应用方法。',
    underlyingPrinciple: '基于认知学习理论和思维模型教学法设计，将复杂的思维模型拆解为核心原理、适用范围、操作建议、实践案例和可视化设计五个维度，通过结构化的解析方式，帮助用户快速掌握和应用各种思维模型。',
    coreRules: '每个图表包含五个解析部分：核心原理（图表所基于的底层理论）、适用范围（图表适用于哪些场景）、操作建议（如何应用图表中的思维模型）、实践案例（实际应用中的具体例子）、可视化设计描述（图表的设计规范和实现要求）；点击图表深度解析模块右侧的帮助按钮可查看此指南；所有图表的解析内容均遵循统一的撰写规范。',
    usageMethods: '1. 进入图表汇总模块，选择感兴趣的图表；2. 查看图表深度解析模块的五个部分内容，全面理解图表；3. 根据操作建议尝试应用图表中的思维模型；4. 参考实践案例，结合自身情况进行调整；5. 若需了解撰写规范，点击帮助按钮查看详细指南；6. 定期回顾不同图表的解析内容，深化对各种思维模型的理解。',
    updateTime: '2026-01-01'
  },
  
  // 设置中心帮助
  settings: {
    title: '【设置中心】行动指南',
    icon: <Settings size={24} className="text-gray-500" />,
    productIntro: '设置中心是人生游戏化平台的核心配置界面，提供主题设置、音效设置、显示设置、数据管理等多种配置选项。用户可以通过设置中心个性化定制平台的各项功能，打造属于自己的游戏化体验。',
    underlyingPrinciple: '基于用户中心设计原则，将所有可配置选项集中管理，提供直观的界面和清晰的操作流程。通过模块化设计，支持灵活扩展新的设置选项，适应平台功能的不断迭代和用户需求的变化。',
    coreRules: '设置中心包含主题、音效、显示、数据等多个配置模块；所有设置实时生效，无需重启应用；设置自动保存，下次打开应用时保持上次选择；部分高级设置需要达到一定等级才能解锁；支持重置所有设置到默认状态。',
    usageMethods: '1. 点击平台右上角的设置图标进入设置中心；2. 浏览各个设置模块，找到需要调整的选项；3. 根据个人需求修改设置，观察实时效果；4. 完成设置后自动保存，无需额外操作；5. 若需要恢复默认设置，可在对应模块中点击"重置"按钮；6. 定期检查设置中心，了解新增加的配置选项；7. 根据使用反馈，合理调整各项设置，优化使用体验。',
    updateTime: '2025-12-26'
  },
  
  // 签到系统帮助
  checkin: {
    title: '【签到系统】行动指南',
    icon: <Calendar size={24} className="text-blue-500" />,
    productIntro: '签到系统是人生游戏化平台的核心激励机制之一，通过每日签到获得积分、经验值和特殊奖励，培养用户的平台粘性和持续使用习惯。该系统支持连续签到奖励机制，激励用户长期坚持。',
    underlyingPrinciple: '基于习惯养成心理学和可变比率强化原理设计，通过每日签到的仪式感和即时奖励，帮助用户建立持续使用平台的习惯。结合连续签到奖励机制，利用损失厌恶心理，增强用户的签到动力。',
    coreRules: '每日可签到一次，获得固定积分和经验值；连续签到天数越多，获得的额外奖励越丰厚；签到奖励自动发放，无需手动领取；签到记录永久保存，可在个人资料中查看；签到系统与平台其他模块深度联动，签到可解锁特殊任务和勋章。',
    usageMethods: '1. 进入签到系统模块，点击"签到"按钮完成每日签到；2. 查看连续签到天数和累计签到天数；3. 领取连续签到的特殊奖励；4. 查看签到历史记录，了解自身签到习惯；5. 结合任务管理系统，将签到作为每日必做任务之一；6. 利用签到奖励，加速提升等级和获取勋章。',
    updateTime: '2026-01-08'
  },
  
  // 心法模块帮助
  mantra: {
    title: '【心法模块】行动指南',
    icon: <BookOpen size={24} className="text-purple-500" />,
    productIntro: '心法模块是人生游戏化平台的心灵成长功能，通过每日更换正能量金句，帮助用户培养积极心态，提升内在能量。该系统支持自定义金句、编辑和删除功能，为用户提供个性化的心灵成长体验。',
    underlyingPrinciple: '基于积极心理学和神经语言编程（NLP）理论设计，通过每日接触正能量金句，潜移默化地影响用户的思维模式和情绪状态。结合个性化定制功能，让用户能够根据自身需求选择和创建适合自己的心法金句。',
    coreRules: '系统内置多条正能量金句，每日自动切换；支持用户添加自定义金句，丰富心法库；可编辑和删除现有金句，保持心法库的新鲜度；心法金句支持分享功能，传播正能量；心法模块与专注系统联动，可在专注模式显示当前心法。',
    usageMethods: '1. 进入心法模块，查看当前显示的心法金句；2. 点击"更换金句"按钮切换到下一条；3. 点击"管理金句"按钮进入金句管理页面；4. 点击"添加金句"按钮创建自定义金句；5. 对现有金句进行编辑或删除操作；6. 定期更新心法库，保持积极的心态和能量。',
    updateTime: '2026-01-08'
  },
  
  // 军工模块帮助
  military: {
    title: '【军工模块】行动指南',
    icon: <Crosshair size={24} className="text-red-500" />,
    productIntro: '军工模块是人生游戏化平台的战斗系统，通过完成任务获得战斗经验和军工积分，提升军事等级和获得军事勋章。该系统支持战斗数据统计、等级提升和勋章解锁功能，为用户提供战斗维度的成长体验。',
    underlyingPrinciple: '基于游戏化战斗系统设计，将用户的任务完成行为转化为战斗数据，通过军事等级和勋章系统，增强用户的成就感和竞争意识。结合数据可视化，让用户直观了解自身的战斗实力和成长轨迹。',
    coreRules: '完成任务获得战斗经验和军工积分；战斗经验累计达到阈值自动提升军事等级；军事等级对应不同的军事头衔和特权；军工积分可用于兑换特殊奖励和勋章；支持查看战斗统计数据，了解自身战斗表现。',
    usageMethods: '1. 进入军工模块，查看当前军事等级和头衔；2. 查看战斗统计数据，了解任务完成情况；3. 完成任务获得战斗经验和军工积分；4. 提升军事等级，解锁新的军事头衔和特权；5. 用军工积分兑换特殊奖励和勋章；6. 查看军事排行榜，与其他用户比较战斗实力。',
    updateTime: '2026-01-08'
  },
  
  // 专注时间系统帮助
  focusTime: {
    title: '【专注时间系统】行动指南',
    icon: <Clock size={24} className="text-green-500" />,
    productIntro: '专注时间系统是人生游戏化平台的核心功能之一，通过记录用户的专注时间，帮助用户培养专注习惯，提升工作效率。该系统支持多种专注模式、时间统计和分析功能，为用户提供全面的专注管理体验。',
    underlyingPrinciple: '基于番茄工作法和注意力管理理论设计，通过固定的专注时间周期和清晰的视觉反馈，帮助用户培养专注习惯。结合数据统计和分析功能，让用户直观了解自身的专注模式和效率，优化时间管理策略。',
    coreRules: '支持多种专注模式，包括标准番茄钟、自定义时长等；专注时间自动累计，记录到个人统计数据中；专注时间可转换为经验值和积分奖励；支持专注状态下的沉浸式模式，减少外界干扰；提供专注时间统计和分析功能，帮助用户优化专注习惯。',
    usageMethods: '1. 进入专注时间系统，选择适合的专注模式；2. 设置专注时长，点击"开始"按钮进入专注状态；3. 专注结束后查看专注时间统计；4. 查看专注历史记录，了解自身专注习惯；5. 结合任务管理系统，将专注时间与具体任务关联；6. 根据专注数据分析，调整专注策略，提升专注效率。',
    updateTime: '2026-01-08'
  },
  
  // 系统稳定性帮助
  'system-stability': {
    title: '【系统稳定性】行动指南',
    icon: <Activity size={24} className="text-emerald-500" />,
    productIntro: '系统稳定性代表了你当前生活系统的有序程度。它是由熵值决定的：稳定性 = 100% - 熵值。',
    underlyingPrinciple: '基于热力学第二定律（熵增定律）设计。在封闭系统中，事物总是趋向于混乱。通过完成习惯和任务，你向系统输入"负熵"，从而维持系统的稳定。',
    coreRules: '熵值越高，系统越混乱；完成每日习惯任务可有效降低熵值；长时间不作为会导致熵值自动增加（熵增）；低稳定性可能会触发系统负面事件或降低奖励。',
    usageMethods: '1. 查看导航栏下方的系统稳定性进度条；2. 优先完成高亮显示的习惯任务以降低熵值；3. 维持稳定性在80%以上以获得最佳收益；4. 当出现"警告: 熵增过高"时，立即采取行动。',
    updateTime: '2026-01-12'
  },

  // 勋章奖励规则帮助
  'badge-reward-rules': {
    title: '【勋章奖励规则】指南',
    icon: <Trophy size={24} className="text-yellow-500" />,
    productIntro: '勋章奖励规则定义了在达成不同类型的勋章时，用户所获得的经验值和金币的具体计算方式。',
    underlyingPrinciple: '基于游戏平衡性设计，确保不同难度的成就对应合理的激励强度。通过比例化奖励，让高价值的目标产生更高的成就感。',
    coreRules: '默认规则：1. 经验类勋章：仅奖励经验值，通常为目标值的10%；2. 金币类勋章：仅奖励金币，通常为目标值的10%；3. 专注时间类：同时奖励经验和金币，均为目标值的10%；4. 消费类勋章：仅奖励金币（返利性质），通常为10%。',
    usageMethods: '1. 在编辑勋章界面查看当前的奖励配置；2. 根据勋章的分类，参考默认比例进行调整；3. 确保奖励值与达成难度相匹配；4. 保存设置后，后续解锁该勋章的用户将按新规则获得奖励。',
    updateTime: '2026-01-12'
  },

  // 背景音乐系统帮助
  'bg-music': {
    title: '【背景音乐系统】行动指南',
    icon: <Music size={24} className="text-blue-500" />,
    productIntro: '背景音乐系统为人生游戏化平台提供沉浸式的听觉体验，通过多种类型的背景音乐，帮助用户在不同场景下保持专注或放松。该系统支持音乐选择、快速切换、收藏锁定和播放统计等功能，为用户提供个性化的音频体验。',
    underlyingPrinciple: '基于音频心理学和环境设计理论，不同类型的音乐对人的情绪和专注力有不同的影响。背景音乐系统通过提供多种音乐选择，帮助用户创建适合当前任务的环境氛围，提高工作效率和体验感。系统还会记录播放统计，优化音乐排序和推荐。',
    coreRules: '支持多种音乐类型，包括自然音效（森林、海浪、雨声等）、脑波音乐（阿尔法波、贝塔波、希塔波）和环境音效（咖啡馆、壁炉等）；首次加载时按播放次数排序音乐；支持音乐搜索和快速切换功能；支持单曲播放模式；提供歌曲锁定和收藏功能；自动记录播放统计；音乐状态（上次播放、音量等）自动保存。',
    usageMethods: '1. 点击音乐图标打开背景音乐选择器；2. 使用搜索框查找特定音乐；3. 单击音乐卡片切换播放的音乐；4. 双击音乐卡片锁定/解锁歌曲；5. 三击音乐卡片收藏/取消收藏歌曲；6. 使用上一首/下一首按钮快速切换音乐；7. 音乐播放状态自动保存，下次打开应用时自动恢复；8. 系统会自动记录播放统计，优化音乐排序。',
    updateTime: '2026-01-20'
  },

  // 作战中心帮助卡片
  'mission-control': {
    title: '【作战中心】行动指南',
    icon: <Target size={24} className="text-red-500" />,
    productIntro: '作战中心是全系统的战略指挥中枢，汇集了实时情报、命运挑战、核心战役及日常勤务。通过数据可视化与随机事件驱动，协助你掌控生活节奏，实现高效决策与行动。',
    underlyingPrinciple: '基于 OODA 循环（观察-判断-决策-行动）与游戏化指挥部逻辑。将枯燥的任务转化为具体的战役目标，利用实时反馈维持行动张力，通过命运随机性对抗决策疲劳。',
    coreRules: '包含四个核心区域：1. 实时情报：监控专注趋势与签到状态；2. 命运骰子：抽取每日随机行动；3. 战略战役：管理长期主线任务；4. 每日勤务：处理循环习惯任务。所有行动均产出经验值与金币。',
    usageMethods: '1. 每日启动后首先进行签到并查看实时情报；2. 投掷命运骰子获取突发灵感任务；3. 在主线任务中拆解并推进大型项目；4. 勾选日常任务维持基础稳定性；5. 通过点击各模块的帮助图标获取更细致的战术指导。',
    updateTime: '2026-01-12'
  },
  
  // 时间盒子帮助卡片
  'time-box': {
    title: '【时间盒子】行动指南',
    icon: <Clock size={24} className="text-blue-500" />,
    productIntro: '时间盒子是基于Elon Musk时间管理方法论的时间管理工具，通过将时间分割成固定长度的时间段，每个时间段专注于单一任务，帮助用户提高专注力和工作效率。',
    underlyingPrinciple: '基于Elon Musk的时间管理方法论和时间约束原理设计，通过有限时间倒逼高效产出，让用户在多任务中保持专注，告别无效忙碌。结合游戏化元素，将时间管理转化为可视化的任务完成过程。',
    coreRules: '时间切割：将时间分割成固定长度的时间段（盒子）；优先级排序：80%时间投入高价值任务；执行原则：一次只做一件事，时间到就切换；动态调度：按任务优先级实时调整日程；任务筛选：用"收益≥2×时间成本"筛掉无效项。',
    usageMethods: '1. 添加任务并设置优先级和预计时长；2. 点击"开始专注"进入时间盒子倒计时；3. 专注结束后标记任务完成状态；4. 查看统计数据了解完成率和效率得分；5. 定期复盘优化时间盒设计和执行策略。',
    detailedContent: `
      <div class="space-y-6">
        <div>
          <h4 class="text-lg font-medium mb-3">本质与核心理念</h4>
          <ul class="space-y-3">
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
              <span>定义：为任务设明确时间边界，时间一到强制结束，不无限延展。</span>
            </li>
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
              <span>核心差异：待办清单是"线性无限"，时间盒是"空间有限"，把任务变成日历上的"硬预约"。</span>
            </li>
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
              <span>底层逻辑：用"物理式时间约束"替代"弹性任务清单"，用5分钟颗粒度把时间变成可量化、可执行的资源，匹配"第一性原理"的效率思维。</span>
            </li>
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
              <span>关键效应：截止预期效应，略紧的时限带来紧迫感，提升专注与效率。</span>
            </li>
          </ul>
        </div>
        
        <div>
          <h4 class="text-lg font-medium mb-3">马斯克式执行细节</h4>
          <ul class="space-y-3">
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
              <span>时间切割：醒着的18小时切成216个5分钟"盒子"，连接水、会议、回复邮件都精准入盒。</span>
            </li>
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
              <span>优先级排序：80%时间投入高价值任务（如工程设计、核心决策），低价值任务直接剔除。</span>
            </li>
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
              <span>执行原则：一次只做一件事，时间到就切换，不纠结未完成部分，避免"完美主义陷阱"。</span>
            </li>
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
              <span>动态调度：按任务优先级实时调整日程，允许计划外中断，但每月设"熔断机制"防系统崩溃。</span>
            </li>
          </ul>
        </div>
        
        <div>
          <h4 class="text-lg font-medium mb-3">普通人可复制的四步流程</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-medium mb-2">1. 任务筛选与排序</h5>
              <ul class="space-y-2 pl-4">
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>列出所有待办，用"收益≥2×时间成本"筛掉无效项。</span>
                </li>
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>按"重要且紧急＞重要不紧急＞紧急不重要＞不紧急不重要"排序，锁定核心任务。</span>
                </li>
              </ul>
            </div>
            <div>
              <h5 class="font-medium mb-2">2. 时间盒设计</h5>
              <ul class="space-y-2 pl-4">
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>颗粒度：日常用15-60分钟（新手不建议5分钟），按任务复杂度拆分。</span>
                </li>
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>时长设定：比预估短10%-20%（如预估1小时设50分钟），制造合理压力。</span>
                </li>
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>精力匹配：把高认知任务（创意、决策）放在10:00-11:30，机械任务放14:00-15:00等低谷期。</span>
                </li>
              </ul>
            </div>
            <div>
              <h5 class="font-medium mb-2">3. 专注执行</h5>
              <ul class="space-y-2 pl-4">
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>启动倒计时，期间关闭手机通知，拒绝多线程，专注单任务。</span>
                </li>
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>遇到卡壳：用"马斯克三连击"→写阻碍→算解决成本→立即执行或永久删除（犹豫超5分钟放弃）。</span>
                </li>
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>时间到即停，记录完成度，不拖延到下一盒。</span>
                </li>
              </ul>
            </div>
            <div>
              <h5 class="font-medium mb-2">4. 复盘优化</h5>
              <ul class="space-y-2 pl-4">
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>每日花5分钟记录实际耗时与预估偏差，迭代后续时间盒时长。</span>
                </li>
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>每周回看优先级与任务筛选，剔除持续低价值事项。</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div>
          <h4 class="text-lg font-medium mb-3">避坑要点与工具推荐</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-medium mb-2">避坑要点</h5>
              <ul class="space-y-2 pl-4">
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>不贪多：每天核心任务不超3个，避免计划过载。</span>
                </li>
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>留缓冲：每2-3个盒子间留5-10分钟弹性，应对突发。</span>
                </li>
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>接受不完美：时间盒的核心是"完成度"而非"完美度"，避免因未做完而焦虑。</span>
                </li>
              </ul>
            </div>
            <div>
              <h5 class="font-medium mb-2">工具推荐</h5>
              <ul class="space-y-2 pl-4">
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>日历类：谷歌日历、Outlook、苹果日历（直接拖拽创建时间块）。</span>
                </li>
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>专注类：Forest、番茄ToDo（倒计时+专注模式）。</span>
                </li>
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>复盘类：Notion、Excel（记录耗时与完成度，生成周/月报表）。</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div>
          <h4 class="text-lg font-medium mb-3">常见问题与解决</h4>
          <ul class="space-y-3">
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
              <span>问题1：时间到任务没做完？→停止并标记"未完成"，移至下一个盒子或重新评估优先级，不占用其他任务时间。</span>
            </li>
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
              <span>问题2：频繁被打断？→设"免打扰时段"，非紧急事务集中处理（如每天16:00统一回消息）。</span>
            </li>
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
              <span>问题3：坚持不了？→从3个时间盒/天开始，逐步增加，用"完成奖励"（如休息10分钟）强化习惯。</span>
            </li>
          </ul>
        </div>
        
        <div>
          <h4 class="text-lg font-medium mb-3">与其他方法的区别</h4>
          <ul class="space-y-3">
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
              <span>时间盒 vs 番茄工作法：番茄是25分钟固定时长+5分钟休息；时间盒按任务设时长，更灵活。</span>
            </li>
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
            </li>
          </ul>
        </div>
      </div>
    `,
    updateTime: '2026-01-30'
  },
  
  // 番茄钟全屏模式帮助卡片
  'pomodoro-guide': {
    title: '【番茄钟全屏模式】使用指南',
    icon: <Clock size={24} className="text-red-500" />,
    productIntro: '番茄钟全屏模式是一款基于番茄工作法的沉浸式时间管理工具，提供3D大陆和时间盒子两种模式，通过全屏沉浸式体验帮助用户提高专注力，避免干扰，提升工作效率。',
    underlyingPrinciple: '基于番茄工作法和注意力管理理论设计，通过沉浸式全屏模式减少外界干扰，培养用户的专注能力。结合3D可视化和游戏化元素，将专注时间转化为植物生长和任务完成的可视化反馈，增强用户的持续动力。',
    coreRules: '支持两种模式：3D大陆模式（可视化植物生长）和时间盒子模式（简洁专注界面）；默认专注时长25分钟，支持自定义时长；专注完成后获得积分和经验奖励；支持暂停、重置等操作；全屏模式下可通过右上角按钮退出或切换模式；支持主题切换，适应不同使用环境。',
    usageMethods: '1. 点击任务右侧的"开始专注"进入番茄钟全屏模式；2. 默认进入3D大陆模式，可点击右上角按钮切换到时间盒子模式；3. 点击中心圆环开始专注；4. 专注结束后获得奖励并可选择继续或退出；5. 使用左上角的主题切换按钮调整界面风格；6. 点击问号按钮查看本指南。',
    detailedContent: `
      <div class="space-y-6">
        <div>
          <h4 class="text-lg font-medium mb-3">模式切换功能详解</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-medium mb-2">3D大陆模式</h5>
              <ul class="space-y-3">
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span><strong>优势：</strong>提供沉浸式3D视觉体验，通过植物生长直观展示专注时间的积累，增加成就感和趣味性。</span>
                </li>
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span><strong>原理：</strong>基于游戏化设计和视觉反馈理论，将抽象的时间概念转化为具体的植物生长过程，通过视觉成就感强化专注行为。</span>
                </li>
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span><strong>使用方法：</strong>在3D大陆模式下，左侧可选择不同种子类型，中心圆环显示倒计时，专注过程中植物会逐渐生长，专注结束后植物成熟并获得奖励。</span>
                </li>
              </ul>
            </div>
            <div>
              <h5 class="font-medium mb-2">时间盒子模式</h5>
              <ul class="space-y-3">
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span><strong>优势：</strong>界面简洁清爽，无任何干扰元素，适合需要极致专注的场景，减少视觉疲劳。</span>
                </li>
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span><strong>原理：</strong>基于极简设计原则和注意力集中理论，通过去除所有无关元素，创造纯净的专注环境，提高信息处理效率。</span>
                </li>
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span><strong>使用方法：</strong>在时间盒子模式下，中央显示大型倒计时，界面简洁明了，专注结束后直接返回任务界面。</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div>
          <h4 class="text-lg font-medium mb-3">核心功能详解</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-medium mb-2">专注计时器</h5>
              <ul class="space-y-2 pl-4">
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>默认25分钟专注时长，可通过底部预设按钮快速切换（1、5、10、25、30、45、60分钟）。</span>
                </li>
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>双击预设时间按钮可自定义时长，满足个性化需求。</span>
                </li>
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>专注过程中可点击中心圆环暂停/继续，点击重置按钮重新开始。</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h5 class="font-medium mb-2">3D大陆种植系统</h5>
              <ul class="space-y-2 pl-4">
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>左侧种子选择器提供多种植物和动物种子，每种种子对应不同的视觉效果。</span>
                </li>
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>专注过程中，种子会逐渐生长，生长速度与专注时间成正比。</span>
                </li>
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>专注结束后，植物成熟并记录到总植物数量中，为用户提供长期的视觉成就感。</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h5 class="font-medium mb-2">背景音乐系统</h5>
              <ul class="space-y-2 pl-4">
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>右下角音乐图标可打开背景音乐选择器，提供多种自然音效和环境音乐。</span>
                </li>
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>音乐按播放次数排序，支持单曲循环和快速切换。</span>
                </li>
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>背景音乐状态自动保存，下次进入时保持上次播放状态。</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div>
          <h4 class="text-lg font-medium mb-3">主题切换功能</h4>
          <ul class="space-y-3">
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
              <span>左上角的月亮/太阳图标可切换系统主题，支持浅色、深色和拟态主题。</span>
            </li>
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
              <span>主题切换会实时应用到整个系统，包括侧边栏和导航栏。</span>
            </li>
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
              <span>深色主题适合夜间使用，减少眼睛疲劳；浅色主题适合白天使用，提供清晰的视觉体验。</span>
            </li>
          </ul>
        </div>
        
        <div>
          <h4 class="text-lg font-medium mb-3">使用技巧与最佳实践</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-medium mb-2">环境准备</h5>
              <ul class="space-y-2 pl-4">
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>选择安静的环境，关闭手机通知，确保专注过程不被打断。</span>
                </li>
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>根据当前任务类型选择合适的模式：创意类任务适合3D大陆模式，需要高度集中的任务适合时间盒子模式。</span>
                </li>
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>选择适合的背景音乐，有助于营造专注氛围（推荐自然音效如森林、雨声）。</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h5 class="font-medium mb-2">执行策略</h5>
              <ul class="space-y-2 pl-4">
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>采用25分钟专注+5分钟休息的番茄工作法循环，保持大脑的最佳状态。</span>
                </li>
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>设置合理的目标，每次专注只处理一个任务，避免多任务切换导致的效率下降。</span>
                </li>
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>利用专注结束后的短暂休息时间，起身活动、喝水或做简单伸展，缓解身体疲劳。</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h5 class="font-medium mb-2">长期坚持</h5>
              <ul class="space-y-2 pl-4">
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>每天固定时间使用番茄钟，培养专注习惯，形成规律性的工作节奏。</span>
                </li>
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>记录每天的专注时长和完成的任务数量，定期复盘，优化时间管理策略。</span>
                </li>
                <li class="flex items-start">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>利用3D大陆模式的植物生长记录，可视化自己的专注积累，增强成就感和持续动力。</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div>
          <h4 class="text-lg font-medium mb-3">常见问题与解决方案</h4>
          <ul class="space-y-3">
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
              <span><strong>问题1：</strong>专注过程中容易分心？→解决方案：选择时间盒子模式，关闭所有无关界面；使用白噪音或自然音效屏蔽外界干扰；设置明确的任务目标，增强专注动力。</span>
            </li>
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
              <span><strong>问题2：</strong>无法坚持完成25分钟专注？→解决方案：从较短时长开始（如10分钟），逐步增加；每完成一个番茄钟给予自己小奖励；使用3D大陆模式，通过植物生长的视觉反馈增强动力。</span>
            </li>
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
              <span><strong>问题3：</strong>切换模式后界面不适应？→解决方案：根据当前任务类型和个人偏好选择合适的模式；尝试在不同环境下使用不同模式，找到最适合自己的专注方式。</span>
            </li>
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
              <span><strong>问题4：</strong>主题切换后视觉效果不佳？→解决方案：根据当前环境光线选择合适的主题；在夜间使用深色主题保护眼睛；如果不确定，可尝试不同主题并观察效果。</span>
            </li>
          </ul>
        </div>
        
        <div>
          <h4 class="text-lg font-medium mb-3">总结与优势回顾</h4>
          <ul class="space-y-3">
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
              <span><strong>双重模式优势：</strong>3D大陆模式提供视觉反馈和游戏化体验，时间盒子模式提供纯净专注环境，满足不同场景需求。</span>
            </li>
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
              <span><strong>沉浸式体验：</strong>全屏模式减少外界干扰，创造专注氛围，提高注意力质量。</span>
            </li>
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
              <span><strong>个性化定制：</strong>支持自定义时长、背景音乐、主题切换，适应不同用户的个性化需求。</span>
            </li>
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
              <span><strong>数据可视化：</strong>通过植物生长和统计数据，直观展示专注时间的积累，增强用户的成就感和持续动力。</span>
            </li>
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
              <span><strong>科学时间管理：</strong>基于番茄工作法的时间分割，结合人类注意力的自然周期，提高工作效率和质量。</span>
            </li>
          </ul>
        </div>
      </div>
    `,
    updateTime: '2026-01-30'
  }
};
