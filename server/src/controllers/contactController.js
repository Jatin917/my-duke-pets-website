import asyncHandler from 'express-async-handler';
import {
  sendContactConfirmationEmail,
  sendContactAdminEmail,
  sendHelpEnquiryConfirmationEmail,
  sendHelpEnquiryAdminEmail,
  hasEmailFailure,
  notifyDeliveryFailure,
} from '../utils/email.js';

// @desc    Contact Us form
// @route   POST /api/contact
// @access  Customer
export const submitContactForm = asyncHandler(async (req, res) => {
  const form = {
    name: req.customer.name || 'Pet Parent',
    phone: req.customer.phone || '',
    email: req.customer.email || '',
    subject: (req.body.subject || '').trim(),
    message: (req.body.message || '').trim(),
  };

  const results = await Promise.all([
    form.email
      ? sendContactConfirmationEmail({ form })
      : Promise.resolve({ skipped: true }),
    sendContactAdminEmail({ form }),
  ]);

  if (hasEmailFailure(results)) {
    await notifyDeliveryFailure({
      userEmail: form.email,
      userName: form.name,
      context: 'contact message',
      results,
    }).catch(() => {});
  }

  const bothFailed = results.every((r) => r && r.success === false);
  if (bothFailed) {
    res.status(502);
    throw new Error('Could not send your message right now. Please try again or call us.');
  }

  res.status(201).json({
    success: true,
    message: 'Message sent! We will get back to you soon.',
  });
});

// @desc    Help / Enquiries form
// @route   POST /api/contact/help
// @access  Customer
export const submitHelpEnquiry = asyncHandler(async (req, res) => {
  const form = {
    intent: (req.body.intent || '').trim(),
    name: req.customer.name || 'Pet Parent',
    phone: req.customer.phone || '',
    email: req.customer.email || '',
    petType: (req.body.petType || '').trim(),
    city: (req.body.city || '').trim(),
    message: (req.body.message || '').trim(),
  };

  const results = await Promise.all([
    form.email
      ? sendHelpEnquiryConfirmationEmail({ form })
      : Promise.resolve({ skipped: true }),
    sendHelpEnquiryAdminEmail({ form }),
  ]);

  if (hasEmailFailure(results)) {
    await notifyDeliveryFailure({
      userEmail: form.email,
      userName: form.name,
      context: 'help enquiry',
      results,
    }).catch(() => {});
  }

  const bothFailed = results.every((r) => r && r.success === false);
  if (bothFailed) {
    res.status(502);
    throw new Error('Could not submit your enquiry right now. Please try again or call us.');
  }

  res.status(201).json({
    success: true,
    message: 'Enquiry submitted. Our team will contact you soon.',
  });
});
