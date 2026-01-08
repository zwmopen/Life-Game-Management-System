
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

const MODEL_NAMES = [
  "心智闭环测试", "负面清单治理", "颗粒度缩减算法", "影子审计系统", "能量锚点协议", "逻辑断路补偿", "肌肉记忆优先律", "算法抗性设计", "单兵作战冗余", "均值回归防御",
  "显卡级执行力", "肉身破局协议", "哑巴士兵模式", "散热止损机制", "垃圾问答协议", "虚拟工资系统", "压缩饼干消化论", "钝感力重力场", "开枪先行律", "高认知穷人镜像",
  "MVP 进化逻辑", "瓜子反馈理论", "鲁莽行动协议", "40/70 决策准则", "认知代偿防火墙", "士兵/CEO 切换", "条件完备性幻觉", "中间态耐受性", "生理性产出协议", "脑嗨成瘾阻断",
  "微习惯启动器", "人生游戏化", "苏格拉底追问", "福格行为引擎", "最小可行性行动", "双轨价值体系", "环境诱导设计", "公开承诺协议", "双曲贴现防御", "死亡谷生存期",
  "个人复利账本", "认知套利", "反馈极化", "数字主权", "能力溢出", "情绪止损协议", "林迪式资产", "非线性激励", "算法防御", "单兵作战画布",
  "单人决策黑盒", "注意力复利", "认知负反馈", "反馈延迟校准", "技能半衰期", "情绪复利", "逻辑断路器", "机会成本(深度版)", "沉没成本(协议版)", "非标资产(溢价版)",
  "单人公司画布", "认知磨损", "价值锚点", "反馈延迟", "复利折旧", "情绪熵", "逻辑防火墙", "机会窗口", "沉没成本(个人版)", "非标资产",
  "两分钟法则", "可选性思维", "许可营销", "精力管理", "长线博弈", "信息增量", "技能复利", "多巴胺排毒", "反常识思维", "极简执行力",
  "1000铁粉定律", "安全边际", "卢曼卡片盒", "注意力经济", "生态位思维", "反向归纳法", "结构性空洞", "米勒定律", "网络中介逻辑", "元认知循环",
  "阿什比必要多样性", "凯利公式", "哥德尔不完备", "中心极限定理", "香农极限", "明斯基时刻", "普朗克尺度", "共有知识逻辑", "汉密尔顿法则", "凸性偏好",
  "拓扑量子纠错", "信息几何", "负熵流", "突发对称破缺", "奇异点思维", "共演化动力学", "非定域博弈", "兰道尔界限", "耗散共振", "拓扑序",
  "贝尔不等式", "相变临界", "麦克斯韦妖", "双盲实验", "庞加莱回归", "量子退相干", "拓扑鲁棒性", "非定域感应", "布朗运动搜索", "重整化思维",
  "量子纠缠", "对称性破缺", "超循环", "自创生", "偏好依附", "混沌边缘", "无标度网络", "滞后现象", "随机共振", "宽恕一报还一报",
  "艾略特波浪", "康波周期", "捕食者模型", "NK 适应性景观", "兰道尔原理", "贝纳德对流", "协同论", "戈珀特曲线", "怪异环", "热力学第三定律",
  "安娜·卡列尼娜原则", "耗散结构", "范式转移", "共生演化", "盖亚假说", "圖靈模式", "万能构造器", "费根鲍姆常数", "科学研究纲领", "分形维数",
  "齐夫定律", "普赖斯定律", "费米估算", "图灵完备", "帕勒托前沿", "霍金斯能量级", "卡尔达肖夫等级", "林德曼定律", "布尔斯廷效应", "萨皮尔-沃尔夫",
  "凯恩斯选美", "布利丹之驴", "决策疲劳", "习得性无助", "反馈滞后", "注意力过滤", "认知灵活性", "博弈惩罚", "系统临界态", "中子简并压",
  "康宁汉定律", "佩兹曼效应", "吉布森定律", "萨顿定律", "兰切斯特平方律", "香农熵", "科尔莫哥洛夫复杂度", "瓦格纳定律", "布尔决策逻辑", "承诺升级效应",
  "进化稳定策略", "伯克松悖论", "谢林隔离模型", "多巴胺 RPE", "集体行动逻辑", "库里肖夫效应", "萨拉米战术", "普雷马克原理", "霍夫曼编码逻辑", "邓巴层级",
  "废话不对称定律", "斯特赖桑德效应", "布雷斯悖论", "霍特林定律", "阿比林悖论", "萨伊定律", "韦伯-费希纳定律", "吉分悖论", "信息茧房", "卢比孔河陷阱",
  "混合策略", "马尔科夫链", "贝页斯先验", "反馈深度理论", "锁定效应", "零边际成本", "反演法 (深度)", "赢家诅咒", "塞瑞定律", "林迪效应 (强化)",
  "遍历性", "多重叠加效应", "反身性", "灰犀牛", "冗余与弹性", "减法思维", "运气表面积", "制度激励", "坎尼扎三角", "波普尔证诣主义",
  "谢林点", "委托代理问题", "外部性", "六度分隔", "巴菲特 5/25 法则", "信息不对称", "路径依赖", "创造性破坏", "平方反比定律", "公地悲剧 (强化)",
  "信号与噪声", "地图不等于疆域", "分形二八定律", "引爆点", "认知杠杆", "错误反向传播", "沉默的墓地", "涌现效应", "多米诺链条", "正和博弈",
  "OODA 循环", "四燃料箱理论", "情绪智力 (EQ)", "番茄工作法", "主动回忆", "低谷效应", "微习惯", "个人 SWOT", "正念冥想", "超级学习",
  "深度工作", "间隔复习", "后悔最小化框架", "冒名顶替综合征", "非暴力沟通", "艾宾浩斯遗忘曲线", "习惯堆叠", "多任务处理谬误", "费曼技巧 (强化)", "自我效能感",
  "成长型思维", "影响圈与关注圈", "生计志趣 (IKIGAI)","原子习惯", "吃掉那只青蛙", "T 型人才", "五小时原则", "德雷福斯模型", "认知带宽", "刻意练习",
  "波特钻石模型", "3C 战略模型", "GE 矩阵", "AISAS 模型", "70/20/10 学习法则", "RFM 用户价值模型", "VRIO 核心竞争力", "麦肯锡三增长曲线", "价值链分析", "产品生命周期",
  "科斯定理", "拉弗曲线", "不可能三角", "口红效应", "史特金定律", "库兹涅茨曲线", "基尼系数", "零和博弈", "公地悲剧", "比较优势",
  "布鲁克斯法则", "希克定律", "特斯勒定律", "系列位置效应", "卢比孔河模型", "自我损耗", "巴甫洛夫反应", "操作性条件反射", "复杂性偏见", "邓宁-克鲁格 (专家版)",
  "护城护河", "延迟满足", "社会认同", "皮格马利翁效应", "回声室效应", "认知失调", "边际效用递减", "刺谓理念",
  "PMF 适配模型", "创新扩散定律", "德西效应", "雷斯托夫效应", "过度辩护效应", "南风法则", "费斯汀格法则", "吉德林法则", "威尔逊法则", "古德曼定理",
  "斯特恩原理", "贝尔纳效应", "蓝斯登原则", "卢维斯定理", "托利得定理", "史华兹论断", "洛伯定理", "杜根定律", "皮尔·卡丹定理", "奥格尔维法则",
  "斯坦纳定理", "摩斯科定理", "认知隧道效应", "斯特鲁普效应", "蔡氏电路混沌", "埃尔斯伯格悖论", "狄德罗效应", "安慰剂效应", "锚定效应", "禀赋效应",
  "损失厌恶", "现状偏见", "巴纳姆效应", "框架效应", "聚光灯效应", "确认偏误", "幸存者偏差", "费曼技巧", "库伯学习圈", "邓宁-克鲁格效应",
  "认知负荷理论", "蔡格尼克效应", "心流模型", "艾森豪威尔矩阵", "帕金森定律", "学生综合征", "第一性原理", "复利效应", "熵增定律", "反脆弱性",
  "金字塔原理", "SWOT 分析", "黄金圈法则", "PDCA 循环", "冰山模型", "5W1H 分析", "帕累托法则", "OKR 目标管理", "MECE 原则", "SCAMPER 创新",
  "GROW 教练模型", "六顶思考帽", "卡诺模型", "双钻石模型", "反馈回路", "4P 营销理论", "AARRR 漏斗", "项目铁三角", "决策树模型", "蓝海战略",
  "马斯洛需求", "波特五力模型", "设计思维", "关键路径法", "麦肯锡 7S", "奥卡姆剃刀", "飞轮效应", "推论之梯", "逆向思维", "PESTEL 分析",
  "上游思维", "沉没成本", "安索夫矩阵", "钩子模型", "乔哈里视窗", "马太效应", "纳什均衡", "存量与流量", "曼陀罗法", "邓巴数字",
  "林迪效应", "汉隆剃刀", "5M1E 分析", "波士顿矩阵", "螃蟹效应", "双系统理论", "霍桑效应", "峰终定律", "梅特卡夫定律", "二阶思维",
  "福格行为模型", "红皇后效应", "10/10/10 法则", "破窗效应", "长尾理论", "能力圈", "黑天鹅效应", "风险共担", "机会成本", "杠铃策略",
  "囚徒困境", "古德哈特定律", "格雷希法则", "彼得原理", "眼镜蛇效应", "创新者窘境", "切斯特顿栅栏", "自行车棚效应", "侯世达定律", "盖尔定律",
  "基本率谬误", "可用性级联", "满意即可", "本福特定律", "卢卡斯批判", "坎贝尔定律", "控制点理论", "可得性启发", "规模效应", "撇脂定价",
  "渗透定价", "边际成本", "棘列效应", "帕累托最优", "康威定律", "能量守恒", "普朗克原理", "霍曼斯命题", "边际效用", "热力学第二定律",
  "沉睡者效应", "曝光效应", "虚假一致性", "自利性偏差", "对比效应", "踢猫效应", "瓦伦达效应", "宜家效应", "詹森效应", "对比效应 (强化)",
  "稀缺效应", "诱饵效应", "归因偏差", "后视偏差", "赌徒谬误", "热手效应", "认知闭合需求", "信念偏差", "乐观偏差", "鸵鸟效应",
  "知识陷阱", "控制错觉", "规划谬误", "零风险偏差", "邓宁-克鲁格 (深挖)", "阿伦森效应", "登门槛效应", "从众效应", "旁观者效应", "鸡尾酒会效应",
  "瓦拉赫效应", "共生效应", "刻板印象", "罗森塔尔效应", "木桶定律", "手表定律", "羊群效应", "蝴蝶效应", "长尾效应", "墨菲定律",
  "青蛙现象", "二八定律", "马太效应 (强化)", "破窗理论", "刺谓法则", "鲶鱼效应", "酒与污水定律", "光环效应", "首因效应", "近因效应",
  "暈轮效应", "木桶效应", "凡勃伦效应", "贝叶斯定理", "大数定律", "正态分布", "幂律分布", "均值回归"
];

const models = MODEL_NAMES.map((name, i) => {
  const displayId = 494 - i;
  const fileMap: Record<string, string> = {
    "心智闭环测试": "mind_loop_test.html",
    "负面清单治理": "negative_list.html",
    "颗粒度缩减算法": "granularity_shrink.html",
    "影子审计系统": "shadow_audit.html",
    "能量锚点协议": "energy_anchor.html",
    "逻辑断路补偿": "break_recovery.html",
    "肌肉记忆优先律": "muscle_memory_first.html",
    "算法抗性设计": "algo_resistance.html",
    "单兵作战冗余": "solo_redundancy.html",
    "均值回归防御": "mean_defense.html",
    "显卡级执行力": "gpu_execution.html",
    "肉身破局协议": "body_collision.html",
    "哑巴士兵模式": "mute_soldier.html",
    "散热止损机制": "thermal_shutdown.html",
    "垃圾问答协议": "trash_output.html",
    "虚拟工资系统": "virtual_wage.html",
    "压缩饼干消化论": "biscuit_digestion.html",
    "钝感力重力场": "dullness_gravity.html",
    "开枪先行律": "fire_then_aim.html",
    "高认知穷人镜像": "cognitive_poverty.html",
    "MVP 进化逻辑": "mvp_evolution.html",
    "瓜子反馈理论": "sunflower_feedback.html",
    "鲁莽行动协议": "recklessness_protocol.html",
    "40/70 决策准则": "decision_4070.html",
    "认知代偿防火墙": "cog_comp_defense.html",
    "士兵/CEO 切换": "soldier_ceo_mode.html",
    "条件完备性幻觉": "condition_illusion.html",
    "中间态耐受性": "plateau_tolerance.html",
    "生理性产出协议": "excretory_output.html",
    "脑嗨成瘾阻断": "brain_high_block.html",
    "微习惯启动器": "micro_habit_launcher.html",
    "人生游戏化": "life_gamification.html",
    "苏格拉底追问": "socratic_deep.html",
    "福格行为引擎": "fogg_engine.html",
    "最小可行性行动": "mva_protocol.html",
    "双轨价值体系": "dual_track_value.html",
    "环境诱导设计": "env_design.html",
    "公开承诺协议": "public_contract.html",
    "双曲贴现防御": "discounting_defense.html",
    "死亡谷生存期": "death_valley_phase.html",
    "个人复利账本": "personal_ledger.html",
    "认知套利": "cognitive_arbitrage.html",
    "反馈极化": "feedback_polarization.html",
    "数字主权": "digital_sovereignty.html",
    "能力溢出": "capability_overflow.html",
    "情绪止损协议": "emotional_stoploss.html",
    "林迪式资产": "lindy_assets.html",
    "非线性激励": "non_linear_incentives.html",
    "算法防御": "algorithmic_defense.html",
    "单兵作战画布": "solo_ops_canvas.html",
    "单人决策黑盒": "solo_decision_blackbox.html",
    "注意力复利": "attention_compounding.html",
    "认知负反馈": "cognitive_negative_feedback.html",
    "反馈延迟校准": "feedback_lag_calibration.html",
    "技能半衰期": "skill_half_life.html",
    "情绪复利": "emotional_compounding.html",
    "逻辑断路器": "logic_breaker.html",
    "机会成本(深度版)": "opp_cost_deep.html",
    "沉没成本(协议版)": "sunk_cost_protocol.html",
    "非标资产(溢价版)": "non_standard_premium.html",
    "单人公司画布": "solopreneur_canvas.html",
    "认知磨损": "cognitive_attrition.html",
    "价值锚点": "value_anchoring.html",
    "反馈延迟": "feedback_lag.html",
    "复利折旧": "compounding_decay.html",
    "情绪熵": "emotional_entropy.html",
    "逻辑防火墙": "logic_firewall.html",
    "机会窗口": "opportunity_window.html",
    "沉没成本(个人版)": "sunk_cost_personal.html",
    "非标资产": "non_standard_assets.html",
    "两分钟法则": "two_minute_rule.html",
    "可选性思维": "optionality.html",
    "许可营销": "permission_marketing.html",
    "精力管理": "energy_management.html",
    "长线博弈": "long_term_games.html",
    "信息增量": "information_delta.html",
    "技能复利": "skill_stacking.html",
    "多巴胺排毒": "dopamine_detox.html",
    "反常识思维": "contrarian_thinking.html",
    "极简执行力": "minimalist_execution.html",
    "1000铁粉定律": "true_fans.html",
    "安全边际": "margin_of_safety.html",
    "卢曼卡片盒": "zettelkasten.html",
    "注意力经济": "attention_economy.html",
    "生态位思维": "niche_strategy.html",
    "反向归纳法": "backward_induction.html",
    "结构性空洞": "structural_holes.html",
    "米勒定律": "millers_law.html",
    "网络中介逻辑": "network_brokerage.html",
    "元认知循环": "metacognition.html",
    "阿什比必要多样性": "ashbys_law.html",
    "凯利公式": "kelly_criterion.html",
    "哥德尔不完备": "goedels_incompleteness.html",
    "中心极限定理": "central_limit_theorem.html",
    "香农极限": "shannon_limit.html",
    "明斯基时刻": "minsky_moment.html",
    "普朗克尺度": "planck_scale.html",
    "共有知识逻辑": "common_knowledge.html",
    "汉密尔顿法则": "hamiltons_rule.html",
    "凸性偏好": "convexity_preference.html",
    "拓扑量子纠错": "topological_error_correction.html",
    "信息几何": "information_geometry.html",
    "负熵流": "negentropy_flow.html",
    "突发对称破缺": "spontaneous_symmetry_breaking.html",
    "奇异点思维": "singularity_thinking.html",
    "共演化动力学": "coevolutionary_dynamics.html",
    "非定域博弈": "non_local_games.html",
    "兰道尔界限": "landauers_bound.html",
    "耗散共振": "dissipative_resonance.html",
    "拓扑序": "topological_order.html",
    "贝尔不等式": "bells_theorem.html",
    "相变临界": "phase_transition.html",
    "麦克斯韦妖": "maxwells_demon.html",
    "双盲实验": "double_blind.html",
    "庞加莱回归": "poincare_recurrence.html",
    "量子退相干": "decoherence.html",
    "拓扑鲁棒性": "topological_robustness.html",
    "非定域感应": "non_locality.html",
    "布朗运动搜索": "brownian_search.html",
    "重整化思维": "renormalization.html",
    "量子纠缠": "quantum_entanglement.html",
    "对称性破缺": "symmetry_breaking.html",
    "超循环": "hypercycle.html",
    "自创生": "autopoiesis.html",
    "偏好依附": "preferential_attachment.html",
    "混沌边缘": "edge_of_chaos.html",
    "无标度网络": "scale_free_network.html",
    "滞后现象": "hysteresis.html",
    "随机共振": "stochastic_resonance.html",
    "宽恕一报还一报": "tit_for_tat_forgiveness.html",
    "艾略特波浪": "elliott_wave.html",
    "康波周期": "kondratiev_waves.html",
    "捕食者模型": "lotka_volterra.html",
    "NK 适应性景观": "nk_model.html",
    "兰道尔原理": "landauers_principle.html",
    "贝纳德对流": "benard_cells.html",
    "协同论": "synergetics.html",
    "戈珀特曲线": "gompertz_curve.html",
    "怪异环": "strange_loops.html",
    "热力学第三定律": "third_law_thermodynamics.html",
    "安娜·卡列尼娜原则": "anna_karenina_principle.html",
    "耗散结构": "dissipative_structures.html",
    "范式转移": "paradigm_shift.html",
    "共生演化": "symbiogenesis.html",
    "盖亚假说": "gaia_hypothesis.html",
    "图灵模式": "turing_patterns.html",
    "万能构造器": "universal_constructor.html",
    "费根鲍姆常数": "feigenbaum_constant.html",
    "科学研究纲领": "research_programmes.html",
    "分形维数": "fractal_dimension.html",
    "齐夫定律": "zipfs_law.html",
    "普赖斯定律": "prices_law.html",
    "费米估算": "fermi_estimation.html",
    "图灵完备": "turing_completeness.html",
    "帕勒托前沿": "pareto_frontier.html",
    "霍金斯能量级": "hawkins_scale.html",
    "卡尔达肖夫等级": "kardashev_scale.html",
    "林德曼定律": "lindemans_law.html",
    "布尔斯廷效应": "boorstin_effect.html",
    "萨皮尔-沃尔夫": "sapir_whorf.html",
    "凯恩斯选美": "keynesian_beauty.html",
    "布利丹之驴": "buridans_ass.html",
    "决策疲劳": "decision_fatigue.html",
    "习得性无助": "learned_helplessness.html",
    "反馈滞后": "feedback_delay.html",
    "注意力过滤": "attention_filter.html",
    "认知灵活性": "cognitive_flexibility.html",
    "博弈惩罚": "game_punishment.html",
    "系统临界态": "self_organized_criticality.html",
    "中子简并压": "degeneracy_pressure.html",
    "康宁汉定律": "cunninghams_law.html",
    "peltzman_effect": "peltzman_effect.html",
    "吉布森定律": "gibsons_law.html",
    "萨顿定律": "suttons_law.html",
    "兰切斯特平方律": "lanchester_square.html",
    "香农熵": "shannon_entropy.html",
    "科尔莫哥洛夫复杂度": "kolmogorov_complexity.html",
    "瓦格纳定律": "wagners_law.html",
    "布尔决策逻辑": "booles_logic.html",
    "承诺升级效应": "escalation_commitment.html",
    "进化稳定策略": "ess_strategy.html",
    "伯克松悖论": "berksons_paradox.html",
    "谢林隔离模型": "schelling_segregation.html",
    "多巴胺 RPE": "dopamine_rpe.html",
    "集体行动逻辑": "collective_action.html",
    "库里肖夫效应": "kuleshov_effect.html",
    "萨拉米战术": "salami_slicing.html",
    "普雷马克原理": "premack_principle.html",
    "霍夫曼编码逻辑": "huffman_logic.html",
    "邓巴层级": "dunbars_layers.html",
    "废话不对称定律": "brandolinis_law.html",
    "斯特赖桑德效应": "streisand_effect.html",
    "布雷斯悖论": "braess_paradox.html",
    "霍特林定律": "hotellings_law.html",
    "阿比林悖论": "abilene_paradox.html",
    "萨伊定律": "says_law.html",
    "韦伯-费希纳定律": "weber_fechner.html",
    "吉分悖论": "giffen_paradox.html",
    "信息茧房": "filter_bubble.html",
    "卢比孔河陷阱": "rubicon_trap.html",
    "混合策略": "mixed_strategy.html",
    "马尔科夫链": "markov_chain.html",
    "贝叶斯先验": "bayesian_prior.html",
    "反馈深度理论": "feedback_deep.html",
    "锁定效应": "lock_in.html",
    "零边际成本": "zero_marginal.html",
    "反演法 (深度)": "inversion_advanced.html",
    "赢家诅咒": "negotiation_curse.html",
    "塞瑞定律": "sayres_law.html",
    "林迪效应 (强化)": "lindy_deep.html",
    "遍历性": "ergodicity.html",
    "多重叠加效应": "lollapalooza.html",
    "反身性": "reflexivity.html",
    "灰犀牛": "gray_rhino.html",
    "冗余与弹性": "redundancy.html",
    "减法思维": "via_negativa.html",
    "运气表面积": "luck_surface_area.html",
    "制度激励": "institutional_imperative.html",
    "坎尼扎三角": "kanizsa_triangle.html",
    "波普尔证诣主义": "falsificationism.html",
    "谢林点": "schelling_point.html",
    "委托代理问题": "principal_agent.html",
    "外部性": "externalities.html",
    "六度分隔": "six_degrees.html",
    "巴菲特 5/25 法则": "buffett_525.html",
    "信息不对称": "asymmetric_info.html",
    "路径依赖": "path_dependency.html",
    "创造性破坏": "creative_destruction.html",
    "平方反比定律": "inverse_square.html",
    "公地悲剧 (强化)": "tragedy_commons_deep.html",
    "信号与噪声": "signal_noise.html",
    "地图不等于疆域": "map_territory.html",
    "分形二八定律": "pareto_fractal.html",
    "引爆点": "tipping_point.html",
    "认知杠杆": "cognitive_leverage.html",
    "错误反向传播": "backpropagation.html",
    "沉默的墓地": "unseen_cemetery.html",
    "涌现效应": "emergence.html",
    "多米诺链条": "domino_advanced.html",
    "正和博弈": "positive_sum.html",
    "OODA 循环": "ooda_loop.html",
    "四燃料箱理论": "four_burners.html",
    "情绪智力 (EQ)": "emotional_intelligence.html",
    "番茄工作法": "pomodoro.html",
    "主动回忆": "active_recall.html",
    "低谷效应": "the_dip.html",
    "微习惯": "mini_habits.html",
    "个人 SWOT": "personal_swot.html",
    "正念冥想": "mindfulness.html",
    "超级学习": "ultralearning.html",
    "深度工作": "deep_work.html",
    "间隔复习": "spaced_repetition.html",
    "后悔最小化框架": "regret_minimization.html",
    "冒名顶替综合征": "imposter_syndrome.html",
    "非暴力沟通": "nvc_model.html",
    "艾宾浩斯遗忘曲线": "forgetting_curve.html",
    "习惯堆叠": "habit_stacking.html",
    "多任务处理谬误": "multitasking_myth.html",
    "费曼技巧 (强化)": "feynman_advanced.html",
    "自我效能感": "self_efficacy.html",
    "成长型思维": "growth_mindset.html",
    "影响圈与关注圈": "circles_of_influence.html",
    "生计志趣 (IKIGAI)": "ikigai.html",
    "原子习惯": "atomic_habits.html",
    "吃掉那只青蛙": "eat_the_frog.html",
    "T 型人才": "t_shaped_skills.html",
    "五小时原则": "five_hour_rule.html",
    "德雷福斯模型": "dreyfus_model.html",
    "认知带宽": "cognitive_bandwidth.html",
    "刻意练习": "deliberate_practice.html",
    "波特钻石模型": "porter_diamond.html",
    "3C 战略模型": "3c_model.html",
    "GE 矩阵": "ge_matrix.html",
    "AISAS 模型": "aisas.html",
    "70/20/10 学习法则": "learning_702010.html",
    "RFM 用户价值模型": "rfm_model.html",
    "VRIO 核心竞争力": "vrio_model.html",
    "麦肯锡三增长曲线": "mckinsey_3_horizons.html",
    "价值链分析": "value_chain.html",
    "产品生命周期": "product_lifecycle.html",
    "科斯定理": "coase_theorem.html",
    "拉弗曲线": "laffer_curve.html",
    "不可能三角": "impossible_trinity.html",
    "口红效应": "lipstick_effect.html",
    "史特金定律": "sturgeons_law.html",
    "库兹涅茨曲线": "kuznets_curve.html",
    "基尼系数": "gini_coefficient.html",
    "零和博弈": "zero_sum.html",
    "公地悲剧": "tragedy_of_commons.html",
    "比较优势": "comparative_advantage.html",
    "布鲁克斯法则": "brooks_law.html",
    "希克定律": "hicks_law.html",
    "特斯勒定律": "teslers_law.html",
    "系列位置效应": "serial_position.html",
    "卢比孔河模型": "rubicon_model.html",
    "自我损耗": "ego_depletion.html",
    "巴甫洛夫反应": "pavlovian_response.html",
    "操作性条件反射": "operant_conditioning.html",
    "复杂性偏见": "complexity_bias.html",
    "邓宁-克鲁格 (专家版)": "dunning_kruger_expert.html",
    "护城河": "moat.html",
    "延迟满足": "delayed_gratification.html",
    "社会认同": "social_proof.html",
    "皮格马利翁效应": "pygmalion_effect.html",
    "回声室效应": "echo_chamber.html",
    "认知失调": "cognitive_dissonance.html",
    "边际效用递减": "diminishing_returns.html",
    "刺谓理念": "hedgehog_concept.html",
    "PMF 适配模型": "pmf_model.html",
    "创新扩散定律": "diffusion_innovation.html",
    "德西效应": "deci_effect.html",
    "雷斯托夫效应": "restorff_effect.html",
    "过度辩护效应": "overjustification_effect.html",
    "南风法则": "south_wind.html",
    "费斯汀格法则": "festinger_law.html",
    "吉德林法则": "gidlin_law.html",
    "威尔逊法则": "wilson_law.html",
    "古德曼定理": "goodman_theorem.html",
    "斯特恩原理": "stern_principle.html",
    "贝尔纳效应": "bernal_effect.html",
    "蓝斯登原则": "lansden_principle.html",
    "卢维斯定理": "lewis_law.html",
    "托利得定理": "tolider_law.html",
    "史华兹论断": "schwartz_thesis.html",
    "洛伯定理": "loeb_theorem.html",
    "杜根定律": "dugan_law.html",
    "皮尔·卡丹定理": "cardin_law.html",
    "奥格尔维法则": "ogilvy_law.html",
    "斯坦纳定理": "steiner_law.html",
    "摩斯科定理": "mosco_law.html",
    "认知隧道效应": "cognitive_tunneling.html",
    "斯特鲁普效应": "stroop_effect.html",
    "蔡氏电路混沌": "chua_circuit.html",
    "埃尔斯伯格悖论": "ellsberg_paradox.html",
    "狄德罗效应": "diderot_effect.html",
    "安慰剂效应": "placebo_effect.html",
    "锚定效应": "anchoring_effect.html",
    "禀赋效应": "endowment_effect.html",
    "损失厌恶": "loss_aversion.html",
    "现状偏见": "status_quo_bias.html",
    "巴纳姆效应": "barnum_effect.html",
    "框架效应": "framing_effect.html",
    "聚光灯效应": "spotlight_effect.html",
    "确认偏误": "confirmation_bias.html",
    "幸存者偏差": "survivorship_bias.html",
    "费曼技巧": "feynman_technique.html",
    "库伯学习圈": "kolb_cycle.html",
    "邓宁-克鲁格效应": "dunning_kruger.html",
    "认知负荷理论": "cognitive_load.html",
    "蔡格尼克效应": "zeigarnik_effect.html",
    "心流模型": "flow_model.html",
    "艾森豪威尔矩阵": "eisenhower.html",
    "帕金森定律": "parkinson_law.html",
    "学生综合征": "student_syndrome.html",
    "第一性原理": "first_principles.html",
    "复利效应": "compound_interest.html",
    "熵增定律": "entropy_law.html",
    "反脆弱性": "antifragile.html",
    "金字塔原理": "pyramid.html",
    "SWOT 分析": "swot.html",
    "黄金圈法则": "golden_circle.html",
    "PDCA 循环": "pdca.html",
    "冰山模型": "iceberg_model.html",
    "5W1H 分析": "5w1h.html",
    "帕累托法则": "pareto.html",
    "OKR 目标管理": "okr.html",
    "MECE 原则": "mece.html",
    "SCAMPER 创新": "scamper.html",
    "GROW 教练模型": "grow.html",
    "六顶思考帽": "six_hats.html",
    "卡诺模型": "kano.html",
    "双钻石模型": "double_diamond.html",
    "反馈回路": "feedback_loops.html",
    "4P 营销理论": "marketing_4p.html",
    "AARRR 漏斗": "aarrr.html",
    "项目铁三角": "iron_triangle.html",
    "决策树模型": "decision_tree.html",
    "蓝海战略": "blue_ocean.html",
    "马斯洛需求": "maslow.html",
    "波特五力模型": "porter_five.html",
    "设计思维": "design_thinking.html",
    "关键路径法": "cpm.html",
    "麦肯锡 7S": "mckinsey_7s.html",
    "奥卡姆剃刀": "occam_razor.html",
    "飞轮效应": "flywheel.html",
    "推论之梯": "ladder_inference.html",
    "逆向思维": "inversion.html",
    "PESTEL 分析": "pestel.html",
    "上游思维": "upstream.html",
    "沉没成本": "sunk_cost.html",
    "安索夫矩阵": "ansoff.html",
    "钩子模型": "hook_model.html",
    "乔哈里视窗": "johari_window.html",
    "马太效应": "matthew_effect.html",
    "纳什均衡": "nash_equilibrium.html",
    "存量与流量": "stock_and_flow.html",
    "曼陀罗法": "mandala_chart.html",
    "邓巴数字": "dunbars_number.html",
    "林迪效应": "lindy_effect.html",
    "汉隆剃刀": "hanlons_razor.html",
    "5M1E 分析": "5m1e.html",
    "波士顿矩阵": "bcg_matrix.html",
    "螃蟹效应": "crab_mentality.html",
    "双系统理论": "system_1_2.html",
    "霍桑效应": "hawthorne_effect.html",
    "峰终定律": "peak_end_rule.html",
    "梅特卡夫定律": "metcalfe.html",
    "二阶思维": "second_order.html",
    "福格行为模型": "fogg_behavior.html",
    "红皇后效应": "red_queen_effect.html",
    "10/10/10 法则": "rule_101010.html",
    "破窗效应": "broken_windows.html",
    "长尾理论": "long_tail.html",
    "能力圈": "circle_of_competence.html",
    "黑天鹅效应": "black_swan.html",
    "风险共担": "skin.html",
    "机会成本": "opportunity.html",
    "杠铃策略": "barbell.html",
    "囚徒困境": "prisoner.html",
    "古德哈特定律": "goodharts_law.html",
    "格雷希法则": "greshams_law.html",
    "彼得原理": "peter_principle.html",
    "眼镜蛇效应": "cobras_effect.html",
    "创新者窘境": "innovators_dilemma.html",
    "切斯特顿栅栏": "chestertons_fence.html",
    "自行车棚效应": "bike_shedding.html",
    "侯世达定律": "hofstadters_law.html",
    "盖尔定律": "galls_law.html",
    "基本率谬误": "base_rate_fallacy.html",
    "可用性级联": "availability_cascade.html",
    "满意即可": "satisficing.html",
    "本福特定律": "benfords_law.html",
    "卢卡斯批判": "lucas_critique.html",
    "坎贝尔定律": "campbells_law.html",
    "控制点理论": "locus_of_control.html",
    "可得性启发": "availability_heuristic.html",
    "规模效应": "economies_of_scale.html",
    "撇脂定价": "skimming_pricing.html",
    "渗透定价": "penetration_pricing.html",
    "边际成本": "marginal_cost.html",
    "棘列效应": "ratchet_effect.html",
    "帕累托最优": "pareto_optimality.html",
    "康威定律": "conway.html",
    "能量守恒": "energy_conservation.html",
    "普朗克原理": "plancks_principle.html",
    "霍曼斯命题": "homans_propositions.html",
    "边际效用": "marginal_utility.html",
    "热力学第二定律": "thermodynamics_second_law.html",
    "沉睡者效应": "sleeper_effect.html",
    "曝光效应": "exposure_effect.html",
    "虚假一致性": "false_consensus.html",
    "自利性偏差": "self_serving_bias.html",
    "对比效应": "contrast_effect.html",
    "踢猫效应": "kick_the_cat.html",
    "瓦伦达效应": "wallenda_effect.html",
    "宜家效应": "ikea_effect.html",
    "詹森效应": "janssen_effect.html",
    "对比效应 (强化)": "contrast_effect_reinforced.html",
    "稀缺效应": "scarcity_effect.html",
    "诱饵效应": "decoy_effect.html",
    "归因偏差": "attribution_bias.html",
    "后视偏差": "hindsight_bias.html",
    "赌徒谬误": "gamblers_fallacy.html",
    "热手效应": "hot_hand.html",
    "认知闭合需求": "need_for_closure.html",
    "信念偏差": "belief_bias.html",
    "乐观偏差": "optimism_bias.html",
    "鸵鸟效应": "ostrich_effect.html",
    "知识陷阱": "knowledge_trap.html",
    "控制错觉": "illusion_of_control.html",
    "规划谬误": "planning_fallacy.html",
    "零风险偏差": "zero_risk_bias.html",
    "邓宁-克鲁格 (深挖)": "dunning_kruger_deep.html",
    "阿伦森效应": "aronson_effect.html",
    "登门槛效应": "foot_in_the_door.html",
    "从众效应": "bandwagon_effect.html",
    "旁观者效应": "bystander_effect.html",
    "鸡尾酒会效应": "cocktail_party.html",
    "瓦拉赫效应": "wallach_effect.html",
    "共生效应": "symbiotic_effect.html",
    "刻板印象": "stereotype.html",
    "罗森塔尔效应": "rosenthal_effect.html",
    "木桶定律": "cannikin_law.html",
    "手表定律": "segals_law.html",
    "羊群效应": "herd_effect.html",
    "蝴蝶效应": "butterfly_effect.html",
    "长尾效应": "long_tail.html",
    "墨菲定律": "murphys_law.html",
    "青蛙现象": "boiling_frog.html",
    "二八定律": "pareto_2080.html",
    "马太效应 (强化)": "matthew_effect_reinforced.html",
    "破窗理论": "broken_windows_reinforced.html",
    "刺谓法则": "hedgehog_principle.html",
    "鲶鱼效应": "catfish_effect.html",
    "酒与污水定律": "wine_sewage_law.html",
    "光环效应": "halo_effect.html",
    "首因效应": "primacy_effect.html",
    "近因效应": "recency_effect.html",
    "暈轮效应": "halo_effect_deep.html",
    "木桶效应": "cannikin_law_deep.html",
    "凡勃伦效应": "veblen_effect.html",
    "贝叶斯定理": "bayes_theorem.html",
    "大数定律": "large_numbers.html",
    "正态分布": "normal_distribution.html",
    "幂律分布": "power_law.html",
    "均值回归": "regression_mean_deep.html"
  };

  return {
    id: `m_${displayId}`,
    displayId,
    name,
    file: fileMap[name] || "not_found.html",
    desc: "Solo Business Intelligence Unit v94.0",
    idx: i
  };
});

const App = () => {
  const [isDark, setIsDark] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [srcDoc, setSrcDoc] = useState('');

  const activeModel = models[activeIdx];

  const theme = useMemo(() => ({
    bg: isDark ? '#0A0F1E' : '#FFFFFF', 
    sidebar: isDark ? '#111827' : '#F8FAFC',
    heading: isDark ? '#F1F5F9' : '#0F172A',
    text: isDark ? '#94A3B8' : '#475569',
    accent: '#3b82f6'
  }), [isDark]);

  useEffect(() => {
    const loadContent = async () => {
      if (!activeModel || !activeModel.file) return;
      try {
        const response = await fetch(activeModel.file);
        if (!response.ok) throw new Error();
        const html = await response.text();
        const customStyles = `
          <style>
            :root { --accent: ${theme.accent}; --text: ${theme.text}; --heading: ${theme.heading}; --bg: ${theme.bg}; }
            body { background: var(--bg) !important; color: var(--text) !important; margin: 0; padding: 0; font-family: "SF Pro Display", "Inter", sans-serif; display: flex; flex-direction: column; align-items: center; overflow-x: hidden; }
            
            .neu-card, .model-card, .blueprint, body > div:first-child { 
              width: 100% !important; 
              height: 60vh !important; 
              min-height: 480px !important; 
              background: transparent !important; 
              border: none !important; 
              display: flex !important; 
              justify-content: center !important; 
              align-items: center !important; 
              position: relative; 
              margin: 0 !important; 
              padding: 0 !important; 
              box-sizing: border-box; 
              box-shadow: none !important;
            }
            
            svg { 
              max-width: 90% !important; 
              max-height: 85% !important; 
              overflow: visible !important; 
              filter: drop-shadow(0 15px 35px rgba(0,0,0,0.08)); 
            }
            
            .text-content, main, body > div:nth-child(2) { 
              width: 100% !important; 
              max-width: 760px !important; 
              margin: 0 auto !important; 
              padding: 1rem 2rem 10rem 2rem !important; 
              background: transparent !important; 
              border: none !important; 
            }
            
            h1 { 
              font-size: 2.8rem !important; 
              font-weight: 900 !important; 
              color: var(--heading) !important; 
              text-align: center !important; 
              margin-bottom: 0.75rem !important; 
              letter-spacing: -0.05em !important; 
              line-height: 1.0 !important; 
            }
            
            p { 
              font-size: 1.15rem !important; 
              line-height: 1.8 !important; 
              text-align: center !important; 
              opacity: 0.6 !important; 
              margin-bottom: 2.5rem !important; 
              font-weight: 400 !important; 
              max-width: 680px !important; 
              margin-left: auto !important; 
              margin-right: auto !important; 
            }
            
            .grid { 
              display: grid !important; 
              grid-template-columns: 1fr 1fr !important; 
              gap: 3rem !important; 
              border-top: 1px solid rgba(0,0,0,0.06); 
              padding-top: 2.5rem !important; 
            }
            
            h3 { 
              font-size: 0.85rem !important; 
              font-weight: 900 !important; 
              text-transform: uppercase !important; 
              letter-spacing: 0.25em !important; 
              color: var(--accent) !important; 
              margin-bottom: 1.2rem !important; 
              opacity: 0.8;
            }
            
            ul { padding: 0 !important; margin: 0 !important; list-style: none !important; }
            
            li { 
              font-size: 1.0rem !important; 
              line-height: 1.7 !important; 
              margin-bottom: 1.0rem !important; 
              color: var(--heading) !important; 
              display: block !important;
            }
            
            li strong { 
              color: var(--heading) !important; 
              font-weight: 800 !important; 
              display: inline !important; 
              margin-right: 0.4rem; 
              font-size: 1.05rem; 
              opacity: 1;
            }
            
            li::after { display: none !important; }
          </style>
        `;
        setSrcDoc(html.replace('</head>', `${customStyles}</head>`));
      } catch {
        const displayName = activeModel?.name || 'Unknown Model';
        const displayId = activeModel?.displayId || '??';
        setSrcDoc(`<html><body style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;background:${theme.bg};color:${theme.text};font-family:sans-serif;text-align:center;">
          <h1 style="font-size:200px;opacity:0.02;margin:0;font-weight:900;position:absolute;z-index:0;">${displayId}</h1>
          <h2 style="color:${theme.accent};font-size:36px;font-weight:900;position:relative;z-index:1;">${displayName}</h2>
          <p style="opacity:0.4;font-size:14px;margin-top:20px;letter-spacing:0.3em;position:relative;z-index:1;">EXECUTING THE CORE PROTOCOL...</p>
        </body></html>`);
      }
    };
    loadContent();
  }, [activeIdx, theme, activeModel]);

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ backgroundColor: theme.bg }}>
      <div className="w-80 h-full flex flex-col border-r z-20 transition-all shadow-2xl" style={{ backgroundColor: theme.sidebar, borderColor: isDark ? '#1E293B' : '#E2E8F0' }}>
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black tracking-tighter" style={{ color: theme.heading }}>HUB 494</h1>
              <p className="text-[9px] font-black opacity-30 tracking-[0.2em] uppercase">Bulletproof System</p>
            </div>
            <button onClick={() => setIsDark(!isDark)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 transition-all">
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="搜索思维模型..." 
              className="w-full px-5 py-4 rounded-2xl text-xs outline-none bg-white dark:bg-slate-900 border border-transparent focus:border-blue-500 shadow-sm transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute right-5 top-4 opacity-20">🔍</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-20 custom-scrollbar">
          {models.filter(m => m.name.includes(searchTerm)).map(m => (
            <button
              key={m.id}
              onClick={() => setActiveIdx(m.idx)}
              className={`w-full p-4 rounded-2xl transition-all flex items-center gap-5 border text-left
                ${activeIdx === m.idx 
                  ? 'border-blue-500 bg-white dark:bg-slate-800 shadow-xl translate-x-2' 
                  : 'border-transparent opacity-40 hover:opacity-100'}`}
            >
              <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-[10px] shrink-0
                ${activeIdx === m.idx ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-900 text-slate-400'}`}>
                {m.displayId}
              </div>
              <div className="overflow-hidden">
                <div className="text-[14px] font-black truncate" style={{ color: activeIdx === m.idx ? theme.accent : theme.heading }}>
                  {m.name}
                </div>
                <div className="text-[9px] opacity-40 truncate font-bold uppercase tracking-widest">Logic Core</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 h-full relative">
        <iframe srcDoc={srcDoc} className="w-full h-full border-none" title="Logic System" />
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
