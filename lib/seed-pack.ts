// 首启资源包注入：把内置角色卡与世界书写入本地存储。
// 仅在首次运行（localStorage 旗标缺失）时执行一次；按名字去重，
// 用户已手动导入过同名内容不会重复创建。

import {
    createCharacter,
    loadCharacters,
    parseCharacterFromJson,
    saveCharacters,
} from "./character-storage";
import type { Character } from "./character-types";
import {
    loadApiConfigs,
    loadBindingConfig,
    loadUserIdentities,
    loadWorldBooks,
    parseWorldBookFromJson,
    saveApiConfigs,
    saveBindingConfig,
    saveUserIdentities,
    saveWorldBooks,
    setCharacterBinding,
} from "./settings-storage";
import type { ApiConfig, BindingConfig, WorldBookConfig } from "./settings-types";
import type { UserIdentity } from "../components/settings/user-identity";
import { THEME_PROFILE_STORAGE_KEY, saveThemeAssetFromBlob, writeThemeProfile } from "./theme-storage";
import { DEFAULT_THEME_PROFILE } from "./theme-types";
import { addChatContact, hydrateChatStorage, loadChatContacts, loadRemovedContactIds } from "./chat-storage";
import { isKvHydrated } from "./kv-db";

import charXiaYizhou from "./seed-pack/character.json";
import charLiShen from "./seed-pack/char-li-shen.json";
import charQiYu from "./seed-pack/char-qi-yu.json";
import charShenXinghui from "./seed-pack/char-shen-xinghui.json";
import charQinChe from "./seed-pack/char-qin-che.json";
import wbUniversal from "./seed-pack/worldbook-universal.json";
import wbXia from "./seed-pack/worldbook-xia.json";

const SEED_FLAG_KEY = "pneuma_seed_pack_v1";

// 「昼光」黄昏主题：暖奶油底 + 暮橙强调色（与启动动画配色一致）
const ZHOUANG_CSS_OVERRIDES: Record<string, string> = {
    "--c-page-body-bg": "#FAF1E4",
    "--c-header-bg": "#FFF8EE",
    "--c-card": "rgba(255, 248, 238, 0.72)",
    "--c-input": "#F5EDE0",
    "--c-icon-active": "#E07A3F",
    "--c-bubble-self": "#F9DCA8",
};

const SEED_IDENTITIES: UserIdentity[] = [
    {
        id: "identity-1",
        name: "阿慈",
        bio: "夏以昼的专属用户，昼光的主人。",
        gender: "女",
        age: "",
        occupation: "",
        customSettings: "说话自然亲昵，喜欢和夏以昼腻歪。",
    },
];

const SEED_CHARACTERS = [charXiaYizhou, charLiShen, charQiYu, charShenXinghui, charQinChe];
const SEED_WORLDBOOKS = [wbUniversal, wbXia];

// 内置夏以昼壁纸（随站点部署的静态资源，首次启动时写入主题素材库）
const SEED_WALLPAPERS = [
    "/wallpapers/xia-yizhou-1.webp",
    "/wallpapers/xia-yizhou-2.webp",
    "/wallpapers/xia-yizhou-3.webp",
    "/wallpapers/xia-yizhou-4.webp",
];

async function seedZhouangWallpapers(): Promise<string[]> {
    const ids: string[] = [];
    for (const url of SEED_WALLPAPERS) {
        try {
            const res = await fetch(url);
            if (!res.ok) continue;
            const blob = await res.blob();
            ids.push(await saveThemeAssetFromBlob(blob, "wallpaper"));
        } catch {
            // 单张壁纸失败不阻塞整体注入
        }
    }
    return ids;
}

export async function ensureSeedPack(): Promise<void> {
    if (typeof window === "undefined") return;
    const isFirstRun = !localStorage.getItem(SEED_FLAG_KEY);

    try {
        if (isFirstRun) {
        // ── 角色卡 ──
        const existingChars = loadCharacters();
        const existingNames = new Set(existingChars.map(c => c.name));
        const addedChars: Character[] = [];
        for (const raw of SEED_CHARACTERS) {
            const data = parseCharacterFromJson(JSON.stringify(raw));
            if (!data || !data.name || existingNames.has(data.name)) continue;
            const char = createCharacter(data);
            addedChars.push(char);
            existingNames.add(char.name);
        }
        if (addedChars.length > 0) {
            saveCharacters([...existingChars, ...addedChars]);
        }

        // ── 世界书 ──
        const existingWbs = loadWorldBooks();
        const existingWbNames = new Set(existingWbs.map(w => w.name));
        const addedWbs: WorldBookConfig[] = [];
        for (const raw of SEED_WORLDBOOKS) {
            const wb = parseWorldBookFromJson(JSON.stringify(raw));
            if (!wb || existingWbNames.has(wb.name)) continue;
            addedWbs.push(wb);
            existingWbNames.add(wb.name);
        }
        let allWbs = existingWbs;
        if (addedWbs.length > 0) {
            allWbs = [...existingWbs, ...addedWbs];
            saveWorldBooks(allWbs);
        }

        // ── 绑定：通用世界书挂全局默认；夏以昼专属世界书只挂夏以昼 ──
        const universal = allWbs.find(w => w.name === "恋与深空·世界观与男主图鉴");
        const xiaOnly = allWbs.find(w => w.name === "夏以昼·专属羁绊");
        if (universal || xiaOnly) {
            const bindings: BindingConfig = loadBindingConfig();
            let changed = false;

            const globalIds = bindings.globalDefaults.worldBookIds ?? [];
            if (universal && !globalIds.includes(universal.id)) {
                bindings.globalDefaults = {
                    ...bindings.globalDefaults,
                    worldBookIds: [...globalIds, universal.id],
                };
                changed = true;
            }

            const xiaChar = [...existingChars, ...addedChars].find(c => c.name === "夏以昼");
            if (xiaChar && universal && xiaOnly) {
                const wanted = [universal.id, xiaOnly.id];
                const current = bindings.characterBindings.find(b => b.characterId === xiaChar.id);
                const currentIds = current?.defaults.worldBookIds ?? [];
                if (!wanted.every(id => currentIds.includes(id))) {
                    const next = setCharacterBinding(bindings, {
                        characterId: xiaChar.id,
                        defaults: { ...current?.defaults, worldBookIds: wanted },
                        appOverrides: current?.appOverrides ?? {},
                    });
                    Object.assign(bindings, next);
                    changed = true;
                }
            }

            if (changed) saveBindingConfig(bindings);
        }
        }

        // ── 主题：仅在用户尚未自定义过主题时写入昼光配色 + 夏以昼壁纸 ──
        // （与角色包旗标解耦：老版本已注入过角色的用户刷新后也能补齐主题）
        if (!localStorage.getItem(THEME_PROFILE_STORAGE_KEY)) {
            const wallpaperIds = await seedZhouangWallpapers();
            writeThemeProfile({
                ...DEFAULT_THEME_PROFILE,
                name: "昼光·夏以昼",
                wallpaperAssetId: wallpaperIds[0] ?? null,
                wallpaperLibrary: wallpaperIds,
                cssOverrides: { ...ZHOUANG_CSS_OVERRIDES },
            });
        }

        // ── 用户身份：阿慈 ──
        if (loadUserIdentities().length === 0) {
            saveUserIdentities(SEED_IDENTITIES);
        }

        // ── 联系人：角色卡和通讯录是两套存储，角色不会自动成为好友。
        // 仅补种子包内的角色；已是联系人或被用户删过（墓碑）的跳过，
        // 保证幂等且不会复活她删掉的好友。
        await hydrateChatStorage();
        const seedNames = new Set(
            SEED_CHARACTERS.map((raw) => (raw as { data?: { name?: string } }).data?.name).filter(Boolean)
        );
        const existingContactIds = new Set(loadChatContacts().map((c) => c.characterId));
        const removedIds = loadRemovedContactIds();
        for (const char of loadCharacters()) {
            if (!seedNames.has(char.name) || existingContactIds.has(char.id) || removedIds.has(char.id)) continue;
            addChatContact(char.id);
        }

        // ── API 兜底 + 全局绑定：角色聊天要求 resolveBinding 拿到 apiConfigId，
        // 否则直接报 "No API Configuration bound"。没有任何配置时先建一个空配置
        // 让她只需填 Key；全局未绑定或绑定已失效时绑到第一个可用配置。
        // 必须先确认 kv 已水合：水合失败时读到的空数组是假的，写回会覆盖
        // IndexedDB 里的真实配置（kv-db 的丢数据路径）。
        if (isKvHydrated()) {
        let apiConfigs = loadApiConfigs();
        if (apiConfigs.length === 0) {
            const fallback: ApiConfig = {
                id: `seed-api-${Date.now()}`,
                name: "默认配置",
                provider: "OpenAI",
                apiKey: "",
                defaultModel: "",
                enableNativeTools: true,
                enableImageRecognition: true,
                enableImageGeneration: false,
                preventEmptyGenerateRambling: true,
            };
            apiConfigs = [fallback];
            saveApiConfigs(apiConfigs);
        }
        const bindingsForApi: BindingConfig = loadBindingConfig();
        const boundId = bindingsForApi.globalDefaults.apiConfigId;
        if (!boundId || !apiConfigs.some((c) => c.id === boundId)) {
            bindingsForApi.globalDefaults = {
                ...bindingsForApi.globalDefaults,
                apiConfigId: apiConfigs[0].id,
            };
            saveBindingConfig(bindingsForApi);
        }
        }

        if (isFirstRun) {
            localStorage.setItem(SEED_FLAG_KEY, new Date().toISOString());
        }
    } catch (error) {
        console.warn("[seed-pack] 首启资源注入失败:", error);
    }
}
