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

describe('GET similar dataset including descendent', () => {
    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();
    });

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    it('Getting similar datasets including descendent without dataset ids should return a 400 error', async () => {
        const response = await requester
            .get('/api/v1/graph/query/similar-dataset-including-descendent');

        response.status.should.equal(400);
        response.body.errors[0].detail.should.equal('dataset query param required');
    });

    it('Getting similar datasets including descendent with dataset ids should return a 200 (happy case)', async () => {
        const records = [
            {
                keys: [
                    'dataset',
                    'dataset_tags',
                    'number_of_ocurrences'
                ],
                length: 3,
                _fields: [
                    '444138cd-8ef4-48b3-b197-73e324175ad0',
                    [
                        'precipitation',
                        'soil'
                    ],
                    {
                        low: 2,
                        high: 0
                    }
                ],
                _fieldLookup: {
                    dataset: 0,
                    dataset_tags: 1,
                    number_of_ocurrences: 2
                }
            },
            {
                keys: [
                    'dataset',
                    'dataset_tags',
                    'number_of_ocurrences'
                ],
                length: 3,
                _fields: [
                    '4828c405-06a2-4460-a78c-90969bce582b',
                    [
                        'water',
                        'drought'
                    ],
                    {
                        low: 2,
                        high: 0
                    }
                ],
                _fieldLookup: {
                    dataset: 0,
                    dataset_tags: 1,
                    number_of_ocurrences: 2
                }
            },
            {
                keys: [
                    'dataset',
                    'dataset_tags',
                    'number_of_ocurrences'
                ],
                length: 3,
                _fields: [
                    'c0c71e67-0088-4d69-b375-85297f79ee75',
                    [
                        'drought',
                        'precipitation'
                    ],
                    {
                        low: 2,
                        high: 0
                    }
                ],
                _fieldLookup: {
                    dataset: 0,
                    dataset_tags: 1,
                    number_of_ocurrences: 2
                }
            }
        ];
        const query = '\nMATCH (d:DATASET)-[:TAGGED_WITH {application: {application}}]->(c:TOPIC)\nWHERE d.id IN {datasets}\nWITH COLLECT(c.id) AS main_tags, d\nMATCH (d2:DATASET)-[:TAGGED_WITH {application: {application}}]->(c1:TOPIC)-[:PART_OF|:IS_A|:QUALITY_OF*1..15]->(c2:TOPIC)\nWHERE (c1.id IN main_tags OR c2.id IN main_tags) AND d2.id <> d.id\nWITH COLLECT(DISTINCT c1.id) AS dataset_tags, d2.id AS dataset\nWITH size(dataset_tags) AS number_of_ocurrences, dataset_tags, dataset\nRETURN dataset, dataset_tags, number_of_ocurrences\nORDER BY number_of_ocurrences DESC\n';
        const parameters = {
            datasets: [
                'e7b9efb2-3836-45ae-8b6a-f8391c7bcd2f'
            ],
            application: 'rw'
        };

        stubQuery(sandbox, query, parameters, records);
        nock(process.env.GATEWAY_URL)
            .post('/v1/dataset/find-by-ids', {
                // eslint-disable-next-line no-underscore-dangle
                ids: records.map((elem) => elem._fields[0])
            })
            .reply(200, {
                data: [
                    {
                        id: '444138cd-8ef4-48b3-b197-73e324175ad0',
                        type: 'dataset',
                        attributes: {
                            name: 'dis.012.nrt Landslide Hazard Alerts',
                            slug: 'dis012nrt-Landslide-Hazard-Alerts',
                            type: 'tabular',
                            subtitle: '',
                            application: [
                                'rw'
                            ],
                            dataPath: '',
                            attributesPath: null,
                            connectorType: 'rest',
                            provider: 'cartodb',
                            userId: '58fa22c54eecd907310778cd',
                            connectorUrl: 'https://rw-nrt.carto.com/tables/dis_012_landslide_hazard_alerts_explore/public',
                            sources: [],
                            tableName: 'dis_012_landslide_hazard_alerts_explore',
                            status: 'saved',
                            published: true,
                            overwrite: false,
                            subscribable: {},
                            mainDateField: 'datetime',
                            env: 'production',
                            geoInfo: true,
                            protected: false,
                            legend: {
                                date: [],
                                region: [],
                                country: [],
                                nested: [],
                                integer: [],
                                short: [],
                                byte: [],
                                double: [],
                                float: [],
                                half_float: [],
                                scaled_float: [],
                                boolean: [],
                                binary: [],
                                text: [],
                                keyword: []
                            },
                            clonedHost: {},
                            errorMessage: '',
                            taskId: null,
                            createdAt: '2019-06-28T06:59:42.797Z',
                            updatedAt: '2021-08-13T10:27:01.559Z',
                            dataLastUpdated: '2021-08-13T02:30:00.000Z',
                            widgetRelevantProps: [
                                'datetime',
                                'nowcast'
                            ],
                            layerRelevantProps: [
                                'datetime',
                                'nowcast'
                            ]
                        }
                    },
                    {
                        id: '4828c405-06a2-4460-a78c-90969bce582b',
                        type: 'dataset',
                        attributes: {
                            name: 'foo.024.nrt Vegetation Health Index',
                            slug: 'foo024nrt-Vegetation-Health-Index',
                            type: 'raster',
                            subtitle: 'NOAA',
                            application: [
                                'prep'
                            ],
                            dataPath: '',
                            attributesPath: null,
                            connectorType: 'rest',
                            provider: 'gee',
                            userId: '5899bfbcde3d6e4317ee4ef0',
                            connectorUrl: '',
                            sources: [],
                            tableName: 'users/resourcewatch_wri/foo_024_vegetation_health_index',
                            status: 'saved',
                            published: true,
                            overwrite: false,
                            subscribable: {},
                            mainDateField: '',
                            env: 'production',
                            applicationConfig: {
                                rw: {
                                    layerOrder: [
                                        'e9f9d20c-1924-48b2-97ed-6936e233adb2'
                                    ]
                                }
                            },
                            geoInfo: true,
                            protected: false,
                            legend: {
                                date: [],
                                region: [],
                                country: [],
                                nested: [],
                                integer: [],
                                short: [],
                                byte: [],
                                double: [],
                                float: [],
                                half_float: [],
                                scaled_float: [],
                                boolean: [],
                                binary: [],
                                text: [],
                                keyword: []
                            },
                            clonedHost: {},
                            errorMessage: '',
                            taskId: null,
                            createdAt: '2019-07-03T12:34:20.439Z',
                            updatedAt: '2019-10-29T12:52:47.662Z',
                            dataLastUpdated: '2019-10-20T00:00:00.000Z',
                            widgetRelevantProps: [],
                            layerRelevantProps: []
                        }
                    },
                    {
                        id: 'c0c71e67-0088-4d69-b375-85297f79ee75',
                        type: 'dataset',
                        attributes: {
                            name: 'cli.023 Standard Precipitation Index (SPI)',
                            slug: 'cli023-Standard-Precipitation-Index',
                            type: 'raster',
                            subtitle: 'UCSB',
                            application: [
                                'rw'
                            ],
                            dataPath: '',
                            attributesPath: null,
                            connectorType: 'rest',
                            provider: 'gee',
                            userId: '58fa22c54eecd907310778cd',
                            connectorUrl: '',
                            sources: [],
                            tableName: 'projects/resource-watch-gee/cli_023_CHIRPS_2006_to_2015_annual_SPI',
                            status: 'saved',
                            published: true,
                            overwrite: false,
                            subscribable: {},
                            mainDateField: null,
                            env: 'production',
                            applicationConfig: {
                                rw: {
                                    layerOrder: [
                                        'd57be513-7510-4c97-bc0c-88b3a6407edb',
                                        'eb0574c3-50a8-4cd3-ba8d-4d13eb7b12ad',
                                        '5543496a-84e0-4936-b974-d7504717b84d',
                                        '845fc586-c130-4da8-89da-3978816c14c2',
                                        'dbdb0d8e-7352-4bc7-857c-f727b56462aa',
                                        'd799f842-95bc-48ef-b17e-9c2550b6f1c2',
                                        '156cfedb-f989-4ad2-be6d-5c48db262a36',
                                        'bee905be-cb07-411c-b646-df7cb0a247da',
                                        'e6ddf90a-c822-46bf-8e02-de86d7bdf5d0',
                                        'ed38b641-b462-44b9-832c-1f9747922e25',
                                        '27857f82-847c-4bb0-b5ef-f5e0d45018c0',
                                        '840f7792-1b70-4792-9929-bc14aeb00469',
                                        'e4e90ff1-e1ae-4bd6-a6af-c1da1009687a',
                                        '3ac08127-089c-4d89-8888-e824893013de'
                                    ]
                                }
                            },
                            geoInfo: true,
                            protected: false,
                            legend: {
                                date: [],
                                region: [],
                                country: [],
                                nested: [],
                                integer: [],
                                short: [],
                                byte: [],
                                double: [],
                                float: [],
                                half_float: [],
                                scaled_float: [],
                                boolean: [],
                                binary: [],
                                text: [],
                                keyword: []
                            },
                            clonedHost: {},
                            errorMessage: '[Automatic Validation] ConnectorFailed -> Invalid Dataset',
                            taskId: null,
                            createdAt: '2020-02-26T15:39:57.762Z',
                            updatedAt: '2021-08-12T15:01:42.062Z',
                            dataLastUpdated: null,
                            widgetRelevantProps: [],
                            layerRelevantProps: []
                        }
                    },
                ],
                links: {
                    self: 'http://api.resourcewatch.org/v1/dataset/find-by-ids?page[number]=1&page[size]=10',
                    first: 'http://api.resourcewatch.org/v1/dataset/find-by-ids?page[number]=1&page[size]=10',
                    last: 'http://api.resourcewatch.org/v1/dataset/find-by-ids?page[number]=2&page[size]=10',
                    prev: 'http://api.resourcewatch.org/v1/dataset/find-by-ids?page[number]=1&page[size]=10',
                    next: 'http://api.resourcewatch.org/v1/dataset/find-by-ids?page[number]=2&page[size]=10'
                },
                meta: {
                    'total-pages': 2,
                    'total-items': 14,
                    size: 10
                }
            });

        const response = await requester
            .get('/api/v1/graph/query/similar-dataset-including-descendent')
            .query({
                dataset: 'e7b9efb2-3836-45ae-8b6a-f8391c7bcd2f'
            });

        response.status.should.equal(200);
        response.body.should.deep.equal({
            data: [
                {
                    concepts: [
                        'precipitation',
                        'soil'
                    ],
                    dataset: '444138cd-8ef4-48b3-b197-73e324175ad0',
                    numberOfOcurrences: 1,
                },
                {
                    concepts: [
                        'water',
                        'drought',
                    ],
                    dataset: '4828c405-06a2-4460-a78c-90969bce582b',
                    numberOfOcurrences: 1
                },
                {
                    concepts: [
                        'drought',
                        'precipitation'
                    ],
                    dataset: 'c0c71e67-0088-4d69-b375-85297f79ee75',
                    numberOfOcurrences: 1
                }
            ]
        });
    });

    it('Getting similar datasets including descendent with dataset ids should return a 200 (happy case) - with filtered by env', async () => {
        const records = [
            {
                keys: [
                    'dataset',
                    'dataset_tags',
                    'number_of_ocurrences'
                ],
                length: 3,
                _fields: [
                    '444138cd-8ef4-48b3-b197-73e324175ad0',
                    [
                        'precipitation',
                        'soil'
                    ],
                    {
                        low: 2,
                        high: 0
                    }
                ],
                _fieldLookup: {
                    dataset: 0,
                    dataset_tags: 1,
                    number_of_ocurrences: 2
                }
            },
            {
                keys: [
                    'dataset',
                    'dataset_tags',
                    'number_of_ocurrences'
                ],
                length: 3,
                _fields: [
                    '4828c405-06a2-4460-a78c-90969bce582b',
                    [
                        'water',
                        'drought'
                    ],
                    {
                        low: 2,
                        high: 0
                    }
                ],
                _fieldLookup: {
                    dataset: 0,
                    dataset_tags: 1,
                    number_of_ocurrences: 2
                }
            },
            {
                keys: [
                    'dataset',
                    'dataset_tags',
                    'number_of_ocurrences'
                ],
                length: 3,
                _fields: [
                    'c0c71e67-0088-4d69-b375-85297f79ee75',
                    [
                        'drought',
                        'precipitation'
                    ],
                    {
                        low: 2,
                        high: 0
                    }
                ],
                _fieldLookup: {
                    dataset: 0,
                    dataset_tags: 1,
                    number_of_ocurrences: 2
                }
            }
        ];
        const query = '\nMATCH (d:DATASET)-[:TAGGED_WITH {application: {application}}]->(c:TOPIC)\nWHERE d.id IN {datasets}\nWITH COLLECT(c.id) AS main_tags, d\nMATCH (d2:DATASET)-[:TAGGED_WITH {application: {application}}]->(c1:TOPIC)-[:PART_OF|:IS_A|:QUALITY_OF*1..15]->(c2:TOPIC)\nWHERE (c1.id IN main_tags OR c2.id IN main_tags) AND d2.id <> d.id\nWITH COLLECT(DISTINCT c1.id) AS dataset_tags, d2.id AS dataset\nWITH size(dataset_tags) AS number_of_ocurrences, dataset_tags, dataset\nRETURN dataset, dataset_tags, number_of_ocurrences\nORDER BY number_of_ocurrences DESC\n';
        const parameters = {
            datasets: [
                'e7b9efb2-3836-45ae-8b6a-f8391c7bcd2f'
            ],
            application: 'rw',
            env: 'production',
        };

        stubQuery(sandbox, query, parameters, records);
        nock(process.env.GATEWAY_URL)
            .post('/v1/dataset/find-by-ids', {
                // eslint-disable-next-line no-underscore-dangle
                ids: records.map((elem) => elem._fields[0]),
                env: 'production',
            })
            .reply(200, {
                data: [
                    {
                        id: '444138cd-8ef4-48b3-b197-73e324175ad0',
                        type: 'dataset',
                        attributes: {
                            name: 'dis.012.nrt Landslide Hazard Alerts',
                            slug: 'dis012nrt-Landslide-Hazard-Alerts',
                            type: 'tabular',
                            subtitle: '',
                            application: [
                                'rw'
                            ],
                            dataPath: '',
                            attributesPath: null,
                            connectorType: 'rest',
                            provider: 'cartodb',
                            userId: '58fa22c54eecd907310778cd',
                            connectorUrl: 'https://rw-nrt.carto.com/tables/dis_012_landslide_hazard_alerts_explore/public',
                            sources: [],
                            tableName: 'dis_012_landslide_hazard_alerts_explore',
                            status: 'saved',
                            published: true,
                            overwrite: false,
                            subscribable: {},
                            mainDateField: 'datetime',
                            env: 'production',
                            geoInfo: true,
                            protected: false,
                            legend: {
                                date: [],
                                region: [],
                                country: [],
                                nested: [],
                                integer: [],
                                short: [],
                                byte: [],
                                double: [],
                                float: [],
                                half_float: [],
                                scaled_float: [],
                                boolean: [],
                                binary: [],
                                text: [],
                                keyword: []
                            },
                            clonedHost: {},
                            errorMessage: '',
                            taskId: null,
                            createdAt: '2019-06-28T06:59:42.797Z',
                            updatedAt: '2021-08-13T10:27:01.559Z',
                            dataLastUpdated: '2021-08-13T02:30:00.000Z',
                            widgetRelevantProps: [
                                'datetime',
                                'nowcast'
                            ],
                            layerRelevantProps: [
                                'datetime',
                                'nowcast'
                            ]
                        }
                    },
                    {
                        id: '4828c405-06a2-4460-a78c-90969bce582b',
                        type: 'dataset',
                        attributes: {
                            name: 'foo.024.nrt Vegetation Health Index',
                            slug: 'foo024nrt-Vegetation-Health-Index',
                            type: 'raster',
                            subtitle: 'NOAA',
                            application: [
                                'prep'
                            ],
                            dataPath: '',
                            attributesPath: null,
                            connectorType: 'rest',
                            provider: 'gee',
                            userId: '5899bfbcde3d6e4317ee4ef0',
                            connectorUrl: '',
                            sources: [],
                            tableName: 'users/resourcewatch_wri/foo_024_vegetation_health_index',
                            status: 'saved',
                            published: true,
                            overwrite: false,
                            subscribable: {},
                            mainDateField: '',
                            env: 'production',
                            applicationConfig: {
                                rw: {
                                    layerOrder: [
                                        'e9f9d20c-1924-48b2-97ed-6936e233adb2'
                                    ]
                                }
                            },
                            geoInfo: true,
                            protected: false,
                            legend: {
                                date: [],
                                region: [],
                                country: [],
                                nested: [],
                                integer: [],
                                short: [],
                                byte: [],
                                double: [],
                                float: [],
                                half_float: [],
                                scaled_float: [],
                                boolean: [],
                                binary: [],
                                text: [],
                                keyword: []
                            },
                            clonedHost: {},
                            errorMessage: '',
                            taskId: null,
                            createdAt: '2019-07-03T12:34:20.439Z',
                            updatedAt: '2019-10-29T12:52:47.662Z',
                            dataLastUpdated: '2019-10-20T00:00:00.000Z',
                            widgetRelevantProps: [],
                            layerRelevantProps: []
                        }
                    },
                ],
                links: {
                    self: 'http://api.resourcewatch.org/v1/dataset/find-by-ids?page[number]=1&page[size]=10',
                    first: 'http://api.resourcewatch.org/v1/dataset/find-by-ids?page[number]=1&page[size]=10',
                    last: 'http://api.resourcewatch.org/v1/dataset/find-by-ids?page[number]=2&page[size]=10',
                    prev: 'http://api.resourcewatch.org/v1/dataset/find-by-ids?page[number]=1&page[size]=10',
                    next: 'http://api.resourcewatch.org/v1/dataset/find-by-ids?page[number]=2&page[size]=10'
                },
                meta: {
                    'total-pages': 2,
                    'total-items': 14,
                    size: 10
                }
            });

        const response = await requester
            .get('/api/v1/graph/query/similar-dataset-including-descendent')
            .query({
                dataset: 'e7b9efb2-3836-45ae-8b6a-f8391c7bcd2f'
            });

        response.status.should.equal(200);
        response.body.should.deep.equal({
            data: [
                {
                    concepts: [
                        'precipitation',
                        'soil'
                    ],
                    dataset: '444138cd-8ef4-48b3-b197-73e324175ad0',
                    numberOfOcurrences: 1,
                },
                {
                    concepts: [
                        'water',
                        'drought',
                    ],
                    dataset: '4828c405-06a2-4460-a78c-90969bce582b',
                    numberOfOcurrences: 1
                },
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
