const nock = require('nock');
const chai = require('chai');
const sinon = require('sinon');
const { getTestServer } = require('./utils/test-server');
const { stubQuery } = require('./utils/neo4j.service.stub');

chai.should();

let requester;
let sandbox;

nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

describe('GET list concepts', () => {
    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();
    });

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    it('Getting a list of concepts should return a 200 status code (happy case)', async () => {
        const records = [
            {
                keys: [
                    'c.id',
                    'c.label',
                    'c.synonyms',
                    'labels',
                    'number_of_datasets_tagged',
                    'datasets'
                ],
                length: 6,
                _fields: [
                    'geospatial',
                    'Geospatial',
                    '',
                    [
                        'CONCEPT',
                        'DATA_TYPE'
                    ],
                    {
                        low: 3,
                        high: 0
                    },
                    [
                        'e7b9efb2-3836-45ae-8b6a-f8391c7bcd2f',
                        '49c781f2-e875-4186-82c4-999eedf08d62',
                        'bca0109c-6d13-42a0-89b2-bcc046dc177e',
                    ]
                ],
                _fieldLookup: {
                    'c.id': 0,
                    'c.label': 1,
                    'c.synonyms': 2,
                    labels: 3,
                    number_of_datasets_tagged: 4,
                    datasets: 5
                }
            },
            {
                keys: [
                    'c.id',
                    'c.label',
                    'c.synonyms',
                    'labels',
                    'number_of_datasets_tagged',
                    'datasets'
                ],
                length: 6,
                _fields: [
                    'global',
                    'Global',
                    '',
                    [
                        'CONCEPT',
                        'GEOGRAPHY'
                    ],
                    {
                        low: 3,
                        high: 0
                    },
                    [
                        'fe0a0042-8430-419b-a60f-9b69ec81a0ec',
                        '266ed113-396c-4c69-885a-ead30df95810',
                        '2c2c614a-8678-443a-8874-33335771ecc0',
                    ]
                ],
                _fieldLookup: {
                    'c.id': 0,
                    'c.label': 1,
                    'c.synonyms': 2,
                    labels: 3,
                    number_of_datasets_tagged: 4,
                    datasets: 5
                }
            },
            {
                keys: [
                    'c.id',
                    'c.label',
                    'c.synonyms',
                    'labels',
                    'number_of_datasets_tagged',
                    'datasets'
                ],
                length: 6,
                _fields: [
                    'table',
                    'Table',
                    '',
                    [
                        'CONCEPT',
                        'DATA_TYPE'
                    ],
                    {
                        low: 3,
                        high: 0
                    },
                    [
                        '1de2af1c-5e5e-4a33-b8f1-8c8f9d000e49',
                        '6f26eadd-d6f4-44f9-9de4-618bdcfdc95e',
                        '36803484-c413-49a9-abe2-2286ee99b624',
                    ]
                ],
                _fieldLookup: {
                    'c.id': 0,
                    'c.label': 1,
                    'c.synonyms': 2,
                    labels: 3,
                    number_of_datasets_tagged: 4,
                    datasets: 5
                }
            },
        ];
        const query = '\nMATCH (c:CONCEPT)\n\nWITH c\nOPTIONAL MATCH (c)<-[:TAGGED_WITH {application: {application}}]-(d:DATASET)\nWITH COLLECT(d.id) AS datasets, c, COUNT(d) as number_of_datasets_tagged\nRETURN c.id, c.label, c.synonyms, labels(c) AS labels, number_of_datasets_tagged, datasets\nORDER BY number_of_datasets_tagged DESC\n';
        const parameters = {
            application: 'rw',
            includes: [],
            search: null
        };

        stubQuery(sandbox, query, parameters, records);

        const response = await requester
            .get('/api/v1/graph/query/list-concepts');

        response.status.should.equal(200);
        response.body.should.deep.equal({
            data: [
                {
                    id: 'geospatial',
                    label: 'Geospatial',
                    synonyms: '',
                    labels: [
                        'CONCEPT',
                        'DATA_TYPE'
                    ],
                    numberOfDatasetsTagged: 3,
                    datasets: [
                        'e7b9efb2-3836-45ae-8b6a-f8391c7bcd2f',
                        '49c781f2-e875-4186-82c4-999eedf08d62',
                        'bca0109c-6d13-42a0-89b2-bcc046dc177e'
                    ]
                },
                {
                    id: 'global',
                    label: 'Global',
                    synonyms: '',
                    labels: [
                        'CONCEPT',
                        'GEOGRAPHY'
                    ],
                    numberOfDatasetsTagged: 3,
                    datasets: [
                        'fe0a0042-8430-419b-a60f-9b69ec81a0ec',
                        '266ed113-396c-4c69-885a-ead30df95810',
                        '2c2c614a-8678-443a-8874-33335771ecc0'
                    ]
                },
                {
                    id: 'table',
                    label: 'Table',
                    synonyms: '',
                    labels: [
                        'CONCEPT',
                        'DATA_TYPE'
                    ],
                    numberOfDatasetsTagged: 3,
                    datasets: [
                        '1de2af1c-5e5e-4a33-b8f1-8c8f9d000e49',
                        '6f26eadd-d6f4-44f9-9de4-618bdcfdc95e',
                        '36803484-c413-49a9-abe2-2286ee99b624'
                    ]
                }
            ]
        });
    });

    it('Getting a list of concepts filtered by application should return a 200 status code and data limited by said app', async () => {
        const records = [
            {
                keys: [
                    'c.id',
                    'c.label',
                    'c.synonyms',
                    'labels',
                    'number_of_datasets_tagged',
                    'datasets'
                ],
                length: 6,
                _fields: [
                    'dataset',
                    'Dataset',
                    '',
                    [
                        'CONCEPT',
                        'DATA_TYPE'
                    ],
                    {
                        low: 0,
                        high: 0
                    },
                    []
                ],
                _fieldLookup: {
                    'c.id': 0,
                    'c.label': 1,
                    'c.synonyms': 2,
                    labels: 3,
                    number_of_datasets_tagged: 4,
                    datasets: 5
                }
            },
            {
                keys: [
                    'c.id',
                    'c.label',
                    'c.synonyms',
                    'labels',
                    'number_of_datasets_tagged',
                    'datasets'
                ],
                length: 6,
                _fields: [
                    'raster',
                    'Raster',
                    '',
                    [
                        'CONCEPT',
                        'DATA_TYPE'
                    ],
                    {
                        low: 0,
                        high: 0
                    },
                    []
                ],
                _fieldLookup: {
                    'c.id': 0,
                    'c.label': 1,
                    'c.synonyms': 2,
                    labels: 3,
                    number_of_datasets_tagged: 4,
                    datasets: 5
                }
            },
            {
                keys: [
                    'c.id',
                    'c.label',
                    'c.synonyms',
                    'labels',
                    'number_of_datasets_tagged',
                    'datasets'
                ],
                length: 6,
                _fields: [
                    'vector',
                    'Vector',
                    '',
                    [
                        'CONCEPT',
                        'DATA_TYPE'
                    ],
                    {
                        low: 0,
                        high: 0
                    },
                    []
                ],
                _fieldLookup: {
                    'c.id': 0,
                    'c.label': 1,
                    'c.synonyms': 2,
                    labels: 3,
                    number_of_datasets_tagged: 4,
                    datasets: 5
                }
            }
        ];
        const query = '\nMATCH (c:CONCEPT)\n\nWITH c\nOPTIONAL MATCH (c)<-[:TAGGED_WITH {application: {application}}]-(d:DATASET)\nWITH COLLECT(d.id) AS datasets, c, COUNT(d) as number_of_datasets_tagged\nRETURN c.id, c.label, c.synonyms, labels(c) AS labels, number_of_datasets_tagged, datasets\nORDER BY number_of_datasets_tagged DESC\n';
        const parameters = {
            application: 'gfw',
            includes: [],
            search: null
        };

        stubQuery(sandbox, query, parameters, records);

        const response = await requester
            .get('/api/v1/graph/query/list-concepts?application=gfw');

        response.status.should.equal(200);
        response.body.should.deep.equal({
            data: [
                {
                    datasets: [],
                    id: 'dataset',
                    label: 'Dataset',
                    labels: [
                        'CONCEPT',
                        'DATA_TYPE'
                    ],
                    numberOfDatasetsTagged: 0,
                    synonyms: ''
                },
                {
                    datasets: [],
                    id: 'raster',
                    label: 'Raster',
                    labels: [
                        'CONCEPT',
                        'DATA_TYPE'
                    ],
                    numberOfDatasetsTagged: 0,
                    synonyms: ''
                },
                {
                    datasets: [],
                    id: 'vector',
                    label: 'Vector',
                    labels: [
                        'CONCEPT',
                        'DATA_TYPE'
                    ],
                    numberOfDatasetsTagged: 0,
                    synonyms: ''
                }
            ]
        });
    });

    afterEach(() => {
        sandbox.restore();

        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
