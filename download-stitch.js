const https = require('https');
const fs = require('fs');

const url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzc5YTRhNzFhZDZmYzQxZWRhYTZiN2FkNTI3M2JlYzE0EgsSBxCNzMrVsxAYAZIBJAoKcHJvamVjdF9pZBIWQhQxNDMxNDE2NTA0MTczNDExNDY4Ng&filename=&opi=96797242";

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        fs.writeFileSync('stitch-download.html', data);
        console.log("HTML downloaded successfully.");
    });
}).on('error', (err) => {
    console.log("Error: " + err.message);
});
