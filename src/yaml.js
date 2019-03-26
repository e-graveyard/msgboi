const fs = require('fs');
const yaml = require('js-yaml');

module.exports = {
    load: (file) =>
    {
        return (() => {
            try {
                return yaml.safeLoad(fs.readFileSync(file, 'utf8'));
            }
            catch (e) {
                return null;
            }
        })();
    }
};

