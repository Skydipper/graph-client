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

describe('GET list concepts by dataset', () => {
    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();
    });

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    it('Getting a list of concepts by dataset should return a 200 status code (happy case)', async () => {
        const records = [
            {
                keys: [
                    'c'
                ],
                length: 1,
                _fields: [
                    {
                        identity: {
                            low: 10428,
                            high: 0
                        },
                        labels: [
                            'CONCEPT',
                            'TIME_PERIOD'
                        ],
                        properties: {
                            id: 'historical',
                            label: 'Historical',
                            synonyms: '',
                            default_parent: 'time_period'
                        }
                    }
                ],
                _fieldLookup: {
                    c: 0
                }
            },
            {
                keys: [
                    'c'
                ],
                length: 1,
                _fields: [
                    {
                        identity: {
                            low: 10459,
                            high: 0
                        },
                        labels: [
                            'CONCEPT',
                            'TOPIC'
                        ],
                        properties: {
                            id: 'water',
                            label: 'Water',
                            synonyms: '',
                            default_parent: 'general'
                        }
                    }
                ],
                _fieldLookup: {
                    c: 0
                }
            },
            {
                keys: [
                    'c'
                ],
                length: 1,
                _fields: [
                    {
                        identity: {
                            low: 10460,
                            high: 0
                        },
                        labels: [
                            'CONCEPT',
                            'TOPIC'
                        ],
                        properties: {
                            id: 'drought',
                            label: 'Drought',
                            synonyms: [
                                'Droughts'
                            ],
                            default_parent: 'natural_disaster'
                        }
                    }
                ],
                _fieldLookup: {
                    c: 0
                }
            },
            {
                keys: [
                    'c'
                ],
                length: 1,
                _fields: [
                    {
                        identity: {
                            low: 10124,
                            high: 0
                        },
                        labels: [
                            'CONCEPT',
                            'FREQUENCY'
                        ],
                        properties: {
                            id: 'near_real_time',
                            label: 'Near Real Time',
                            synonyms: '',
                            default_parent: 'frequency'
                        }
                    }
                ],
                _fieldLookup: {
                    c: 0
                }
            },
            {
                keys: [
                    'c'
                ],
                length: 1,
                _fields: [
                    {
                        identity: {
                            low: 10134,
                            high: 0
                        },
                        labels: [
                            'CONCEPT',
                            'GEOGRAPHY'
                        ],
                        properties: {
                            id: 'global',
                            label: 'Global',
                            synonyms: '',
                            default_parent: 'location'
                        }
                    }
                ],
                _fieldLookup: {
                    c: 0
                }
            },
            {
                keys: [
                    'c'
                ],
                length: 1,
                _fields: [
                    {
                        identity: {
                            low: 10121,
                            high: 0
                        },
                        labels: [
                            'CONCEPT',
                            'DATA_TYPE'
                        ],
                        properties: {
                            id: 'geospatial',
                            label: 'Geospatial',
                            synonyms: '',
                            default_parent: 'dataset'
                        }
                    }
                ],
                _fieldLookup: {
                    c: 0
                }
            },
            {
                keys: [
                    'c'
                ],
                length: 1,
                _fields: [
                    {
                        identity: {
                            low: 10118,
                            high: 0
                        },
                        labels: [
                            'CONCEPT',
                            'DATA_TYPE'
                        ],
                        properties: {
                            id: 'raster',
                            label: 'Raster',
                            synonyms: '',
                            default_parent: 'geospatial'
                        }
                    }
                ],
                _fieldLookup: {
                    c: 0
                }
            },
            {
                keys: [
                    'c'
                ],
                length: 1,
                _fields: [
                    {
                        identity: {
                            low: 10712,
                            high: 0
                        },
                        labels: [
                            'CONCEPT',
                            'TOPIC'
                        ],
                        properties: {
                            id: 'soil',
                            label: 'Soils',
                            synonyms: [
                                'Soil'
                            ],
                            default_parent: 'land'
                        }
                    }
                ],
                _fieldLookup: {
                    c: 0
                }
            }
        ];
        const query = '\nMATCH (c:CONCEPT)<-[:TAGGED_WITH {application: {application}}]-(d:DATASET {id: {dataset}})\nRETURN c;\n';
        const parameters = {
            application: 'rw',
            dataset: 'e7b9efb2-3836-45ae-8b6a-f8391c7bcd2f'
        };

        stubQuery(sandbox, query, parameters, records);

        const response = await requester
            .get('/api/v1/graph/query/list-concepts/e7b9efb2-3836-45ae-8b6a-f8391c7bcd2f');

        response.status.should.equal(200);
        response.body.should.deep.equal({
            data: [
                {
                    id: 'e7b9efb2-3836-45ae-8b6a-f8391c7bcd2f',
                    type: 'graph',
                    attributes: {
                        id: 'historical',
                        label: 'Historical',
                        synonyms: '',
                        default_parent: 'time_period'
                    }
                },
                {
                    id: 'e7b9efb2-3836-45ae-8b6a-f8391c7bcd2f',
                    type: 'graph',
                    attributes: {
                        id: 'water',
                        label: 'Water',
                        synonyms: '',
                        default_parent: 'general'
                    }
                },
                {
                    id: 'e7b9efb2-3836-45ae-8b6a-f8391c7bcd2f',
                    type: 'graph',
                    attributes: {
                        id: 'drought',
                        label: 'Drought',
                        synonyms: [
                            'Droughts'
                        ],
                        default_parent: 'natural_disaster'
                    }
                },
                {
                    id: 'e7b9efb2-3836-45ae-8b6a-f8391c7bcd2f',
                    type: 'graph',
                    attributes: {
                        id: 'near_real_time',
                        label: 'Near Real Time',
                        synonyms: '',
                        default_parent: 'frequency'
                    }
                },
                {
                    id: 'e7b9efb2-3836-45ae-8b6a-f8391c7bcd2f',
                    type: 'graph',
                    attributes: {
                        id: 'global',
                        label: 'Global',
                        synonyms: '',
                        default_parent: 'location'
                    }
                },
                {
                    id: 'e7b9efb2-3836-45ae-8b6a-f8391c7bcd2f',
                    type: 'graph',
                    attributes: {
                        id: 'geospatial',
                        label: 'Geospatial',
                        synonyms: '',
                        default_parent: 'dataset'
                    }
                },
                {
                    id: 'e7b9efb2-3836-45ae-8b6a-f8391c7bcd2f',
                    type: 'graph',
                    attributes: {
                        id: 'raster',
                        label: 'Raster',
                        synonyms: '',
                        default_parent: 'geospatial'
                    }
                },
                {
                    id: 'e7b9efb2-3836-45ae-8b6a-f8391c7bcd2f',
                    type: 'graph',
                    attributes: {
                        id: 'soil',
                        label: 'Soils',
                        synonyms: [
                            'Soil'
                        ],
                        default_parent: 'land'
                    }
                }
            ]
        });
    });

    it('Getting a list of concepts by dataset filtered by application should return a 200 status code and data limited by said app', async () => {
        const records = [
            {
                keys: [
                    'c'
                ],
                length: 1,
                _fields: [
                    {
                        identity: {
                            low: 10428,
                            high: 0
                        },
                        labels: [
                            'CONCEPT',
                            'TIME_PERIOD'
                        ],
                        properties: {
                            id: 'historical',
                            label: 'Historical',
                            synonyms: '',
                            default_parent: 'time_period'
                        }
                    }
                ],
                _fieldLookup: {
                    c: 0
                }
            },
            {
                keys: [
                    'c'
                ],
                length: 1,
                _fields: [
                    {
                        identity: {
                            low: 10459,
                            high: 0
                        },
                        labels: [
                            'CONCEPT',
                            'TOPIC'
                        ],
                        properties: {
                            id: 'water',
                            label: 'Water',
                            synonyms: '',
                            default_parent: 'general'
                        }
                    }
                ],
                _fieldLookup: {
                    c: 0
                }
            },
            {
                keys: [
                    'c'
                ],
                length: 1,
                _fields: [
                    {
                        identity: {
                            low: 10460,
                            high: 0
                        },
                        labels: [
                            'CONCEPT',
                            'TOPIC'
                        ],
                        properties: {
                            id: 'drought',
                            label: 'Drought',
                            synonyms: [
                                'Droughts'
                            ],
                            default_parent: 'natural_disaster'
                        }
                    }
                ],
                _fieldLookup: {
                    c: 0
                }
            },
            {
                keys: [
                    'c'
                ],
                length: 1,
                _fields: [
                    {
                        identity: {
                            low: 10124,
                            high: 0
                        },
                        labels: [
                            'CONCEPT',
                            'FREQUENCY'
                        ],
                        properties: {
                            id: 'near_real_time',
                            label: 'Near Real Time',
                            synonyms: '',
                            default_parent: 'frequency'
                        }
                    }
                ],
                _fieldLookup: {
                    c: 0
                }
            },
            {
                keys: [
                    'c'
                ],
                length: 1,
                _fields: [
                    {
                        identity: {
                            low: 10134,
                            high: 0
                        },
                        labels: [
                            'CONCEPT',
                            'GEOGRAPHY'
                        ],
                        properties: {
                            id: 'global',
                            label: 'Global',
                            synonyms: '',
                            default_parent: 'location'
                        }
                    }
                ],
                _fieldLookup: {
                    c: 0
                }
            },
            {
                keys: [
                    'c'
                ],
                length: 1,
                _fields: [
                    {
                        identity: {
                            low: 10121,
                            high: 0
                        },
                        labels: [
                            'CONCEPT',
                            'DATA_TYPE'
                        ],
                        properties: {
                            id: 'geospatial',
                            label: 'Geospatial',
                            synonyms: '',
                            default_parent: 'dataset'
                        }
                    }
                ],
                _fieldLookup: {
                    c: 0
                }
            },
            {
                keys: [
                    'c'
                ],
                length: 1,
                _fields: [
                    {
                        identity: {
                            low: 10118,
                            high: 0
                        },
                        labels: [
                            'CONCEPT',
                            'DATA_TYPE'
                        ],
                        properties: {
                            id: 'raster',
                            label: 'Raster',
                            synonyms: '',
                            default_parent: 'geospatial'
                        }
                    }
                ],
                _fieldLookup: {
                    c: 0
                }
            },
            {
                keys: [
                    'c'
                ],
                length: 1,
                _fields: [
                    {
                        identity: {
                            low: 10712,
                            high: 0
                        },
                        labels: [
                            'CONCEPT',
                            'TOPIC'
                        ],
                        properties: {
                            id: 'soil',
                            label: 'Soils',
                            synonyms: [
                                'Soil'
                            ],
                            default_parent: 'land'
                        }
                    }
                ],
                _fieldLookup: {
                    c: 0
                }
            }
        ];
        const query = '\nMATCH (c:CONCEPT)<-[:TAGGED_WITH {application: {application}}]-(d:DATASET {id: {dataset}})\nRETURN c;\n';
        const parameters = {
            application: 'gfw',
            dataset: 'e7b9efb2-3836-45ae-8b6a-f8391c7bcd2f'
        };

        stubQuery(sandbox, query, parameters, records);

        const response = await requester
            .get('/api/v1/graph/query/list-concepts/e7b9efb2-3836-45ae-8b6a-f8391c7bcd2f')
            .query({
                application: 'gfw'
            });

        response.status.should.equal(200);
        response.body.should.deep.equal({
            data: [
                {
                    id: 'e7b9efb2-3836-45ae-8b6a-f8391c7bcd2f',
                    type: 'graph',
                    attributes: {
                        id: 'historical',
                        label: 'Historical',
                        synonyms: '',
                        default_parent: 'time_period'
                    }
                },
                {
                    id: 'e7b9efb2-3836-45ae-8b6a-f8391c7bcd2f',
                    type: 'graph',
                    attributes: {
                        id: 'water',
                        label: 'Water',
                        synonyms: '',
                        default_parent: 'general'
                    }
                },
                {
                    id: 'e7b9efb2-3836-45ae-8b6a-f8391c7bcd2f',
                    type: 'graph',
                    attributes: {
                        id: 'drought',
                        label: 'Drought',
                        synonyms: [
                            'Droughts'
                        ],
                        default_parent: 'natural_disaster'
                    }
                },
                {
                    id: 'e7b9efb2-3836-45ae-8b6a-f8391c7bcd2f',
                    type: 'graph',
                    attributes: {
                        id: 'near_real_time',
                        label: 'Near Real Time',
                        synonyms: '',
                        default_parent: 'frequency'
                    }
                },
                {
                    id: 'e7b9efb2-3836-45ae-8b6a-f8391c7bcd2f',
                    type: 'graph',
                    attributes: {
                        id: 'global',
                        label: 'Global',
                        synonyms: '',
                        default_parent: 'location'
                    }
                },
                {
                    id: 'e7b9efb2-3836-45ae-8b6a-f8391c7bcd2f',
                    type: 'graph',
                    attributes: {
                        id: 'geospatial',
                        label: 'Geospatial',
                        synonyms: '',
                        default_parent: 'dataset'
                    }
                },
                {
                    id: 'e7b9efb2-3836-45ae-8b6a-f8391c7bcd2f',
                    type: 'graph',
                    attributes: {
                        id: 'raster',
                        label: 'Raster',
                        synonyms: '',
                        default_parent: 'geospatial'
                    }
                },
                {
                    id: 'e7b9efb2-3836-45ae-8b6a-f8391c7bcd2f',
                    type: 'graph',
                    attributes: {
                        id: 'soil',
                        label: 'Soils',
                        synonyms: [
                            'Soil'
                        ],
                        default_parent: 'land'
                    }
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
