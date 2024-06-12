const router = require('express').Router();
const e = require('express');
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint


// get all products
router.get('/', async (req, res) => {
  // find all products
  try {
    const productData = await Product.findAll({
      include: [{ model: Category }, { model: Tag }],
    }) 
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
  // be sure to include its associated Category and Tag data
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  try { 
    const productData = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag }],
    })
    if (!productData) {
      res.status(404).json({ message: 'No product found with that id!' });
      return;
    }
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
  // be sure to include its associated Category and Tag data
});

// create new product
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    // if there's product tags, we need to create pairings to bulk create in the ProductTag model
    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: product.id,
          tag_id,
        };
      });
      await ProductTag.bulkCreate(productTagIdArr);
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json(err);
  }
});

// update product
router.put('/:id', (req, res) => {
  try {
    const productData = Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    })
    if (!productData) {
      res.status(404).json({ message: 'No product found with that id!' });
      return;
    }
    res.status(200).json(productData);
    } catch (err) {
      res.status(500).json(err);
    }
    
});
  // update product data
  router.put('/:id', async (req, res) => {
    try {
      const productData = await Product.update(req.body, {
        where: {
          id: req.params.id,
        },
      });
  
      if (!productData[0]) {
        res.status(404).json({ message: 'No product found with that id!' });
        return;
      }
  
      if (req.body.tagIds && req.body.tagIds.length) {
        const productTags = await ProductTag.findAll({
          where: { product_id: req.params.id },
        });
  
        const productTagIds = productTags.map(({ tag_id }) => tag_id);
  
        const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: req.params.id,
              tag_id,
            };
          });
  
        const productTagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);
  
        await Promise.all([
          ProductTag.destroy({ where: { id: productTagsToRemove } }),
          ProductTag.bulkCreate(newProductTags),
        ]);
      }
  
      res.status(200).json({ message: 'Product updated successfully' });
    } catch (err) {
      res.status(500).json(err);
    }
  });

router.delete('/:id', (req, res) => {
  // delete one product by its `id` value
  try {
    const productData = Product.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!productData) {
      res.status(404).json({ message: 'No product found with that id!' });
      return;
    }
    res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
      res.status(500).json(err);
    }
});

module.exports = router;