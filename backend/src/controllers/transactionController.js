const transactionService = require('../services/transactionService');

exports.getTransactions = (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      customerRegion = '',
      gender = '',
      ageMin = '',
      ageMax = '',
      productCategory = '',
      tags = '',
      paymentMethod = '',
      dateStart = '',
      dateEnd = '',
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const filters = {
      search,
      customerRegion: customerRegion ? customerRegion.split(',') : [],
      gender: gender ? gender.split(',') : [],
      ageMin: ageMin ? parseInt(ageMin) : null,
      ageMax: ageMax ? parseInt(ageMax) : null,
      productCategory: productCategory ? productCategory.split(',') : [],
      tags: tags ? tags.split(',') : [],
      paymentMethod: paymentMethod ? paymentMethod.split(',') : [],
      dateStart,
      dateEnd
    };

    const result = transactionService.getFilteredTransactions(
      parseInt(page),
      parseInt(limit),
      filters,
      sortBy,
      sortOrder
    );

    res.json(result);
  } catch (error) {
    console.error('Error in getTransactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

exports.getFilterOptions = (req, res) => {
  try {
    const options = transactionService.getFilterOptions();
    res.json(options);
  } catch (error) {
    console.error('Error in getFilterOptions:', error);
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
};