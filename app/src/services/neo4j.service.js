const logger = require('logger');
const config = require('config');
const sleep = require('sleep');
const neo4j = require('neo4j-driver').v1;

const NEO4J_URI = process.env.NEO4J_URI || `bolt://${config.get('neo4j.host')}:${config.get('neo4j.port')}`;

let retries = 10;

class Neo4JService {

    connect() {
        try {
            this.init().then(() => {
                this.driver.onCompleted = () => {
                    logger.info('[Neo4JService] Connected');
                };

                this.driver.onError = (error) => {
                    this.retryConnection(error);
                };
            });
        } catch (err) {
            logger.error(err);
        }
    }

    retryConnection(err) {
        if (retries >= 0) {
            retries--;
            logger.error(`[Neo4JService] Failed to connect to Neo4j with error message "${err.message}", retrying...`);
            sleep.sleep(2);
            this.init().then(() => {
                this.driver.onCompleted = () => {
                    logger.info('[Neo4JService] Connected');
                };

                this.driver.onError = (error) => {
                    this.retryConnection(error);
                };
            });
        } else {
            logger.error(err);
            process.exit(1);
        }
    }

    async init() {
        if (config.get('neo4j.password') === null || config.get('neo4j.user') === null) {
            logger.info(`[Neo4JService] Connecting to neo4j at ${NEO4J_URI}`);
            this.driver = neo4j.driver(NEO4J_URI);
        } else {
            logger.info(`[Neo4JService] Connecting to neo4j at ${NEO4J_URI} with username ${config.get('neo4j.user')}`);
            this.driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(config.get('neo4j.user'), config.get('neo4j.password')));
        }
    }


    async query(query, params) {
        logger.info('Doing query ONLY READ ', query);
        if (!this.driver) {
            this.connect();
        }
        const session = this.driver.session();
        const data = await session.run(query, params);
        session.close();
        return data;
    }

}


module.exports = new Neo4JService();
