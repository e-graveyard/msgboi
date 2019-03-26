const fs = require('fs');
const yaml = require('js-yaml');

module.exports = class
{
    constructor(file) {
        this.file = file;
        this.ready = fs.existsSync(file);
    }

    isReady() {
        return this.ready;
    }

    read() {
        return fs.readFileSync(this.file, 'utf8');
    }

    toJSON() {
        return JSON.parse(this.read());
    }

    toYAML() {
        return yaml.safeLoad(this.read());
    }
}
