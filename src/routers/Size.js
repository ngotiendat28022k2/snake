import express from 'express';
import { addTags, getTags, getTagsbyId, removeTags, updateTags } from '../controller/tags';
import { addSize, getSize, getSizebyId, removeSize, updateSize } from '../controller/size';

const RouterSize = express.Router();

RouterSize.get(`/size`, getSize)
RouterSize.post(`/size`, addSize)
RouterSize.put(`/size/:id`, updateSize)
RouterSize.get(`/size/:id`, getSizebyId)
RouterSize.delete(`/size/:id`, removeSize)

export default RouterSize;