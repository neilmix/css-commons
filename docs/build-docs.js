
const css = require('../css-commons.js');
const fs = require('fs');

let words = {};
for (let key in css.wordMap) {
    const word = css.wordMap[key];
    words[word] = { abbr: key };
}

const template = compile_template(`
<html>
<head>
<style>
html body { font-family: helvetica, sans-serif; }
html table { border-collapse: collapse; }
html td  { border: 1px solid #000; padding: 5px; vertical-align: top; }
html th  { font-weight: bold; padding: 5px; }

:root {
    --class-heading: font-1.2rem fnwtbld phz-10px pvt-5px mvt-20px bg-#666 c-#fff txalctr;
    --class-list: d-flex f-wrap;
    --class-item: p-5 hover:bg-#666 hover:c-#fff cursor-default;
}
</style>
<script defer src="../css-commons.js"></script>
</head>
<body class="p-1rem pb-4rem">

<div class="heading">Static Classes</div>
<div class="list">
$$ for (let cls of [...css.staticClassSet.values()].sort()) {
    <span class="item w-8rem" title="{{ css.staticMap[cls] }}">{{ cls }}</span>
$$ }
</div>

<div class="heading">Dynamic Classes</div>
<div class="list">
$$ for (let cls of [...css.dynClassSet.values()].sort()) {
$$   let desc = css.dynClassPropMap[cls];
$$   for (let type of desc.types) {
        <span class="item w-8rem" title="{{ css.typeMap[type][cls].map(p => p + ': ' + type + "; ").join('\\n') }}">
        {{ cls }}-<span class="fnstitc c-#ccc">{{ type }}</span>
        </span>
$$   }
$$ }
</div>

<div class="heading">Available Static Properties</div>
<div class="list">
$$ for (let prop of [...css.staticPropSet.values()].sort()) {
    <span class="item w-6rem" title="{{ Object.entries(css.staticMap).filter(k => k[1].includes(prop)).map(e => e[0] + " &rarr; " + e[1]).join("\\n") }}">{{ prop }}</span>
$$ }
</div>

<div class="heading">Available Dynamic Properties</div>
<div class="list">
$$ for (let prop of [...css.dynPropSet.values()].sort()) {
    <span class="item w-15rem" title="{{ Object.values(css.dynClassPropMap).filter(p => Object.keys(p.propTypeMap).includes(prop)).map(p => p.cls + ' &rarr; ' + p.props.join(", ")).join("\\n") }}">{{ prop }}</span>
$$ }
</div>

<div class="heading">Word List</div>
<div class="list">
$$ for (let word of Object.values(css.wordMap).sort()) {
    <span class="item w-6rem" title="{{ Object.entries(css.wordMap).find(e => e[1] == word)[0] }}">{{word}}</span>
$$ }
</div>

<div class="heading">Word Abbreviations</div>
<div class="list">
$$ for (let abbr of Object.values(words).map(w => w.abbr).sort()) {
    <span class="item w-6rem" title="{{ css.wordMap[abbr] }}">{{ abbr }}</span>
$$ }
</div>

<div class="heading">Reset Styling</div>
<pre class="mhz-4rem">
{{ css.resetCSS }}
</pre>

</body>
</html>
`);
console.log(template);
const html = eval(template);

fs.writeFileSync('docs/index.html', html);

function compile_template(txt) {
    const lines = txt.split('\n'), body = ['let out = "";'];
    for (let line of lines) {
        if (line.startsWith('$$')) {
            body.push(`      ${line.slice(2)}`);
        } else {
            line = line
                .replace(/`/g, '\\`')
                .replace(/{{-(.*?)}}/g, '` + ($1) + `')
                .replace(/{{(.*?)}}/g, '` + html_escape($1) + `');
            body.push('out += `' + line + '`;');
        }
    }
    return `${body.join('\n')}\nout;`;
}
function html_escape(s) { 
    return (s||'').replace(/[<>"']/g, v => ({'<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[v]));
};
