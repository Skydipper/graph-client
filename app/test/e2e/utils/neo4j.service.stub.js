const Neo4JService = require('services/neo4j.service');
const { generateNeo4JResponse } = require('./helpers');

const stubQuery = (sandbox, query, parameters, records) => {
    sandbox
        .stub(Neo4JService, 'query')
        .withArgs(query, parameters)
        .returns(generateNeo4JResponse(query, parameters, records));
};

module.exports = {
    stubQuery
};
