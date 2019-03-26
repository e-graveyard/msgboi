module.exports = class
{
    constructor(event) {
        this.event = event;
        this.kind  = event.object_kind;
    }

    getBranch() {
        return 'master';
    }

    toSlackMessage() {

    }
}
