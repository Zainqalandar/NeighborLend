import { Request, Response } from "express";
import mongoose from "mongoose";
import { HTTP_STATUS } from "../constants/http-status";
import Item from "../models/item.model";
import { enhanceItemDescriptionWithGemini } from "../services/gemini.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const ITEM_STATUSES = ["available", "requested", "borrowed"] as const;

const getUserId = (req: Request) =>
  (req as AuthenticatedRequest).user?.id;

const getUserObjectId = (req: Request) => {
  const userId = getUserId(req);
  return userId && mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : null;
};

const getRouteParam = (req: Request, name: string) => {
  const value = req.params[name];
  return typeof value === "string" ? value : undefined;
};

const isValidItemId = (id: string) => mongoose.Types.ObjectId.isValid(id);

// GET /api/items?search=drill&category=Power%20Tools&status=available&page=1&limit=10
const getAllItems = async (req: Request, res: Response) => {
  try {
    const category = typeof req.query.category === "string" ? req.query.category.trim() : undefined;
    const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
    const status = typeof req.query.status === "string" ? req.query.status.trim() : undefined;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

    if (status && status !== "all" && !ITEM_STATUSES.includes(status as typeof ITEM_STATUSES[number])) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid item status",
        allowedStatuses: ITEM_STATUSES,
      });
    }

    const filter: Record<string, unknown> = {};
    if (!status || status !== "all") filter.status = status || "available";
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      Item.find(filter)
        .populate("owner", "name email phone address")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Item.countDocuments(filter),
    ]);

    return res.status(HTTP_STATUS.OK).json({
      message: "Items retrieved successfully",
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Error retrieving items",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// GET /api/items/mine (protected)
const getMyItems = async (req: Request, res: Response) => {
  try {
    const ownerId = getUserObjectId(req);
    if (!ownerId) return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" });

    const items = await Item.find({ owner: ownerId }).sort({ createdAt: -1 });
    return res.status(HTTP_STATUS.OK).json({
      message: "Your items retrieved successfully",
      data: items,
    });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Error retrieving your items",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// GET /api/items/:id
const getItemById = async (req: Request, res: Response) => {
  try {
    const itemId = getRouteParam(req, "id");
    if (!itemId || !isValidItemId(itemId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Invalid item ID" });
    }

    const item = await Item.findById(new mongoose.Types.ObjectId(itemId)).populate("owner", "name email phone address");
    if (!item) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Item not found" });

    return res.status(HTTP_STATUS.OK).json({ message: "Item retrieved successfully", data: item });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Error retrieving item",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// POST /api/items (protected)
const createItem = async (req: Request, res: Response) => {
  try {
    const ownerId = getUserObjectId(req);
    if (!ownerId) return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" });

    const { title, description, category, imageUrl } = req.body;
    if (![title, description, category, imageUrl].every(
      (value) => typeof value === "string" && value.trim().length > 0,
    )) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "title, description, category and imageUrl are required",
      });
    }

    const newItem = await Item.create({
      owner: ownerId,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      imageUrl: imageUrl.trim(),
    });

    return res.status(HTTP_STATUS.CREATED).json({ message: "Item created successfully", data: newItem });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Error creating item",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// PUT /api/items/:id (protected, owner only)
const updateItem = async (req: Request, res: Response) => {
  try {
    const ownerId = getUserObjectId(req);
    const itemId = getRouteParam(req, "id");
    if (!ownerId) return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" });
    if (!itemId || !isValidItemId(itemId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Invalid item ID" });
    }

    const { title, description, category, imageUrl } = req.body;
    const updates: Record<string, string> = {};
    
    for (const [field, value] of Object.entries({ title, description, category, imageUrl })) {
      if (value !== undefined) {
        if (typeof value !== "string" || !value.trim()) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: `${field} must be a non-empty string` });
        }
        updates[field] = value.trim();
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "At least one field is required" });
    }

    const updatedItem = await Item.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(itemId), owner: ownerId },
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!updatedItem) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Item not found or you are not the owner" });
    }

    return res.status(HTTP_STATUS.OK).json({ message: "Item updated successfully", data: updatedItem });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Error updating item",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// DELETE /api/items/:id (protected, owner only)
const deleteItem = async (req: Request, res: Response) => {
  try {
    const ownerId = getUserObjectId(req);
    const itemId = getRouteParam(req, "id");
    if (!ownerId) return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" });
    if (!itemId || !isValidItemId(itemId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Invalid item ID" });
    }

    const deletedItem = await Item.findOneAndDelete({ _id: new mongoose.Types.ObjectId(itemId), owner: ownerId });
    if (!deletedItem) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Item not found or you are not the owner" });
    }

    return res.status(HTTP_STATUS.OK).json({ message: "Item deleted successfully", data: deletedItem });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Error deleting item",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// POST /api/items/ai-enhance (protected)
const enhanceItemDescription = async (req: Request, res: Response) => {
  try {
    const { description } = req.body;
    if (typeof description !== "string" || !description.trim()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Description is required" });
    }

    const enhancedDescription = await enhanceItemDescriptionWithGemini(description.trim());
    return res.status(HTTP_STATUS.OK).json({
      message: "Description enhanced successfully",
      data: { enhancedDescription },
    });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Error enhancing description",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export {
  getAllItems,
  getMyItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  enhanceItemDescription,
};
