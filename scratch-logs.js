const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  await page.goto('http://localhost:3000');
  
  // Wait for React Three Fiber to mount the scene
  await page.waitForTimeout(3000);
  
  const sceneInfo = await page.evaluate(() => {
    if (!window.scene) return 'NO SCENE FOUND on window.scene';
    
    try {
      const getMeshInfo = (obj, depth = 0) => {
        let str = '  '.repeat(depth) + obj.type + (obj.name ? ' "' + obj.name + '"' : '') + ' pos:' + obj.position.toArray().map(n => n.toFixed(2)).join(',');
        
        if (obj.geometry) {
           str += ' geo:' + obj.geometry.type;
        }
        
        const children = obj.children.map(c => getMeshInfo(c, depth + 1)).join('\n');
        return children ? str + '\n' + children : str;
      };
      
      return 'Scene Graph:\n' + getMeshInfo(window.scene) + '\n\nCamera pos: ' + window.camera.position.toArray().map(n=>n.toFixed(2)).join(',');
    } catch (e) {
      return 'Error extracting scene: ' + e.message;
    }
  });

  console.log(sceneInfo);

  await browser.close();
})();
