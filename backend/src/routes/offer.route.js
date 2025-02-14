import express, { Router } from "express";
import {
  createOffer,
  deleteOffer,
  getAllOffers,
  getSpecificOfferDetails,
  isOfferEligible,
  offerWithOutMetaData,
  updateOffer,
} from "../controller/offer.controller.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const router = Router();

router.route("/applicable").get(offerWithOutMetaData);
router.route("/").post(ClerkExpressRequireAuth(), createOffer);
router.route("/:shopId/:itemId").get(getAllOffers);
router.route("/:id").get(getSpecificOfferDetails);
router.route("/:id").patch(ClerkExpressRequireAuth(), updateOffer);
router.route("/:id").delete(ClerkExpressRequireAuth(), deleteOffer);
router.route("/eligible").post(ClerkExpressRequireAuth(), isOfferEligible);

export default router;
