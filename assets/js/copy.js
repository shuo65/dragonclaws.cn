/* ==========================================
   龙爪中国网 - 通用脚本
   来源：index.html 提取（保持原样）
   ========================================== */

// Back to Top Button
const backToTopBtn = document.getElementById('backToTop');
const navbar = document.querySelector('.navbar');
let lastScrollTop = 0;

window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Show/Hide Back to Top button
    if (scrollTop > 300) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }

    // Hide/Show Navbar on scroll
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        navbar.classList.add('navbar-hidden');
    } else {
        navbar.classList.remove('navbar-hidden');
    }
    lastScrollTop = scrollTop;
});

backToTopBtn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Dark Mode Toggle (方案C：智能显示按钮)
const darkModeToggle = document.getElementById('darkModeToggle');
const darkModeIcon = document.getElementById('darkModeIcon');
const html = document.documentElement;

// 检查用户是否有手动设置
const savedTheme = localStorage.getItem('theme');
const hasManualTheme = savedTheme !== null;

function updateDarkModeUI(forceDark = null) {
    let isDark;
    
    if (forceDark !== null) {
        // 强制设置（用于点击切换）
        isDark = forceDark;
    } else {
        // 读取当前状态
        isDark = html.getAttribute('data-bs-theme') === 'dark';
    }

    // 更新UI
    if (isDark) {
        html.setAttribute('data-bs-theme', 'dark');
        darkModeIcon.textContent = '☀️';
        darkModeToggle.setAttribute('title', '当前：手动暗色（点击恢复系统自动）');
    } else {
        html.removeAttribute('data-bs-theme');
        darkModeIcon.textContent = '🌙';
        darkModeToggle.setAttribute('title', '当前：跟随系统（点击切换手动暗色）');
    }

    // 方案C：按钮显示逻辑
    if (hasManualTheme || forceDark === true) {
        // 用户有手动设置或刚切换到手动 → 显示按钮
        darkModeToggle.classList.add('visible');
    } else {
        // 系统自动模式 → 隐藏按钮
        darkModeToggle.classList.remove('visible');
    }
}

// 初始化
if (hasManualTheme) {
    // 有保存的设置，应用并显示按钮
    updateDarkModeUI(savedTheme === 'dark');
} else {
    // 无设置，跟随系统，隐藏按钮
    updateDarkModeUI(false);
}

// 点击切换
darkModeToggle.addEventListener('click', function() {
    const currentIsDark = html.getAttribute('data-bs-theme') === 'dark';
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme !== null) {
        // 当前是手动模式 → 清除设置，恢复系统自动
        localStorage.removeItem('theme');
        updateDarkModeUI(false);
    } else {
        // 当前是系统自动 → 切换到手动暗色
        localStorage.setItem('theme', 'dark');
        updateDarkModeUI(true);
    }
});

// Update copyright year
document.addEventListener('DOMContentLoaded', function() {
    const year = new Date().getFullYear();
    const copyright = document.querySelector('footer p.text-center.small');
    if (copyright) {
        copyright.innerHTML = `© ${year} 龙爪中国网. All rights reserved.`;
    }

    // Load Git timeline
    loadTimeline();
});

// Git Timeline Loader (Optimized for Mobile)
async function loadTimeline() {
    const container = document.getElementById('auto-timeline');
    if (!container) return;

    try {
        const response = await fetch('timeline.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const timeline = data.versions || [];

        if (timeline.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-muted">暂无版本历史记录</p>
                </div>`;
            console.warn('⚠️ timeline.json 中没有版本记录');
            return;
        }

        // 按年份分组
        const groups = {};
        timeline.forEach(v => {
            const year = v.date.split('-')[0]; // 提取年份
            if (!groups[year]) {
                groups[year] = [];
            }
            groups[year].push(v);
        });

        // 年份排序（降序）
        const yearList = Object.keys(groups).sort((a, b) => b - a);

        // 渲染筛选按钮
        let html = '<div class="timeline-filters">';
        html += '<button class="filter-btn active" data-year="all">全部</button>';
        yearList.forEach(year => {
            html += `<button class="filter-btn" data-year="${year}">${year}</button>`;
        });
        html += '</div><div class="timeline-groups">';

        // 渲染分组（默认全部折叠）
        yearList.forEach((year) => {
            const items = groups[year];
            html += `
                <div class="timeline-group" data-year="${year}">
                    <div class="group-header" onclick="toggleTimelineGroup(this)">
                        <span class="year-label">${year}年</span>
                        <span class="badge bg-secondary">${items.length}</span>
                        <span class="group-toggle-icon">▼</span>
                    </div>
                    <div class="group-items collapsed" data-expanded="false">
                        <div class="timeline">
                            ${items.map(v => `
                                <div class="timeline-item">
                                    <div class="timeline-dot"></div>
                                    <div class="timeline-content">
                                        <h5>${escapeHtml(v.version)} · ${escapeHtml(v.date)}</h5>
                                        <p class="text-muted mb-0">${escapeHtml(v.title)}</p>
                                        <small class="text-muted">提交: ${escapeHtml(v.commit)}</small>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>`;
        });
        html += '</div>';

        container.innerHTML = html;

        // 绑定筛选按钮事件
        container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const selectedYear = btn.dataset.year;

                container.querySelectorAll('.timeline-group').forEach(group => {
                    const groupYear = group.dataset.year;
                    if (selectedYear === 'all' || groupYear === selectedYear) {
                        group.style.display = 'block';
                    } else {
                        group.style.display = 'none';
                    }
                });
            });
        });

    } catch (error) {
        console.error('Failed to load timeline:', error);
// Fallback: 显示静态发展史（当网络或JSON加载失败时）
container.innerHTML = `
            <div class="timeline-filters">
                <button class="filter-btn active" data-year="all">全部</button>
                <button class="filter-btn" data-year="2025">2025</button>
                <button class="filter-btn" data-year="2026">2026</button>
            </div>
            <div class="timeline-groups">
                <div class="timeline-group" data-year="2025">
                    <div class="group-header" onclick="toggleTimelineGroup(this)">
                        <span class="year-label">2025年</span>
<span class="badge bg-secondary">4</span>
<span class="group-toggle-icon">▼</span>
                    </div>
                    <div class="group-items collapsed" data-expanded="false">
                        <div class="timeline">
                            <div class="timeline-item">
                                <div class="timeline-dot"></div>
                                <div class="timeline-content">
                                    <h5>2025年初 - 项目启动</h5>
                                    <p class="text-muted mb-0">OpenClaw项目正式启动，致力于打造跨平台智能Agent助手...</p>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-dot"></div>
                                <div class="timeline-content">
                                    <h5>2025年夏 - v2.0 企业级功能</h5>
                                    <p class="text-muted mb-0">添加团队协作、权限管理、审计日志等企业级功能...</p>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-dot"></div>
                                <div class="timeline-content">
                                    <h5>2025年秋 - v3.0 里程碑版本</h5>
                                    <p class="text-muted mb-0">OpenClaw v3.0发布，重写核心架构，支持多Agent协作，性能提升300%...</p>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-dot"></div>
                                <div class="timeline-content">
                                    <h5>2025年冬 - v1.0.0 首次正式发布</h5>
                                    <p class="text-muted mb-0">OpenClaw v1.0.0发布，支持基础Agent功能和插件系统，社区版本诞生...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="timeline-group" data-year="2026">
                    <div class="group-header" onclick="toggleTimelineGroup(this)">
                        <span class="year-label">2026年</span>
                        <span class="badge bg-secondary">12</span>
                        <span class="group-toggle-icon">▼</span>
                    </div>
                    <div class="group-items collapsed" data-expanded="false">
                        <div class="timeline">
                            <div class="timeline-item">
                                <div class="timeline-dot"></div>
                                <div class="timeline-content">
                                    <h5>2026年元旦 - v3.5 插件系统重构</h5>
                                    <p class="text-muted mb-0">全新的插件架构，支持热加载，提升可扩展性和稳定性...</p>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-dot"></div>
                                <div class="timeline-content">
                                    <h5>2026年春节 - v3.6 多模型支持扩展</h5>
                                    <p class="text-muted mb-0">支持Claude 3.7 Sonnet、Gemini 2.5 Pro等新模型，优化API调用效率...</p>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-dot"></div>
                                <div class="timeline-content">
                                    <h5>2026.03.07 - v3.7 记忆热插拔</h5>
                                    <p class="text-muted mb-0">革命性功能：AI记忆可自由插拔。新增GPT-5.4和Gemini 3.1 Flash支持...</p>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-dot"></div>
                                <div class="timeline-content">
                                    <h5>2026.03.08 - v3.8 ACP溯源</h5>
                                    <p class="text-muted mb-0">新增ACP来源（agent provenance），更好地识别用户交互。修复12+安全漏洞...</p>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-dot"></div>
                                <div class="timeline-content">
                                    <h5>2026.03.13 - OpenClaw-zh v2026.3.13</h5>
                                    <p class="text-muted mb-0">中文汉化版发布！全面本地化，支持微信/钉钉/飞书，百度网盘集成...</p>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-dot"></div>
                                <div class="timeline-content">
                                    <h5>2026.03.22 - v2026.3.22</h5>
                                    <p class="text-muted mb-0">双版本连发 + 安全加固：配对安全增强（256-bit令牌），控制台恢复，插件系统改进...</p>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-dot"></div>
                                <div class="timeline-content">
                                    <h5>2026.03.23 - v2026.3.23</h5>
                                    <p class="text-muted mb-0">Qwen随用随付 + DeepSeek可插拔：阿里云Qwen实现全球化"随用随付"，DeepSeek变为可插拔插件...</p>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-dot"></div>
                                <div class="timeline-content">
                                    <h5>2026.03.24 - v2026.3.24</h5>
                                    <p class="text-muted mb-0">Microsoft Teams全面升级 + 安全增强：迁移至官方Teams SDK，流式回复，OpenAI兼容性增强...</p>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-dot"></div>
                                <div class="timeline-content">
                                    <h5>2026.03.25 - v2026.3.25</h5>
                                    <p class="text-muted mb-0">关键Bug修复版本：OpenClaw 3月连发大版本，修复关键bug，提升系统稳定性...</p>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-dot"></div>
                                <div class="timeline-content">
                                    <h5>2026.03.28 - v2026.3.28</h5>
                                    <p class="text-muted mb-0">xAI深度集成 + x_search工具：Grok搜索迁移至Responses API，新增x_search工具，25+新功能，70+Bug修复...</p>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-dot"></div>
                                <div class="timeline-content">
                                    <h5>2026.03.31 - v2026.3.31</h5>
                                    <p class="text-muted mb-0">QQ原生接入 + 腾讯生态整合：原生内置QQ Bot插件，QQ成为首个官方原生支持的国内社交平台...</p>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-dot"></div>
                                <div class="timeline-content">
                                    <h5>2026.04.02 - v2026.4.2</h5>
                                    <p class="text-muted mb-0">Task Flow生产级化：质的跨越，从实验玩具升级为生产级多Agent协作系统，状态持久化...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Toggle timeline group collapse/expand
function toggleTimelineGroup(header) {
    const group = header.closest('.timeline-group');
    const items = group.querySelector('.group-items');
    const isCollapsed = items.classList.toggle('collapsed');
    header.dataset.expanded = !isCollapsed;
}

// XSS 防护：转义HTML特殊字符
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 一键复制命令功能（支持 Clipboard API + execCommand fallback）
function copyCmd(btn, cmd) {
    // 优先使用 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(cmd).then(function() {
            showCopySuccess(btn);
        }).catch(function(err) {
            // 失败时使用 fallback
            fallbackCopy(btn, cmd);
        });
    } else {
        // 不支持 Clipboard API，直接使用 fallback
        fallbackCopy(btn, cmd);
    }
}

// 复制成功提示
function showCopySuccess(btn) {
    const originalText = btn.textContent;
    btn.textContent = '✓ 已复制';
    btn.style.background = '#198754';
    setTimeout(function() {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 1500);
}

// 后备复制方案（execCommand）
function fallbackCopy(btn, cmd) {
    const textarea = document.createElement('textarea');
    textarea.value = cmd;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '2em';
    textarea.style.height = '2em';
    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopySuccess(btn);
        } else {
            showCopyFail(btn);
        }
    } catch (err) {
        showCopyFail(btn);
    }
    document.body.removeChild(textarea);
}

// 复制失败提示
function showCopyFail(btn) {
    btn.textContent = '复制失败';
    btn.style.background = '#dc3545';
    setTimeout(function() {
        btn.textContent = 'Copy';
        btn.style.background = '';
    }, 1500);
}
