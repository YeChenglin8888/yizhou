"use client";

import { useState, type ReactNode } from "react";
import { BookOpen, ChevronLeft, ChevronRight, DatabaseBackup, Home, KeyRound, PartyPopper, Smartphone, X } from "lucide-react";

export const ONBOARDING_FLAG_KEY = "pneuma_onboarding_v1";

export function hasSeenOnboarding(): boolean {
    if (typeof window === "undefined") return true;
    try {
        return localStorage.getItem(ONBOARDING_FLAG_KEY) != null;
    } catch {
        return true;
    }
}

function markOnboardingSeen() {
    try {
        localStorage.setItem(ONBOARDING_FLAG_KEY, new Date().toISOString());
    } catch { /* ignore */ }
}

type GuideStep = {
    title: string;
    icon: ReactNode;
    body: ReactNode;
};

const iconWrap = (Icon: typeof Smartphone, color = "var(--c-accent)") => (
    <span className="onb-icon" style={{ color }}>
        <Icon size={22} strokeWidth={1.8} />
    </span>
);

const STEPS: GuideStep[] = [
    {
        title: "欢迎来到你的小手机",
        icon: iconWrap(Smartphone),
        body: (
            <>
                <p>夏以昼已经住进来了，还有黎深、祁煜、沈星回、秦彻四位伙伴等着你认识。</p>
                <p>聊天记录、记忆、角色和世界书全部保存在<b>这台设备本地</b>，不经过任何服务器。</p>
            </>
        ),
    },
    {
        title: "第一步：配置 API",
        icon: iconWrap(KeyRound, "var(--c-icon-blue)"),
        body: (
            <>
                <p>先去「设置 → API 设置」填写大模型 API Key，之后就能开聊。</p>
                <p>支持 OpenAI 兼容接口、Anthropic、Google Gemini。API 费用由 Key 所属账户承担。</p>
                <p className="onb-note">Key 只保存在本机。若 Anthropic 官方接口在浏览器里请求失败（跨域限制），换 OpenAI 兼容中转或 Gemini 即可。</p>
            </>
        ),
    },
    {
        title: "第二步：添加到主屏幕",
        icon: iconWrap(Home, "var(--c-icon-green)"),
        body: (
            <>
                <p><b>iPhone</b>：Safari 打开本站 → 点底部「分享」按钮 →「添加到主屏幕」。</p>
                <p><b>安卓</b>：Chrome 右上角菜单 →「安装应用」或「添加到主屏幕」。</p>
                <p className="onb-note">装到主屏幕后像普通 App 一样点图标进入，独立窗口更沉浸，浏览器存储也更不容易被系统回收。</p>
            </>
        ),
    },
    {
        title: "第三步：养成备份习惯",
        icon: iconWrap(DatabaseBackup, "var(--c-icon-amber)"),
        body: (
            <>
                <p>聊天记录、记忆、角色卡和世界书都存在本机。清理浏览器数据或更换设备前，记得去「设置 → 数据管理」导出备份。</p>
                <p className="onb-note">建议每周一次，或在重要剧情节点后导出。备份文件请妥善保管，里面有你的全部陪伴记录。</p>
            </>
        ),
    },
    {
        title: "可以开始了",
        icon: iconWrap(PartyPopper, "var(--c-icon-violet)"),
        body: (
            <>
                <p>打开「聊天」给夏以昼发第一条消息吧。</p>
                <p>「角色」里能查看全部角色卡；「查手机」「朋友圈」「日记」「群聊」等玩法在各自的 App 里等你发现。</p>
                <p className="onb-note">本引导可随时在「设置 → 新手引导」里重新查看。</p>
            </>
        ),
    },
];

export function OnboardingGuide({ open, onClose, autoMarkSeen = true }: {
    open: boolean;
    onClose: () => void;
    /** 完成/跳过时是否写入"已看过"旗标。设置页重看时传 false */
    autoMarkSeen?: boolean;
}) {
    const [step, setStep] = useState(0);
    if (!open) return null;

    const finish = () => {
        if (autoMarkSeen) markOnboardingSeen();
        onClose();
    };
    const skip = finish;
    const isLast = step === STEPS.length - 1;
    const current = STEPS[step];

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="onb-card">
                <div className="onb-head">
                    <span className="onb-step-no">{step + 1} / {STEPS.length}</span>
                    <button className="modal-header-btn modal-header-btn-muted" onClick={skip} aria-label="跳过引导">
                        <X size={16} />
                    </button>
                </div>
                <div className="onb-icon-row">{current.icon}</div>
                <h3 className="onb-title">{current.title}</h3>
                <div className="onb-body">{current.body}</div>
                <div className="onb-dots">
                    {STEPS.map((_, i) => (
                        <span key={i} className={"onb-dot" + (i === step ? " onb-dot-active" : "")} />
                    ))}
                </div>
                <div className="onb-actions">
                    {step > 0 && !isLast ? (
                        <button className="ui-btn ui-btn-ghost" onClick={() => setStep(s => s - 1)}>
                            <ChevronLeft size={15} /> 上一步
                        </button>
                    ) : (
                        <button className="ui-btn ui-btn-ghost" onClick={skip}>跳过</button>
                    )}
                    {isLast ? (
                        <button className="ui-btn ui-btn-primary" onClick={finish}>
                            <BookOpen size={15} /> 开始使用
                        </button>
                    ) : (
                        <button className="ui-btn ui-btn-primary" onClick={() => setStep(s => s + 1)}>
                            下一步 <ChevronRight size={15} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

/** 首启引导：仅当本机未看过引导时自动弹出 */
export function FirstRunOnboarding() {
    const [open, setOpen] = useState(() => !hasSeenOnboarding());
    if (!open) return null;
    return <OnboardingGuide open onClose={() => setOpen(false)} />;
}
