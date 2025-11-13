import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const __dirname = path.resolve();

async function createZipWithJSZip() {
    try {
        console.log('📦 开始构建和打包（使用JSZip）...');

        // 1. 运行构建
        console.log('🔨 运行构建...');
        execSync('npm run build', { stdio: 'inherit' });

        // 2. 检查构建产物
        const requiredFiles = ['main.js', 'styles.css', 'manifest.json'];
        for (const file of requiredFiles) {
            if (!fs.existsSync(path.join(__dirname, file))) {
                throw new Error(`构建产物缺失: ${file}`);
            }
        }
        console.log('✅ 构建产物检查完成');

        // 3. 创建zip实例
        const zip = new JSZip();

        // 4. 添加文件到obsidian-pkmer文件夹
        console.log('📋 添加文件到zip...');
        zip.file('obsidian-pkmer/main.js', fs.readFileSync(path.join(__dirname, 'main.js')));
        console.log('  ✅ obsidian-pkmer/main.js');

        zip.file('obsidian-pkmer/styles.css', fs.readFileSync(path.join(__dirname, 'styles.css')));
        console.log('  ✅ obsidian-pkmer/styles.css');

        zip.file('obsidian-pkmer/manifest.json', fs.readFileSync(path.join(__dirname, 'manifest.json')));
        console.log('  ✅ obsidian-pkmer/manifest.json');

        // 5. 检查是否有其他资源文件
        const otherFiles = fs.readdirSync(__dirname)
            .filter(file => file.startsWith('assets/') || file.endsWith('.map'));

        otherFiles.forEach(file => {
            const fullPath = path.join(__dirname, file);
            if (fs.statSync(fullPath).isFile()) {
                zip.file(`obsidian-pkmer/${file}`, fs.readFileSync(fullPath));
                console.log(`  ✅ obsidian-pkmer/${file}`);
            }
        });

        // 6. 生成zip文件
        const zipPath = path.join(__dirname, 'obsidian-pkmer.zip');
        if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath);
        }

        console.log('🔒 正在生成zip文件...');
        const content = await zip.generateAsync({
            type: 'nodebuffer',
            compression: 'DEFLATE',
            compressionOptions: {
                level: 9
            }
        });

        // 7. 写入文件
        fs.writeFileSync(zipPath, content);

        console.log(`\n✅ Zip文件创建成功!`);
        console.log(`📦 文件路径: ${zipPath}`);
        console.log(`📊 文件大小: ${content.length} bytes`);

        // 8. 验证zip文件
        console.log('\n🔍 验证zip文件...');
        const zipTest = new JSZip();
        await zipTest.loadAsync(content);
        const fileList = Object.keys(zipTest.files);
        console.log(`✅ zip文件包含 ${fileList.length} 个文件/文件夹`);
        fileList.forEach(file => {
            if (!zipTest.files[file].dir) {
                console.log(`  - ${file}`);
            }
        });

        console.log('\n🎉 打包完成!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ 打包失败:', error.message);
        if (error.stack) {
            console.error('\n堆栈信息:', error.stack);
        }
        process.exit(1);
    }
}

createZipWithJSZip();
