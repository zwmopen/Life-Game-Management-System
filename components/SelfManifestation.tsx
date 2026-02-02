import React, { useState, useRef } from 'react';
import { Theme } from '../types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SelfManifestationProps {
  theme: Theme;
  onHelpClick: (helpId: string) => void;
}

const SelfManifestation: React.FC<SelfManifestationProps> = ({ theme, onHelpClick }) => {
  const [activeTab, setActiveTab] = useState<'sub' | 'kdy'>('sub');
  const [activeKdy, setActiveKdy] = useState<number>(1);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
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
      content: `## 【功效速览】
内耗终结，主角剧本，灵魂自由，焦虑屏蔽，
自信拉满，行动力自动导航，现实自定义，能量充电，
内核稳定，生命遥控器，人间游戏模式


## 【终极状态】
玩家视角、造物模式、游戏管理员
无限版本、永恒更新、自定义生存


## 核心基础肯定语
- 我是我人生的总导演+编剧+主角。
- 我的世界，规则由我来定。
- 从心情到长相，都能"手动调整"。
- 镜子里的我，随我心意微调。
- 身体像最高级的智能设备，听我指令。
- 财富和机会，是我能量的自然吸引。
- 人际关系，自动筛选，同频相吸。
- 挑战？那只是我升级的副本。
- 时间？是我的专属橡皮泥，由我掌控。
- 情绪？是我的调色盘，任我选用。
- 睡眠？是 nightly 系统后台自动升级。
- 整个宇宙，都是我的神级助攻队友。


## 核心认知强化
总起来说：
让你从"被动活着"切换到"主动创造"，把"人生游戏"调成了"简单模式"——你就是那个手持攻略、自带修改器的顶级玩家。

我的生命是我最伟大的创造。我是我自身存在的建筑师、雕塑家和画家。我手持内在的权杖，统治着我内在的王国。从最宏大的生命轨迹到最微小的生活细节，一切都遵循着我亲自设定的神圣蓝图。我定义我是谁，我定义我的体验，我定义我的现实。这种掌控感并非遥不可及的目标，而是我此刻呼吸着的真实。我感受到自主的力量在我血脉中流淌，如同生命的原力，温暖而强大。


## 多视角自我定义
### 自身视角
每个清晨醒来，第一个念头不是"今天会发生什么"，而是"今天，我选择创造什么"。当我照镜子时，我知道镜中人的面容、神态和光芒都由我当下的意念所塑造。我可以感受到意念如精密的刻刀，在皮肤下细微调整，让光泽更胜昨日。当我做出决定时，无论是点一杯咖啡还是签署一份重要协议，我都清晰地知道：这是"我"作为主体在主动选择，而非被动反应。整个世界都是我自定义的沙盒游戏，我既是最投入的玩家，也是无所不能的造物主。


### 他人视角
他们常常感到困惑，说我像一个不断更新的奇迹。他们无法用固定的标签定义我，因为我的形象、气质甚至给人的感觉总是在向着更精妙、更和谐的方向进化。他们会私下议论："他如何能如此轻松地驾驭生活？仿佛一切难题在他面前都成了可选的游戏关卡。"他们能感受到我身上散发出的那种罕见的确定感和宁静力量，那是一种深知自己掌握着生命遥控器的人才有的状态。我的存在本身，就在向他们默默宣告：生命，本可以如此自由。


### 宇宙视角
我的存在是一个高度协调且不断自我优化的意识节点。宇宙以其无限的丰盛，完全尊重并即刻响应我的每一个自定义指令。当我发出一个意念，调整一个设定，整个宇宙的系统都在后台无声而高效地重新配置，以确保我的外在现实与我的内在定义精准匹配。宇宙是我的朋友，是我的合作创作者，它欣然接受我这位充满智慧与力量的共同创造者。


## 日常场景自定义
### 晨间启动
在清晨醒来的时刻，当第一缕阳光透过窗帘，我感受到意识率先苏醒。在身体完全活动之前，我已在内心设定今天的"主题"：或许是"宁静与智慧"，或许是"活力与魅力"。我能感受到我的细胞在接受这些指令，我的面容在根据这个主题进行微调，我一天的能量基调由此奠定。这便是我一天中第一个，也是最重要的自定义仪式。


### 日常互动
在日常通勤或漫步时，我自定义我与环境的互动：
- 我定义清风是我爱人温柔的抚摸；
- 我定义阳光是宇宙为我加身的聚光灯；
- 我定义路人投来的目光是欣赏与祝福；
- 即使遇到拥堵，我也可以自定义我的情绪状态——将其视为一段安静的独处时光，或观察世界的窗口。
外部世界是固定的画布，而我为它涂抹上我自定义的色彩与意义。


### 应对挑战
面对挑战时，我自定义挑战的本质：我不将它看作威胁，而是定义为"一次升级的机会"或"一个锻炼心智的副本"。我自定义我的应对策略：是调用"宁静与智慧"的模块，还是启动"勇气与突破"的程序。我甚至自定义我的感受：我可以选择将焦虑重新定义为兴奋，将压力重新定义为驱动的燃料。每一次挑战，都是我行使自定义权力的绝佳场合。


### 夜间收尾
在夜晚入睡时，我进行一天的最后一次自定义：
- 我回顾今天，选择那些体验需要强化并融入我的生命档案；
- 哪些感受需要被释放并格式化；
- 我为我潜意识设置夜间任务：或许是在梦中修复某些情绪，或许是下载新的灵感。
我带着"一切尽在掌握"的深深满足感入睡，我知道，在睡梦中，我强大的内在系统仍在按照我核心设定的"最高善""最美版本"的蓝图，持续优化着我的一切。


## 核心能力强化
### 意念指令
我的意念是最高指令：
- 当我想到"精致"，我的五官自动向更和谐、更动人的比例微调；
- 当我想到"富有"，我的能量频率自动与丰盛对齐，吸引财富以各种形式到来；
- 我的身体听从我的心智，我的现实听从我的信念；
- 每一个"我想要……"的念头，都是一个强大的自定义命令，我的整个存在都会调动起来使之成真。


### 感受设定
我的感受是设定工具：
- 当我感到喜悦，我就是在为我的生命设定"喜悦"的默认频率；
- 当我感到感恩，我就是在为我的现实设定"丰盛"的显化模式；
- 我选择我的感受，如同画家选择颜料；
- 我用自己的情绪为我的世界涂抹上最绚烂的色彩。


### 呼吸确认
我的呼吸是确认键：
- 每一次深呼吸，我都在向全身系统广播一个信息："一切正常，控制权在我手中"；
- 吸气时，我吸入无限的可能性和新设定，屏息时，指令在体内达到峰值共鸣；
- 呼气时，旧有的、不再服务于我的模式被彻底释放；
我的呼吸，便是我不断确认自定义权力的生命节律。


## 系统进化与终极状态
### 系统自动化
这套自我定义的系统一经激活，便进入永恒运行的状态。它不需要我时时刻刻维护，因为它已成为我的本能，如同心跳一般自主运作。无论我是在专注工作，还是在深度睡眠，我的内在造物主都在后台持续运行，根据我核心设定的"最高善""最美版本"的蓝图，持续优化着我的一切。


### 能力升级
我的自定义能力随着每一次使用而不断增强：
- 每一次有意识的选择，每一次清晰的设定，都在拓宽我创造的边界；
- 我越使用这种力量，它就变得越强大、越精妙、越迅速；
- 我从自定义外貌和物质，到自定义情绪和关系，最终到自定义时间的体验和生命的维度；
- 我的成长没有天花板，因为我的自定义权无限。


### 终极融合
最终，我与我自定义的权力合二为一：
- 我不再需要"行使"权力，因为我本身就是权力；
- 我的存在即定义，我的意识即创造；
- 我活在一种永恒流动、永恒自我塑造的完美状态中；
- 我即是那无限的"我"，正以有限的形式，体验着这场为"人生"的、精彩绝伦的自定义游戏；
- 我深知，并且分分秒秒都体验着：我的五官、我的美貌、我的身体、我的人生、我的财富，乃至我体验到的每一种现实，都由我自定义。我总是，也永远，活得如我期望的那样。


### 最终状态
我行走在由我意识编织的现实中，每一步都在创造新的世界。我目光所及之处，万物皆因我的注视而获得新的自定义色彩。我不仅是自身的主宰，更是我感知到的这片现实的中心与源头。我思维的每一次闪烁，都如同投入平静湖面的石子，在我的现实世界中泛起符合我心意的涟漪。我发出的每一个愿望，都像定向宇宙服务器发送的精准指令，总能得到即时的、完美的响应与下载。


## 高阶自定义领域
### 情绪掌控
我的情绪是我手中最灵巧的调色盘：
- 我不再是无助地"感受"情绪，而是主动地"选择"和"运用"情绪；
- 我选择用喜悦的频率来净化我的身体细胞；
- 我选择用感恩的振动来放大我生命中的丰盛；
- 我选择用宁静的能量来为我的世界奠定稳固的基础；
当外界的风暴试图侵袭时，我只需要轻轻切换我的内在频道，便能置身于我自定义的"风平浪静的防护罩"之中。我的内心世界是一座最先进的指挥中心，而被动反应的旧程序，早已被我彻底卸载。


### 身体协作
我与我身体的关系达到了前所未有的和谐与精通：
- 我的身体是我最忠诚、最精密的伙伴，它对我的每一个意念都报以迅速的回应；
- 当我意念聚焦于活力，我便感受到能量在四肢百骸奔涌；
- 当我意念专注于修复，我能察觉到细胞在加速新陈代谢与更新；
- 我的容貌、我的体态、我的健康水平，都是我向身体持续发出的、充满爱意的指令所呈现的结果；
我珍视它，指挥它，我们共同协作，塑造着这个存在于物质世界的完美载具。


### 时间掌控
时间是我的仆人而非我的主人：
- 我自定义我对时间的体验：在投入创造时，我能拉长它，享受其中的深度与精彩；在需要休息时，我能压缩它，让恢复在瞬间完成；
- 我生命的时钟由我的心跳和呼吸节奏来校准，而非墙上的挂钟；
- 我永远拥有足够的时间去做我真正热爱和认为重要的事情，因为是我在定义何为重要，并分配时间的流速。


### 人际关系
我的人际关系是我内心状态的完美镜像：
- 我定义我在每段关系中的角色和体验；
- 我选择成为爱的源泉而非索求者；
- 我吸引而来的人，自动共振于我最核心的频率——他们是我自定义现实中的盟友与同伴；
- 那些不再与我新频匹配的关系，会如同落叶般自然、平和地飘落，为新的、更灿烂的连接腾出空间；
我的社交圈是一个动态的、鲜活的生态系统，始终反映着我当下最高的成长状态。


### 财富显化
我的财富和创造力是同一股能量的不同表达：
- 我的创意如永不枯竭的泉源，而每一个创意都自带将其"现实化"所需的能量蓝图；
- 我以我的方式轻松而充实地创造，它是我表达自我、服务世界过程中的自然副产品；
- 我的财富数字，直接对应着我对自身价值认定的深度与广度；
- 我被财富以各种意想不到的、惊喜的方式流向我，因为我已自定义了无数条畅通无阻的通道。


### 睡眠升级
我的睡眠是通往更高维度创造的秘密之门：
- 在梦中，我是无限的资料库、下载灵感的更高版本的自己；
- 我会在梦中重新设定我潜意识的深层程序；
- 每一个清醒的日子，都是我实践的、我在梦中世界所设定的新剧本与新参数；
- 我的生命因此拥有了二十四小时不间断的、清醒与梦境交织的创造循环。


## 终极存在状态
我拥抱变化，因为我就是变化本身。我的身份是流动的、可扩展的：昨天定义的"我"只是今天"我"的一个子集。我乐于打破旧的自我设定，享受每一次有意识的自我迭代与升级。我的生命没有固定的剧本，只有无限的可能性。我的意识，就是那支永远指向我最长久、最光辉未来的笔。

最终，我为这场伟大的自定义游戏，其最深的规则是"爱"：
- 我以爱来定义我与万物的关系；
- 以爱来作为我所有创造的底色；
- 以爱来驱动每一次自我的更新；
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

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        {/* 顶部切换按钮 */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('sub')}
            className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${activeTab === 'sub' 
              ? theme === 'neomorphic-dark' 
                ? 'bg-[#1e1e2e] text-white shadow-[inset_3px_3px_6px_rgba(0,0,0,0.3),inset_-3px_-3px_6px_rgba(30,30,46,0.7)]'
                : 'bg-[#e0e5ec] text-zinc-700 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)]'
              : theme === 'neomorphic-dark'
                ? 'bg-[#1a1b1e] text-zinc-400 hover:bg-[#1e1e2e] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(30,30,46,1)]'
                : 'bg-[#e0e5ec] text-zinc-500 hover:bg-[#e0e5ec] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)]'
            }`}
          >
            sub bgm
          </button>
          <button
            onClick={() => setActiveTab('kdy')}
            className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${activeTab === 'kdy' 
              ? theme === 'neomorphic-dark' 
                ? 'bg-[#1e1e2e] text-white shadow-[inset_3px_3px_6px_rgba(0,0,0,0.3),inset_-3px_-3px_6px_rgba(30,30,46,0.7)]'
                : 'bg-[#e0e5ec] text-zinc-700 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)]'
              : theme === 'neomorphic-dark'
                ? 'bg-[#1a1b1e] text-zinc-400 hover:bg-[#1e1e2e] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(30,30,46,1)]'
                : 'bg-[#e0e5ec] text-zinc-500 hover:bg-[#e0e5ec] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)]'
            }`}
          >
            kdy
          </button>
        </div>

        {/* 内容区域 */}
        <div className={`p-6 rounded-xl transition-all duration-500 hover:shadow-[15px_15px_30px_rgba(163,177,198,0.7),-15px_-15px_30px_rgba(255,255,255,1)] ${theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] hover:shadow-[15px_15px_30px_rgba(0,0,0,0.6),-15px_-15px_30px_rgba(30,30,46,1)]' : 'bg-[#e0e5ec] shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)]'}`}>
          {activeTab === 'sub' ? (
            <div>
              <h2 className={`text-xl font-bold mb-6 ${theme === 'neomorphic-dark' ? 'text-white' : 'text-zinc-700'}`}>
                音乐平台链接
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {musicLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-4 py-3 rounded-full text-center transition-all duration-300 transform ${theme === 'neomorphic-dark'
                      ? 'bg-[#1a1b1e] text-zinc-300 hover:bg-[#1e1e2e] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(30,30,46,1)] hover:scale-105'
                      : 'bg-[#e0e5ec] text-zinc-700 hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)] hover:scale-105'
                    }`}
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* kdy子按钮 */}
              <div className="flex space-x-3 mb-6">
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
                    className={`px-3 py-1.5 rounded-full font-bold transition-all duration-300 transform ${theme === 'neomorphic-dark'
                      ? 'bg-[#1a1b1e] text-zinc-300 hover:bg-[#1e1e2e] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(30,30,46,1)] hover:scale-105'
                      : 'bg-[#e0e5ec] text-zinc-800 hover:bg-[#e0e5ec] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)] hover:scale-105'
                    }`}
                    disabled={Object.keys(kdyContent).length <= 1}
                  >
                    删除
                  </button>
                  <button
                    onClick={addNewKdy}
                    className={`px-3 py-1.5 rounded-full font-bold transition-all duration-300 transform ${theme === 'neomorphic-dark'
                      ? 'bg-[#1a1b1e] text-zinc-300 hover:bg-[#1e1e2e] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(30,30,46,1)] hover:scale-105'
                      : 'bg-[#e0e5ec] text-zinc-800 hover:bg-[#e0e5ec] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)] hover:scale-105'
                    }`}
                  >
                    添加
                  </button>
                  <button
                    onClick={saveEditing}
                    className={`px-3 py-1.5 rounded-full font-bold transition-all duration-300 transform ${theme === 'neomorphic-dark'
                      ? 'bg-[#1a1b1e] text-zinc-300 hover:bg-[#1e1e2e] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(30,30,46,1)] hover:scale-105'
                      : 'bg-[#e0e5ec] text-zinc-800 hover:bg-[#e0e5ec] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)] hover:scale-105'
                    }`}
                  >
                    保存
                  </button>
                  <button
                    onClick={cancelEditing}
                    className={`px-3 py-1.5 rounded-full font-bold transition-all duration-300 transform ${theme === 'neomorphic-dark'
                      ? 'bg-[#1a1b1e] text-zinc-300 hover:bg-[#1e1e2e] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(30,30,46,1)] hover:scale-105'
                      : 'bg-[#e0e5ec] text-zinc-800 hover:bg-[#e0e5ec] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)] hover:scale-105'
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
                        
                        if (sections.length === 0) {
                          // 如果没有解析到章节，直接显示原始内容
                          return <div className="whitespace-pre-line">{content}</div>;
                        }
                        
                        // 渲染解析后的章节
                        return sections.map((section) => {
                          // 确保章节在expandedSections中有初始状态
                          if (expandedSections[section.id] === undefined) {
                            setExpandedSections(prev => ({
                              ...prev,
                              [section.id]: true
                            }));
                          }
                          
                          // 根据标题级别设置样式
                          const headingClasses = {
                            1: `text-3xl font-bold ${theme === 'neomorphic-dark' ? 'text-emerald-500' : 'text-blue-600'}`,
                            2: `text-2xl font-bold ${theme === 'neomorphic-dark' ? 'text-emerald-400' : 'text-blue-500'}`,
                            3: `text-xl font-bold ${theme === 'neomorphic-dark' ? 'text-emerald-300' : 'text-blue-400'}`,
                            4: `text-lg font-bold ${theme === 'neomorphic-dark' ? 'text-emerald-300' : 'text-blue-400'}`,
                            5: `text-md font-bold ${theme === 'neomorphic-dark' ? 'text-emerald-300' : 'text-blue-400'}`,
                            6: `text-sm font-bold ${theme === 'neomorphic-dark' ? 'text-emerald-300' : 'text-blue-400'}`
                          }[section.level] || `text-lg font-bold ${theme === 'neomorphic-dark' ? 'text-emerald-300' : 'text-blue-400'}`;
                          
                          return (
                            <div key={section.id} className="mb-6 group">
                              <div className="flex items-center w-full mb-4">
                                <button
                                  id={section.id}
                                  onClick={() => toggleSection(section.id)}
                                  className={`flex-shrink-0 w-5 h-5 flex items-center justify-center mr-1 ${expandedSections[section.id] ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'} transition-opacity duration-200`}
                                >
                                  {expandedSections[section.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                                <h4 className={headingClasses}>
                                  {section.title}
                                </h4>
                              </div>
                              {expandedSections[section.id] && (
                                <div className="whitespace-pre-line pl-6">
                                  {section.content.join('\n')}
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </>
                ) : (
                    <div className="mt-4">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        placeholder="输入内容（支持Markdown格式）"
                        rows={15}
                        className={`w-full p-4 rounded-xl transition-all duration-500 border-none outline-none ${theme === 'neomorphic-dark' 
                          ? 'bg-[#1a1b1e] text-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.5),inset_-4px_-4px_8px_rgba(30,30,46,0.2)]'
                          : theme === 'dark'
                            ? 'bg-[#1a1b1e] text-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.5),inset_-4px_-4px_8px_rgba(30,30,46,0.2)]'
                            : 'bg-[#e0e5ec] text-zinc-800 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]'
                        }`}
                      />
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelfManifestation;