# 思维模型文件中英文文本翻译脚本

# 定义翻译映射表
$translationMap = @{
    # 已翻译的内容
    "COMMITMENT ESCALATION" = "承诺升级"
    "ORDER" = "秩序"
    "EMOTIONAL STOP LOSS" = "情绪止损"
    "SUNK COST" = "沉没成本"
    "FUTURE" = "未来"
    "STUPIDITY" = "愚蠢"
    "CORE" = "核心"
    "SUB A" = "子主题A"
    "SUB B" = "子主题B"
    "SUB C" = "子主题C"
    "FLOW" = "心流"
    "ANXIETY" = "焦虑"
    "BOREDOM" = "无聊"
    "DIM A" = "维度A"
    "The Geometric Divergence" = "几何发散"
    "THE TOP" = "顶端"
    "PSEUDOCERTAINTY EFFECT" = "伪确定性效应"
    "A SPOON OF SEWAGE" = "一勺污水"
    "NEGATIVE ELEMENTS DOMINATE QUALITY" = "负面因素主导质量"
    "QUALITY BREEDS WEALTH" = "质量孕育财富"
    "FAILURE OF FOCUS" = "专注失败"
    "WALLACH PEAK" = "沃拉赫峰值"
    "FOCUS ON THE EXTREME TALENT" = "关注极端人才"
    "CONSPICUOUS CONSUMPTION" = "炫耀性消费"
    "THE SILENT EVIDENCE" = "沉默证据"
    "UNIVERSAL MACHINE" = "通用机器"
    "TOPOLOGICAL ORDER" = "拓扑序"
    "CRITICAL MASS" = "临界质量"
    "TIPPING POINT" = "临界点"
    "DEATH IS EQUILIBRIUM" = "死亡就是平衡"
    "THE ARROW OF TIME" = "时间之箭"
    "THE MODERN SURVIVAL ARCHITECTURE" = "现代生存架构"
    "MUTUAL AMPLIFICATION SYSTEM" = "相互放大系统"
    "STRATEGIC MATRIX ANALYSIS" = "战略矩阵分析"
    "QUIT" = "退出"
    "QUIT NOW" = "及时止损"
    "THE BOTTOMLESS PIT" = "无底洞"
    "DEADLINE" = "截止日期"
    "I" = "我"
    "AM" = "是"
    "SYSTEM DYNAMICS FOUNDATION" = "系统动力学基础"
    "STEREOTYPE LABEL" = "刻板印象标签"
    "REALITY" = "现实"
    "THE TRAP OF CATEGORIZATION" = "分类陷阱"
    "CHANGE IS VIEWED AS A RISK" = "变化被视为风险"
    "THE ILLUSION OF ATTENTION" = "注意力幻觉"
    "TIME DISSOLVES THE SOURCE" = "时间消解来源"
    "SKIN IN THE GAME" = "利益相关"
    "SKILL DEPRECIATION" = "技能贬值"
    "SINGULARITY" = "奇点"
    "FOCUS ON WHAT MATTERS" = "关注重要的事"
    "SHANNON LIMIT" = "香农极限"
    "TWO WATCHES MEAN NO TIME" = "两块表意味着没有时间"
    "BAD NEWS" = "坏消息"
    "PERCEPTION SHAPES REALITY" = "感知塑造现实"
    "SOCIOLOGICAL EMERGENCE" = "社会学涌现"
    "COGNITIVE BANDWIDTH TAX" = "认知带宽税"
    "SYSTEMATIC CREATIVITY ENGINE" = "系统性创造力引擎"
    "SUPPLY CREATES ITS OWN DEMAND" = "供给创造自身需求"
    "LANGUAGE SHAPES THOUGHT" = "语言塑造思想"
    "DECISION FILTER THROUGH TIME" = "时间决策过滤器"
    "HIGH EXPECTATION" = "高期望"
    "GROWTH" = "成长"
    "CUSTOMER VALUE QUANTIFICATION" = "客户价值量化"
    "EXTREMES ARE FOLLOWED BY MEDIOCRITY" = "极端之后是平庸"
    "RESILIENCE OVER EFFICIENCY" = "弹性优于效率"
    "RUNNING TO STAND STILL" = "奔跑以保持静止"
    "STOP THINKING" = "停止思考"
    "ACT NOW" = "立即行动"
    "THE LAST THING YOU HEARD IS THE LOUDEST" = "最后听到的最响亮"
    "COMPETITIVE ADVANTAGE OF NATIONS" = "国家竞争优势"
    "PRODUCT MARKET FIT" = "产品市场适配"
    "SCIENCE ADVANCES ONE FUNERAL AT A TIME" = "科学以一次葬礼的速度前进"
    "BELIEF IS MEDICINE" = "信念是良药"
    "PHASE TRANSITION" = "相变"
    "PERSONAL STRATEGIC AUDIT" = "个人战略审计"
    "P" = "计划"
    "D" = "执行"
    "C" = "检查"
    "A" = "行动"
    "CONDITIONED REFLEX" = "条件反射"
    "THE FRACTAL POWER LAW" = "分形幂律"
    "FOCUS ON THE VITAL FEW" = "关注关键少数"
    "SCIENTIFIC REVOLUTIONS" = "科学革命"
    "AVOIDING THE UNPLEASANT TRUTH" = "逃避不愉快的真相"
    "THE ILLUSION OF INVULNERABILITY" = "无敌幻觉"
    "Chaos is the Default State" = "混沌是默认状态"
    "THE COACHING EVOLUTION" = "教练进化"
    "The Strategic Triangle" = "战略三角"
    
    # 用户提到的未翻译内容
    "THE STRATEGIC TRIANGLE" = "战略三角"
    "The Manufacturing Tree" = "制造之树"
    "ROOT CAUSE FRAMEWORK" = "根本原因框架"
    "TESTING IS THE BEST WAY TO LEARN" = "测试是最好的学习方式"
}

# 获取所有思维模型HTML文件
$htmlFiles = Get-ChildItem -Path "thinking-models" -Filter "*.html" -Recurse

# 遍历每个文件并进行翻译
foreach ($file in $htmlFiles) {
    Write-Host "正在处理文件: $($file.FullName)"
    
    # 读取文件内容
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    # 遍历翻译映射表，替换所有匹配的英文文本
    foreach ($key in $translationMap.Keys) {
        $pattern = [regex]::Escape($key)
        $replacement = $translationMap[$key]
        $content = $content -replace $pattern, $replacement
    }
    
    # 保存修改后的内容
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
}

Write-Host "翻译完成！共处理了 $($htmlFiles.Count) 个文件。"