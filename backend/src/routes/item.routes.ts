
import express from 'express'

import { getAllItems, getMyItems, getItemById, createItem, updateItem, deleteItem, enhanceItemDescription } from "../controller/item.controller";
import protect from "../middleware/auth.middleware";

const routes = express.Router();

routes.get('/', getAllItems);
routes.get('/mine', protect, getMyItems);
routes.post('/ai-enhance', protect, enhanceItemDescription);
routes.get('/:id', getItemById);
routes.post('/', protect, createItem);
routes.put('/:id', protect, updateItem);
routes.delete('/:id', protect, deleteItem);

export default routes;
