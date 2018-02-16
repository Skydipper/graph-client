const logger = require('logger');
const ctRegisterMicroservice = require('ct-register-microservice-node');

class DatasetService {

  static async checkDatasets(application, datasets, query) {
    logger.info('Checking published and other fields of dataset', datasets);
    if (query) {
      delete query.loggedUser;
    }
    const result = await ctRegisterMicroservice.requestToMicroservice({
      uri: '/dataset/find-by-ids',
      method: 'POST',
      json: true,
      application,
      body: {
        ids: datasets
      },
      qs: query
    });
    logger.debug('Returning ', result);
    if (result && result.data) {
      return result.data.map(el => el.id);
    }
    return [];
  }

}

module.exports = DatasetService;
