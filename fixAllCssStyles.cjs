const fs = require('fs');
const path = require('path');

// 读取文件内容
const filePath = './components/MissionControl.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 移除所有SVG内部的<style>标签，包括CSS关键帧
// 首先移除包含@keyframes的style标签
content = content.replace(/<style>[\s\S]*?@keyframes[\s\S]*?<\/style>/g, '');

// 然后移除其他style标签
content = content.replace(/<style>[\s\S]*?<\/style>/g, '');

// 写入修复后的文件
fs.writeFileSync(filePath, content, 'utf8');
console.log('已移除所有SVG内部的<style>标签');
