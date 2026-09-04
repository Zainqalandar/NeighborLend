import { Request, Response } from "express";
import mongoose from "mongoose";
import { HTTP_STATUS } from "../constants/http-status";
import Item from "../models/item.model";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import RequestModel from "../models/request.model";


// Requests
// POST   /api/requests                     (borrower creates request)

const getUserId = (req: Request) =>
  (req as AuthenticatedRequest).user?.id;

const getUserObjectId = (req: Request) => {
  const userId = getUserId(req);
  return userId && mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : null;
};

const createRequest = async (req: Request, res: Response) => {
  try {
    const borrowerId = getUserObjectId(req);
    if (!borrowerId) return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" });

    const { itemId } = req.body;
    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Invalid item ID" });
    }

    // Check if the item exists and is available
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Item not found" });
    }
    if (item.status !== "available") {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Item is not available for borrowing" });
    }
    
    // Create the request
    const newRequest = new RequestModel({
      item: item._id,
      borrower: borrowerId,
      owner: item.owner,
      status: "pending",
      requestDate: new Date(),
    });

    await newRequest.save();

    return res.status(HTTP_STATUS.CREATED).json({ message: "Request created successfully", data: newRequest });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Error creating request",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// GET    /api/requests/my-requests         (borrower view)

const getMyRequests = async (req: Request, res: Response) => {
  try {
    const borrowerId = getUserObjectId(req);
    if (!borrowerId) return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" });

    const requests = await RequestModel.find({ borrower: borrowerId } as any)
      .populate("item", "title description category imageUrl status")
      .populate("owner", "name email phone address");
      
    return res.status(HTTP_STATUS.OK).json({
        message: "Requests retrieved successfully",
        data: requests,
    });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Error retrieving your requests",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// PATCH  /api/requests/:id/approve

const approveRequest = async (req: Request, res: Response) => {
  try {
    const ownerId = getUserObjectId(req);
    if (!ownerId) return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" });

    const requestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Invalid request ID" });
    }

    const request = await RequestModel.findById(requestId);
    if (!request) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Request not found" });
    }

    // Check if the current user is the owner of the item
    if (request.owner.toString() !== ownerId.toString()) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ message: "You are not authorized to approve this request" });
    }

    // Update the request status to approved and set the approved date
    request.status = "approved";
    request.approvedDate = new Date();
    await request.save();

    // Update the item status to requested
    const item = await Item.findById(request.item);
    if (item) {
      item.status = "requested";
      await item.save();
    }

    return res.status(HTTP_STATUS.OK).json({ message: "Request approved successfully", data: request });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Error approving request",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// PATCH  /api/requests/:id/reject

const rejectRequest = async (req: Request, res: Response) => {
  try {
    const ownerId = getUserObjectId(req);
    if (!ownerId) return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" });

    const requestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Invalid request ID" });
    }

    const request = await RequestModel.findById(requestId);
    if (!request) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Request not found" });
    }

    // Check if the current user is the owner of the item
    if (request.owner.toString() !== ownerId.toString()) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ message: "You are not authorized to reject this request" });
    }

    // Update the request status to rejected
    request.status = "rejected";
    await request.save();

    return res.status(HTTP_STATUS.OK).json({ message: "Request rejected successfully", data: request });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Error rejecting request",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// PATCH  /api/requests/:id/return

const returnRequest = async (req: Request, res: Response) => {
  try {
    const borrowerId = getUserObjectId(req);
    if (!borrowerId) return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" });

    const requestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Invalid request ID" });
    }

    const request = await RequestModel.findById(requestId);
    if (!request) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Request not found" });
    }

    // Check if the current user is the borrower of the item
    if (request.borrower.toString() !== borrowerId.toString()) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ message: "You are not authorized to mark this request as returned" });
    }

    // Update the request status to returned and set the returned date
    request.status = "returned";
    request.returnedDate = new Date();
    await request.save();

    // Update the item status to available
    const item = await Item.findById(request.item);
    if (item) {
      item.status = "available";
      await item.save();
    }

    return res.status(HTTP_STATUS.OK).json({ message: "Request marked as returned successfully", data: request });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Error marking request as returned",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export { createRequest, getMyRequests, approveRequest, rejectRequest, returnRequest };