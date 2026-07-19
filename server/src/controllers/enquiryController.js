import asyncHandler from 'express-async-handler';
import Enquiry from '../models/Enquiry.js';
import Pet from '../models/Pet.js';
import Category from '../models/Category.js';
import { appendEnquiryToExcel, generateEnquiriesExcelBuffer } from '../utils/excelExport.js';
import {
  appendEnquiryToGoogleSheet,
  updateEnquiryInGoogleSheet,
  deleteEnquiryFromGoogleSheet,
  getGoogleSheetInfo,
} from '../utils/googleSheets.js';
import {
  sendEnquiryConfirmationEmail,
  sendEnquiryAdminEmail,
  sendEnquiryStatusEmail,
} from '../utils/email.js';

// @desc    Create enquiry
// @route   POST /api/enquiry
// @access  Public
export const createEnquiry = asyncHandler(async (req, res) => {
  const { name, phone, email, city, state, address, pet, message } = req.body;

  const petDoc = await Pet.findById(pet).populate('category', 'name');

  if (!petDoc) {
    res.status(404);
    throw new Error('Selected pet not found');
  }

  const enquiry = await Enquiry.create({
    name,
    phone,
    email,
    city,
    state,
    address,
    pet: petDoc._id,
    petName: petDoc.name,
    category: petDoc.category?.name || '',
    message,
  });

  await Promise.all([appendEnquiryToExcel(enquiry), appendEnquiryToGoogleSheet(enquiry)]);

  Promise.all([
    sendEnquiryConfirmationEmail({ enquiry }),
    sendEnquiryAdminEmail({ enquiry }),
  ]).catch(() => {});

  res.status(201).json({
    success: true,
    message: 'Thank you! Our team will contact you shortly.',
    data: enquiry,
  });
});

// @desc    Get all enquiries (admin)
// @route   GET /api/enquiry
// @access  Private/Admin
export const getEnquiries = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { petName: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [enquiries, total] = await Promise.all([
    Enquiry.find(query).populate('pet', 'name slug images').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Enquiry.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: enquiries.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: enquiries,
  });
});

// @desc    Google Sheet link/status for admin UI
// @route   GET /api/enquiry/google-sheet
// @access  Private/Admin
export const getGoogleSheet = asyncHandler(async (req, res) => {
  res.json({ success: true, data: getGoogleSheetInfo() });
});

// @desc    Get single enquiry
// @route   GET /api/enquiry/:id
// @access  Private/Admin
export const getEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id).populate('pet', 'name slug images');
  if (!enquiry) {
    res.status(404);
    throw new Error('Enquiry not found');
  }
  res.json({ success: true, data: enquiry });
});

// @desc    Update enquiry status
// @route   PUT /api/enquiry/:id
// @access  Private/Admin
export const updateEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry) {
    res.status(404);
    throw new Error('Enquiry not found');
  }

  const previousStatus = enquiry.status;
  enquiry.status = req.body.status || enquiry.status;
  const updated = await enquiry.save();
  await updateEnquiryInGoogleSheet(updated);

  if (req.body.status && req.body.status !== previousStatus) {
    sendEnquiryStatusEmail({ enquiry: updated }).catch(() => {});
  }

  res.json({ success: true, data: updated });
});

// @desc    Delete enquiry
// @route   DELETE /api/enquiry/:id
// @access  Private/Admin
export const deleteEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry) {
    res.status(404);
    throw new Error('Enquiry not found');
  }
  const id = enquiry._id;
  await enquiry.deleteOne();
  await deleteEnquiryFromGoogleSheet(id);
  res.json({ success: true, message: 'Enquiry deleted successfully' });
});

// @desc    Export enquiries to Excel
// @route   GET /api/enquiry/export/excel
// @access  Private/Admin
export const exportEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await Enquiry.find().sort({ createdAt: -1 });
  const buffer = await generateEnquiriesExcelBuffer(enquiries);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=enquiries-export.xlsx');
  res.send(buffer);
});

// @desc    Get dashboard stats
// @route   GET /api/enquiry/stats/dashboard
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalPets = await Pet.countDocuments();
  const totalCategories = await Category.countDocuments();
  const totalEnquiries = await Enquiry.countDocuments();
  const pendingEnquiries = await Enquiry.countDocuments({ status: 'Pending' });
  const latestEnquiries = await Enquiry.find().sort({ createdAt: -1 }).limit(5).populate('pet', 'name');

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const recentEnquiries = await Enquiry.find({ createdAt: { $gte: sevenDaysAgo } });
  const enquiryTrend = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date(sevenDaysAgo);
    day.setDate(day.getDate() + i);
    const dayKey = day.toDateString();
    const count = recentEnquiries.filter((e) => new Date(e.createdAt).toDateString() === dayKey).length;
    return { date: day.toISOString().slice(0, 10), count };
  });

  const statusBreakdown = await Enquiry.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    data: {
      totalPets,
      totalCategories,
      totalEnquiries,
      pendingEnquiries,
      latestEnquiries,
      enquiryTrend,
      statusBreakdown,
      googleSheet: getGoogleSheetInfo(),
    },
  });
});
