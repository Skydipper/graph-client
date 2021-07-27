/* eslint-disable no-underscore-dangle */
const logger = require('logger');
const Router = require('koa-router');
const QueryService = require('services/query.service');
const datasetService = require('services/dataset.service');

const router = new Router({
    prefix: '/graph',
});

class GraphRouter {

    static async createDataset(ctx) {
        logger.info('Creating dataset node with id ', ctx.params.id);
        ctx.set('uncache', `graph-dataset dataset-graph ${ctx.params.id}-graph`);
        ctx.body = await QueryService.createDatasetNode(ctx.params.id);
    }

    static async associateResource(ctx) {
        ctx.assert(ctx.request.body && ctx.request.body.tags && ctx.request.body.tags.length > 0, 400, 'Tags body param is required');
        logger.info('Associating ', ctx.params.resourceType, ' node with id ', ctx.params.idResource, 'and tags ', ctx.request.body.tags);
        ctx.set('uncache', `graph-dataset dataset-graph ${ctx.params.idResource}-graph`);
        ctx.body = await QueryService.createRelationWithConcepts(ctx.params.resourceType, ctx.params.idResource, ctx.request.body.tags, ctx.request.body.application || 'rw');
    }

    static async updateResource(ctx) {
        ctx.assert(ctx.request.body && ctx.request.body.tags && ctx.request.body.tags.length > 0, 400, 'Tags body param is required');
        logger.info('Associating ', ctx.params.resourceType, ' node with id ', ctx.params.idResource, 'and tags ', ctx.request.body.tags);
        await QueryService.deleteRelationWithConcepts(ctx.params.resourceType, ctx.params.idResource, ctx.request.body.application || 'rw');
        ctx.set('uncache', `${ctx.params.idResource}-graph`);
        ctx.body = await QueryService.createRelationWithConcepts(ctx.params.resourceType, ctx.params.idResource, ctx.request.body.tags, ctx.request.body.application || 'rw');
    }

    static async disassociateResource(ctx) {
        logger.info('Dissasociating ', ctx.params.resourceType, ' node with id ', ctx.params.idResource, 'and app ', ctx.query.application);
        await QueryService.deleteRelationWithConcepts(ctx.params.resourceType, ctx.params.idResource, ctx.query.application || 'rw');
        ctx.set('uncache', `${ctx.params.idResource}-graph`);
        ctx.body = 'ok';
    }

    static async createWidgetNodeAndRelation(ctx) {
        logger.info('Creating widget node and relation with idWidget ', ctx.params.idWidget, ' and dataset ', ctx.params.idDataset);
        ctx.set('uncache', `graph-widget widget-graph ${ctx.params.idWidget}-graph`);
        ctx.body = await QueryService.createWidgetNodeAndRelation(ctx.params.idDataset, ctx.params.idWidget);
    }

    static async createLayerNodeAndRelation(ctx) {
        logger.info('Creating layer node and relation with idLayer ', ctx.params.idLayer, ' and dataset ', ctx.params.idDataset);
        ctx.set('uncache', `graph-layer layer-graph ${ctx.params.idLayer}-graph`);
        ctx.body = await QueryService.createLayerNodeAndRelation(ctx.params.idDataset, ctx.params.idLayer);
    }

    static async createMetadataNodeAndRelation(ctx) {
        ctx.assert(['DATASET', 'LAYER', 'WIDGET'].indexOf(ctx.params.resourceType) >= 0, 400, `Resource ${ctx.params.resourceType} invalid`);
        logger.info('Creating metadata node and relation with idWidget ', ctx.params.idMetadata, ' and resourcetype ', ctx.params.resourceType, ' and idresource', ctx.params.idResource);
        ctx.set('uncache', `graph-metadata metadata-graph ${ctx.params.idMetadata}-graph`);
        ctx.body = await QueryService.createMetadataNodeAndRelation(ctx.params.resourceType, ctx.params.idResource, ctx.params.idMetadata,);
    }

    static async deleteDataset(ctx) {
        logger.info('Deleting dataset node with id ', ctx.params.id);
        ctx.set('uncache', `graph-dataset dataset-graph ${ctx.params.id}-graph`);
        ctx.body = await QueryService.deleteDatasetNode(ctx.params.id);
    }

    static async deleteWidgetNodeAndRelation(ctx) {
        logger.info('Deleting widget node and relation with idWidget ', ctx.params.id);
        ctx.set('uncache', `graph-widget widget-graph ${ctx.params.id}-graph`);
        ctx.body = await QueryService.deleteWidgetNodeAndRelation(ctx.params.id);
    }

    static async deleteLayerNodeAndRelation(ctx) {
        logger.info('Deleting layer node and relation with idWidget ', ctx.params.id);
        ctx.set('uncache', `graph-layer layer-graph ${ctx.params.id}-graph`);
        ctx.body = await QueryService.deleteLayerNodeAndRelation(ctx.params.id);
    }

    static async deleteMetadata(ctx) {
        logger.info('Deleting metadata node and relation with idWidget ', ctx.params.id);
        ctx.set('uncache', `graph-metadata metadata-graph ${ctx.params.id}-graph`);
        ctx.body = await QueryService.deleteMetadata(ctx.params.id);
    }

    static async createFavouriteRelationWithResource(ctx) {
        logger.info('Creating favourite relation ');
        ctx.body = await QueryService.createFavouriteRelationWithResource(ctx.params.userId, ctx.params.resourceType, ctx.params.idResource, ctx.request.body.application || 'rw');
    }

    static async deleteFavouriteRelationWithResource(ctx) {
        logger.info('Creating favourite relation ');
        ctx.body = await QueryService.deleteFavouriteRelationWithResource(ctx.params.userId, ctx.params.resourceType, ctx.params.idResource, ctx.request.query.application || 'rw');
    }

    static async mostLikedDatasets(ctx) {
        logger.info('Getting most liked datasets ');
        const application = ctx.query.application || ctx.query.app || 'rw';
        const response = await QueryService.mostLikedDatasets(application);
        let data = [];
        if (response) {
            data = response.records.map((c) => ({
                id: c._fields[0],
                count: c._fields[1]
            }));
        }
        ctx.set('cache', 'graph-dataset');
        ctx.body = {
            data
        };
    }

    static async conceptsInferred(ctx) {
        let concepts = null;
        const application = ctx.query.application || ctx.query.app || 'rw';
        if (ctx.query.concepts) {
            concepts = ctx.query.concepts.split(',').map((c) => c.trim());
        } else if (ctx.request.body) {
            concepts = ctx.request.body.concepts;
        }
        ctx.assert(concepts, 400, 'Concepts is required');
        logger.info('Getting concepts inferred ', concepts);

        const response = await QueryService.getConceptsInferredFromList(concepts, application);
        let data = [];
        if (response) {
            data = response.records.map((c) => ({
                id: c._fields[0],
                label: c._fields[1],
                synonyms: c._fields[2],
                labels: c._fields[3]
            }));
        }
        ctx.set('cache', 'graph-default');
        ctx.body = {
            data
        };
    }

    static async conceptsAncestors(ctx) {
        let concepts = null;
        const application = ctx.query.application || ctx.query.app || 'rw';
        if (ctx.query.concepts) {
            concepts = ctx.query.concepts.split(',').map((c) => c.trim());
        } else if (ctx.request.body) {
            concepts = ctx.request.body.concepts;
        }
        ctx.assert(concepts, 400, 'Concepts is required');
        logger.info('Getting concepts inferred ', concepts);

        const response = await QueryService.getConceptsAncestorsFromList(concepts, application);
        let data = [];
        if (response) {
            data = response.records.map((c) => ({
                id: c._fields[0],
                label: c._fields[1],
                synonyms: c._fields[2],
                labels: c._fields[3]
            }));
        }
        ctx.set('cache', 'graph-default');
        ctx.body = {
            data
        };
    }

    static async listConcepts(ctx) {
        logger.info('Getting list concepts ');
        const application = ctx.query.application || ctx.query.app || 'rw';
        const includes = ctx.query.includes ? ctx.query.includes.split(',') : null;
        const defaultIncludes = ['TOPIC', 'DATA_TYPE', 'TIME_PERIOD', 'FREQUENCY'];
        const sanitizeIncludes = [];
        if (includes) {
            includes.forEach((el) => {
                if (defaultIncludes.indexOf(el.toUpperCase()) > -1) {
                    sanitizeIncludes.push(el.toUpperCase());
                }
            });
        }
        const response = await QueryService.getListConcepts(application, sanitizeIncludes, ctx.query.search ? ctx.query.search.split(',') : null);
        let data = [];
        if (response.records) {
            data = response.records.map((c) => ({
                id: c._fields[0],
                label: c._fields[1],
                synonyms: c._fields[2],
                labels: c._fields[3],
                numberOfDatasetsTagged: c._fields[4] ? c._fields[4].low : 0,
                datasets: c._fields[5]
            }));
        }
        ctx.set('cache', 'graph-default');
        ctx.body = {
            data
        };
    }

    static async listConceptsByDataset(ctx) {
        logger.info('Getting list concepts');
        const application = ctx.query.application || ctx.query.app || 'rw';
        const { dataset } = ctx.params;
        const response = await QueryService.getListConceptsByDataset(application, dataset);
        let data = [];
        if (response.records) {
            data = response.records.map((c) => ({
                id: dataset,
                type: 'graph',
                attributes: c._fields[0].properties
            }));
        }
        // ctx.set('cache', 'graph-default');
        ctx.body = {
            data
        };
    }

    static async listConceptsByDatasetsIds(ctx) {
        logger.info('Getting list concepts by find-by-ids');
        const application = ctx.query.application || ctx.query.app || 'rw';
        const datasets = ctx.request.body.ids;
        const data = await Promise.all(datasets.map(async (dataset) => {
            const response = await QueryService.getListConceptsByDataset(application, dataset);
            if (response.records) {
                return response.records.map((c) => ({
                    type: 'concept',
                    attributes: { dataset, ...c._fields[0].properties }
                }));
            }
            return null;
        }));
        // ctx.set('cache', 'graph-default');
        ctx.body = {
            data: [].concat(...data)
        };
    }

    static async querySearchDatasets(ctx) {
        let concepts = null;
        const application = ctx.query.application || ctx.query.app || 'rw';
        if (ctx.method === 'GET') {
            ctx.assert(ctx.query.concepts, 400, 'Concepts query params is required');
            concepts = ctx.query.concepts;
        } else {
            concepts = ctx.request.body.concepts;
        }
        logger.info('Searching dataset with concepts', concepts);

        let depthParam = ctx.query.depth;
        logger.info('depth', depthParam);
        if (depthParam === undefined) {
            depthParam = 15;
        } else {
            depthParam = parseInt(depthParam, 10);
        }
        const results = await QueryService.querySearchDatasets(concepts, application, depthParam);

        let datasetIds = [];
        if (results.records) {
            results.records.map((el) => {
                if (el._fields[0].length > 0) {
                    datasetIds = datasetIds.concat(el._fields[0]);
                }
                return el._fields[0];
            });
        }

        let result = [];
        if (datasetIds.length > 0) {
            result = await datasetService.checkDatasets(datasetIds, ctx.query);
        } else {
            result = [];
        }
        ctx.set('cache', 'graph-dataset');
        ctx.body = {
            data: result
        };
    }

    static async querySearchDatasetsIds(ctx) {
        let concepts = null;
        const application = ctx.query.application || ctx.query.app || 'rw';
        const { sort } = ctx.query;
        if (ctx.method === 'GET') {
            // ctx.assert(ctx.query.concepts, 400, 'Concepts query params is required');
            concepts = ctx.query.concepts;
        } else {
            concepts = ctx.request.body.concepts;
        }
        let depthParam = ctx.query.depth;
        if (depthParam === undefined) {
            depthParam = 15;
        } else {
            depthParam = parseInt(depthParam, 10);
        }
        let datasetIds = null;
        if (concepts) {
            datasetIds = [];
            logger.info('Searching dataset with concepts', concepts);
            const results = await QueryService.querySearchDatasets(concepts, application, depthParam);

            if (results.records) {
                results.records.map((el) => {
                    if (el._fields[0].length > 0) {
                        datasetIds = datasetIds.concat(el._fields[0]);
                    }
                    return el._fields[0];
                });
            }
        }
        if (datasetIds && datasetIds.length > 0 && sort && (sort.includes('most-viewed') || sort.includes('most-favorited'))) {
            datasetIds = await QueryService.sortDatasets(sort, datasetIds);
        } else if (!datasetIds) {
            datasetIds = await QueryService.sortDatasets(sort, datasetIds);
        }
        ctx.set('cache', 'graph-dataset');
        ctx.body = {
            data: datasetIds
        };
    }

    static async queryMostViewed(ctx) {
        logger.info('Returning datasets most viewed');
        const application = ctx.query.application || ctx.query.app || 'rw';
        const results = await QueryService.queryMostViewed(application);
        const datasetIds = [];
        const data = results.records ? results.records.map((el) => {
            datasetIds.push(el._fields[0]);
            return {
                dataset: el._fields[0],
                views: el._fields[1] ? el._fields[1].low : null
            };
        }) : [];
        let result = [];
        if (datasetIds.length > 0) {
            result = await datasetService.checkDatasets(datasetIds, ctx.query);
        } else {
            result = [];
        }
        ctx.set('cache', 'graph-dataset');
        ctx.body = {
            data: data.filter((el) => result.indexOf(el.dataset) >= 0)
        };
        if (ctx.query.limit) {
            ctx.body.data = ctx.body.data.slice(0, ctx.query.limit);
        }
    }

    static async queryMostViewedByUser(ctx) {
        logger.info('Returning datasets most viewed by user');
        if (!ctx.query.loggedUser) {
            ctx.throw(401, 'Not authenticaed');
            return;
        }
        const user = JSON.parse(ctx.query.loggedUser);
        const application = ctx.query.application || ctx.query.app || 'rw';
        const results = await QueryService.queryMostViewedByUser(user.id, application);

        const datasetIds = [];
        const data = results.records ? results.records.map((el) => {
            datasetIds.push(el._fields[0]);
            return {
                dataset: el._fields[0],
                views: el._fields[1] ? el._fields[1].low : null
            };
        }) : [];
        let result = [];
        if (datasetIds.length > 0) {
            result = await datasetService.checkDatasets(datasetIds, ctx.query);
        } else {
            result = [];
        }
        ctx.body = {
            data: data.filter((el) => result.indexOf(el.dataset) >= 0)
        };
        if (ctx.query.limit) {
            ctx.body.data = ctx.body.data.slice(0, ctx.query.limit);
        }
    }

    static async querySimilarDatasets(ctx) {
        logger.info('Obtaining similar datasets', ctx.params.dataset);
        const application = ctx.query.application || ctx.query.app || 'rw';
        if (ctx.params.dataset) {
            ctx.query.dataset = ctx.params.dataset;
        }
        ctx.assert(ctx.query.dataset, 400, 'dataset query param required');
        const results = await QueryService.querySimilarDatasets(ctx.query.dataset.split(','), application);
        const datasetIds = [];
        const data = results && results.records ? results.records.map((el) => {
            datasetIds.push(el._fields[0]);
            return {
                dataset: el._fields[0],
                concepts: el._fields[1],
                numberOfOcurrences: el._fieldLookup.dataset_tags
            };
        }) : [];
        let result = [];
        if (datasetIds.length > 0) {
            result = await datasetService.checkDatasets(datasetIds, ctx.query);
        }
        ctx.set('cache', 'graph-dataset');
        ctx.body = {
            data: data.filter((el) => result.indexOf(el.dataset) >= 0).slice(0, ctx.query.limit || 3)
        };
    }

    static async querySimilarDatasetsIncludingDescendent(ctx) {
        logger.info('Obtaining similar datasets with descendent', ctx.params.dataset);
        const application = ctx.query.application || ctx.query.app || 'rw';
        if (ctx.params.dataset) {
            ctx.query.dataset = ctx.params.dataset;
        }
        ctx.assert(ctx.query.dataset, 400, 'dataset query param required');
        const results = await QueryService.querySimilarDatasetsIncludingDescendent(ctx.query.dataset.split(','), application);
        const datasetIds = [];
        const data = results && results.records ? results.records.map((el) => {
            datasetIds.push(el._fields[0]);
            return {
                dataset: el._fields[0],
                concepts: el._fields[1],
                numberOfOcurrences: el._fieldLookup.dataset_tags
            };
        }) : [];
        let result = [];
        if (datasetIds.length > 0) {
            result = await datasetService.checkDatasets(datasetIds, ctx.query);
        }
        ctx.set('cache', 'graph-dataset');
        ctx.body = {
            data: data.filter((el) => result.indexOf(el.dataset) >= 0).slice(0, ctx.query.limit || 3)
        };
    }

    static async querySearchByLabelSynonymons(ctx) {
        logger.info('Obtaining datasets by application and search ', ctx.query.search);
        const application = ctx.query.application || ctx.query.app || 'rw';

        ctx.assert(ctx.query.search, 400, 'search query param required');
        const results = await QueryService.querySearchByLabelSynonymons(ctx.query.search ? ctx.query.search.split(' ') : '', application);
        logger.debug('AAA', results);
        const datasetIds = [];
        if (results && results.records) {
            results.records.map((el) => {
                datasetIds.push(el._fields[0]);
                return {
                    dataset: el._fields[0],
                    concepts: el._fields[1],
                    numberOfOcurrences: el._fieldLookup.dataset_tags
                };
            });
        }
        ctx.set('cache', 'graph-default');
        ctx.body = {
            data: datasetIds
        };
    }

    static async visitedDataset(ctx) {
        logger.info('Visited dataset');
        const user = ctx.request.body && ctx.request.body.loggedUser;
        await QueryService.visitedDataset(ctx.params.id, user ? user.id : null);
        ctx.set('uncache', `graph-dataset dataset-graph ${ctx.params.id}-graph`);
        ctx.body = {};
    }

}

async function isAuthorized(ctx, next) {
    let user = ctx.request.body && ctx.request.body.loggedUser;
    if (!user && ctx.request.query && ctx.request.query.loggedUser) {
        user = JSON.parse(ctx.request.query.loggedUser);
    }

    if (user.id !== 'microservice') {
        ctx.throw(401, 'Unauthorized');
        return;
    }
    await next();
}


async function checkExistsDataset(ctx, next) {
    const exists = await QueryService.checkExistsDataset(ctx.params.idDataset);
    if (!exists.records || exists.records.length === 0) {
        ctx.throw(404, 'Dataset not found');
        return;
    }
    await next();
}

async function checkExistsResource(ctx, next) {
    ctx.params.resourceType = ctx.params.resourceType.toUpperCase();
    const exists = await QueryService.checkExistsResource(ctx.params.resourceType, ctx.params.idResource);
    if (!exists.records || exists.records.length === 0) {
        ctx.throw(404, `Resource ${ctx.params.resourceType} and id ${ctx.params.idResource} not found`);
        return;
    }
    logger.debug('Exists');
    await next();
}

router.get('/query/list-concepts', GraphRouter.listConcepts);
router.get('/query/list-concepts/:dataset', GraphRouter.listConceptsByDataset);
router.post('/query/list-concepts/find-by-ids', GraphRouter.listConceptsByDatasetsIds);
router.get('/query/concepts-inferred', GraphRouter.conceptsInferred);
router.post('/query/concepts-inferred', GraphRouter.conceptsInferred);
router.get('/query/concepts-ancestors', GraphRouter.conceptsAncestors);
router.post('/query/concepts-ancestors', GraphRouter.conceptsAncestors);


router.get('/query/similar-dataset', GraphRouter.querySimilarDatasets);
router.get('/query/similar-dataset-including-descendent', GraphRouter.querySimilarDatasetsIncludingDescendent);
router.get('/query/similar-dataset/:dataset', GraphRouter.querySimilarDatasets);
router.get('/query/similar-dataset-including-descendent/:dataset', GraphRouter.querySimilarDatasetsIncludingDescendent);
router.get('/query/search-datasets', GraphRouter.querySearchDatasets);
router.get('/query/search-datasets-ids', GraphRouter.querySearchDatasetsIds);
router.get('/query/most-liked-datasets', GraphRouter.mostLikedDatasets);
router.post('/query/search-datasets', GraphRouter.querySearchDatasets);
router.get('/query/most-viewed', GraphRouter.queryMostViewed);
router.get('/query/most-viewed-by-user', GraphRouter.queryMostViewedByUser);
router.get('/query/search-by-label-synonyms', GraphRouter.querySearchByLabelSynonymons);


router.post('/dataset/:id', isAuthorized, GraphRouter.createDataset);
router.post('/dataset/:id/visited', GraphRouter.visitedDataset);
router.post('/widget/:idDataset/:idWidget', isAuthorized, checkExistsDataset, GraphRouter.createWidgetNodeAndRelation);
router.post('/layer/:idDataset/:idLayer', isAuthorized, checkExistsDataset, GraphRouter.createLayerNodeAndRelation);
router.post('/metadata/:resourceType/:idResource/:idMetadata', isAuthorized, checkExistsResource, GraphRouter.createMetadataNodeAndRelation);
router.post('/:resourceType/:idResource/associate', isAuthorized, checkExistsResource, GraphRouter.associateResource);
router.put('/:resourceType/:idResource/associate', isAuthorized, checkExistsResource, GraphRouter.updateResource);
router.delete('/:resourceType/:idResource/associate', isAuthorized, checkExistsResource, GraphRouter.disassociateResource);
router.post('/favourite/:resourceType/:idResource/:userId', isAuthorized, checkExistsResource, GraphRouter.createFavouriteRelationWithResource);

router.delete('/favourite/:resourceType/:idResource/:userId', isAuthorized, checkExistsResource, GraphRouter.deleteFavouriteRelationWithResource);
router.delete('/dataset/:id', isAuthorized, GraphRouter.deleteDataset);
router.delete('/widget/:id', isAuthorized, GraphRouter.deleteWidgetNodeAndRelation);
router.delete('/layer/:id', isAuthorized, GraphRouter.deleteLayerNodeAndRelation);
router.delete('/metadata/:id', isAuthorized, GraphRouter.deleteMetadata);

module.exports = router;
