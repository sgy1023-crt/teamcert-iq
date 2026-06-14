# TeamCert IQ — 项目交接文档

> 最后更新：2026-06-14
> 项目位置：`G:/claude code workspace/teamcert-iq/teamcert-iq-next`
> 技术栈：Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui
> 赛道：Microsoft Agents League Hackathon 2026 — Reasoning Agents Track

---

## 1. 这个项目是什么

TeamCert IQ 是一个**企业认证就绪度评估系统**。输入一个员工的画像（角色、目标认证、会议负荷、练习分数、可学习时间），系统跑一个 **7-agent 工作流**，输出：就绪度分数、弱项诊断、个性化学习计划、练习题、给管理者的辅导建议，以及一份引用校验 + 安全审计报告。

核心卖点（评委视角）：
- **7 个专门化 agent** 协同推理，不是单一 chatbot
- **grounded retrieval**：每条建议都从合成知识库检索并带 citation
- **混合架构**：评分引擎和 Verifier 是 deterministic（可解释、可复现），Manager Insight Agent 可选接真 LLM（OpenAI / Azure OpenAI），失败自动回退本地模板
- **透明评分**：就绪度分数用加权公式算，UI 展示完整拆解
- **合成数据**：零真实 PII

---

## 2. 当前已经做了什么（按提交顺序）

### 架构 / 后端
- `lib/agents/` 下 7 个 agent + 1 个 coordinator
  - Learner Profile / Learning Path Curator / Study Plan Generator / Assessment / Manager Insights / Verifier / Composer
- `lib/scoring.ts` —— 统一加权评分引擎（practice 45% + timeFit 15% + workload 10% + weakDomain 20% + evidence 10%）
- `lib/iq/local-demo-iq.ts` —— 合成知识库 + 关键词检索 + `getAllSourceIds()` 供 verifier 查证
- `lib/llm/llm-adapter.ts` —— **多供应商 LLM 客户端**：
  - 支持任意自定义 OpenAI 兼容端点（LLM_API_KEY + LLM_BASE_URL）
  - 内置 8 个命名供应商（OpenAI / DeepSeek / Moonshot / OpenRouter / SiliconFlow / Together / Zhipu / Qwen），填 key 自动补齐 base URL 和默认模型
  - Azure OpenAI
  - 12 秒超时，任何失败返回 null
  - `listModels()` 查询可用模型，`generateManagerInsight()` 返回 `{output, provider, model}`
- `app/api/assess/route.ts` —— POST，跑完整 7-agent 流程
- `app/api/status/route.ts` —— GET，返回 LLM 是否已配置 + provider + defaultModel（首页用）
- `app/api/models/route.ts` —— GET，返回当前 provider 可用模型列表

### 评分引擎（已修过的坑）
- 早期版本用大额扣分，Alex 算出 16 分（不合理）
- 现在是加权评分，三个预设候选分数落在合理区间：
  - Alex Chen（Cloud Engineer / AZ-204）：~51
  - Maya Patel（DevOps Engineer / AZ-400）：~68
  - Jordan Lee（Data Engineer / DP-203）：~84
- 分数完全由输入参数驱动，不按名字写死

### Verifier（从橡皮图章升级为真审计）
- 真去知识库逐条查证每个 cited sourceId 是否存在
- citation coverage = grounded claims / total claims
- 扫 PII / 密钥模式
- 解耦了与 Manager 的循环依赖（Manager 要 Verifier 结果当 LLM context，Verifier 只审 grounded 内容）

### 前端 / UI
- Hero：标题 + badges + 候选人选择器 + Demo Scenario 卡 + 可调参数 + Run 按钮 + Active Mode 横幅 + **Manager Insight 模式状态条**（首页就显示 LLM-assisted / Local fallback）
- System Overview：Bento Grid 指标卡 + counting 动画
- Agent Progress：运行时显示 7 个 agent 步骤卡
- Assessment Summary：What this result means + 分数 + 弱项 + verifier + "How the score was calculated" 拆解 + "Why more than a chatbot"
- Results Tabs：8 个 tab（Final Recommendation / Learning Path / Study Plan / Practice / Manager / Trace / Verifier / Evaluation）
- Manager tab：显示 generation mode 徽章 + LLM 生成的四段叙事（managerSummary / riskExplanation / coachingRecommendation / nextBestAction）
- 已删除冗余的 Advanced Configuration 面板
- 已铺宽布局（max-w-5xl → max-w-7xl/6xl/5xl 分层）
- 已修 slider 卡死（受控 input 拖动触发整页重渲染）→ SliderField 本地 state，松手才同步父级

### 文档
- `README.md`（含混合架构诚实说明 + env 配置）
- `DEMO_SCRIPT.md`（1-2 分钟演示脚本）
- LICENSE、.gitignore、package.json 元信息

---

## 3. 已知的遗留问题

### 高优先级（影响提交 / 演示）
1. **LLM 还没真跑过。** Manager Insight Agent 接好了多供应商 adapter（支持 OpenAI、DeepSeek、Moonshot、OpenRouter、SiliconFlow、Together、智谱、通义千问、Azure、任意自定义 OpenAI 兼容端点），但本地没配 API key，所以首页和结果都显示 "Local fallback"。要让 demo 显示绿色 "LLM-assisted"，必须在 `.env.local` 配任一供应商 key（见第 5 节），并实测一次 LLM 真的返回了四段叙事。**这是拿奖成色的关键，必须做。**
2. **没有部署。** 目前只能本地 `pnpm dev` 跑。Vercel 部署没试过。如果提交要求线上 demo URL，需要部署；否则用 GitHub repo + 本地运行说明 + 录屏替代。
3. **没有录屏。** DEMO_SCRIPT.md 写好了脚本，但没录视频。评委大概率靠视频打分。

### 中优先级（体验 / 可信度）
4. **"智能"成色仍偏弱。** 7 个 agent 里只有 1 个（Manager）接了真 LLM。其余 6 个是规则 / 模板。评委如果点开 Agent Trace 会看到大部分 agent 的 detail 是字符串拼接。当前叙事靠"混合架构 + 透明评分 + Verifier 真审计"撑住，但如果评委较真"推理成色"，这是软肋。可考虑给 Assessment Agent 也接 LLM 真出题（但刚毅明确只接 Manager，改之前要确认）。
5. **知识检索很弱。** LocalDemoIQ 是关键词计数匹配，不是语义检索 / 向量检索。Foundry IQ 集成只是 scaffold（`lib/iq/azure-foundry-iq.ts` 在老的 Streamlit 项目里，Next.js 版没有真接）。
6. **Agent Progress 不是真流式。** 运行时一次性显示所有 agent 步骤（都标 completed），不是边跑边出现。要真流式得用 SSE / WebSocket。
7. **System Overview 指标是静态声明值。** "7 agents / 5 sources / 92.5% / 600ms" 是写死的展示数，不是每次跑出来的真实统计。600ms 在 headless 里测实际更快。

### 低优先级（打磨）
8. `app/page.tsx` 里 `handleGenerateCustom` 是 dead code（AdvancedConfig 删了之后没人调用），留着不影响编译，但可清理。
9. `components/advanced-config.tsx` 文件还在（只是没被 import），可删。
10. Practice Score 拖到 75% 实际算出 66（我之前口头说 ~74 估错了）。公式本身合理，只是我报错数字。
11. 旧 Streamlit 版本（`teamcert-iq/` 根目录的 Python 项目）和 `submission/demo_dashboard.html` 静态页还在仓库里，是历史产物。Next.js 版（`teamcert-iq-next/`）才是当前主线。

---

## 4. 提交前必须达成的标准（Definition of Done）

按重要性排序，**前 3 条是硬门槛**：

- [ ] **配 LLM key 并实测成功。** 在 `teamcert-iq-next/.env.local` 填 key，重启，跑一次，确认首页状态条变绿 "LLM-assisted"，Manager tab 出现四段模型生成的叙事。
- [ ] **主流程闭环无 bug。** 选候选人 → 调参数（slider 双向都流畅）→ Run → 看到 7-agent → 自动滚到 Assessment Complete → 各 tab 数据正确。三个候选人分数明显不同（51 / 68 / 84）。
- [ ] **录一个 1-2 分钟 demo 视频。** 按 DEMO_SCRIPT.md，展示：首页 LLM 状态条 → 选 Alex 跑 → 看 7-agent → Assessment Complete → 调高 practice score 重跑看分数变 → 切到 Manager tab 展示 LLM 叙事 → Agent Trace 展示 grounding。

加分项（有时间再做）：
- [ ] Vercel 部署，拿到线上 URL
- [ ] README 里补真实截图（配了 LLM 之后的）
- [ ] GitHub repo 设为 public，README 里的 GitHub URL 占位符替换成真实地址
- [ ] 提交表单的 short description（README 里已有草稿）

---

## 5. 怎么在本地跑

```bash
cd "G:/claude code workspace/teamcert-iq/teamcert-iq-next"
pnpm install          # 首次
pnpm dev              # 启动，访问 http://localhost:3000
```

启用 LLM（可选，但强烈建议）—— 创建 `teamcert-iq-next/.env.local`，**选一个**：

```bash
# 自定义 OpenAI 兼容端点（本地 Ollama / vLLM / 代理等）
LLM_API_KEY=sk-...
LLM_BASE_URL=http://localhost:11434/v1
LLM_MODEL=qwen2.5:7b                      # 可选
LLM_PROVIDER_NAME=ollama                  # 可选，显示名称

# OpenAI
OPENAI_API_KEY=sk-...

# DeepSeek（推荐，便宜）
DEEPSEEK_API_KEY=sk-...

# Moonshot（月之暗面）
MOONSHOT_API_KEY=sk-...

# OpenRouter（聚合 200+ 模型）
OPENROUTER_API_KEY=sk-...

# SiliconFlow（国内）
SILICONFLOW_API_KEY=sk-...

# Together AI
TOGETHER_API_KEY=...

# 智谱 GLM
ZHIPU_API_KEY=...

# 通义千问
QWEN_API_KEY=sk-...

# Azure OpenAI
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=https://<resource>.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=<deployment-name>
```

不配任何 key 也能完整跑，只是 Manager Insight 走本地 fallback。配了任一 key 后重启，首页状态条会变绿显示供应商名和模型。

---

## 6. 关键文件地图

```
teamcert-iq-next/
├── app/
│   ├── page.tsx                 # 主页（状态、事件、布局编排）
│   ├── api/assess/route.ts      # 7-agent 工作流入口
│   └── api/status/route.ts      # LLM 是否已配置
├── components/
│   ├── hero-section.tsx         # 首屏 + 候选人 + 参数 + SliderField
│   ├── demo-scenario-card.tsx
│   ├── system-overview.tsx      # Bento 指标卡
│   ├── agent-progress.tsx       # 运行中 7 步
│   ├── assessment-summary.tsx   # 结果摘要 + 分数拆解
│   └── results-tabs.tsx         # 8 个 tab
├── lib/
│   ├── types.ts                 # 所有 TS 类型
│   ├── scoring.ts               # 加权评分引擎（核心，别乱改）
│   ├── agents/                  # 7 agent + coordinator
│   ├── iq/local-demo-iq.ts      # 合成知识库
│   └── llm/llm-adapter.ts       # LLM 客户端（OpenAI + Azure）
├── README.md
└── DEMO_SCRIPT.md
```

---

## 7. 架构决策记录（为什么这么设计，免得后人改错）

1. **评分引擎必须 deterministic。** 就绪度分数是核心可信输出，不能交给 LLM 随机生成。加权公式透明可复现，UI 展示拆解。**不要把评分逻辑挪进 LLM。**

2. **Verifier 必须 deterministic。** 安全审计层不能由被审计的对象（LLM）自己审。Verifier 真去知识库查证引用，不依赖 Manager 叙事。

3. **只有 Manager Agent 接 LLM。** 这是刚毅明确的边界。LLM 只写叙事（coaching 文字），不碰分数、不碰审计、不碰 grounding。其他 6 个 agent 是规则。要扩 LLM 范围（比如 Assessment 真出题）必须先和刚毅确认。

4. **LLM 失败必须静默回退。** adapter 任何失败（无 key / 网络 / 超时 / JSON 错）返回 null，Manager agent 用本地模板，页面绝不崩。generationMode 字段如实标记 llm / local。

5. **候选人是预设但参数可调。** Alex/Maya/Jordan 只是把默认参数填进去，用户可以随便改 practice/study/meeting，Run 时用最终值算分。不要把分数写死。

6. **Slider 用本地 state。** 受控 range input 在拖动时触发整页重渲染会卡死。SliderField 本地维护拖动值，松手才同步父级。改 slider 行为时注意这个。

---

## 8. 未来路线（赛后）

- **P0** 给更多 agent 接 LLM（Assessment 真出题、Learning Path 真做语义检索排序），让"推理成色"名副其实
- **P1** 真 Foundry IQ / Azure AI Search 集成，替掉关键词检索
- **P1** Agent Progress 改真流式（SSE），边跑边出
- **P2** 多学习者批量、团队 dashboard、历史趋势
- **P2** 真实数据治理（目前全合成）

---

## 9. 给接手者的第一句话

先读 `README.md` 的 "Hybrid Reasoning Architecture" 那节，理解为什么评分和 Verifier 是 deterministic 而 Manager 是 LLM。然后读 `lib/scoring.ts` 和 `lib/agents/coordinator.ts`，这两个是系统的心脏。改之前先看本文件第 7 节的架构决策，别把 deterministic 的部分改成 LLM。

当前最紧迫的事：配 LLM key 实测一次，然后录视频。
