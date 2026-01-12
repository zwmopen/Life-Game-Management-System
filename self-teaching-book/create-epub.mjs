import fs from 'fs';
import { execSync } from 'child_process';

// 检查并安装adm-zip
let AdmZip;
try {
    AdmZip = (await import('adm-zip')).default;
    createEPUB();
} catch (e) {
    console.log('正在安装adm-zip依赖...');
    execSync('npm install adm-zip', { stdio: 'inherit' });
    AdmZip = (await import('adm-zip')).default;
    createEPUB();
}

// 创建EPUB文件
function createEPUB() {
    const epubName = 'self-teaching-book.epub';
    const zip = new AdmZip();
    
    // 添加mimetype文件（必须是第一个文件，且不压缩）
    zip.addFile('mimetype', Buffer.from('application/epub+zip'), '', 0);
    
    // 添加META-INF/container.xml
    zip.addFile('EPUB/META-INF/container.xml', Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`));
    
    // 添加OEBPS/content.opf
    zip.addFile('EPUB/OEBPS/content.opf', Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<package version="2.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="book-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>自学的技艺</dc:title>
    <dc:title opf:file-as="自学的技艺" opf:type="main">自学的技艺</dc:title>
    <dc:creator opf:role="aut">selfteaching</dc:creator>
    <dc:subject>自学</dc:subject>
    <dc:subject>自我提升</dc:subject>
    <dc:subject>教育</dc:subject>
    <dc:description>One has no future if one couldn't teach themself.</dc:description>
    <dc:publisher>开源书籍</dc:publisher>
    <dc:date opf:event="publication">2023-05-03</dc:date>
    <dc:rights>CC BY-SA 4.0</dc:rights>
    <dc:language>zh-CN</dc:language>
    <dc:identifier id="book-id" opf:scheme="URI">https://github.com/selfteaching/the-craft-of-selfteaching</dc:identifier>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>
    <item id="title-page" href="title-page.xhtml" media-type="application/xhtml+xml"/>
    <item id="introduction" href="introduction.xhtml" media-type="application/xhtml+xml"/>
    <item id="style" href="css/style.css" media-type="text/css"/>
  </manifest>
  <spine toc="ncx">
    <itemref idref="cover" linear="no"/>
    <itemref idref="title-page"/>
    <itemref idref="introduction"/>
  </spine>
</package>`));
    
    // 添加OEBPS/toc.ncx
    zip.addFile('EPUB/OEBPS/toc.ncx', Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<ncx version="2005-1" xmlns="http://www.daisy.org/z3986/2005/ncx/">
  <head>
    <meta name="dtb:uid" content="https://github.com/selfteaching/the-craft-of-selfteaching"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle>
    <text>自学的技艺</text>
  </docTitle>
  <docAuthor>
    <text>selfteaching</text>
  </docAuthor>
  <navMap>
    <navPoint id="title-page" playOrder="1">
      <navLabel>
        <text>扉页</text>
      </navLabel>
      <content src="title-page.xhtml"/>
    </navPoint>
    <navPoint id="introduction" playOrder="2">
      <navLabel>
        <text>引言</text>
      </navLabel>
      <content src="introduction.xhtml"/>
    </navPoint>
  </navMap>
</ncx>`));
    
    // 添加CSS
    zip.addFile('EPUB/OEBPS/css/style.css', Buffer.from(`body {
  font-family: "SimSun", "宋体", serif;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  margin: 0;
  padding: 0;
  background-color: #fff;
}

h1, h2, h3 {
  font-family: "SimHei", "黑体", sans-serif;
  margin: 1em 0 0.5em;
  line-height: 1.2;
}

h1 {
  font-size: 2em;
  text-align: center;
  color: #000;
}

.cover {
  text-align: center;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.title-page {
  text-align: center;
  padding: 2em;
}

.title-page h1 {
  font-size: 2.5em;
  margin-bottom: 1em;
}

.title-page .subtitle {
  font-size: 1.2em;
  margin-bottom: 2em;
  font-style: italic;
}

.title-page .author {
  font-size: 1.5em;
  margin-bottom: 3em;
}

.introduction {
  padding: 1em 2em;
}

.blockquote {
  margin: 1em 2em;
  padding: 1em;
  border-left: 4px solid #ccc;
  background-color: #f9f9f9;
  font-style: italic;
}`));
    
    // 添加封面
    zip.addFile('EPUB/OEBPS/cover.xhtml', Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>封面</title>
  <meta charset="UTF-8"/>
  <link rel="stylesheet" type="text/css" href="css/style.css"/>
</head>
<body>
  <div class="cover">
    <h1>自学的技艺</h1>
    <p class="subtitle">如果不能自学，就没有未来</p>
    <p class="author">selfteaching</p>
    <p>One has no future if one couldn't teach themself.</p>
  </div>
</body>
</html>`));
    
    // 添加扉页
    zip.addFile('EPUB/OEBPS/title-page.xhtml', Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>扉页</title>
  <meta charset="UTF-8"/>
  <link rel="stylesheet" type="text/css" href="css/style.css"/>
</head>
<body>
  <div class="title-page">
    <h1>自学的技艺</h1>
    <p class="subtitle">如果不能自学，就没有未来</p>
    <p class="author">selfteaching</p>
    <p>2023年5月3日</p>
    <p><strong>One has no future if one couldn't teach themself.</strong></p>
  </div>
</body>
</html>`));
    
    // 添加引言
    zip.addFile('EPUB/OEBPS/introduction.xhtml', Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>引言</title>
  <meta charset="UTF-8"/>
  <link rel="stylesheet" type="text/css" href="css/style.css"/>
</head>
<body>
  <div class="introduction">
    <h2>引言</h2>
    
    <p>在这个快速变化的世界里，自学能力已经成为生存和发展的核心技能。正如本书的副标题所说：<strong>如果不能自学，就没有未来</strong>。</p>
    
    <p class="blockquote">
      "One has no future if one couldn't teach themself."
    </p>
    
    <h3>为什么自学如此重要？</h3>
    
    <p>科技的飞速发展、行业的快速迭代、知识的爆炸式增长，都使得传统的教育模式无法满足个人发展的需求。在学校里学到的知识，可能在毕业时就已经过时。只有具备强大的自学能力，才能不断更新知识体系，适应社会的变化。</p>
    
    <h3>什么是自学的技艺？</h3>
    
    <p>自学不是简单的阅读和记忆，而是一套系统的方法和实践。它包括：明确的学习目标设定、高效的信息获取渠道、科学的学习方法选择、持续的实践和反馈、知识的整合和应用、学习习惯的培养。</p>
    
    <h3>如何培养自学能力？</h3>
    
    <p>培养自学能力需要长期的实践和坚持。主动学习、问题导向、跨学科学习、实践出真知、反思与调整、分享与交流，这些都是培养自学能力的基本原则。</p>
  </div>
</body>
</html>`));
    
    // 写入EPUB文件
    zip.writeZip(epubName);
    console.log(`EPUB文件已成功创建：${epubName}`);
}