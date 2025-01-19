
(document.addEventListener("DOMContentLoaded", () => {

    const computed = getComputedStyle(document.documentElement);
    const themes = new Set();
    for (const prop of computed) {
      if (prop.match(/^--theme-([^\-]+)-/)) {
        themes.add(RegExp.$1);
      }
    }
    
    let html = [];
    const write = (str) => html.push(str);
    
    for (let theme of themes) {
        const varname = (str) => `--theme-${theme}-${str}`;
        const get = (str) => computed.getPropertyValue(varname(str)).trim();
        const tiers = 5;

        for (let mode of ['', 'inverse']) {
            write(`<div class="row0 ${mode}">`);
            for (let i = 1; i <= tiers; i++) {
                write(`
                    <div class="col0">
                        <span class="stretch"></span>
                        <div class="${theme} col${i} bg${i}">
                            <div class="col${i} m${i} b${i} p${i}">
                                <span class="h${i}">h${1}</span>
                                <span class="t${i}">t${i}</span>
                            </div>
                        </div>
                        <span class="stretch"></span>
                    </div>
                `);
            }
            write(`</div>`)
        }
    }

    let template = document.createElement('template');
    template.innerHTML = html.join('');
     `
<div class="row0">
    <div class="main5 col bg">
        <div class="col m b p">
            <span class="h">Heading</span>
            <span class="t">Text</span>
        </div>
    </div>
    <div class="col0">
        <div class="stretch"></div>
        <div class="main4 col bg">
            <div class="col m b p">
                <span class="h">Heading</span>
                <span class="t">Text</span>
            </div>
        </div>
        <div class="stretch"></div>
    </div>
</div>
    `;

    document.body.appendChild(template.content);

}));