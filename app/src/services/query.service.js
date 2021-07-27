/* eslint-disable no-underscore-dangle */
const logger = require('logger');
const Neo4JService = require('services/neo4j.service');

const CREATE_DATASET = `MERGE (dataset:DATASET {id: {id}, views: 0}) RETURN dataset`;
const CHECK_EXISTS_DATASET = `MATCH (dataset:DATASET {id: {id}}) RETURN dataset`;
const CHECK_EXISTS_RESOURCE = `MATCH (n:{resourceType} {id: {resourceId}}) RETURN n`;
const CREATE_USER = `MERGE (user:USER {id: {id}}) RETURN user`;
const CHECK_EXISTS_USER = `MATCH (dataset:USER {id: {id}}) RETURN dataset`;

const CREATE_RELATION = `
  MATCH (resource:{resourceType} {id:{resourceId}})
  MATCH (concept:CONCEPT{id:{label}})
  MERGE (resource)-[r:TAGGED_WITH {application: {application}}]->(concept) RETURN concept, resource, r
`;

const DELETE_RELATION = `
  MATCH (resource:{resourceType} {id:{resourceId}})
  MATCH (concept:CONCEPT)
  MATCH (resource)-[r:TAGGED_WITH {application: {application}}]->(concept) DELETE r
`;

const DELETE_RELATION_ALL_APPS = `
  MATCH (resource:{resourceType} {id:{resourceId}})
  MATCH (concept:CONCEPT)
  MATCH (resource)-[r:TAGGED_WITH]->(concept) DELETE r
`;


const CREATE_RELATION_FAVOURITE_AND_RESOURCE = `
MATCH (resource:{resourceType} {id:{resourceId}})
MERGE (user:USER{id:{userId}})
MERGE (user)-[r:FAVOURITE {application: {application}}]->(resource) RETURN user, resource, r
`;

const CREATE_WIDGET_AND_RELATION = `
  MATCH(dataset: DATASET {id: {idDataset}})
  MERGE (widget: WIDGET {id: {idWidget}})
  MERGE (widget)-[r:BELONGS_TO]->(dataset) RETURN widget, dataset, r
`;

const CREATE_LAYER_AND_RELATION = `
  MATCH (dataset: DATASET {id: {idDataset}})
  MERGE (layer: LAYER {id: {idLayer}})
  MERGE (layer)-[r:BELONGS_TO]->(dataset) RETURN layer, dataset, r
`;

const CREATE_METADATA_AND_RELATION = `
  MATCH (resource:{resourceType} {id: {resourceId}})
  MERGE (metadata: METADATA {id: {idMetadata}})
  MERGE (metadata)-[r:BELONGS_TO]->(resource) RETURN metadata, resource, r
`;

const DELETE_DATASET_NODE = `
  MATCH (n)-[:BELONGS_TO*0..]->(dataset:DATASET{id:{id}})
  DETACH DELETE dataset, n
`;


const DELETE_RELATION_FAVOURITE_AND_RESOURCE = `
  MATCH (user:USER{id:{userId}})-[r:FAVOURITE]->(resource:{resourceType}{id:{resourceId}})
  DETACH DELETE r
`;


const DELETE_WIDGET_NODE = `
  MATCH (n)-[:BELONGS_TO*0..]->(widget:WIDGET{id:{id}})
  DETACH DELETE widget, n
`;

const DELETE_LAYER_NODE = `
  MATCH (n)-[:BELONGS_TO*0..]->(layer:LAYER{id:{id}})
  DETACH DELETE layer, n
`;

const DELETE_METADATA_NODE = `
  MATCH (metadata:METADATA{id:{id}})
  DETACH DELETE metadata
`;

const QUERY_SIMILAR_DATASET = `
MATCH p=(d:DATASET)-[:TAGGED_WITH {application: {application}}]->(c:TOPIC)<-[:TAGGED_WITH {application: {application}}]-(d2:DATASET)
WHERE d.id IN {datasets}
WITH length(COLLECT(c.id)) AS number_of_shared_concepts, COLLECT(c.id) AS shared_concepts, d2
RETURN d2.id, shared_concepts, number_of_shared_concepts
ORDER BY number_of_shared_concepts DESC
`;

const QUERY_SIMILAR_DATASET_WITH_DESCENDENT = `
MATCH (d:DATASET)-[:TAGGED_WITH {application: {application}}]->(c:TOPIC)
WHERE d.id IN {datasets}
WITH COLLECT(c.id) AS main_tags, d
MATCH (d2:DATASET)-[:TAGGED_WITH {application: {application}}]->(c1:TOPIC)-[:PART_OF|:IS_A|:QUALITY_OF*1..15]->(c2:TOPIC)
WHERE (c1.id IN main_tags OR c2.id IN main_tags) AND d2.id <> d.id
WITH COLLECT(DISTINCT c1.id) AS dataset_tags, d2.id AS dataset
WITH size(dataset_tags) AS number_of_ocurrences, dataset_tags, dataset
RETURN dataset, dataset_tags, number_of_ocurrences
ORDER BY number_of_ocurrences DESC
`;

const QUERY_SEARCH_PARTS = [`
MATCH (c:CONCEPT)<-[:TAGGED_WITH {application: {application}}]-(d:DATASET)
WHERE c.id IN {concepts1}
WITH COLLECT(d.id) AS datasets
`, `
OPTIONAL MATCH (c:CONCEPT)<-[:PART_OF|:IS_A|:QUALITY_OF*{depth}]-(c2:CONCEPT)<-[:TAGGED_WITH {application: {application}}]-(d:DATASET)
WHERE (c.id IN {concepts1})
WITH COLLECT(d.id) + datasets AS datasets
`, `
MATCH (c:CONCEPT)<-[:TAGGED_WITH {application: {application}}]-(d:DATASET)
WHERE c.id IN {concepts2} AND d.id IN datasets
WITH COLLECT(d.id) AS tempSet, datasets
`, `
OPTIONAL MATCH (c:CONCEPT)<-[:PART_OF|:IS_A|:QUALITY_OF*{depth}]-(c2:CONCEPT)<-[:TAGGED_WITH {application: {application}}]-(d:DATASET)
WHERE (c.id IN {concepts2}) AND d.id IN datasets
WITH COLLECT(d.id) + tempSet AS datasets
`, `
MATCH (c:CONCEPT)<-[:TAGGED_WITH {application: {application}}]-(d:DATASET)
WHERE c.id IN {concepts3} AND d.id IN datasets
WITH COLLECT(d.id) AS tempSet, datasets
`, `
OPTIONAL MATCH (c:CONCEPT)<-[:PART_OF|:IS_A|:QUALITY_OF*{depth}]-(c2:CONCEPT)<-[:TAGGED_WITH {application: {application}}]-(d:DATASET)
WHERE (c.id IN {concepts3}) AND d.id IN datasets
WITH COLLECT(DISTINCT d.id) + tempSet AS datasets
`];

const QUERY_SEARCH_FINAL = `
RETURN DISTINCT datasets
`;

const QUERY_GET_LIST_CONCEPTS = [`
MATCH (c:CONCEPT)
`,
`
WITH c
OPTIONAL MATCH (c)<-[:TAGGED_WITH {application: {application}}]-(d:DATASET)
WITH COLLECT(d.id) AS datasets, c, COUNT(d) as number_of_datasets_tagged
RETURN c.id, c.label, c.synonyms, labels(c) AS labels, number_of_datasets_tagged, datasets
ORDER BY number_of_datasets_tagged DESC
`];

const QUERY_GET_LIST_CONCEPTS_WHERE = [
    `size(filter(x IN LABELS(c)  WHERE x in {includes})) > 0`,
    `size(filter(part IN {search} WHERE toLower(c.label) CONTAINS toLower(part))) > 0
  OR size(filter(x IN c.synonyms WHERE size(filter(part in {search} WHERE toLower(x) CONTAINS toLower(part))) > 0)) > 0`
];

const QUERY_GET_CONCEPTS_INFERRED_FROM_LIST = `
MATCH (c:CONCEPT)-[:PART_OF|:IS_A|:QUALITY_OF*]->(c2:CONCEPT)
WHERE c.id IN {concepts}
WITH collect(DISTINCT c.id) + collect(DISTINCT c2.id) as results
MATCH (c:CONCEPT)
WHERE c.id IN results
RETURN c.id, c.label, c.synonyms, labels(c) as labels
`;

const MOST_LIKED_DATASETS = `
MATCH (u:USER)-[:FAVOURITE {application: {application}}]->(d:DATASET)
RETURN d.id, COUNT(d) AS number_of_favorites
ORDER BY number_of_favorites DESC
`;

const INCREMENT_DATASET = `
MATCH (dataset:DATASET {id: {dataset}})
SET dataset.views = coalesce(dataset.views, 0) + 1
`;

const VIEWED_BY_USER = `
MATCH (dataset:DATASET {id: {dataset}})
MERGE (user:USER{id:{userId}})
MERGE (user)-[r:VIEWED]->(dataset)
ON MATCH SET r.views = coalesce(r.views, 0) + 1
ON CREATE SET r.views = 1
`;

const QUERY_MOST_VIEWED = `
MATCH (d:DATASET)
RETURN d.id, d.views
ORDER BY d.views DESC
`;

const QUERY_MOST_VIEWED_BY_USER = `
MATCH (d:DATASET)<-[v:VIEWED {application: {application}}]-(u:USER {id: {userId}})
RETURN d.id, v.views
ORDER BY v.views DESC
`;

const QUERY_SEARCH_BY_LABEL_SYNONYMONS = `
MATCH (d:DATASET)-[:TAGGED_WITH {application: {application}}]->(c:CONCEPT)
WHERE size(filter(part IN {search} WHERE toLower(c.label) CONTAINS toLower(part))) > 0
OR size(filter(x IN c.synonyms WHERE size(filter(part in {search} WHERE toLower(x) CONTAINS toLower(part))) > 0)) > 0
RETURN d.id
`;

const QUERY_CONCEPTS_BY_DATASET = `
MATCH (c:CONCEPT)<-[:TAGGED_WITH {application: {application}}]-(d:DATASET {id: {dataset}})
RETURN c;
`;


class QueryService {

    static async run(query, params) {
        logger.info('Doing query ONLY READ ', query);
        const data = await Neo4JService.query(query, params);
        return data;
    }

    static async visitedDataset(dataset, userId) {
        logger.info(`Visited dataset ${dataset} by user ${userId}`);
        if (dataset) {
            await QueryService.run(INCREMENT_DATASET, {
                dataset
            });
        }
        if (dataset && userId) {
            await QueryService.run(VIEWED_BY_USER, {
                dataset,
                userId
            });
        }
    }

    static async getListConcepts(application, includes = null, search = null) {
        logger.debug('Getting list concepts');
        let query = QUERY_GET_LIST_CONCEPTS[0];
        if ((includes && includes.length > 0) || (search && search.length > 0)) {
            query += ' WHERE ';
            let gtOne = false;
            if (includes && includes.length > 0) {
                query += ` ${QUERY_GET_LIST_CONCEPTS_WHERE[0]} `;
                gtOne = true;
            }
            if (search && search.length > 0) {
                if (gtOne) {
                    query += ' AND ';
                }
                query += ` ${QUERY_GET_LIST_CONCEPTS_WHERE[1]} `;
            }
        }
        query += QUERY_GET_LIST_CONCEPTS[1];
        return QueryService.run(query, {
            application,
            includes,
            search
        });
    }

    static async getListConceptsByDataset(application, dataset) {
        logger.debug('Getting list concepts by dataset');
        return QueryService.run(QUERY_CONCEPTS_BY_DATASET, {
            application,
            dataset
        });
    }

    static async mostLikedDatasets(application) {
        logger.debug('Getting most liked datasets');
        return QueryService.run(MOST_LIKED_DATASETS, {
            application
        });
    }

    static async getConceptsInferredFromList(concepts, application) {
        logger.debug('Getting list concepts');
        return QueryService.run(QUERY_GET_CONCEPTS_INFERRED_FROM_LIST, {
            concepts,
            application
        });
    }

    static async checkExistsResource(resourceType, resourceId) {
        logger.debug('Checking if exist resource with type ', resourceType, ' and id ', resourceId);
        return QueryService.run(CHECK_EXISTS_RESOURCE.replace('{resourceType}', resourceType), {
            resourceId
        });
    }

    static async deleteRelationWithConcepts(resourceType, resourceId, application) {
        logger.debug('deleting relations with concepts, Type ', resourceType, ' and id ', resourceId);

        if (application) {
            logger.debug(DELETE_RELATION.replace('{resourceType}', resourceType));
            await QueryService.run(DELETE_RELATION.replace('{resourceType}', resourceType), {
                resourceId,
                application
            });
        } else {
            logger.debug(DELETE_RELATION_ALL_APPS.replace('{resourceType}', resourceType));
            await QueryService.run(DELETE_RELATION_ALL_APPS.replace('{resourceType}', resourceType), {
                resourceId,
                application
            });
        }

    }

    static async createRelationWithConcepts(resourceType, resourceId, concepts, application) {
        logger.debug('Creating relations with concepts, Type ', resourceType, ' and id ', resourceId, 'and concepts', concepts);
        for (let i = 0, { length } = concepts; i < length; i++) {
            logger.debug(CREATE_RELATION.replace('{resourceType}', resourceType));
            await QueryService.run(CREATE_RELATION.replace('{resourceType}', resourceType), {
                resourceId,
                label: concepts[i],
                application
            });
        }
    }

    static async createFavouriteRelationWithResource(userId, resourceType, resourceId, application) {

        logger.debug('Creating favourite relation, Type ', resourceType, ' and id ', resourceId, 'and user', userId);
        logger.debug('Checking if exist user');
        const users = await QueryService.run(CHECK_EXISTS_USER, {
            id: userId
        });
        if (!users.records || users.records.length === 0) {
            logger.debug('Creating user node');
            await QueryService.run(CREATE_USER, {
                id: userId
            });
        }
        await QueryService.run(CREATE_RELATION_FAVOURITE_AND_RESOURCE.replace('{resourceType}', resourceType), {
            resourceId,
            userId,
            application
        });
    }

    static async deleteFavouriteRelationWithResource(userId, resourceType, resourceId, application) {

        logger.debug('deleting favourite relation, Type ', resourceType, ' and id ', resourceId, 'and user', userId, 'and application ', application);

        await QueryService.run(DELETE_RELATION_FAVOURITE_AND_RESOURCE.replace('{resourceType}', resourceType), {
            resourceId,
            userId,
            application
        });
    }

    static async createDatasetNode(id) {
        logger.debug('Creating dataset with id ', id);
        return QueryService.run(CREATE_DATASET, {
            id
        });
    }

    static async createUserNode(id) {
        logger.debug('Creating user with id ', id);
        return QueryService.run(CREATE_USER, {
            id
        });
    }

    static async deleteDatasetNode(id) {
        logger.debug('Deleting dataset with id ', id);
        return QueryService.run(DELETE_DATASET_NODE, {
            id
        });
    }

    static async checkExistsDataset(id) {
        logger.debug('Checking if exists dataset with id ', id);
        return QueryService.run(CHECK_EXISTS_DATASET, {
            id
        });
    }

    static async createWidgetNodeAndRelation(idDataset, idWidget) {
        logger.debug('Creating widget and relation with id ', idWidget, '; id dataset', idDataset);
        return QueryService.run(CREATE_WIDGET_AND_RELATION, {
            idWidget,
            idDataset
        });
    }

    static async createUserNodeAndRelation(idDataset, idWidget) {
        logger.debug('Creating user and relation with id ', idWidget, '; id dataset', idDataset);
        return QueryService.run(CREATE_WIDGET_AND_RELATION, {
            idWidget,
            idDataset
        });
    }

    static async deleteWidgetNodeAndRelation(id) {
        logger.debug('Deleting widget and relation with id ', id);
        return QueryService.run(DELETE_WIDGET_NODE, {
            id
        });
    }

    static async createLayerNodeAndRelation(idDataset, idLayer) {
        logger.debug('Creating layer and relation with id ', idLayer, '; id dataset', idDataset);
        return QueryService.run(CREATE_LAYER_AND_RELATION, {
            idLayer,
            idDataset
        });
    }

    static async deleteLayerNodeAndRelation(id) {
        logger.debug('Deleting layer and relation with id ', id);
        return QueryService.run(DELETE_LAYER_NODE, {
            id
        });
    }

    static async createMetadataNodeAndRelation(resourceType, resourceId, idMetadata) {
        logger.debug('Creating metadata and relation with id-metadata ', idMetadata, '; resourceType ', resourceType, 'id dataset', resourceId);
        return QueryService.run(CREATE_METADATA_AND_RELATION.replace('{resourceType}', resourceType), {
            idMetadata,
            resourceId
        });
    }

    static async deleteMetadata(id) {
        logger.debug('Deleting metadata and relation with id ', id);
        return QueryService.run(DELETE_METADATA_NODE, {
            id
        });
    }

    static async querySimilarDatasets(datasets, application) {
        logger.debug('Obtaining similar datasets of ', datasets);
        return QueryService.run(QUERY_SIMILAR_DATASET, {
            datasets,
            application
        });
    }

    static async querySimilarDatasetsIncludingDescendent(datasets, application) {
        logger.debug('Obtaining similar datasets including descendent of ', datasets);
        return QueryService.run(QUERY_SIMILAR_DATASET_WITH_DESCENDENT, {
            datasets,
            application
        });
    }

    static async queryMostViewed(application) {
        logger.debug('Obtaining dataset most viewed ');
        return QueryService.run(QUERY_MOST_VIEWED, {
            application
        });
    }

    static async queryMostViewedByUser(userId, application) {
        logger.debug('Obtaining dataset most viewed by user ', userId);
        return QueryService.run(QUERY_MOST_VIEWED_BY_USER, {
            userId,
            application
        });
    }

    static async querySearchByLabelSynonymons(search, application) {
        logger.debug('Obtaining dataset by search ', search, 'and application ', application);
        return QueryService.run(QUERY_SEARCH_BY_LABEL_SYNONYMONS, {
            search,
            application
        });
    }

    static async querySearchDatasets(concepts, application, depth) {
        logger.debug('Searching datasets with concepts ', concepts);

        let query = '';
        const params = {
            concepts1: [],
            concepts2: [],
            concepts3: [],
            application
        };
        if (concepts && concepts.length > 0) {
            for (let i = 0, { length } = concepts; i < length; i += 2) {
                query += QUERY_SEARCH_PARTS[i];
                if (depth !== 0) {
                    query += QUERY_SEARCH_PARTS[i + 1].replace('{depth}', `1..${depth}`);
                }

                params[`concepts${i + 1}`] = concepts[i]; // .map(el => `'${el}'`).join(',');
            }
            query += QUERY_SEARCH_FINAL;
        }
        logger.info('query', query);
        logger.info('params', params);
        if (query) {
            logger.debug('query', query);
            logger.debug('params', params);
            return QueryService.run(query, params);
        }
        return null;
    }

    static async sortDatasets(sort, datasets = null) {
        let query = null;
        let dir = 'ASC';
        if (sort.startsWith('-')) {
            // eslint-disable-next-line no-param-reassign
            sort = sort.substr(1, sort.length);
            dir = 'DESC';
        }
        if (sort === 'most-favorited') {
            query = `
        MATCH (d:DATASET)
        OPTIONAL MATCH (d)<-[f:FAVOURITE]-()
        WITH d, COUNT(f) as favorites
        ${datasets ? `WHERE d.id IN {datasets}` : ''}
        RETURN d.id
        ORDER BY favorites ${dir}
      `;
        }
        if (sort === 'most-viewed') {
            query = `
        MATCH (d:DATASET)
        ${datasets ? `WHERE d.id IN {datasets}` : ''}
        return d.id
        ORDER BY d.views ${dir}
      `;
        }
        const results = await QueryService.run(query, { datasets });
        let datasetIds = [];
        if (results.records) {
            results.records.map((el) => {
                if (el._fields[0].length > 0) {
                    datasetIds = datasetIds.concat(el._fields[0]);
                }
                return el._fields[0];
            });
        }
        return datasetIds;
    }

}


module.exports = QueryService;
