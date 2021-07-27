const generateNeo4JResponse = (query, parameters, records) => ({
    records,
    summary: {
        statement: {
            text: query,
            parameters
        },
        statementType: 'r',
        counters: {
            _stats: {
                nodesCreated: 0,
                nodesDeleted: 0,
                relationshipsCreated: 0,
                relationshipsDeleted: 0,
                propertiesSet: 0,
                labelsAdded: 0,
                labelsRemoved: 0,
                indexesAdded: 0,
                indexesRemoved: 0,
                constraintsAdded: 0,
                constraintsRemoved: 0
            }
        },
        updateStatistics: {
            _stats: {
                nodesCreated: 0,
                nodesDeleted: 0,
                relationshipsCreated: 0,
                relationshipsDeleted: 0,
                propertiesSet: 0,
                labelsAdded: 0,
                labelsRemoved: 0,
                indexesAdded: 0,
                indexesRemoved: 0,
                constraintsAdded: 0,
                constraintsRemoved: 0
            }
        },
        plan: false,
        profile: false,
        notifications: [],
        server: {
            address: 'localhost:7687',
            version: 'Neo4j/3.5.3'
        },
        resultConsumedAfter: {
            low: 12,
            high: 0
        },
        resultAvailableAfter: {
            low: 25,
            high: 0
        }
    }
});


module.exports = {
    generateNeo4JResponse
};
