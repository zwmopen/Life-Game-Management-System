const fs = require('fs');
const path = './components/Settings.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace Object.assign with spread operator
content = content.replace(
  /const newSoundEffectsByLocation = Object\.assign\(\{\}, settings\.soundEffectsByLocation, \{\s*\[location\.id\]: \{ \.\.\.locationSetting, sound: e\.target\.value \}\s*\}\);/g,
  `const newSoundEffectsByLocation = {
                                      ...settings.soundEffectsByLocation,
                                      [location.id]: { ...locationSetting, sound: e.target.value }
                                    };`
);

fs.writeFileSync(path, content);
console.log('Settings.tsx has been fixed!');