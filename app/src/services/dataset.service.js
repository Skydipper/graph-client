const logger = require('logger');
const { RWAPIMicroservice } = require('rw-api-microservice-node');

class DatasetService {

    static async checkDatasets(datasets, query = {}) {
        logger.info('Checking published and other fields of dataset', datasets);
        if (query) {
            delete query.loggedUser;
        }
        const env = query.env ? query.env : 'production';

        const result = await RWAPIMicroservice.requestToMicroservice({
            uri: '/v1/dataset/find-by-ids',
            method: 'POST',
            json: true,
            body: {
                ids: datasets,
                env: env.split(',').map((elem) => elem.trim())
            },
            qs: query
        });
        logger.debug('Returning ', result);
        if (result && result.data) {
            return result.data.map((el) => el.id);
        }
        return [];

    }

}

module.exports = DatasetService;
