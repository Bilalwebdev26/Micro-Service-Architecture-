import express from "express";
import { APIError, asyncHandler } from "../middleware/errorHandler.js";
const route = express.Router();

const items = [
  {
    id: 1,
    name: "itme 1",
  },
  {
    id: 2,
    name: "itme 2",
  },
  {
    id: 3,
    name: "itme 3",
  },
  {
    id: 4,
    name: "itme 4",
  },
  {
    id: 5,
    name: "itme 5",
  },
];
//create routes
route.get(
  "/items",
  asyncHandler(async (req, res) => {
    res.json(items);
  })
);
route.post(
  "/items",
  asyncHandler(async (req, res) => {
    if (!req.body.name) {
      throw new APIError("Name Not found", 400);
    }
    const newItem = {
      id: items.length + 1,
      name: `item ${items.length + 1} -- ${req.body.name}`,
    };
    items.push(newItem)
    res.json(items)
  })
);
export default route;
