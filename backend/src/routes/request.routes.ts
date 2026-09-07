import express from "express";
import protect from "../middleware/auth.middleware";
import {
  createRequest,
  getMyRequests,
  getReceivedRequests,
  approveRequest,
  rejectRequest,
  returnRequest,
} from "../controller/request.controller";

const routes = express.Router();

routes.post("/", protect, createRequest);
routes.get("/my-requests", protect, getMyRequests);
routes.get("/received", protect, getReceivedRequests);
routes.patch("/:id/approve", protect, approveRequest);
routes.patch("/:id/reject", protect, rejectRequest);
routes.patch("/:id/return", protect, returnRequest);

export default routes;
