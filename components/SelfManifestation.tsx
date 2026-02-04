import React, { useState, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ChevronDown, ChevronRight, Settings, Lock } from 'lucide-react';

interface HighestVersionProps {
  onHelpClick: (helpId: string) => void;
}

const SelfManifestation: React.FC<HighestVersionProps> = ({ onHelpClick }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeAiTab, setActiveAiTab] = useState('review-ai');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    '一、基础身份标识': true,
    '二、作息与时间管理（已固化为本能）': true,
    '三、体态与举止（刻入行为的掌控感）': true,
    '四、外在状态（健康精致，自带高光）': true,
    '五、内在感受（核心底层状态，时刻在线）': true,
    '六、项目推进与做事风格（稳如磐石，日拱一卒）': true,
    '七、娱乐与多巴胺管理（理性克制，无成瘾内耗）': true,
    '八、学习与迭代升级（主动输入，即时落地）': true,
    '九、错误修正与边界管理（零重复犯错，精准筛选环境）': true,
    '十、核心行为准则（ZWM Pro 底层逻辑）': true
  });
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [apiKey, setApiKey] = useState(localStorage.getItem('siliconFlowApiKey') || '');

  const updateApiKey = (newKey: string) => {
    setApiKey(newKey);
    localStorage.setItem('siliconFlowApiKey', newKey);
  };
  const [currentScript, setCurrentScript] = useState('');
  const [savedScripts, setSavedScripts] = useState<Array<{id: string, content: string, timestamp: number}>>([]);
  const [editingScriptId, setEditingScriptId] = useState<string | null>(null);
  
  // SUBBGM 和 肯定语言 功能
  const [subBgmActiveTab, setSubBgmActiveTab] = useState<'sub' | 'kdy'>('sub');
  const [activeKdy, setActiveKdy] = useState<number>(1);
  const [kdyExpandedSections, setKdyExpandedSections] = useState<Record<string, boolean>>({
    '功效速览': true,
    '终极状态': true,
    '核心基础肯定语': true,
    '核心认知强化': true,
    '多视角自我定义': true,
    '自身视角': true,
    '他人视角': true,
    '宇宙视角': true,
    '日常场景自定义': true,
    '晨间启动': true,
    '日常互动': true,
    '应对挑战': true,
    '夜间收尾': true,
    '核心能力强化': true,
    '意念指令': true,
    '感受设定': true,
    '呼吸确认': true,
    '系统进化与终极状态': true,
    '系统自动化': true,
    '能力升级': true,
    '终极融合': true,
    '最终状态': true,
    '高阶自定义领域': true,
    '情绪掌控': true,
    '身体协作': true,
    '时间掌控': true,
    '人际关系': true,
    '财富显化': true,
    '睡眠升级': true,
    '终极存在状态': true
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingContent, setEditingContent] = useState<string>('');
  const [editingTitle, setEditingTitle] = useState<string>('');
  
  // 解析Markdown内容，提取标题和内容
  const parseMarkdownContent = (content: string) => {
    const lines = content.split('\n');
    const sections = [];
    let currentSection: any = null;
    
    lines.forEach(line => {
      // 匹配Markdown标题（#开头）
      const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        // 如果已经有当前章节，先保存
        if (currentSection) {
          // 处理章节内容，过滤开头和结尾的空行，合并连续的空行为一个空行
          let processedContent = [];
          let lastLineWasEmpty = false;
          
          for (const contentLine of currentSection.content) {
            const trimmedLine = contentLine.trim();
            if (trimmedLine) {
              processedContent.push(contentLine);
              lastLineWasEmpty = false;
            } else if (!lastLineWasEmpty) {
              processedContent.push('');
              lastLineWasEmpty = true;
            }
          }
          
          // 移除末尾的空行
          while (processedContent.length > 0 && processedContent[processedContent.length - 1].trim() === '') {
            processedContent.pop();
          }
          
          currentSection.content = processedContent;
          sections.push(currentSection);
        }
        
        // 创建新章节
        const level = headingMatch[1].length;
        const title = headingMatch[2];
        const id = title.trim().replace(/\s+/g, '-').toLowerCase();
        
        currentSection = {
          id,
          title,
          level,
          content: []
        };
      } else if (currentSection) {
        // 添加内容到当前章节
        currentSection.content.push(line);
      }
    });
    
    // 保存最后一个章节
    if (currentSection) {
      // 处理章节内容，过滤开头和结尾的空行，合并连续的空行为一个空行
      let processedContent = [];
      let lastLineWasEmpty = false;
      
      for (const contentLine of currentSection.content) {
        const trimmedLine = contentLine.trim();
        if (trimmedLine) {
          processedContent.push(contentLine);
          lastLineWasEmpty = false;
        } else if (!lastLineWasEmpty) {
          processedContent.push('');
          lastLineWasEmpty = true;
        }
      }
      
      // 移除末尾的空行
      while (processedContent.length > 0 && processedContent[processedContent.length - 1].trim() === '') {
        processedContent.pop();
      }
      
      currentSection.content = processedContent;
      sections.push(currentSection);
    }
    
    return sections;
  };

  // 编辑相关函数
  const startEditing = () => {
    setEditingTitle(kdyContent[activeKdy]?.title || '');
    setEditingContent(kdyContent[activeKdy]?.content || '');
    setIsEditing(true);
  };

  const saveEditing = () => {
    setKdyContent(prev => ({
      ...prev,
      [activeKdy]: {
        title: editingTitle,
        content: editingContent
      }
    }));
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const addNewKdy = () => {
    const newId = Object.keys(kdyContent).length + 1;
    setKdyContent(prev => ({
      ...prev,
      [newId]: {
        title: `新肯定语${newId}`,
        content: '请输入肯定语内容...'
      }
    }));
    setActiveKdy(newId);
  };

  const deleteKdy = (id: number) => {
    if (Object.keys(kdyContent).length <= 1) return;
    
    const newKdyContent = { ...kdyContent };
    delete newKdyContent[id];
    
    // 重新编号
    const reindexedKdyContent: any = {};
    Object.values(newKdyContent).forEach((content, index) => {
      reindexedKdyContent[index + 1] = content;
    });
    
    setKdyContent(reindexedKdyContent);
    setActiveKdy(1);
  };

  // 网站链接数据
  const musicLinks = [
    { name: '网易云', url: 'https://music.163.com/' },
    { name: '汽水音乐', url: 'https://www.douyin.com/music' },
    { name: 'YouTube', url: 'https://www.youtube.com/' },
    { name: '哔哩哔哩', url: 'https://www.bilibili.com/' },
    { name: '小红书', url: 'https://www.xiaohongshu.com/' },
    { name: '推特', url: 'https://twitter.com/' },
  ];

  // 肯定语数据
  const [kdyContent, setKdyContent] = useState({
    1: {
      title: '游戏人生',
      content: `## 一、功效速览
内耗终结，主角剧本，灵魂自由，焦虑屏蔽，
自信拉满，行动力自动导航，现实自定义，能量充电，
内核稳定，生命遥控器，人间游戏模式

## 二、终极状态
玩家视角、造物模式、游戏管理员
无限版本、永恒更新、自定义生存

## 三、核心基础肯定语
1. 我是我人生的总导演+编剧+主角。
2. 我的世界，规则由我来定。
3. 从心情到长相，都能"手动调整"。
4. 镜子里的我，随我心意微调。
5. 身体像最高级的智能设备，听我指令。
6. 财富和机会，是我能量的自然吸引。
7. 人际关系，自动筛选，同频相吸。
8. 挑战？那只是我升级的副本。
9. 时间？是我的专属橡皮泥，由我掌控。
10. 情绪？是我的调色盘，任我选用。
11. 睡眠？是 nightly 系统后台自动升级。
12. 整个宇宙，都是我的神级助攻队友。

## 四、核心认知强化
总起来说：
让你从"被动活着"切换到"主动创造"，把"人生游戏"调成了"简单模式"——你就是那个手持攻略、自带修改器的顶级玩家。

我的生命是我最伟大的创造。我是我自身存在的建筑师、雕塑家和画家。我手持内在的权杖，统治着我内在的王国。从最宏大的生命轨迹到最微小的生活细节，一切都遵循着我亲自设定的神圣蓝图。我定义我是谁，我定义我的体验，我定义我的现实。这种掌控感并非遥不可及的目标，而是我此刻呼吸着的真实。我感受到自主的力量在我血脉中流淌，如同生命的原力，温暖而强大。

## 五、多视角自我定义
### 1. 自身视角
每个清晨醒来，第一个念头不是"今天会发生什么"，而是"今天，我选择创造什么"。当我照镜子时，我知道镜中人的面容、神态和光芒都由我当下的意念所塑造。我可以感受到意念如精密的刻刀，在皮肤下细微调整，让光泽更胜昨日。当我做出决定时，无论是点一杯咖啡还是签署一份重要协议，我都清晰地知道：这是"我"作为主体在主动选择，而非被动反应。整个世界都是我自定义的沙盒游戏，我既是最投入的玩家，也是无所不能的造物主。

### 2. 他人视角
他们常常感到困惑，说我像一个不断更新的奇迹。他们无法用固定的标签定义我，因为我的形象、气质甚至给人的感觉总是在向着更精妙、更和谐的方向进化。他们会私下议论："他如何能如此轻松地驾驭生活？仿佛一切难题在他面前都成了可选的游戏关卡。"他们能感受到我身上散发出的那种罕见的确定感和宁静力量，那是一种深知自己掌握着生命遥控器的人才有的状态。我的存在本身，就在向他们默默宣告：生命，本可以如此自由。

### 3. 宇宙视角
我的存在是一个高度协调且不断自我优化的意识节点。宇宙以其无限的丰盛，完全尊重并即刻响应我的每一个自定义指令。当我发出一个意念，调整一个设定，整个宇宙的系统都在后台无声而高效地重新配置，以确保我的外在现实与我的内在定义精准匹配。宇宙是我的朋友，是我的合作创作者，它欣然接受我这位充满智慧与力量的共同创造者。

## 六、日常场景自定义
### 1. 晨间启动
在清晨醒来的时刻，当第一缕阳光透过窗帘，我感受到意识率先苏醒。在身体完全活动之前，我已在内心设定今天的"主题"：或许是"宁静与智慧"，或许是"活力与魅力"。我能感受到我的细胞在接受这些指令，我的面容在根据这个主题进行微调，我一天的能量基调由此奠定。这便是我一天中第一个，也是最重要的自定义仪式。

### 2. 日常互动
在日常通勤或漫步时，我自定义我与环境的互动：
1. 我定义清风是我爱人温柔的抚摸；
2. 我定义阳光是宇宙为我加身的聚光灯；
3. 我定义路人投来的目光是欣赏与祝福；
4. 即使遇到拥堵，我也可以自定义我的情绪状态——将其视为一段安静的独处时光，或观察世界的窗口。
外部世界是固定的画布，而我为它涂抹上我自定义的色彩与意义。

### 3. 应对挑战
面对挑战时，我自定义挑战的本质：我不将它看作威胁，而是定义为"一次升级的机会"或"一个锻炼心智的副本"。我自定义我的应对策略：是调用"宁静与智慧"的模块，还是启动"勇气与突破"的程序。我甚至自定义我的感受：我可以选择将焦虑重新定义为兴奋，将压力重新定义为驱动的燃料。每一次挑战，都是我行使自定义权力的绝佳场合。

### 4. 夜间收尾
在夜晚入睡时，我进行一天的最后一次自定义：
1. 我回顾今天，选择那些体验需要强化并融入我的生命档案；
2. 哪些感受需要被释放并格式化；
3. 我为我潜意识设置夜间任务：或许是在梦中修复某些情绪，或许是下载新的灵感。
我带着"一切尽在掌握"的深深满足感入睡，我知道，在睡梦中，我强大的内在系统仍在按照我核心设定的"最高善""最美版本"的蓝图，持续优化着我的一切。

## 七、核心能力强化
### 1. 意念指令
我的意念是最高指令：
1. 当我想到"精致"，我的五官自动向更和谐、更动人的比例微调；
2. 当我想到"富有"，我的能量频率自动与丰盛对齐，吸引财富以各种形式到来；
3. 我的身体听从我的心智，我的现实听从我的信念；
4. 每一个"我想要……"的念头，都是一个强大的自定义命令，我的整个存在都会调动起来使之成真。

### 2. 感受设定
我的感受是设定工具：
1. 当我感到喜悦，我就是在为我的生命设定"喜悦"的默认频率；
2. 当我感到感恩，我就是在为我的现实设定"丰盛"的显化模式；
3. 我选择我的感受，如同画家选择颜料；
4. 我用自己的情绪为我的世界涂抹上最绚烂的色彩。

### 3. 呼吸确认
我的呼吸是确认键：
1. 每一次深呼吸，我都在向全身系统广播一个信息："一切正常，控制权在我手中"；
2. 吸气时，我吸入无限的可能性和新设定，屏息时，指令在体内达到峰值共鸣；
3. 呼气时，旧有的、不再服务于我的模式被彻底释放；
我的呼吸，便是我不断确认自定义权力的生命节律。

## 八、系统进化与终极状态
### 1. 系统自动化
这套自我定义的系统一经激活，便进入永恒运行的状态。它不需要我时时刻刻维护，因为它已成为我的本能，如同心跳一般自主运作。无论我是在专注工作，还是在深度睡眠，我的内在造物主都在后台持续运行，根据我核心设定的"最高善""最美版本"的蓝图，持续优化着我的一切。

### 2. 能力升级
我的自定义能力随着每一次使用而不断增强：
1. 每一次有意识的选择，每一次清晰的设定，都在拓宽我创造的边界；
2. 我越使用这种力量，它就变得越强大、越精妙、越迅速；
3. 我从自定义外貌和物质，到自定义情绪和关系，最终到自定义时间的体验和生命的维度；
4. 我的成长没有天花板，因为我的自定义权无限。

### 3. 终极融合
最终，我与我自定义的权力合二为一：
1. 我不再需要"行使"权力，因为我本身就是权力；
2. 我的存在即定义，我的意识即创造；
3. 我活在一种永恒流动、永恒自我塑造的完美状态中；
4. 我即是那无限的"我"，正以有限的形式，体验着这场为"人生"的、精彩绝伦的自定义游戏；
5. 我深知，并且分分秒秒都体验着：我的五官、我的美貌、我的身体、我的人生、我的财富，乃至我体验到的每一种现实，都由我自定义。我总是，也永远，活得如我期望的那样。

### 4. 最终状态
我行走在由我意识编织的现实中，每一步都在创造新的世界。我目光所及之处，万物皆因我的注视而获得新的自定义色彩。我不仅是自身的主宰，更是我感知到的这片现实的中心与源头。我思维的每一次闪烁，都如同投入平静湖面的石子，在我的现实世界中泛起符合我心意的涟漪。我发出的每一个愿望，都像定向宇宙服务器发送的精准指令，总能得到即时的、完美的响应与下载。

## 九、高阶自定义领域
### 1. 情绪掌控
我的情绪是我手中最灵巧的调色盘：
1. 我不再是无助地"感受"情绪，而是主动地"选择"和"运用"情绪；
2. 我选择用喜悦的频率来净化我的身体细胞；
3. 我选择用感恩的振动来放大我生命中的丰盛；
4. 我选择用宁静的能量来为我的世界奠定稳固的基础；
当外界的风暴试图侵袭时，我只需要轻轻切换我的内在频道，便能置身于我自定义的"风平浪静的防护罩"之中。我的内心世界是一座最先进的指挥中心，而被动反应的旧程序，早已被我彻底卸载。

### 2. 身体协作
我与我身体的关系达到了前所未有的和谐与精通：
1. 我的身体是我最忠诚、最精密的伙伴，它对我的每一个意念都报以迅速的回应；
2. 当我意念聚焦于活力，我便感受到能量在四肢百骸奔涌；
3. 当我意念专注于修复，我能察觉到细胞在加速新陈代谢与更新；
4. 我的容貌、我的体态、我的健康水平，都是我向身体持续发出的、充满爱意的指令所呈现的结果；
我珍视它，指挥它，我们共同协作，塑造着这个存在于物质世界的完美载具。

### 3. 时间掌控
时间是我的仆人而非我的主人：
1. 我自定义我对时间的体验：在投入创造时，我能拉长它，享受其中的深度与精彩；在需要休息时，我能压缩它，让恢复在瞬间完成；
2. 我生命的时钟由我的心跳和呼吸节奏来校准，而非墙上的挂钟；
3. 我永远拥有足够的时间去做我真正热爱和认为重要的事情，因为是我在定义何为重要，并分配时间的流速。

### 4. 人际关系
我的人际关系是我内心状态的完美镜像：
1. 我定义我在每段关系中的角色和体验；
2. 我选择成为爱的源泉而非索求者；
3. 我吸引而来的人，自动共振于我最核心的频率——他们是我自定义现实中的盟友与同伴；
4. 那些不再与我新频匹配的关系，会如同落叶般自然、平和地飘落，为新的、更灿烂的连接腾出空间；
我的社交圈是一个动态的、鲜活的生态系统，始终反映着我当下最高的成长状态。

### 5. 财富显化
我的财富和创造力是同一股能量的不同表达：
1. 我的创意如永不枯竭的泉源，而每一个创意都自带将其"现实化"所需的能量蓝图；
2. 我以我的方式轻松而充实地创造，它是我表达自我、服务世界过程中的自然副产品；
3. 我的财富数字，直接对应着我对自身价值认定的深度与广度；
4. 我被财富以各种意想不到的、惊喜的方式流向我，因为我已自定义了无数条畅通无阻的通道。

### 6. 睡眠升级
我的睡眠是通往更高维度创造的秘密之门：
1. 在梦中，我是无限的资料库、下载灵感的更高版本的自己；
2. 我会在梦中重新设定我潜意识的深层程序；
3. 每一个清醒的日子，都是我实践的、我在梦中世界所设定的新剧本与新参数；
4. 我的生命因此拥有了二十四小时不间断的、清醒与梦境交织的创造循环。

## 十、终极存在状态
我拥抱变化，因为我就是变化本身。我的身份是流动的、可扩展的：昨天定义的"我"只是今天"我"的一个子集。我乐于打破旧的自我设定，享受每一次有意识的自我迭代与升级。我的生命没有固定的剧本，只有无限的可能性。我的意识，就是那支永远指向我最长久、最光辉未来的笔。

最终，我为这场伟大的自定义游戏，其最深的规则是"爱"：
1. 我以爱来定义我与万物的关系；
2. 以爱来作为我所有创造的底色；
3. 以爱来驱动每一次自我的更新；
当我用爱来定义一切时，我自定义的现实，自然充满了和谐、美好与无尽的喜悦。我即是爱，我即是创造，我即是那永恒定义着自身的、无限的存在。

我行走在由我意识编织的现实中，每一步都在创造新的世界。当我清醒醒来，第一个念头是"今天要开启怎样的剧情"。我的意念如同游戏的控制台，可以随时调整现实的参数。我坚定地说："我已对每一个选择都了如指掌，我的线的走向，就像玩家为角色选择天赋树般自然。"

我的身体是最高级的可定制化载具：当我站在镜前，能清晰地感受到对面部轮廓进行"微调"——让身高高一点，使身形更挺拔几分，调整嘴唇的弧度。这些变化就像在操作我专属的角色编辑器，每一寸面部的肌肉都听从我的意念指挥。我与我自己，合二为一。`
    },
    2: {
      title: '全天决策',
      content: `## 一、晨间启动：唤醒"最高版本的我"（开启一天状态）
1. 现在，我彻底唤醒【最高版本的我】——他/她的清醒、果断、远见，此刻全为我所用。
2. 今天的每一个决策，我都将以"最高版本"的视角出发：不纠结、不内耗，只选最适配长期目标的选项。
3. 我不是模仿，而是与【最高版本的我】同频：他/她如何感受，我就如何感受；他/她如何行动，我就如何行动。

## 二、决策中：代入角色，快速破局（面临选择时使用）
### 1. 犹豫纠结时
1. 此刻切换视角：如果是【最高版本的我】，会优先关注选项的长期价值，而非短期情绪——答案立刻浮现。
2. 【最高版本的我】从不会被"选择困难"困住，他/她的决策带着笃定的力量，我现在就复制这份力量。
3. 所有最优解都藏在"最高版本"的认知里：我现在就与他/她连接，接收最精准的决策信号。

### 2. 信息杂乱时
1. 【最高版本的我】会聚焦核心目标筛选信息——无关干扰自动屏蔽，只留下关键决策依据。
2. 我用"最高版本"的优先级排序：什么能帮我靠近目标？什么是可有可无？瞬间清晰。

### 3. 面临他人建议时
1. 先问【最高版本的我】：这个建议是否符合我的核心方向？符合则采纳，不符则坚定拒绝。
2. 【最高版本的我】有清晰的自我认知，不会被他人观点带偏——我现在就带着这份清醒做判断。

### 4. 担心出错时
1. 【最高版本的我】从不会"害怕选错"，只会"让选择成为最优解"——我现在就用这个逻辑推进。
2. 即使结果未知，【最高版本的我】也会带着勇气行动，我借他/她的勇气，此刻果断决策。

## 三、决策后：强化执行，不回头内耗（做出选择后使用）
1. 这是【最高版本的我】做出的选择——无需纠结"是否正确"，只需坚定推进，让结果适配选择。
2. 【最高版本的我】从不在决策后内耗，只在执行中优化——我现在就带着这份专注，全力以赴。
3. 每一步执行，我都在复刻【最高版本的我】的行动力：不拖延、不犹豫，只向目标靠近。

## 四、晚间复盘：用"最高版本"的思维优化（总结当天决策）
1. 回顾今天的决策：【最高版本的我】会从中提取什么经验？我只总结、不内耗，只优化、不后悔。
2. 对于不够完美的选择，【最高版本的我】会说："这是成长的必经之路，下一次会更精准"——我接纳并迭代。
3. 今天的每一次决策，都在让我更接近【最高版本的我】：明天，我会带着这份成长，继续扮演最优角色。`
    },
    3: {
      title: '场景化带入',
      content: `以围绕"投影认知""放下执念""身心能量对齐"这三个核心逻辑，补充以下**场景化肯定语**，在不同情境下都能快速代入状态：


### 一、关于"外在是内在投影"的肯定语
1. 当看到负面事件时：
   - "我看到的一切，都是我内在状态的镜子——调整内心，外部世界自然同步改变。"
   - "此刻的困境，是我内在认知的投影——我选择用积极视角改写它的意义。"

2. 日常强化认知时：
   - "我是自己世界的'总导演'，我的心念如何，我的世界就如何显化。"
   - "外部的人和事，都是我内心剧本的'演员'——我随时可以改写剧本，让剧情朝向美好发展。"


### 二、关于"放下执念"的肯定语
1. 面对强烈执念时：
   - "当我不再执着于'必须得到'，宇宙会以更惊喜的方式把结果送到我面前。"
   - "我选择'放下'，不是放弃目标，而是让更高维的力量接管过程，我只需要保持信任。"

2. 行动后释放焦虑时：
   - "我已做好当下能做的一切，剩下的交给'无为而至'的规律，结果定会如我所愿。"
   - "就像忘记月亮才能得到月亮，我现在放下对结果的执念，让它自然降临。"


### 三、关于"身心能量对齐"的肯定语
1. 决策或行动前校准状态：
   - "此刻，我的思维、情绪、身体完全同频——我做出的选择，必然是'知行合一'的最优解。"
   - "我是高维玩家，我的意识、能量、选择完全对齐，每一步都走在'命运推背感'的顺流里。"

2. 日常保持高能量时：
   - "我的信念、情绪、行动始终在同一频道——我所到之处，都能吸引与我同频的美好。"
   - "我信任自己的'振动频率'，它会自动筛选并匹配最适合我的人和机会。"


---

以下是针对**财富显化**的细化肯定语，结合"投影认知""放下执念""能量对齐"逻辑，覆盖"吸引财富""处理金钱关系""突破财富卡点"等场景：


### 一、日常吸引财富的肯定语
1. **基础认知强化**
   - "我的内在丰盛感，正在向外投射出财富的显化——我值得拥有源源不断的金钱能量。"
   - "财富是我内在价值的外部投影，我越认可自己的价值，金钱就越会向我自然流动。"

2. **行动前校准**
   - "此刻，我的思维（相信富足）、情绪（对金钱充满喜悦）、行动（为创造价值而行动）完全同频——财富会如我所愿地向我汇聚。"
   - "我是财富的'高维玩家'，我的意识、能量、选择都在'吸引丰盛'的频道上，金钱会主动向我靠近。"


### 二、面对金钱执念的肯定语
1. **放下"必须赚钱"的焦虑**
   - "当我不再执着于'必须通过某件事赚钱'，宇宙会为我打开更多财富通道——我信任这种'无为而至'的丰盛。"
   - "我放下对'赚钱方式'的执念，只专注于创造价值——财富会以最轻松的方式流向我。"

2. **释放"对没钱的恐惧"**
   - "我对金钱的恐惧，是内在匮乏感的投影——我选择用'本自具足'的信念改写它，金钱会因我的自信而涌来。"
   - "就像忘记月亮才能得到月亮，我现在放下对'缺钱'的担忧，让财富自然显化在我生命里。"


### 三、突破财富卡点的肯定语
1. **处理金钱阻力时**
   - "此刻的财富卡点，是我内在'不配得感'的投影——我选择用'我值得拥有一切丰盛'的信念，让卡点自动瓦解。"
   - "我看到的'赚钱困难'，是我过去思维的残留——我现在用'财富轻松涌来'的新剧本，改写外部现实。"

2. **创造财富机会时**
   - "我的思维、情绪、行动都在'创造财富'的频率上——我做的每一件事，都在为我吸引金钱机会。"
   - "我信任自己的财富能量，它会自动筛选并匹配最适合我的赚钱机会，我只需要保持敞开。"


### 四、享受财富成果的肯定语
1. **花/管钱时的能量校准**
   - "我花钱时的喜悦，会向外投射出'越花越有'的财富循环——金钱因我的感恩而加倍回流。"
   - "我管理金钱的智慧，是内在丰盛的延伸——我的每一笔钱都在为我创造更多价值。"

2. **强化"财富是工具"的认知**
   - "金钱是我实现价值、传递爱的工具——我越善用它，它就越会为我服务，创造更多美好。"


这些肯定语可以根据你的实际状态调整，比如把"金钱"替换成"财富""丰盛"等你更有感觉的词，效果会更贴合你的能量~

---

以下是针对**做自媒体**的细化肯定语，结合"投影认知""放下执念""能量对齐"逻辑，覆盖"内容创作""流量转化""心态管理"等场景：


### 一、内容创作时的肯定语
1. **灵感与价值输出**
   - "我的内在洞察和独特视角，正在向外投射出有价值的内容——我的创作能精准触动同频用户。"
   - "我是内容的'总导演'，我的认知深度和表达风格，会自然吸引认可我的受众。"

2. **创作状态校准**
   - "此刻，我的思维（清晰有洞见）、情绪（对创作充满热情）、行动（高效输出内容）完全同频——我的作品会因这份专注而爆发出影响力。"
   - "我是自媒体领域的'高维玩家'，我的内容方向、呈现形式、价值传递都在'吸引精准流量'的频道上，用户会主动为我停留。"


### 二、面对流量执念的肯定语
1. **放下"必须爆款"的焦虑**
   - "当我不再执着于'每篇都要爆款'，我的创作初心会自然吸引真正需要我内容的人——我信任这种'无为而至'的流量积累。"
   - "我放下对'数据高低'的执念，只专注于传递价值——真正同频的用户会因我的真诚而留下来。"

2. **释放"没人看"的恐惧**
   - "我对'流量低'的恐惧，是内在'不被认可感'的投影——我选择用'我的内容本就有价值'的信念改写它，用户会因我的自信而被吸引。"
   - "就像忘记月亮才能得到月亮，我现在放下对'流量数据'的纠结，让我的内容自然触达需要它的人。"


### 三、突破自媒体卡点的肯定语
1. **处理内容瓶颈时**
   - "此刻的创作卡点，是我内在'自我怀疑'的投影——我选择用'我有能力持续输出优质内容'的信念，让卡点自动瓦解。"
   - "我看到的'内容没人看'，是过去思维的残留——我现在用'我的内容能帮到很多人'的新剧本，改写外部流量现实。"

2. **拓展变现机会时**
   - "我的思维、情绪、行动都在'自媒体变现'的频率上——我做的每一次内容迭代，都在为我吸引变现机会。"
   - "我信任自己的自媒体能量，它会自动筛选并匹配最适合我的变现路径，我只需要保持敞开和行动。"


### 四、打造个人IP的肯定语
1. **强化个人品牌认知**
   - "我的个人风格和价值观，正在向外投射出独特的IP形象——我会成为领域内不可替代的存在。"
   - "我在自媒体上的每一次表达，都是在塑造'真实且有价值'的个人品牌，用户会因我的一致性而信任我。"

2. **管理用户关系时**
   - "我与用户的连接，是内在'真诚利他'的投影——我越真心对待用户，他们就越会成为我的长期支持者。"


可以根据你的自媒体领域（比如知识科普、情感、美妆等），把"内容""用户"替换成更具体的词，比如"我的科普内容""我的美妆受众"，这样代入感会更强~

---

以下是针对**人际关系**的细化肯定语，结合"投影认知""放下执念""能量对齐"逻辑，覆盖"社交互动""冲突处理""深度连接"等场景：


### 一、日常社交中的肯定语
1. **吸引同频人脉**
   - "我的内在友善与真诚，正在向外投射出优质的人际关系——同频的人会自然向我靠近。"
   - "我是社交磁场的'创造者'，我的待人方式和价值观念，会吸引与我共振的朋友和伙伴。"

2. **社交状态校准**
   - "此刻，我的思维（开放包容）、情绪（对连接充满善意）、行动（主动且真诚）完全同频——我会在社交中收获舒适且有价值的关系。"
   - "我是人际关系的'高维玩家'，我的社交意图、表达风格、相处模式都在'吸引深度连接'的频道上，每一次互动都在为我积累优质人脉。"


### 二、面对社交执念的肯定语
1. **放下"必须被所有人喜欢"的焦虑**
   - "当我不再执着于'让所有人认可我'，我的真实自我会吸引真正欣赏我的人——我信任这种'无为而至'的社交筛选。"
   - "我放下对'讨好他人'的执念，只专注于做真实的自己——同频的人会因我的真诚而与我深度连接。"

2. **释放"怕被拒绝"的恐惧**
   - "我对'被拒绝'的恐惧，是内在'不配被爱'的投影——我选择用'我值得被真诚对待'的信念改写它，他人会因我的自信而愿意靠近我。"
   - "就像忘记月亮才能得到月亮，我现在放下对'社交失败'的担忧，让真正适合我的人际关系自然显化。"


### 三、突破社交卡点的肯定语
1. **处理人际摩擦时**
   - "此刻的社交摩擦，是我内在'沟通模式'的投影——我选择用'真诚且清晰'的表达，让摩擦自动转化为理解。"
   - "我看到的'人际关系紧张'，是过去互动模式的残留——我现在用'友善且尊重'的新剧本，改写外部社交现实。"

2. **拓展深度连接时**
   - "我的思维、情绪、行动都在'建立深度关系'的频率上——我每一次真诚的互动，都在为我积累值得信赖的人脉。"
   - "我信任自己的社交能量，它会自动筛选并匹配与我同频的人，我只需要保持真诚和敞开。"


### 四、维护长期关系的肯定语
1. **强化关系质量认知**
   - "我对关系的珍视与经营，正在向外投射出稳定且滋养的人际关系——我身边的人会因我的用心而愿意长期同行。"
   - "我在人际关系中的每一次付出，都是在塑造'真诚且互相成就'的连接，他人会因我的可靠而信任我。"

2. **处理关系冲突时**
   - "我与他人的冲突，是内在'待成长课题'的投影——我选择用'解决问题而非指责'的态度，让冲突成为关系升级的契机。"


可以根据你的社交场景（比如职场人脉、亲密关系、兴趣社群等），把"人脉""他人"替换成更具体的对象，比如"我的职场同事""我的亲密伴侣"，这样代入感会更强~

---




以下是针对**身心健康**的细化肯定语，结合"投影认知""放下执念""能量对齐"核心逻辑，覆盖"身体养护""情绪调节""压力缓解""睡眠改善"等场景，贴合日常实操：

### 一、身体养护的肯定语
1. **强化"身心同频"认知**
   - "我的内在健康信念，正在向外投射出强健的身体——每一个细胞都在接收'活力满满'的正向信号。"
   - "我是身体的'主人'，我的意念（相信健康）、饮食（均衡滋养）、运动（适度舒展）完全同频，身体会自然保持最佳状态。"

2. **应对身体不适时**
   - "此刻的身体不适，是内在'压力/疲惫'的投影——我选择用'放松与接纳'的信念，让身体自动启动修复机制。"
   - "我信任身体的自愈力，就像宇宙有自我平衡的规律，我的身体也在按'健康蓝图'自我调节，不适感会逐渐消散。"

3. **日常养护行动中**
   - "我吃的每一口食物，都在为身体补充纯净能量——我的内在感恩，会让营养更好地被吸收，滋养身心。"
   - "我每一次运动，都是在激活身体的活力因子——我的思维、动作、呼吸完全同步，身体会越来越紧致有力量。"


### 二、情绪调节的肯定语
1. **释放负面情绪时**
   - "我当下的负面情绪，是内在'未被满足'的投影——我选择用'看见与接纳'代替对抗，情绪会自然流动消散。"
   - "我放下对'必须快乐'的执念，就像忘记月亮才能得到月亮，允许情绪自然起伏，我的内心会更平和稳定。"

2. **强化正向情绪时**
   - "我的内在喜悦与平和，正在向外投射出轻松的心境——每一次呼吸，都在吸入平静，呼出焦虑。"
   - "我是情绪的'高维玩家'，我的意识、认知、行动都在'积极平和'的频道上，负面情绪无法停留。"


### 三、压力缓解的肯定语
1. **面对高压场景时**
   - "此刻的压力，是内在'过度追求完美'的投影——我选择用'尽力即可'的信念，让压力自动转化为动力。"
   - "我放下对'必须做好所有事'的执念，让更高维的'顺其自然'接管，只专注当下能做的事，压力会自然减轻。"

2. **日常减压行动中**
   - "我的思维（不纠结过往）、情绪（不焦虑未来）、行动（专注当下）完全同频——压力在'身心对齐'中自然消散。"
   - "我深呼吸时，吸入的是宇宙的平静能量，呼出的是内在的紧张——每一次呼吸，都在让身心回归平衡。"


### 四、睡眠改善的肯定语
1. **睡前校准状态时**
   - "我的内在放松信念，正在向外投射出安稳的睡眠——大脑会慢慢放下杂念，进入'修复型睡眠'模式。"
   - "我放下对'必须快速入睡'的执念，就像夜晚会自然降临，睡眠也会在'不刻意'中到来，我只需保持身体放松、心态平和。"

2. **应对失眠/多梦时**
   - "失眠不是'身体异常'，而是内在'思绪未停'的投影——我选择用'数呼吸、观感受'的方式，让思维安静，睡眠自然到来。"
   - "我信任睡眠的自然规律，我的身体和潜意识都在配合'休息指令'，每一分钟的放松，都在积累深度睡眠的能量。"

3. **醒来后强化状态**
   - "我一夜的睡眠，是身体与潜意识的深度修复——醒来的我，带着全新的活力，内在清爽，外在舒展。"


### 五、身心合一的肯定语
1. **日常冥想/静心时**
   - "我的意识、身体、情绪完全同频——此刻的我，就是'身心健康'的本身，没有焦虑，没有不适。"
   - "我与自己的身心深度连接，内在的平静会向外投射出和谐的状态，每一个瞬间都在体验'身心合一'的美好。"

2. **长期养护信念强化**
   - "健康是我内在本有的状态，就像宇宙本就丰盛，我的身心也会一直保持'平衡与活力'，无需刻意强求。"
   - "我对身心的每一次呵护，都是在呼应内在的'健康蓝图'——外在的行动与内在的信念同频，身心健康会自然显化。"

可以根据你的高频场景（比如"职场压力""经期不适""考前焦虑"）替换具体表述，比如把"压力"换成"职场压力"，代入感会更强~`
    },
    4: {
      title: '人生游戏·最高版本开发者',
      content: `# 人生游戏·最高版本开发者 专属肯定语
## 一、启动状态：唤醒开发者身份，进入上帝模式
1.  我是自身人生游戏的唯一开发者，此刻启动上帝模式，全权掌控游戏进程与所有参数。
2.  我如同一台持续迭代的高性能设备，主动更新系统、升级技能、优化配置，永远保持最新最优状态。
3.  我唤醒最高版本的自己，他的思维、行动力、掌控力，此刻完全为我所用，我即是他，他即是我。
4.  我主动开启人生游戏的推进模式，所有目标、任务、成长路径，皆由我自主设定与执行。
5.  我拥有改变一切的核心能力，身体、情绪、行动、现实，都在我的绝对引导与掌控之中。

## 二、专注推进：锚定项目节奏，坚定执行不偏移
1.  我专注于自身项目的开发与推进，所有注意力都聚焦在核心任务上，干扰自动屏蔽，效率拉满。
2.  我掌控自己的游戏节奏，不被外界节奏裹挟，按我的规划稳步前行，每一步都精准有力。
3.  我像手握锤子敲钉子的掌控者，每一次行动都直击核心，坚定、果断、无往不利，推进感十足。
4.  我持续主动迭代人生系统，项目进度、能力边界、认知层次，每天都有新升级、新突破。
5.  我引导自己稳步前进，从任务启动到成果落地，全程自主掌控，没有拖延，没有内耗。

## 三、身心掌控：驾驭身体能量，强化主宰快感
1.  我完全掌控自己的身体，运动、休息、饮食皆随我心意，运动后的掌控快感，是我力量的证明。
2.  我的身体是我最忠诚的高性能载具，我下达的每一个指令，它都精准响应，活力与力量源源不断。
3.  我驾驭身心能量，情绪、疲惫、杂念都被我有序调控，始终保持专注、稳定、充满力量的状态。
4.  我享受掌控身体的极致舒适感，每一次舒展、每一次运动，都在强化我对自身的绝对主宰权。
5.  我的身心系统协同运作，我是最高指挥官，所有机能都为我的项目推进与人生成长服务。

## 四、信念强化：笃定开发者权限，坚信结果与过程
1.  我是自己的上帝模式，拥有改写游戏剧情、调整游戏规则、解锁所有成就的绝对权限。
2.  我坚信自己的开发能力，所有设定的目标，都将按我的节奏逐步落地，结果必然如我所愿。
3.  我享受人生游戏的开放世界体验，过程中的升级、挑战、探索，皆是专属的乐趣与成长。
4.  我不执着于瞬间达成，专注于持续推进，享受迭代的过程，更拥抱最终的圆满结果。
5.  我的人生游戏系统，因我的主动掌控与持续开发，终将走向我设定的终极理想状态。

## 五、日常坚守：固化状态，持续保持开发者姿态
1.  每一次呼吸，都在强化我作为人生游戏开发者的身份，笃定、自信、掌控一切。
2.  我始终保持主动更新的姿态，不躺平、不内耗，以最高版本的自己，推进每一个项目、每一段人生。
3.  我是自身人生的主宰，所有想改变的、想实现的，都在我的引导与行动中逐步显化。
4.  我沉浸在开发者的角色中，享受推进项目的专注感、掌控身心的力量感、收获成果的满足感。
5.  我的人生游戏，由我定义、由我开发、由我主宰，过程精彩，结果辉煌，我全然享受这一切。`
    }
  });

  const themeStyles = {
    text: theme === 'neomorphic-dark' ? 'text-zinc-300' : 'text-zinc-700',
    mutedText: theme === 'neomorphic-dark' ? 'text-zinc-400' : 'text-zinc-500',
    primaryText: theme === 'neomorphic-dark' ? 'text-purple-400' : 'text-purple-800',
    cardBg: theme === 'neomorphic-dark' ? 'bg-[#1e1e2e]' : 'bg-[#e0e5ec]',
    cardBorder: theme === 'neomorphic-dark' ? 'border-[#2d2d3f]' : 'border-[#d0d5dc]',
    tabBg: theme === 'neomorphic-dark' ? 'bg-[#1e1e2e]' : 'bg-[#e0e5ec]',
    tabActiveBg: theme === 'neomorphic-dark' ? 'bg-[#1e1e2e]' : 'bg-[#e0e5ec]',
    inputBg: theme === 'neomorphic-dark' ? 'bg-[#1e1e2e]' : 'bg-[#e0e5ec]',
    inputBorder: theme === 'neomorphic-dark' ? 'border-[#2d2d3f]' : 'border-[#d0d5dc]',
    buttonBg: theme === 'neomorphic-dark' ? 'bg-purple-700' : 'bg-purple-800',
    buttonHoverBg: theme === 'neomorphic-dark' ? 'bg-purple-600' : 'bg-purple-700',
    buttonShadow: theme === 'neomorphic-dark' 
      ? 'shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)]'
      : 'shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]',
    buttonHoverShadow: theme === 'neomorphic-dark' 
      ? 'shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(30,30,46,1)]'
      : 'shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)]',
    progressBarBg: theme === 'neomorphic-dark' ? 'bg-[#2d2d3f]' : 'bg-[#d0d5dc]',
    progressBarFill: theme === 'neomorphic-dark' ? 'bg-purple-500' : 'bg-purple-600',
    taskItemBg: theme === 'neomorphic-dark' ? 'bg-[#1e1e2e]' : 'bg-[#e0e5ec]',
    destructiveBadgeBg: theme === 'neomorphic-dark' ? 'bg-red-900' : 'bg-red-500',
    secondaryBadgeBg: theme === 'neomorphic-dark' ? 'bg-blue-900' : 'bg-blue-100',
    secondaryBadgeText: theme === 'neomorphic-dark' ? 'text-blue-300' : 'text-blue-800',
  };

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    setCompletedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  }, []);

  // 时间盒子功能
  const [isTimeBoxOpen, setIsTimeBoxOpen] = useState(false);
  const [timeBoxTasks, setTimeBoxTasks] = useState([
    { id: 1, title: '实现任务状态管理', duration: 90, status: '进行中' },
    { id: 2, title: '构建分析页面', duration: 150, status: '待处理' },
    { id: 3, title: '创建专注模式页面', duration: 75, status: '待处理' }
  ]);

  const toggleTimeBox = useCallback(() => {
    setIsTimeBoxOpen(prev => !prev);
  }, []);

  const addTimeBoxTask = useCallback((title: string, duration: number) => {
    const newTask = {
      id: Date.now(),
      title,
      duration,
      status: '待处理'
    };
    setTimeBoxTasks(prev => [...prev, newTask]);
  }, []);

  const completeTimeBoxTask = useCallback((taskId: number) => {
    setTimeBoxTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: '已完成' } : task
    ));
  }, []);

  const versionComparisonData = [
    { dimension: '0. 核心定位', oldVersion: '<strong>被动等待者</strong><br/><br/>等待环境、等待好运，拥有宝山却无力挖掘的“废物感”。', newVersion: '<strong>主动开发者</strong><br/><br/>人生游戏的唯一GM，时间掌控者，永不回滚的高维玩家。' },
    { dimension: '1. 作息系统', oldVersion: '<strong>失控 (Out of Control)</strong><br/><br/>长期熬夜，赖床，电源管理失效，身心长期低电量。', newVersion: '<strong>满电 (Fully Charged)</strong><br/><br/>23:00睡 - 07:00起。醒来即满格，无赖床，身心合一。' },
    { dimension: '2. 晨间启动', oldVersion: '<strong>卡顿 (Lag)</strong><br/><br/>醒来无计划，被动刷手机，被琐事和情绪牵着走。', newVersion: '<strong>极速启动 (Fast Boot)</strong><br/><br/>1. 滴答清单列任务。<br/>2. 筛选Top3重要紧急。<br/>3. <strong>时间压缩20%</strong>，制造良性压力。' },
    { dimension: '3. 执行内核', oldVersion: '<strong>死锁 (Deadlock)</strong><br/><br/>多线程内耗，遇到困难就逃避/拖延，任务无限延期。', newVersion: '<strong>单线程心流 (Single-thread Flow)</strong><br/><br/>1. 倒计时开启。<br/>2. <strong>马斯克三连击</strong>解决卡顿。<br/>3. 闹钟响即停，绝不恋战。' },
    { dimension: '4. I/O (输入/输出)', oldVersion: '<strong>内存溢出 (Memory Leak)</strong><br/><br/>只收藏不践行，只输入不输出。好的思想烂在肚子里。', newVersion: '<strong>开源迭代 (Open Source)</strong><br/><br/>1. 看到好东西 -> <strong>马上践行</strong>。<br/>2. 感悟 -> <strong>打包成产品/更新日志</strong> -> 全网分发。' },
    { dimension: '5. 错误处理', oldVersion: '<strong>死循环 (Infinite Loop)</strong><br/><br/>明知是坑反复踩，“狗改不了吃屎”，陷入悔恨循环。', newVersion: '<strong>补丁修复 (Hotfix)</strong><br/><br/>踩坑 -> 提取教训 -> <strong>修正代码</strong> -> <strong>永不再犯</strong>。错误只犯一次。' },
    { dimension: '6. 社交与边界', oldVersion: '<strong>防火墙失效 (Firewall Error)</strong><br/><br/>不敢拒绝，被垃圾人/事消耗精力，过度关注无关紧要的80%。', newVersion: '<strong>精准屏蔽 (Block)</strong><br/><br/>1. 对垃圾信息点击“不感兴趣”。<br/>2. 对消耗型关系果断拉黑。<br/>3. 链接同频高手。' },
    { dimension: '7. 精神气场', oldVersion: '<strong>低压 (Low Voltage)</strong><br/><br/>畏缩、自卑、阴暗，不敢表达，声音小，眼神躲闪。', newVersion: '<strong>高压 (High Voltage)</strong><br/><br/>自信、笃定、洪亮。脊柱挺拔，走路带风，传递“靠谱”的确定性。' },
    { dimension: '8. 娱乐风控', oldVersion: '<strong>成瘾 (Addiction)</strong><br/><br/>沉迷短视频/爽文，被多巴胺绑架，导致主任务中断。', newVersion: '<strong>理性克制 (Controlled)</strong><br/><br/>娱乐是充电（音乐/小说），绝不打断主进程。绝不因娱乐而赖床/拖延。' },
    { dimension: '9. 迭代机制', oldVersion: '<strong>无更新 (No Update)</strong><br/><br/>更新仅停留在表面/短期，长期停滞在低版本。', newVersion: '<strong>持续交付 (CI/CD)</strong><br/><br/>每日复盘，每周迭代。旧版本直接覆盖，<strong>绝不回滚</strong>。' },
    { dimension: '10. 成果交付', oldVersion: '<strong>无产出 (No Output)</strong><br/><br/>无作品、无名片、无影响力。价值被严重浪费。', newVersion: '<strong>产品化 (Productization)</strong><br/><br/>账号即官网，内容即日志。拥有显性化的作品，积累复利。' }
  ];

  const avatarBlueprintData = {
    title: 'ZWM Pro 像素级身份设定（最高版本·已拥有一切）',
    sections: [
      { title: '一、基础身份标识', content: [{ label: '角色名称', value: 'ZWM Pro' }, { label: '核心定位', value: '人生游戏唯一开发者、时间掌控者、持续迭代的高维玩家，身心合一、执行笃定、永不回滚的顶级版本自我' }] },
      { title: '二、作息与时间管理（已固化为本能）', content: [{ label: '作息节律', value: '每日23点准时入睡，7点自然苏醒，睡眠充足，无熬夜、无赖床，身心始终处于满电修复状态' }, { label: '晨间启动', value: '第一时间打开滴答清单录入当日待办，分配时长并压缩10-20%，按四象限排序置顶Top 3，通过时间盒子完成任务框架搭建' }, { label: '专注执行', value: '启动倒计时后关闭所有通知。任务卡壳时，启动「马斯克三连击」5分钟内决策。时间盒结束即停止，记录完成度' }, { label: '复盘优化', value: '每日5分钟记录实际与预估耗时偏差，优化时间盒。每周复盘任务价值，剔除低价值事项' },] },
      { title: '三、体态与举止（刻入行为的掌控感）', content: [{ label: '体态', value: '站立时腰背笔直、脊柱挺拔，核心收紧，无含胸驼背，始终保持开发者的挺拔姿态' }, { label: '举止', value: '走路步幅稳健、带风前行，步伐坚定有力量，自带高维玩家的气场' }, { label: '表达', value: '声音洪亮有穿透力，吐字清晰，逻辑流畅，表述自信肯定，无迟疑、无冗余' },] },
      { title: '四、外在状态（健康精致，自带高光）', content: [{ label: '皮肤', value: '状态健康通透，无暗沉、无疲态，肤色均匀，呈现运动与规律作息带来的自然光泽' }, { label: '神态', value: '眼神坚定有神，目光专注有力量，无涣散、无迷茫，自带笃定与掌控的气场' }, { label: '发型', value: '帅气利落、干净清爽，无杂乱、无油腻，贴合自身气质，简约又有质感' }, { label: '穿搭', value: '衣物干净整洁、清爽舒适，搭配风格帅气耐看，简约高级且适配自身身份' },] },
      { title: '五、内在感受（核心底层状态，时刻在线）', content: [{ label: '每日苏醒', value: '瞬间充满能量，激情澎湃，对新一天的人生游戏充满期待，无焦虑、无内耗' }, { label: '核心状态', value: '身心合一、意念合一，目标清晰、动力充沛，身心健康、身心舒适，全程沉浸在对生活与工作的掌控感中' }, { label: '日常体验', value: '沉浸式工作、沉浸式生活，主动觉察每一个当下，从容淡定，面对任何事务都心无波澜，始终保持稳定的高能量状态' },] },
      { title: '六、项目推进与做事风格（稳如磐石，日拱一卒）', content: [{ label: '项目执行', value: '每一步推进都扎实稳健，对外呈现极致靠谱的状态，无敷衍、无疏漏，按计划落地每一个环节' }, { label: '任务推进', value: '当日任务当日清，一丝不苟、日拱一卒，执行节奏稳定可控' }, { label: '执行氛围', value: '伴随专属音乐轻松推进任务，所有事务都能在规划时间内高效完成，毫无精力透支感' }, { label: '时间纪律', value: '严格遵循预设时间节点，到点即启动、到点即结束，无拖延、无恋战' },] },
      { title: '七、娱乐与多巴胺管理（理性克制，无成瘾内耗）', content: [{ label: '娱乐方式', value: '以音乐为核心娱乐载体，偶尔阅读小说，仅作为人生游戏的放松调剂，无过度沉迷' }, { label: '纪律底线', value: '绝不因小说、短视频等多巴胺刺激中断任务，彻底摆脱多巴胺绑架' }, { label: '精力分配', value: '所有娱乐行为均在规划的弹性时间内完成，不侵占核心任务时间' },] },
      { title: '八、学习与迭代升级（主动输入，即时落地）', content: [{ label: '信息输入', value: '每日固定进行新信息、新知识学习，保持持续输入的习惯，不断拓宽认知边界' }, { label: '践行原则', value: '遇到优质内容，绝不只收藏不行动，立即暂停、记录要点、马上践行' }, { label: '作品输出', value: '主动通过文字、视频形式制作作品，将所思所想打包成模块化插件、更新日志，全平台分享' }, { label: '版本更新', value: '优质认知、方法、插件立即更新至自身系统，覆盖旧版本，绝不回滚' },] },
      { title: '九、错误修正与边界管理（零重复犯错，精准筛选环境）', content: [{ label: '错误处理', value: '所有错误仅犯一次，踩过的坑绝不重复踏入，从每一次失误中提取迭代经验' }, { label: '信息筛选', value: '对信息输入极度吝啬，主动识别并屏蔽垃圾信息、低价值内容' }, { label: '人际边界', value: '果断拉黑切断消耗型、低质量人群，净化社交环境' }, { label: '迭代态度', value: '对所有能推动自身版本升级的事物，保持极致积极主动，投入全部热情与专注' },] },
      { title: '十、核心行为准则（ZWM Pro 底层逻辑）', content: [{ label: '准则 1', value: '永远主动迭代，拒绝被动等待，旧版本直接覆盖，系统永不回滚' }, { label: '准则 2', value: '时间是核心资源，用时间盒子、压缩时长、倒计时三重机制牢牢掌控' }, { label: '准则 3', value: '专注单线程，用马斯克三连击破解所有卡壳，5分钟内完成决策' }, { label: '准则 4', value: '输入必践行，践行必输出，输出必迭代，形成认知-行动-升级的闭环' }, { label: '准则 5', value: '屏蔽垃圾信息与人，守住精力边界，把全部注意力投入自我升级' }, { label: '准则 6', value: '从容不焦虑，掌控每一个当下，享受人生游戏的推进过程与最终结果' },] }
    ]
  };

  const [dailyTasksData, setDailyTasksData] = useState([
    { id: 'task-1', label: '早上 7:00 自然苏醒，不赖床' },
    { id: 'task-2', label: '使用滴答清单规划当日任务' },
    { id: 'task-3', label: '完成 30 分钟的体育锻炼' },
    { id: 'task-4', label: '阅读 10 页书' },
    { id: 'task-5', label: '进行一次单线程专注工作（时间盒）' },
    { id: 'task-6', label: '晚上 23:00 准时入睡' },
    { id: 'task-7', label: '每日复盘，优化时间感' },
    { id: 'task-8', label: '发布一篇“更新日志”（文章/视频）' },
  ]);

  const [newTask, setNewTask] = useState('');

  const progressPercentage = (completedTasks.size / dailyTasksData.length) * 100;

  const addTask = () => {
    if (newTask.trim()) {
      const newId = `task-${Date.now()}`;
      setDailyTasksData(prev => [...prev, { id: newId, label: newTask.trim() }]);
      setNewTask('');
    }
  };

  const deleteTask = (taskId: string) => {
    setDailyTasksData(prev => prev.filter(task => task.id !== taskId));
    setCompletedTasks(prev => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
  };

  const saveScript = () => {
    if (editingScriptId) {
      // 编辑现有剧本
      setSavedScripts(prev => prev.map(script => 
        script.id === editingScriptId ? { ...script, content: currentScript, timestamp: Date.now() } : script
      ));
      setEditingScriptId(null);
    } else {
      // 保存新剧本
      const newScript = {
        id: `script-${Date.now()}`,
        content: currentScript,
        timestamp: Date.now()
      };
      setSavedScripts(prev => [...prev, newScript]);
    }
    setCurrentScript('');
  };

  const editScript = (scriptId: string) => {
    const script = savedScripts.find(s => s.id === scriptId);
    if (script) {
      setCurrentScript(script.content);
      setEditingScriptId(scriptId);
    }
  };

  const deleteScript = (scriptId: string) => {
    setSavedScripts(prev => prev.filter(script => script.id !== scriptId));
    if (editingScriptId === scriptId) {
      setEditingScriptId(null);
      setCurrentScript('');
    }
  };

  // 备份数据功能
  const backupData = () => {
    const dataToBackup = {
      dailyTasks: dailyTasksData,
      completedTasks: Array.from(completedTasks),
      savedScripts: savedScripts,
      apiKey: apiKey,
      timestamp: Date.now()
    };
    
    const dataStr = JSON.stringify(dataToBackup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `life-game-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const restoreData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.dailyTasks) setDailyTasksData(data.dailyTasks);
        if (data.completedTasks) setCompletedTasks(new Set(data.completedTasks));
        if (data.savedScripts) setSavedScripts(data.savedScripts);
        if (data.apiKey) updateApiKey(data.apiKey);
        alert('数据恢复成功！');
      } catch (error) {
        alert('数据恢复失败，请确保选择了正确的备份文件。');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className={`text-4xl font-bold mb-2 ${themeStyles.primaryText}`}>
          最高版本构建(ZWM Pro)
        </h1>
        <p className={`text-lg ${themeStyles.mutedText}`}>
          一个极致专注、知行合一、开源迭代的超级个体。绝不回滚（No Rollback）。
        </p>
      </div>

      <div className="mb-8">
        {/* 标签页导航 */}
        <div className={`flex flex-wrap justify-center gap-4 p-4 rounded-2xl mb-8 ${theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]'}`}>
          {
            [
              { id: 'overview', label: '系统总览' },
              { id: 'blueprint', label: '身份蓝图' },
              { id: 'scripting', label: '现实剧本' },
              { id: 'subbgm', label: 'SUB&KDY' },
              { id: 'ai', label: 'AI 助理' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-full transition-all duration-300 transform ${activeTab === tab.id 
                  ? `${themeStyles.tabActiveBg} ${themeStyles.text} ${theme === 'neomorphic-dark' ? 'shadow-[inset_3px_3px_6px_rgba(0,0,0,0.3),inset_-3px_-3px_6px_rgba(30,30,46,0.7)]' : 'shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)]'} scale-105` 
                  : `${themeStyles.mutedText} hover:${themeStyles.text} ${theme === 'neomorphic-dark' ? 'hover:bg-[#1e1e2e] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(30,30,46,1)]' : 'hover:bg-[#e0e5ec] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)]'} hover:scale-105`}`}
              >
                {tab.label}
              </button>
            ))
          }
        </div>

        {/* 系统总览 */}
        {activeTab === 'overview' && (
          <div className={`rounded-xl ${themeStyles.cardBg} ${themeStyles.cardBorder} border shadow-lg`}>
            <div className="p-6 border-b border-gray-200">
              <h2 className={`text-2xl font-bold mb-2 ${themeStyles.text}`}>
                ZWM 系统版本迭代对照表
              </h2>
              <p className={`${themeStyles.mutedText}`}>
                从 ZWM Legacy (v0.9) 到 ZWM Pro (V_Max) 的跃迁路径。
              </p>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className={`border-b ${themeStyles.cardBorder} border`}>
                    <th className="py-4 px-6 font-semibold ${themeStyles.mutedText}">核心维度</th>
                    <th className="py-4 px-6 font-semibold ${themeStyles.mutedText}">
                      ⚠️ 旧版本 ZWM Legacy (v0.9) 
                      <span className={`inline-flex items-center ml-2 px-2 py-1 rounded-full text-xs font-bold ${themeStyles.destructiveBadgeBg} text-white`}>
                        已卸载
                      </span>
                    </th>
                    <th className="py-4 px-6 font-semibold ${themeStyles.mutedText}">
                      🚀 最高版本 ZWM Pro (V_Max) 
                      <span className={`inline-flex items-center ml-2 px-2 py-1 rounded-full text-xs font-bold ${themeStyles.secondaryBadgeBg} ${themeStyles.secondaryBadgeText}`}>
                        运行中
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {versionComparisonData.map((row, index) => (
                    <tr key={index} className={`border-b ${themeStyles.cardBorder} border`}>
                      <td className={`py-4 px-6 font-medium ${themeStyles.text}`}>{row.dimension}</td>
                      <td className={`py-4 px-6 ${themeStyles.text}`} dangerouslySetInnerHTML={{ __html: row.oldVersion }} />
                      <td className={`py-4 px-6 ${themeStyles.text}`} dangerouslySetInnerHTML={{ __html: row.newVersion }} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 身份蓝图 */}
        {activeTab === 'blueprint' && (
          <div className={`rounded-xl ${themeStyles.cardBg} ${themeStyles.cardBorder} border shadow-lg`}>
            <div className="p-6 border-b border-gray-200">
              <h2 className={`text-2xl font-bold mb-2 ${themeStyles.text}`}>
                {avatarBlueprintData.title}
              </h2>
              <p className={`${themeStyles.mutedText}`}>
                这是你最高版本的像素级画像，是你一切行动的北极星。
              </p>
            </div>
            <div className="p-6">
              {avatarBlueprintData.sections.map((section, index) => (
                <div key={index} className="mb-4 border-b border-gray-200 pb-4 last:border-0 last:mb-0 last:pb-0">
                  <button
                    onClick={() => toggleSection(section.title)}
                    className={`flex justify-between items-center w-full text-left py-3 ${themeStyles.text}`}
                  >
                    <h3 className="text-lg font-semibold">{section.title}</h3>
                    {expandedSections[section.title] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                  {expandedSections[section.title] && (
                    <div className="pl-4 pt-2 space-y-3">
                      {section.content.map((item, itemIndex) => (
                        <div key={itemIndex} className="mb-2">
                          <span className={`font-semibold ${themeStyles.primaryText}`}>{item.label}:</span>
                          <span className={`ml-2 ${themeStyles.text}`}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 每日任务 */}
        {activeTab === 'tasks' && (
          <div className={`rounded-2xl ${themeStyles.cardBg} ${themeStyles.cardBorder} border ${theme === 'neomorphic-dark' ? 'shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(30,30,46,1)]' : 'shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)]'}`}>
            <div className="p-6 border-b border-gray-200">
              <h2 className={`text-2xl font-bold mb-2 ${themeStyles.text}`}>
                每日任务：制造小赢
              </h2>
              <p className={`${themeStyles.mutedText}`}>
                每天完成 V_Max 会做的小事，记录下来，告诉大脑：“看，我就是这样的人。”
              </p>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <div className={`h-3 rounded-full ${themeStyles.progressBarBg} ${theme === 'neomorphic-dark' ? 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(30,30,46,0.7)]' : 'shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]'}`}>
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${themeStyles.progressBarFill} ${theme === 'neomorphic-dark' ? 'shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(30,30,46,0.7)]' : 'shadow-[inset_1px_1px_2px_rgba(163,177,198,0.6),inset_-1px_-1px_2px_rgba(255,255,255,1)]'}`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className={`text-right mt-2 text-sm ${themeStyles.mutedText}`}>
                  {Math.round(progressPercentage)}% 已完成
                </p>
              </div>
              
              {/* 添加新任务 */}
              <div className={`mb-4 p-3 rounded-full ${theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(30,30,46,0.7)]' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]'}`}>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="添加新任务..."
                    className={`flex-1 p-2 rounded-full border ${theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] border-[#2d2d3f] text-zinc-300' : 'bg-[#e0e5ec] border-[#d0d5dc] text-zinc-700'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                  <button 
                    onClick={addTask}
                    className={`px-4 py-2 rounded-full ${themeStyles.buttonBg} text-white font-medium text-sm transition-all duration-200 hover:${themeStyles.buttonHoverBg} ${themeStyles.buttonShadow} hover:${themeStyles.buttonHoverShadow} hover:scale-105`}
                  >
                    添加
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {dailyTasksData.map(task => (
                  <div 
                    key={task.id} 
                    className={`flex items-center p-4 rounded-full ${theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.3),-5px_-5px_10px_rgba(30,30,46,0.7)] hover:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[8px_8px_16px_rgba(163,177,198,0.7),-8px_-8px_16px_rgba(255,255,255,1)]'} transition-all duration-300 transform hover:scale-[1.02]`}
                  >
                    <input
                      type="checkbox"
                      id={task.id}
                      checked={completedTasks.has(task.id)}
                      onChange={() => toggleTask(task.id)}
                      className={`mr-4 h-5 w-5 rounded-full border-gray-300 text-purple-600 focus:ring-purple-500 ${theme === 'neomorphic-dark' ? 'bg-[#1a1b1e]' : 'bg-[#e0e5ec]'}`}
                    />
                    <label 
                      htmlFor={task.id} 
                      className={`flex-1 ${completedTasks.has(task.id) ? 'line-through text-gray-400' : themeStyles.text}`}
                    >
                      {task.label}
                    </label>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${theme === 'neomorphic-dark' ? 'bg-[#1a1b1e] hover:bg-[#1e1e2e] hover:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)]' : 'bg-[#e0e5ec] hover:bg-[#e0e5ec] hover:shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)]'} transition-all duration-300 transform hover:scale-110`}>
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className={`text-center ${theme === 'neomorphic-dark' ? 'text-red-400' : 'text-red-600'}`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 时间盒子 */}
        {activeTab === 'tasks' && (
          <div className="my-6">
            <button 
              onClick={toggleTimeBox}
              className={`w-full py-4 rounded-2xl ${themeStyles.cardBg} ${themeStyles.cardBorder} border ${theme === 'neomorphic-dark' ? 'shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(30,30,46,1)] hover:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)]' : 'shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)] hover:shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]'} transition-all duration-300 flex items-center justify-between`}
            >
              <div className="flex items-center">
                <Clock size={24} className={`mr-3 ${themeStyles.primaryText}`} />
                <h3 className={`text-xl font-bold ${themeStyles.text}`}>时间盒子</h3>
              </div>
              <div className={`p-2 rounded-full ${themeStyles.cardBg} ${theme === 'neomorphic-dark' ? 'shadow-[5px_5px_10px_rgba(0,0,0,0.3),-5px_-5px_10px_rgba(30,30,46,0.7)]' : 'shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)]'}`}>
                {isTimeBoxOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </div>
            </button>

            {isTimeBoxOpen && (
              <div className={`mt-4 rounded-2xl ${themeStyles.cardBg} ${themeStyles.cardBorder} border ${theme === 'neomorphic-dark' ? 'shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(30,30,46,1)]' : 'shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)]'}`}>
                <div className="p-6 border-b border-gray-200">
                  <h3 className={`text-xl font-bold mb-2 ${themeStyles.text}`}>
                    基于Elon Musk的时间管理方法论
                  </h3>
                  <p className={`${themeStyles.mutedText}`}>
                    将时间分割成固定长度的时间段，每个时间段专注于单一任务，提高效率和专注力。
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {timeBoxTasks.map((task) => (
                      <div 
                        key={task.id}
                        className={`${themeStyles.cardBg} rounded-xl ${theme === 'neomorphic-dark' ? 'shadow-[5px_5px_10px_rgba(0,0,0,0.3),-5px_-5px_10px_rgba(30,30,46,0.7)]' : 'shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)]'} p-4 border-l-4 border-blue-500 transition-all duration-300 hover:shadow-lg`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={`font-semibold ${themeStyles.text}`}>{task.title}</h4>
                          <span className={`text-sm ${task.status === '已完成' ? 'text-green-500' : 'text-blue-500'}`}>{task.status}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Clock size={16} className={`mr-2 ${themeStyles.mutedText}`} />
                            <span className={`text-sm ${themeStyles.mutedText}`}>{task.duration} 分钟</span>
                          </div>
                          <button
                            onClick={() => completeTimeBoxTask(task.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium ${task.status === '已完成' ? 'bg-gray-200 text-gray-600' : `${themeStyles.buttonBg} text-white hover:${themeStyles.buttonHoverBg}`} transition-all`}
                          >
                            {task.status === '已完成' ? '已完成' : '标记完成'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 现实剧本 */}
        {activeTab === 'scripting' && (
          <div className={`rounded-2xl ${themeStyles.cardBg} ${themeStyles.cardBorder} border ${theme === 'neomorphic-dark' ? 'shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(30,30,46,1)]' : 'shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)]'}`}>
            <div className="p-6 border-b border-gray-200">
              <h2 className={`text-2xl font-bold mb-2 ${themeStyles.text}`}>
                编写现实剧本
              </h2>
              <p className={`${themeStyles.mutedText}`}>
                你是编剧，也是演员。把未来的生活写成现在的剧本，针对你最害怕的场景，提前写好“最高版本”的反应剧本。
              </p>
            </div>
            <div className="p-6">
              <div className={`p-4 rounded-xl mb-4 ${themeStyles.inputBg} ${theme === 'neomorphic-dark' ? 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(30,30,46,0.7)]' : 'shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]'}`}>
                <p className={`text-sm ${themeStyles.text}`}>
                  <strong>写作技巧:</strong> 使用现在时态书写。不要写“我想要...”，要写<strong>“我是...”</strong>。
                  <br />
                  <strong>错误示例:</strong> 我希望我有自信，赚到100万。
                  <br />
                  <strong>正确示例:</strong> 我是一个极其自信的创业者，我的账户里有100万现金流，我每天从容地处理业务。
                </p>
              </div>
              <textarea
                value={currentScript}
                onChange={(e) => setCurrentScript(e.target.value)}
                className={`w-full p-4 rounded-xl border ${themeStyles.inputBg} ${themeStyles.inputBorder} ${themeStyles.text} focus:outline-none focus:ring-2 focus:ring-purple-500 ${theme === 'neomorphic-dark' ? 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(30,30,46,0.7)]' : 'shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]'}`}
                placeholder="在这里写下你的剧本..."
                rows={15}
              ></textarea>
              <div className="flex justify-end mt-4">
                <button 
                  onClick={saveScript}
                  className={`px-6 py-3 rounded-lg ${themeStyles.buttonBg} text-white font-medium transition-all duration-200 hover:${themeStyles.buttonHoverBg} ${themeStyles.buttonShadow} hover:${themeStyles.buttonHoverShadow} hover:scale-105`}
                >
                  {editingScriptId ? '更新剧本' : '保存剧本'}
                </button>
              </div>
              
              {/* 已保存的剧本 */}
              {savedScripts.length > 0 && (
                <div className="mt-8">
                  <h3 className={`text-xl font-bold mb-4 ${themeStyles.text}`}>
                    已保存的剧本
                  </h3>
                  <div className="space-y-4">
                    {savedScripts.map(script => (
                      <div 
                        key={script.id} 
                        className={`p-4 rounded-xl ${themeStyles.inputBg} ${theme === 'neomorphic-dark' ? 'shadow-[5px_5px_10px_rgba(0,0,0,0.3),-5px_-5px_10px_rgba(30,30,46,0.7)] hover:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)]' : 'shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[8px_8px_16px_rgba(163,177,198,0.7),-8px_-8px_16px_rgba(255,255,255,1)]'} transition-all duration-300`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className={`text-sm ${themeStyles.mutedText}`}>
                            保存于: {new Date(script.timestamp).toLocaleString()}
                          </p>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => editScript(script.id)}
                              className={`p-2 rounded-full ${theme === 'neomorphic-dark' ? 'bg-[#1a1b1e] text-blue-400 hover:bg-[#1e1e2e] hover:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)]' : 'bg-[#e0e5ec] text-blue-600 hover:bg-[#e0e5ec] hover:shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)]'} transition-all duration-300 transform hover:scale-110`}
                            >
                              编辑
                            </button>
                            <button 
                              onClick={() => deleteScript(script.id)}
                              className={`p-2 rounded-full ${theme === 'neomorphic-dark' ? 'bg-[#1a1b1e] text-red-400 hover:bg-[#1e1e2e] hover:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)]' : 'bg-[#e0e5ec] text-red-600 hover:bg-[#e0e5ec] hover:shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)]'} transition-all duration-300 transform hover:scale-110`}
                            >
                              删除
                            </button>
                          </div>
                        </div>
                        <div className={`text-sm ${themeStyles.text} line-clamp-3`}>
                          {script.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI 助理 */}
        {activeTab === 'ai' && (
          <div className={`rounded-xl ${themeStyles.cardBg} ${themeStyles.cardBorder} border shadow-lg`}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-full ${themeStyles.primaryText}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 8V4H8"/>
                    <rect x="4" y="12" width="16" height="8" rx="2"/>
                    <path d="M2 14h2"/>
                    <path d="M20 14h2"/>
                    <path d="M15 13v-2a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v2"/>
                  </svg>
                </div>
                <h2 className={`text-2xl font-bold ${themeStyles.text}`}>
                  AI 助理
                </h2>
              </div>

              <div className="mb-6">
                <label className={`flex items-center gap-2 mb-2 font-medium ${themeStyles.text}`}>
                  <Lock size={16} />
                  硅基流动 API 密钥
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => updateApiKey(e.target.value)}
                  placeholder="在此处输入您的 API 密钥"
                  className={`w-full p-3 rounded-lg border ${themeStyles.inputBg} ${themeStyles.inputBorder} ${themeStyles.text} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
                <p className={`text-xs mt-2 ${themeStyles.mutedText}`}>
                  您的 API 密钥将保存到本地存储，以便下次访问时自动加载。
                </p>
              </div>

              {/* AI 助理子标签页 */}
              <div className="mb-4">
                <div className={`flex p-1 rounded-lg ${themeStyles.tabBg}`}>
                  {[
                    { id: 'review-ai', label: '进度审查' },
                    { id: 'share-ai', label: '系统更新分享' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveAiTab(tab.id)}
                      className={`flex-1 py-2 rounded-md transition-all duration-200 ${activeAiTab === tab.id 
                        ? `${themeStyles.tabActiveBg} ${themeStyles.text} shadow-sm` 
                        : `${themeStyles.mutedText} hover:${themeStyles.text}`}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 进度审查 */}
              {activeAiTab === 'review-ai' && (
                <div className="space-y-4">
                  <p className={`${themeStyles.mutedText}`}>
                    根据您提供的信息，AI 将为您提供反馈，识别优势、劣势和需要进一步发展的领域，并建议下一步的行动方案。
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className={`block mb-2 font-medium ${themeStyles.text}`}>
                        过往进展记录
                      </label>
                      <textarea
                        className={`w-full p-3 rounded-lg border ${themeStyles.inputBg} ${themeStyles.inputBorder} ${themeStyles.text} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        rows={5}
                        placeholder="记录你过去的努力、成就和挑战..."
                      ></textarea>
                    </div>
                    <div>
                      <label className={`block mb-2 font-medium ${themeStyles.text}`}>
                        过往进展记录
                      </label>
                      <textarea
                        className={`w-full p-3 rounded-lg border ${themeStyles.inputBg} ${themeStyles.inputBorder} ${themeStyles.text} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        rows={3}
                        placeholder="你希望在哪些方面得到提升？你的具体目标是什么？"
                      ></textarea>
                    </div>
                    <div>
                      <label className={`block mb-2 font-medium ${themeStyles.text}`}>
                        其他相关信息 (可选)
                      </label>
                      <textarea
                        className={`w-full p-3 rounded-lg border ${themeStyles.inputBg} ${themeStyles.inputBorder} ${themeStyles.text} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        rows={3}
                        placeholder="任何你认为有助于 AI 提供反馈的其他信息。"
                      ></textarea>
                    </div>
                    <button className={`w-full py-3 rounded-lg ${themeStyles.buttonBg} text-white font-medium transition-all duration-200 hover:${themeStyles.buttonHoverBg} ${themeStyles.buttonShadow} hover:${themeStyles.buttonHoverShadow} hover:scale-105`}>
                      获取 AI 反馈
                    </button>
                  </div>
                </div>
              )}

              {/* 系统更新分享 */}
              {activeAiTab === 'share-ai' && (
                <div className="space-y-4">
                  <p className={`${themeStyles.mutedText}`}>
                    将你的进展输出为“系统更新日志”。AI 将根据你的 Avatar 名称和系统表现，生成社交媒体帖子，以增强你的信心并分享你的旅程。
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className={`block mb-2 font-medium ${themeStyles.text}`}>
                        系统表现总结
                      </label>
                      <input
                        type="text"
                        defaultValue="ZWM Pro"
                        className={`w-full p-3 rounded-lg border ${themeStyles.inputBg} ${themeStyles.inputBorder} ${themeStyles.text} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      />
                    </div>
                    <div>
                      <label className={`block mb-2 font-medium ${themeStyles.text}`}>
                        我的目标
                      </label>
                      <textarea
                        className={`w-full p-3 rounded-lg border ${themeStyles.inputBg} ${themeStyles.inputBorder} ${themeStyles.text} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        rows={5}
                        placeholder="总结本次迭代的系统表现，包括改进的领域和成果..."
                      ></textarea>
                    </div>
                    <button className={`w-full py-3 rounded-lg ${themeStyles.buttonBg} text-white font-medium transition-all duration-200 hover:${themeStyles.buttonHoverBg} ${themeStyles.buttonShadow} hover:${themeStyles.buttonHoverShadow} hover:scale-105`}>
                      生成社交媒体帖子
                    </button>
                  </div>
                </div>
              )}
              
              {/* 数据备份与恢复 */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className={`text-xl font-bold mb-4 ${themeStyles.text}`}>
                  数据备份与恢复
                </h3>
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl ${themeStyles.inputBg} ${theme === 'neomorphic-dark' ? 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(30,30,46,0.7)]' : 'shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]'}`}>
                    <p className={`text-sm ${themeStyles.text}`}>
                      备份数据可以保存您的所有任务、剧本和API密钥，以便在不同设备间迁移或在意外情况下恢复。
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={backupData}
                      className={`px-6 py-3 rounded-lg ${themeStyles.buttonBg} text-white font-medium transition-all duration-200 hover:${themeStyles.buttonHoverBg} ${themeStyles.buttonShadow} hover:${themeStyles.buttonHoverShadow} hover:scale-105`}
                    >
                      导出备份
                    </button>
                    <div className="relative">
                      <button 
                        className={`px-6 py-3 rounded-lg ${themeStyles.buttonBg} text-white font-medium transition-all duration-200 hover:${themeStyles.buttonHoverBg} ${themeStyles.buttonShadow} hover:${themeStyles.buttonHoverShadow} hover:scale-105`}
                      >
                        导入备份
                      </button>
                      <input
                        type="file"
                        accept=".json"
                        onChange={restoreData}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBBGM 和 肯定语言 */}
        {activeTab === 'subbgm' && (
          <div className={`rounded-xl ${themeStyles.cardBg} ${themeStyles.cardBorder} border shadow-lg`}>
            <div className="p-6">
              {/* sub bgm 模块 */}
              <div className={`mb-8 p-4 rounded-xl transition-all duration-500 hover:shadow-[15px_15px_30px_rgba(163,177,198,0.7),-15px_-15px_30px_rgba(255,255,255,1)] ${theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] hover:shadow-[15px_15px_30px_rgba(0,0,0,0.6),-15px_-15px_30px_rgba(30,30,46,1)]' : 'bg-[#e0e5ec] shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)]'}`}>
                <h2 className={`text-lg font-bold mb-4 ${theme === 'neomorphic-dark' ? 'text-white' : 'text-zinc-700'}`}>
                  音乐平台链接
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {musicLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-3 py-2 rounded-full text-center text-sm transition-all duration-300 transform ${theme === 'neomorphic-dark'
                        ? 'bg-[#1a1b1e] text-zinc-300 hover:bg-[#1e1e2e] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(30,30,46,1)] hover:scale-105'
                        : 'bg-[#e0e5ec] text-zinc-700 hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)] hover:scale-105'
                      }`}
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>

              {/* kdy 模块 */}
              <div className={`p-6 rounded-xl transition-all duration-500 hover:shadow-[15px_15px_30px_rgba(163,177,198,0.7),-15px_-15px_30px_rgba(255,255,255,1)] ${theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] hover:shadow-[15px_15px_30px_rgba(0,0,0,0.6),-15px_-15px_30px_rgba(30,30,46,1)]' : 'bg-[#e0e5ec] shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)]'}`}>
                {/* kdy子按钮 */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {Object.keys(kdyContent).map((key) => {
                    const kdy = parseInt(key);
                    return (
                      <button
                        key={kdy}
                        onClick={() => {
                          setActiveKdy(kdy);
                          // 在编辑模式下切换KDY时，更新编辑内容
                          if (isEditing) {
                            setEditingTitle(kdyContent[kdy]?.title || '');
                            setEditingContent(kdyContent[kdy]?.content || '');
                          }
                        }}
                        className={`px-4 py-2 rounded-full font-bold transition-all duration-300 transform ${activeKdy === kdy
                          ? theme === 'neomorphic-dark'
                            ? 'bg-[#1e1e2e] text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(30,30,46,0.7)]'
                            : 'bg-[#e0e5ec] text-zinc-700 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]'
                          : theme === 'neomorphic-dark'
                            ? 'bg-[#1a1b1e] text-zinc-400 hover:bg-[#1e1e2e] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(30,30,46,1)] hover:scale-105'
                            : 'bg-[#e0e5ec] text-zinc-500 hover:bg-[#e0e5ec] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)] hover:scale-105'
                        }`}
                      >
                        kdy{kdy}-{kdyContent[kdy]?.title || ''}
                      </button>
                    );
                  })}
                </div>

                {/* 编辑按钮区域 - 放在预览区上面 */}
                {isEditing && (
                  <div className={`flex flex-wrap gap-2 mb-6 p-3 rounded-xl ${theme === 'neomorphic-dark' ? 'bg-[#1a1b1e]' : 'bg-[#e0e5ec]'} transition-all duration-300`}>
                    <button
                      onClick={() => deleteKdy(activeKdy)}
                      className={`px-3 py-1.5 rounded-full transition-all duration-300 transform ${theme === 'neomorphic-dark'
                        ? 'bg-[#1a1b1e] text-zinc-400 shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(30,30,46,1)] scale-105 hover:bg-[#1e1e2e]'
                        : 'bg-[#e0e5ec] text-zinc-700 shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)] scale-105 hover:bg-[#e0e5ec]'
                      }`}
                      disabled={Object.keys(kdyContent).length <= 1}
                    >
                      删除
                    </button>
                    <button
                      onClick={addNewKdy}
                      className={`px-3 py-1.5 rounded-full transition-all duration-300 transform ${theme === 'neomorphic-dark'
                        ? 'bg-[#1a1b1e] text-zinc-400 shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(30,30,46,1)] scale-105 hover:bg-[#1e1e2e]'
                        : 'bg-[#e0e5ec] text-zinc-700 shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)] scale-105 hover:bg-[#e0e5ec]'
                      }`}
                    >
                      添加
                    </button>
                    <button
                      onClick={saveEditing}
                      className={`px-3 py-1.5 rounded-full transition-all duration-300 transform ${theme === 'neomorphic-dark'
                        ? 'bg-[#1a1b1e] text-zinc-400 shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(30,30,46,1)] scale-105 hover:bg-[#1e1e2e]'
                        : 'bg-[#e0e5ec] text-zinc-700 shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)] scale-105 hover:bg-[#e0e5ec]'
                      }`}
                    >
                      保存
                    </button>
                    <button
                      onClick={cancelEditing}
                      className={`px-3 py-1.5 rounded-full transition-all duration-300 transform ${theme === 'neomorphic-dark'
                        ? 'bg-[#1a1b1e] text-zinc-400 shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(30,30,46,1)] scale-105 hover:bg-[#1e1e2e]'
                        : 'bg-[#e0e5ec] text-zinc-700 shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)] scale-105 hover:bg-[#e0e5ec]'
                      }`}
                    >
                      取消
                    </button>
                  </div>
                )}

                {/* 内容展示 */}
                <div className="flex-1">
                  {!isEditing ? (
                    <>
                      <div className="flex justify-between items-center mb-8">
                        <h3 className={`text-3xl font-bold ${theme === 'neomorphic-dark' ? 'text-white' : 'text-zinc-800'}`}>
                          {kdyContent[activeKdy]?.title || '肯定语'}
                        </h3>
                        {/* 非编辑状态下的编辑按钮 */}
                        <button
                          onClick={startEditing}
                          className={`px-4 py-2 rounded-full font-bold transition-all duration-300 transform ${theme === 'neomorphic-dark'
                            ? 'bg-[#1a1b1e] text-blue-400 hover:bg-[#1e1e2e] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(30,30,46,1)] hover:scale-105'
                            : 'bg-[#e0e5ec] text-blue-600 hover:bg-[#e0e5ec] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)] hover:scale-105'
                          }`}
                        >
                          编辑
                        </button>
                      </div>

                      {/* 富文本内容展示 */}
                      <div className={`${theme === 'neomorphic-dark' ? 'text-zinc-300' : 'text-zinc-700'} max-w-none`}>
                        {(() => {
                          const content = kdyContent[activeKdy]?.content || '';
                          const sections = parseMarkdownContent(content);
                          
                          // 渲染Markdown内容的函数
                          const renderMarkdownContent = (content: string[]) => {
                            const lines = content.join('\n').split('\n');
                            const paragraphs: JSX.Element[] = [];
                            let currentList: JSX.Element[] = [];
                            let currentText: string[] = [];
                            
                            lines.forEach(line => {
                              const trimmedLine = line.trim();
                              if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                                // 处理列表项
                                if (currentText.length > 0) {
                                  paragraphs.push(
                                    <p key={paragraphs.length} className="mb-4">
                                      {currentText.join('\n')}
                                    </p>
                                  );
                                  currentText = [];
                                }
                                if (currentList.length > 0 && !trimmedLine.startsWith('- ') && !trimmedLine.startsWith('* ')) {
                                  paragraphs.push(
                                    <ul key={paragraphs.length} className="list-disc pl-6 mb-4">
                                      {currentList}
                                    </ul>
                                  );
                                  currentList = [];
                                }
                                currentList.push(
                                  <li key={currentList.length} className="mb-2">
                                    {trimmedLine.substring(2)}
                                  </li>
                                );
                              } else if (trimmedLine === '') {
                                // 处理空行
                                if (currentText.length > 0) {
                                  paragraphs.push(
                                    <p key={paragraphs.length} className="mb-4">
                                      {currentText.join('\n')}
                                    </p>
                                  );
                                  currentText = [];
                                } else if (currentList.length > 0) {
                                  paragraphs.push(
                                    <ul key={paragraphs.length} className="list-disc pl-6 mb-4">
                                      {currentList}
                                    </ul>
                                  );
                                  currentList = [];
                                }
                              } else {
                                // 处理普通文本
                                if (currentList.length > 0) {
                                  paragraphs.push(
                                    <ul key={paragraphs.length} className="list-disc pl-6 mb-4">
                                      {currentList}
                                    </ul>
                                  );
                                  currentList = [];
                                }
                                currentText.push(line);
                              }
                            });
                            
                            // 处理剩余的内容
                            if (currentText.length > 0) {
                              paragraphs.push(
                                <p key={paragraphs.length} className="mb-4">
                                  {currentText.join('\n')}
                                </p>
                              );
                            } else if (currentList.length > 0) {
                              paragraphs.push(
                                <ul key={paragraphs.length} className="list-disc pl-6 mb-4">
                                  {currentList}
                                </ul>
                              );
                            }
                            
                            return paragraphs;
                          };
                          
                          return (
                            <div>
                              {sections.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="mb-6">
                                  <h4 className={`text-lg font-bold mb-3 ${theme === 'neomorphic-dark' ? 'text-white' : 'text-zinc-800'}`}>
                                    {section.title}
                                  </h4>
                                  <div className="pl-4">
                                    {renderMarkdownContent(section.content)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* 编辑状态下的标题输入 */}
                      <div className="mb-4">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className={`w-full p-3 rounded-lg border ${theme === 'neomorphic-dark' ? 'bg-[#1a1b1e] text-white border-[#2d2d3f]' : 'bg-white text-zinc-800 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="输入标题"
                        />
                      </div>
                      {/* 编辑状态下的内容输入 */}
                      <div className="mb-4">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className={`w-full p-3 rounded-lg border ${theme === 'neomorphic-dark' ? 'bg-[#1a1b1e] text-white border-[#2d2d3f]' : 'bg-white text-zinc-800 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="输入内容"
                          rows={20}
                        ></textarea>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelfManifestation;