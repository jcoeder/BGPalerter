import Monitor from "./monitor";
import rpki from "rpki-validator";

export default class MonitorRPKI extends Monitor {

    constructor(name, channel, params, env){
        super(name, channel, params, env);
        this.input.onChange(() => {
            this.updateMonitoredResources();
        });
        this.validationQueue = [];

        rpki.preCache(60)
            .then(() => {
                setInterval(this.validateBatch, 400);
            })

    };

    updateMonitoredResources = () => {
        // nothing
    };

    validateBatch = () => {
        const queue = this.validationQueue;
        this.validationQueue = [];

        queue.forEach(this.validate);
    };

    updateMonitoredPrefixes = () => {
        this.monitored = this.input.getMonitoredPrefixes();
    };

    filter = (message) => {
        return message.type === 'announcement' && message.originAS.numbers.length == 1;
    };

    squashAlerts = (alerts) => {

        const message = alerts[0].matchedMessage;
        const covering = (alerts[0].extra.covering && alerts[0].extra.covering[0]) ? alerts[0].extra.covering[0] : false;
        const coveringString = (covering) ? `Valid ROA: origin AS${covering.origin} prefix ${covering.prefix} max length ${covering.maxLength}` : '';

        return `The route ${message.prefix} announced by ${message.originAS} is not RPKI valid. Accepted with AS path: ${message.path}. ${coveringString}`;
    };


    validate = ({ message, matchedRule} ) => {
        const prefix = message.prefix;
        const origin = message.originAS.getValue();

        const result = rpki.validateFromCacheSync(prefix, origin, true);

        if (result.valid === false) {
            const key = "a" + [prefix, origin]
                .join("AS")
                .replace(/\./g, "_")
                .replace(/\:/g, "_")
                .replace(/\//g, "_");

            this.publishAlert(key,
                prefix,
                matchedRule,
                message,
                { covering: result.covering });
        }
    };


    monitor = (message) => {
        const prefix = message.prefix;
        const matchedRule = this.input.getMoreSpecificMatch(prefix, false);

        if (matchedRule) {
            this.validationQueue.push({ message, matchedRule });
        }
        return Promise.resolve(true);
    };



}
