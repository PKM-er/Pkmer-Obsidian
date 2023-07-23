import { Notice } from 'obsidian';
import { PkmerSettingTab } from '@/settings';

export default class WereadLoginModel {
    private modal: any;
    private settingTab: PkmerSettingTab;
    constructor(settingTab: PkmerSettingTab) {
        this.settingTab = settingTab;
        const { remote } = require('electron');
        const { BrowserWindow: RemoteBrowserWindow } = remote;
        this.modal = new RemoteBrowserWindow({
            parent: remote.getCurrentWindow(),
            width: 630,
            height: 840,
            show: false
        });

        this.modal.once('ready-to-show', () => {
            this.modal.setTitle('登录Pkmer~');
            this.modal.setMenu(null);
            this.modal.show();
        });

        this.modal.webContents.on('will-navigate', () => {
            this.modal.webContents.executeJavaScript(`localStorage.getItem('pkmer-token')`).then((result: string) => {
                this.settingTab.saveToken(result);
                this.settingTab.display();
                this.modal.close();
            })
        })

        // this.modal.webContents.on('storage', (event: any, storageArea: any, key: string) => {
        //     // 检查localStorage的变化
        //     if (key === 'pkmer-token') {
        //         // 获取当前localStorage的值
        //         const newValue = localStorage.getItem(key);
        //         console.log(event, storageArea, newValue)
        //         // 关闭窗口
        //         this.modal.close();
        //         this.settingTab.display();
        //     }
        // });


        // const session = this.modal.webContents.session;
        // const filter = {
        // 	urls: ['https://weread.qq.com/web/user?userVid=*']
        // };
        // session.webRequest.onSendHeaders(filter, (details: any) => {
        // 	const cookies = details.requestHeaders['Cookie'];
        // 	const cookieArr = parseCookies(cookies);
        // 	const wr_name = cookieArr.find((cookie) => cookie.name == 'wr_name').value;
        // 	if (wr_name !== '') {
        // 		settingsStore.actions.setCookies(cookieArr);
        // 		settingTab.display();
        // 		this.modal.close();
        // 	} else {
        // 		this.modal.reload();
        // 	}
        // });
    }

    async doLogin() {
        try {
            await this.modal.loadURL('https://pkmer.cn/products/signIn/');
        } catch (error) {
            console.log(error);
            this.modal.webContents.executeJavaScript(`localStorage.getItem('pkmer-token')`).then((result: string) => {
                this.settingTab.saveToken(result);
                this.settingTab.display();
                this.modal.close();
            })
        }
    }

    async Loginout() {
        try {
            await this.modal.loadURL('https://pkmer.cn/products/UserProfile/');
            this.modal.webContents.executeJavaScript(`localStorage.removeItem('pkmer-token')`).then(() => {
                this.settingTab.saveToken("");
                this.settingTab.display();
                this.modal.close();
            })
        } catch (error) {
            console.log(error);
            new Notice('你没登录咋退出？');
        }
    }

    onClose() {
        this.modal.close();
    }
}