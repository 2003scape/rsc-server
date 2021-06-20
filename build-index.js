#!/usr/bin/env node

const recursiveReaddir = require('recursive-readdir');

(async () => {
    const directory = process.argv[2];
    const files = await recursiveReaddir(directory);

    console.log(
        'module.exports = {\n' +
            files
                .filter((filename) => !/index/.test(filename))
                .map((filename) => {
                    filename = filename.replace(directory, '');

                    return `    "${filename
                        .replace(directory, '')
                        .replace('.js', '')
                        .replace(/\//g, '.')}": require('./${filename}'),`;
                })
                .join('\n') +
            '\n};'
    );
})();
