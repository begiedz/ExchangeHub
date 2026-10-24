import log from 'loglevel';

log.setLevel(__DEV__ ? 'debug' : 'silent', false);

export { log as logger };
