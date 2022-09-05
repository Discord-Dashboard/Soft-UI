const fetch = require('node-fetch');
const fs = require('fs');
const consolePrefix = `\x1b[34m[\x1b[33mdbd-soft-ui\x1b[34m]\x1b[36m `;

async function update() {
    const consolePrefix = `\x1b[34m[\x1b[33mdbd-soft-ui\x1b[34m]\x1b[36m `;

    console.log(`${consolePrefix}Checking \x1b[31mlive copy \x1b[36mfor updates..`);

    let failed3 = 0;
    let failed4 = 0;
    try {
        await fetch(`https://cdn.jsdelivr.net/gh/Assistants-Center/DBD-Soft-UI@beta/utils/updater/versionsOnline.json`);
    } catch (error) {
        failed3++;
        console.log(`${consolePrefix}Failed to check live for updates.`);
    }
    if (failed3 === 0) {
        let checkArray = await fetch(`https://cdn.jsdelivr.net/gh/Assistants-Center/DBD-Soft-UI@beta/utils/updater/versionsOnline.json`);
        try {
            checkArray = await checkArray.json();
        } catch (error) {
            failed4++;
            console.log(`${consolePrefix}Failed to check live for updates.`);
        }
        if (failed4 === 0) {
            let latestVersions = [];
            let currentVersions = fs.readFileSync(__dirname + '/versions.json');
            currentVersions = JSON.parse(currentVersions);
            let needsUpdating = [];
            for (const latestFile of checkArray) {
                if (latestFile.version > currentVersions[latestFile.name]) {
                    needsUpdating.push({
                        name: latestFile.name,
                        type: latestFile.type
                    });
                    const {
                        name,
                        type
                    } = latestFile;
                    if (type === "partial") {
                        let failedFile = 0;
                        let fileRaw = await fetch(`https://cdn.jsdelivr.net/gh/Assistants-Center/DBD-Soft-UI@beta/views/partials/${name}.ejs`);
                        try {
                            fileRaw = await fileRaw.text();
                        } catch (error) {
                            failedFile++;
                            console.log(`${consolePrefix}Failed to update ${name}.`);
                        }
                        if (failedFile === 0) {
                            await fs.writeFileSync(`${__dirname}/../../views/partials/${name}.ejs`, fileRaw);
                            currentVersions[name] = latestFile.version;
                            await fs.writeFileSync(`${__dirname}/versions.json`, JSON.stringify(currentVersions));
                            console.log(`${consolePrefix}Successfully updated ${name}`);
                        }
                    }
                }
            }
        }
    }

}

exports.update = async () => {
    await update();
}