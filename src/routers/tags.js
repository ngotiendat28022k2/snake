import express from 'express';
import { addTags, getTags, getTagsbyId, removeTags, updateTags } from '../controller/tags';

const RouterTags = express.Router();

RouterTags.get(`/tags`, getTags)
RouterTags.post(`/tags`, addTags)
RouterTags.put(`/tags/:id`, updateTags)
RouterTags.get(`/tags/:id`, getTagsbyId)
RouterTags.delete(`/tags/:id`, removeTags)

export default RouterTags;