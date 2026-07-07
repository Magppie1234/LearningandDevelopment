/**
 * Order-to-Handover journey — the full post-sale process, from booking payment
 * to order closure (103 steps). Drives the interactive KitchenJourney scene: a
 * Magppie cyclist rides a metro-style line of these stages. Steps and copy are
 * the client's canonical list; `ic` is an icon key (see ICONS in
 * KitchenJourney.tsx), `disp` are the dispositions/captures for that step.
 */

export type JourneyPhase = {
  name: string
  /** 1-based index of the first step in this phase. */
  start: number
  count: number
  /** Accent hex used for this phase's stop, rail segment, and controls. */
  color: string
}

export const JOURNEY_PHASES: JourneyPhase[] = [
  { name: 'Design & Measurement', start: 1, count: 19, color: '#B8935A' },
  { name: 'Procurement & Inventory', start: 20, count: 30, color: '#B8703F' },
  { name: 'Production', start: 50, count: 13, color: '#7C8B6F' },
  { name: 'Packing & Dispatch', start: 63, count: 15, color: '#C9A24B' },
  { name: 'Installation & Handover', start: 78, count: 26, color: '#C06A43' },
]

export function phaseOf(index: number): JourneyPhase {
  const step = index + 1
  return (
    JOURNEY_PHASES.find((p) => step >= p.start && step <= p.start + p.count - 1) ??
    JOURNEY_PHASES[0]
  )
}

export type JourneyStep = {
  t: string
  ic: string
  d: string
  disp?: string[]
}

const S = (t: string, ic: string, d: string, disp?: string[]): JourneyStep => ({
  t,
  ic,
  d,
  ...(disp ? { disp } : {}),
})

export const JOURNEY_STEPS: JourneyStep[] = [
  S('Booking Payment Received', 'payment', 'Booking advance payment received from the client — the starting point of the order-to-handover process.'),
  S('Assigned to Post Designer', 'assign', 'Order assigned to the post-design team for measurement and design execution.'),
  S('Request First Measurement', 'ruler', 'Formal request for the first site measurement is initiated.'),
  S('First Measurement Done', 'clipboard', 'First site measurement completed with all details captured.', ['Measurement Sheet', 'Site Photos', 'Site Videos', 'Measurement Notes']),
  S('Measurement Review', 'review', 'Measurements reviewed for completeness and accuracy.'),
  S('Revisit Required', 'revisit', 'Site revisit required due to issues identified during review.', ['Missing Measurements', 'Site Not Ready', 'Client Unavailable', 'Design Clarification', 'Measurement Error', 'Other']),
  S('Revisit Measurement Done', 'ruler', 'Revisit measurement completed successfully.'),
  S('Design Revision After First Measurement', 'design', 'Design revised based on the first measurement data.'),
  S('Design Approved', 'approve', 'Design approved internally by the design team.'),
  S('Design Approved by Client', 'client', 'Design approved by the client after review.'),
  S('Request Electrical & Plumbing Marking', 'bolt', 'Request initiated for electrical and plumbing marking at site.'),
  S('Electrical & Plumbing Visit Completed', 'bolt', 'Electrical and plumbing marking visit completed at site.'),
  S('Mood Board Selection Sent', 'swatch', 'Mood board with material and finish options sent to the client.'),
  S('Mood Board Approved', 'swatch', 'Client approved the mood board selection.'),
  S('Preparation of 3D Drawings', 'cube', '3D drawings prepared from the approved design and measurements.'),
  S('3D Design Approval', 'cube', '3D design submitted for approval.', ['Approved', 'Revision Required']),
  S('Preparation of Sign-off & Production Drawings', 'drawing', 'Sign-off and production drawings prepared.'),
  S('Production Drawing Approval', 'drawing', 'Production drawings submitted for approval.', ['Approved', 'Disapproved']),
  S('Handover to Factory', 'factory', 'Approved production drawings handed over to the factory for production planning.'),
  S('Factory Order Received', 'factory', 'Order received at the factory from the sales team.'),
  S('BOM Generation', 'bom', 'Bill of Materials generated from the approved designs.'),
  S('BOM Validation', 'bom', 'BOM validated for accuracy and completeness.'),
  S('Stock Availability Check', 'stock', 'Available stock checked against BOM requirements.'),
  S('Stock Reservation', 'stock', 'Available stock reserved for this order.'),
  S('Material Shortage Identification', 'alert', 'Materials with insufficient stock identified.'),
  S('Material Requirement Generation', 'list', 'Material requirement report generated for shortages.'),
  S('OptiSheet Download', 'optimize', 'OptiSheet downloaded for sheet optimization.'),
  S('Optimization Software Processing', 'cnc', 'Optimization software run to generate cutting plans.'),
  S('Waste Percentage Calculation', 'calc', 'Expected waste percentage calculated from optimization.'),
  S('Sheet Utilization Calculation', 'calc', 'Sheet utilization efficiency calculated.'),
  S('Actual Material Requirement Calculation', 'calc', 'Actual material requirements calculated post-optimization.'),
  S('Final Production BOM Released', 'bom', 'Final production BOM released with the optimized cutting plan.'),
  S('Store Stock Verification', 'stock', 'Physical stock verified against system records.'),
  S('Available Stock Committed', 'stock', 'Available stock committed to this production order.'),
  S('Shortage List Generated', 'alert', 'Shortage list generated for materials to be purchased.'),
  S('Purchase Requisition Created', 'purchase', 'Purchase requisition created for shortage materials.'),
  S('Vendor Selection', 'vendor', 'Vendor selected on price, quality, and delivery timeline.'),
  S('Purchase Order Creation', 'purchase', 'Purchase order created with the selected vendor.'),
  S('Purchase Approval', 'approve', 'Purchase order approved by authorized personnel.'),
  S('Purchase Order Released', 'send', 'Purchase order released to the vendor.'),
  S('Vendor Acknowledgement', 'vendor', 'Vendor acknowledges the PO and confirms the delivery timeline.'),
  S('Vendor Dispatch', 'truck', 'Vendor dispatches materials to the factory.'),
  S('Material Receipt at Factory', 'package', 'Materials received at the factory gate.'),
  S('GRN Creation', 'clipboard', 'Goods Receipt Note created for the received materials.'),
  S('Quantity Verification', 'calc', 'Received quantity verified against the PO and GRN.'),
  S('Incoming QC Request', 'qc', 'Incoming quality-control inspection requested.'),
  S('Incoming QC Inspection', 'qc', 'QC inspection of incoming materials against every spec.', ['Dimension Check', 'Thickness Check', 'Shade Check', 'Damage Check', 'Hardware Check', 'Vendor Compliance']),
  S('QC Decision Matrix', 'qc', 'Quality-control decision — accepted or rejected, with full action paths.', ['QC Approved', 'Stock Added', 'QC Rejected', 'Notify Purchase', 'Notify Factory Head', 'Accept + Warning', 'Accept + Partial Debit', 'Accept + Full Debit', 'Purchase Return', 'Book at Loss', 'Reorder Same Supplier', 'Reorder Alternate']),
  S('Material Available in Store', 'stock', 'All materials available and ready in the store.'),
  S('Production Work Order Released', 'factory', 'Production work order released to the factory floor.'),
  S('Store Material Issue', 'stock', 'Store issues materials to production.'),
  S('Raw Material Issued to Production', 'package', 'Raw material issued to the production floor.'),
  S('Cutting', 'cut', 'Raw materials cut to the required dimensions.'),
  S('Edge Banding', 'box', 'Edge banding applied to the cut materials.'),
  S('CNC Processing', 'cnc', 'CNC machining and processing.'),
  S('Drilling', 'drill', 'Holes drilled as per design specifications.'),
  S('Assembly', 'assembly', 'Processed components assembled.'),
  S('Hardware Fitting', 'hardware', 'Hardware fitted and installed.'),
  S('Surface Finishing', 'finish', 'Surface finishing and treatment.'),
  S('Semi Finished Goods', 'package', 'Semi-finished goods stage — quality checkpoint.'),
  S('Finished Goods Creation', 'package', 'Finished goods created and ready for QC.'),
  S('Internal Production QC', 'qc', 'Internal quality control of the finished goods.', ['Approved', 'Rework Required', 'Hold', 'Scrap', 'Rework Process', 'Re-inspection', 'Approval']),
  S('Packing Request', 'package', 'Packing request initiated for the approved goods.'),
  S('Module Packing', 'package', 'Individual modules packed securely.'),
  S('Hardware Packing', 'hardware', 'Hardware components packed into kits.'),
  S('Accessory Packing', 'box', 'Accessories packed and labeled.'),
  S('Label Printing', 'label', 'Labels printed for all packages.'),
  S('Box Mapping', 'box', 'Box contents mapped to the delivery schedule.'),
  S('Set Creation', 'assembly', 'Complete sets created from the packed modules.'),
  S('Dispatchable Item Creation', 'package', 'Dispatchable items created and staged.'),
  S('Dispatch Planning', 'dispatch', 'Dispatch schedule and route planned.'),
  S('Vehicle Allocation', 'truck', 'Vehicle allocated for dispatch.'),
  S('Dispatch Approval', 'approve', 'Dispatch approved by authorized personnel.'),
  S('Dispatch Challan', 'clipboard', 'Dispatch challan generated and printed.'),
  S('First Dispatch', 'truck', 'First dispatch of materials to the site.'),
  S('Material Reaches Site', 'mappin', 'Dispatched materials reach the installation site.'),
  S('First Dispatch Payment Received', 'payment', 'Payment received for the first dispatch.'),
  S('First Installation Scheduled', 'calendar', 'First installation visit scheduled with the client.'),
  S('First Installation Started', 'install', 'First installation work started at site.'),
  S('First Installation Completed', 'install', 'First installation phase completed.'),
  S('Site Review', 'review', 'Site reviewed for pending items and quality.'),
  S('Pending Material Identification', 'list', 'Pending materials identified for the second dispatch.'),
  S('Balance Material Production', 'factory', 'Balance materials produced.'),
  S('Balance Material Packing', 'package', 'Balance materials packed for the second dispatch.'),
  S('Second Dispatch Payment Received', 'payment', 'Payment received for the second dispatch.'),
  S('Second Dispatch Planned', 'dispatch', 'Second dispatch planned and scheduled.'),
  S('Second Dispatch Completed', 'truck', 'Second dispatch completed — materials sent to site.'),
  S('Material Reaches Site', 'mappin', 'Second-dispatch materials reach the installation site.'),
  S('Final Installation Scheduled', 'calendar', 'Final installation scheduled with the client.'),
  S('Final Installation Started', 'install', 'Final installation work started at site.'),
  S('Final Installation Completed', 'install', 'Final installation completed successfully.'),
  S('Snag List Raised', 'alert', 'Snag list raised during site inspection.'),
  S('Snag Rectification', 'hardware', 'All snags in the list rectified.'),
  S('Snag Closure', 'approve', 'All snags closed after rectification.'),
  S('Site Cleaning', 'clean', 'Site cleaned after installation completion.'),
  S('Final Inspection', 'inspect', 'Final inspection by the internal quality team.'),
  S('Customer Inspection', 'client', 'Customer inspects the completed installation.'),
  S('Handover Documentation', 'drawing', 'Handover documentation prepared and shared.'),
  S('Site Handover Completed', 'handshake', 'Site formally handed over to the customer.'),
  S('Warranty Activation', 'warranty', 'Product warranty activated for the customer.'),
  S('Service Handover', 'service', 'Service-team handover for ongoing support.'),
  S('Customer Sign-Off', 'pen', 'Customer sign-off on the completed project.'),
  S('Order Closed', 'flag', 'Order officially closed in the system.'),
]
