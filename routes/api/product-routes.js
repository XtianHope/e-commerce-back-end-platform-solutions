const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  try { 
    const productData = await Product.findAll({
      include: [
        { model: Category },
        { model: Tag }
      ]
    });
    res.status(200).json(productData);
   } catch (err) {
     res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  try { 
    const productData = await Product.findByPk(req.params.id, {
      include: [
        { model: Category },
        { model: Tag }
      ]
    });
    res.status(200).json(productData);
   } catch (err) {
     res.status(500).json(err);
  }
});

// create new product
router.post('/', async (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */

  try {
    const product = await Product.create(req.body);
    // if there's product tags, we need to create pairings by using the setTags method
    if (req.body.tagIds && req.body.tagIds.length > 0) {
      await product.setTags(req.body.tagIds);
      await product.save();
      const productWithTags = await Product.findByPk(product.id, { include: [Category, Tag] });
      return res.status(200).json(await product.getTags());
    }
    // if no product tags, just respond
    const productData = await Product.findByPk(product.id, { include: [Category, Tag] });
    return res.status(200).json(product);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// update product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, { include: [Tag] });
    // update product data
    product.update(req.body);
    // if there's product tags, we need to create pairings by using the setTags method
    if (req.body.tagIds && req.body.tagIds.length > 0) {
      await product.setTags(req.body.tagIds);
    }
    await product.save();
    await product.reload();
    const updatedProduct = await Product.findByPk(req.params.id, { include: [Category, Tag] });
    return res.status(200).json(product);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    await product.destroy();
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

module.exports = router;
