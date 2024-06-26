const mongoose = require('mongoose');
const fs = require('fs');
const AtlasSearchQueryBuilder = require('../classes/AtlasSearchQueryBuilder');

const searchSamples = async ({ query, phrasePaths, enableFuzzy, multiAnalyser, dbName, collectionName, page = 1, limit = 10 }) => {
    const searchQuery = AtlasSearchQueryBuilder.buildSearchCompoundOperator({ query, phrasePaths, enableFuzzy, multiAnalyser });

    if (!searchQuery) {
        throw new Error('Invalid input or unable to build search query');
    }

    console.log('searchQuery=>', searchQuery);

    const pipeline = [
        {
            $search: searchQuery
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: limit
        }
    ];

    let data = JSON.stringify(pipeline);
    fs.writeFileSync('pipeline.json', data);

    // Switch to the appropriate database and collection
    const connection = mongoose.connection.useDb(dbName);
    const Collection = connection.collection(collectionName);

    return await Collection.aggregate(pipeline).toArray();
};

module.exports = { searchSamples };

