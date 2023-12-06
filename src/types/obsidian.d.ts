import "obsidian";






declare module "obsidian" {
    export interface App {
        foldManager: FoldManager
        plugins: Plugins
        commands: Commands
        setting: SettingsManager
    }

    interface SettingsManager {
        activeTab: SettingTab | null;
        openTabById(id: string): SettingTab | null;
        openTab(tab: SettingTab): void;
        open(): void;
        close(): void;
        onOpen(): void;
        onClose(): void;
        settingTabs: SettingTab[];
        pluginTabs: SettingTab[];
        addSettingTab(): void;
        removeSettingTab(): void;
        containerEl: HTMLDivElement;
    }

    interface Plugins {
        manifests: Record<string, PluginManifest>;
        plugins: Record<string, Plugin_2>;
        enabledPlugins: any;
        enablePlugin(pluginId: string): Promise<boolean>;
        disblePlugin(pluginId: string): Promise<void>;
    }

    interface Commands {
        commands: Record<string, Command>;
        addCommand(cmd: Command): void;
        removeCommand(cmd: Command): void;
    }




    interface Editor {
        cm: CodeMirror.Editor;
    }

    interface EditorSuggestManager {
        suggests: EditorSuggest<any>[];
    }





}

