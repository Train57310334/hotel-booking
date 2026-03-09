import {
    LayoutDashboard,
    CalendarDays,
    BedDouble,
    BookOpen,
    Settings,
    Users,
    CreditCard,
    TicketPercent,
    TrendingUp,
    MessageSquare,
    Star,
    Filter,
    UserCircle,
    SprayCan,
    Crown,
    Globe,
    Building2,
    Package
} from 'lucide-react'

export const guideData = {
    '/admin': {
        title: 'Dashboard Overview',
        icon: LayoutDashboard,
        steps: [
            {
                title: 'KPI Cards',
                content: 'Monitor 4 key metrics at the top: Total Revenue (confirmed bookings), New Bookings, Today\'s Activity (check-ins / check-outs), and Occupancy Rate. Hover over the (i) info icon on each card for a detailed explanation.'
            },
            {
                title: 'Time Filter',
                content: 'Use the dropdown in the top-right corner to switch between Today, This Week, This Month, This Year, or All Time. All charts and stats update automatically.'
            },
            {
                title: 'Revenue & Occupancy Charts',
                content: 'Two interactive charts show your Revenue Trend (bar chart) and Occupancy Rate (area chart) for the selected period. These refresh automatically every 30 seconds.'
            },
            {
                title: 'Recent Activity Table',
                content: 'The bottom table shows the 5 most recent bookings. Click any row to open the Booking Detail panel where you can view full info or change the booking status.'
            },
            {
                title: 'Onboarding Widget',
                content: 'If you haven\'t added any rooms yet, a setup checklist will appear here to guide you through the first steps: Upload Logo → Create Room Types.'
            }
        ]
    },
    '/admin/calendar': {
        title: 'Calendar Management',
        icon: CalendarDays,
        steps: [
            {
                title: 'Timeline View',
                content: 'The calendar displays all confirmed bookings on a visual timeline where each row represents a physical room. Bookings are shown as colored bars spanning their stay dates.'
            },
            {
                title: 'Quick Details',
                content: 'Click on any booking bar to instantly see Guest Name, Room Type, check-in/check-out dates, and current status in a side panel.'
            },
            {
                title: 'Navigation',
                content: 'Use the "Previous" and "Next" arrow buttons to move between months. The current date is highlighted for easy orientation.'
            },
            {
                title: 'Room Filter',
                content: 'Use the Room Type dropdown to filter the view and only show rooms of a specific type (e.g., only Deluxe rooms).'
            }
        ]
    },
    '/admin/bookings': {
        title: 'Booking Management',
        icon: BookOpen,
        steps: [
            {
                title: 'All Bookings List',
                content: 'View a comprehensive table of all reservations. Columns include Booking Ref, Guest Name, Room, Check-in/out dates, Status, Amount, and Source (Direct or OTA).'
            },
            {
                title: 'Search & Filter',
                content: 'Use the global search bar (Ctrl+K) or the filter panel to find specific guests by name, email, or booking ID. Filter by status: Pending, Confirmed, Checked In, Checked Out, Cancelled, or No Show.'
            },
            {
                title: 'Update Status',
                content: 'Click any booking row to open the Booking Detail modal. From here you can change the booking status (e.g., Confirmed → Checked In → Checked Out), assign a physical room number, and add internal notes.'
            },
            {
                title: 'Folio Charges',
                content: 'In the Booking Detail modal, you can add extra charges to the guest\'s folio (e.g., Room Service, Laundry, Minibar, Damage) in addition to the base room cost.'
            },
            {
                title: 'Export',
                content: 'Use the Export button to download the booking list as a CSV file for accounting or reporting purposes.'
            }
        ]
    },
    '/admin/rooms': {
        title: 'Room Management',
        icon: BedDouble,
        steps: [
            {
                title: 'Tab: Room Types & Images',
                content: 'Define your room categories (e.g., Standard, Deluxe, Suite). For each type, set the Base Price per night, Bed Configuration, Room Size (sqm), Max Adults/Children, Amenities, and upload multiple Gallery photos. Mark a room as "Featured" to display it on your homepage.'
            },
            {
                title: 'Tab: Room Inventory',
                content: 'Add actual physical room numbers (e.g., Room 101, 102, 103) and assign them to a Room Type. You can add rooms one-by-one or use "Bulk Create" to generate multiple rooms at once (e.g., 10 rooms starting from 101).'
            },
            {
                title: 'Room Status (Housekeeping)',
                content: 'Each physical room has a status dropdown: Dirty → Cleaning → Clean → Inspected → Out of Order (OOO). Update statuses directly from this page to coordinate housekeeping in real-time.'
            },
            {
                title: 'iCal Channel Sync',
                content: 'In the Room Type edit form, paste an iCal URL from an OTA (like Agoda or Booking.com) to automatically block dates that are booked externally and prevent double-booking.'
            },
            {
                title: 'Plan Limits',
                content: 'The progress bars at the top show how many Rooms and Room Types you have used vs. your subscription plan limit. Click "Upgrade" in the sidebar if you need to increase limits.'
            }
        ]
    },
    '/admin/settings': {
        title: 'Hotel Settings',
        icon: Settings,
        steps: [
            {
                title: 'Tab: General Info',
                content: 'Update your hotel\'s core details: Hotel Name, Contact Email, Contact Phone, Address, City, and Country. These appear on guest-facing booking confirmation emails.'
            },
            {
                title: 'Tab: Branding',
                content: 'Upload your Hotel Logo (shown in the admin sidebar and on invoices), a Main Cover Image (the hero background image on your booking page), and additional Gallery/Slider images.'
            },
            {
                title: 'Tab: Website Content',
                content: 'Customize the text on your public booking page. Set a Hero Title (headline) and Sub-headline. Your unique public URL (for sharing with customers) is also displayed here with a one-click Copy button.'
            },
            {
                title: 'Tab: Payment Gateways',
                content: 'Configure all payment methods your guests can use:\n• PromptPay: Enter your 10-digit phone number or 13-digit Tax ID.\n• Bank Transfer: Enter Bank Name, Account Number, and Account Name.\n• Stripe: Enter your Publishable Key & Secret Key for online credit card payments.\n• Omise: Enter your Public Key & Secret Key for PromptPay QR and card payments via Omise.'
            },
            {
                title: 'Saving',
                content: 'Click the "Save Changes" button at the top-right to apply all edits. Settings take effect immediately without needing a server restart.'
            }
        ]
    },
    '/admin/reviews': {
        title: 'Review Management',
        icon: Star,
        steps: [
            {
                title: 'Review Moderation',
                content: 'All guest reviews start as "Pending". Only approved reviews appear on your public booking page. Review each submission and click Approve or Reject accordingly.'
            },
            {
                title: 'Remove Spam',
                content: 'Use the Delete button to permanently remove inappropriate or spam reviews. This action cannot be undone.'
            },
            {
                title: 'Customer Insights',
                content: 'Read guest comments to identify recurring feedback — both positive and areas for improvement. Guest satisfaction is key to maintaining high occupancy rates.'
            }
        ]
    },
    '/admin/guests': {
        title: 'Guest Profiles',
        icon: Users,
        steps: [
            {
                title: 'Guest Database',
                content: 'View all guests who have made bookings at your hotel. Each profile shows contact info, booking history, and total spending.'
            },
            {
                title: 'CRM Tags',
                content: 'Tag guests with labels like "VIP", "Blacklist", or "Corporate" to customize your service approach. Add internal staff notes visible only to your team.'
            },
            {
                title: 'Guest Preferences',
                content: 'Store dietary preferences, room preferences, and special requests so your staff can personalize the experience for returning guests.'
            }
        ]
    },
    '/admin/rates': {
        title: 'Rates & Availability',
        icon: Filter,
        steps: [
            {
                title: 'Tab: Rate Plans',
                content: 'Create pricing tiers that apply on top of the base room price. Examples: "Standard" (flexible cancellation), "Non-Refundable" (discounted), "Breakfast Included" (adds a surcharge per night). A plan can apply to all rooms or be linked to a specific room type.'
            },
            {
                title: 'Tab: Calendar View',
                content: 'View a monthly grid showing Rooms to Sell (allotment), Sale Status (Open/Closed), and Price for each day. Click any date cell to edit that day\'s data individually.'
            },
            {
                title: 'Bulk Update',
                content: 'Use the "Bulk Update" button to modify multiple dates at once. Select a date range and choose which settings to update: Set Daily Price, Set Allotment (how many rooms to sell), or Open/Close dates for sale (Stop Sale).'
            },
            {
                title: 'Stop Sale',
                content: 'Closing a date (Stop Sale = ON) will prevent new bookings for that day even if allotment is available. Useful for blocked dates, private events, or maintenance periods.'
            }
        ]
    },
    '/admin/promotions': {
        title: 'Promotions',
        icon: TicketPercent,
        steps: [
            {
                title: 'PRO Feature',
                content: 'Promotions require a PRO or higher subscription. If your plan is LITE, this page will show an upgrade prompt. Upgrade via the "Subscription" menu in the sidebar.'
            },
            {
                title: 'Create Discount Codes',
                content: 'Click "New Code" to create a promotion. Enter a code (e.g., SUMMER2025), set the discount type (Percent % or Fixed Amount in THB), the discount value, and a valid start/end date range.'
            },
            {
                title: 'How Guests Use Codes',
                content: 'Guests enter the promo code on the checkout page. The system validates the code, checks if it\'s within the valid date range, and automatically applies the discount to the booking total.'
            },
            {
                title: 'Manage Codes',
                content: 'Edit or delete existing promotions anytime. Deleting a code deactivates it immediately — any ongoing booking sessions using the code will lose the discount.'
            }
        ]
    },
    '/admin/reports': {
        title: 'Analytics & Reports',
        icon: TrendingUp,
        steps: [
            {
                title: 'Financial Overview',
                content: 'View total Revenue, Expenses, and Net Profit side by side. Use the date range selector to filter by month or custom period. Charts show income vs. expense trends over time.'
            },
            {
                title: 'Expense Tracking',
                content: 'Record hotel operating costs (Utilities, Salary, Maintenance, Marketing, etc.) directly from this page. Expenses are deducted from Revenue to calculate Net Profit automatically.'
            },
            {
                title: 'Export to CSV',
                content: 'Click the Export button to download a full financial statement as a CSV file, ready for your accountant or bookkeeping software.'
            },
            {
                title: 'Occupancy Analysis',
                content: 'Review occupancy trends to identify peak seasons and low-demand periods. Use this data to adjust your pricing strategy or run promotions during slow periods.'
            }
        ]
    },
    '/admin/payments': {
        title: 'Payment Transactions',
        icon: CreditCard,
        steps: [
            {
                title: 'Transaction Log',
                content: 'View a full list of all payment transactions linked to bookings. Each record shows the Booking Ref, Guest, Payment Method (Card, PromptPay, Cash, Bank Transfer), Amount, and Status.'
            },
            {
                title: 'Payment Status',
                content: 'Track payment stages: Created → Authorized → Captured (successful) | Voided / Refunded / Failed. Transactions from Stripe and Omise update here in real-time.'
            },
            {
                title: 'Manual Payments',
                content: 'For Cash or Bank Transfer bookings that require manual verification, you can update the booking status to "Confirmed" from the Bookings page once payment is verified.'
            }
        ]
    },
    '/admin/staff': {
        title: 'Staff Management',
        icon: Users,
        steps: [
            {
                title: 'Invite Staff',
                content: 'Click "Add Staff" to invite a new team member by entering their Email, Name, and assigning a Role. An account will be created for them to log in with.'
            },
            {
                title: 'Available Roles',
                content: 'Roles control what each staff member can access:\n• Owner/Admin: Full access to all features including financial reports and settings.\n• Reception/Clerk: Operational access — bookings, calendar, guests, rooms. Cannot see reports, payments, or settings.\n• Housekeeper: Can only access the Housekeeping page to update room statuses.'
            },
            {
                title: 'Edit & Remove',
                content: 'Click the Edit button on any staff member to change their name or role. You can also remove staff members to revoke their system access immediately.'
            },
            {
                title: 'Staff Limit',
                content: 'Your subscription plan limits how many staff accounts you can create (LITE: 1, PRO: 5, ENTERPRISE: Unlimited). Upgrade your plan to add more team members.'
            }
        ]
    },
    '/admin/messages': {
        title: 'Guest Messages',
        icon: MessageSquare,
        steps: [
            {
                title: 'Inbox',
                content: 'View all guest inquiries sent through your public booking website\'s Contact form. Messages are sorted by date with Unread/Read/Replied status badges.'
            },
            {
                title: 'Reply to Guests',
                content: 'Click a message to open it. Mark it as Read or Replied after you\'ve responded via email or phone to keep your inbox organized.'
            },
            {
                title: 'Guest Contact Info',
                content: 'Each message includes the guest\'s name and email so you can follow up directly. Use this for pre-arrival coordination, special requests, or upselling.'
            }
        ]
    },
    '/admin/account': {
        title: 'My Account',
        icon: UserCircle,
        steps: [
            {
                title: 'Profile Information',
                content: 'Update your personal details: Name, Email, and Phone Number. Upload a profile avatar which appears in the admin header.'
            },
            {
                title: 'Change Password',
                content: 'Enter your current password and a new password to update your credentials. Use a strong password with at least 8 characters for security.'
            },
            {
                title: 'View Your Hotels',
                content: 'If your account is linked to multiple hotel properties, they are listed here. Use the hotel switcher in the sidebar to switch between properties.'
            }
        ]
    },
    '/admin/housekeeping': {
        title: 'Housekeeping',
        icon: SprayCan,
        steps: [
            {
                title: 'Room Status Board',
                content: 'View all physical rooms grouped by floor/type. Each room card shows its current status: Dirty (needs cleaning), Cleaning (in progress), Clean (done), Inspected (ready for guest), or Out of Order (OOO).'
            },
            {
                title: 'Update Room Status',
                content: 'Housekeepers can update room status directly from this page or from the Rooms page. Changes are reflected system-wide in real-time, including triggering a WebSocket notification to the admin dashboard.'
            },
            {
                title: 'Post-Checkout Workflow',
                content: 'When a guest checks out, the room status automatically becomes "Dirty". Housekeepers can quickly filter for Dirty rooms to prioritize their cleaning schedule.'
            }
        ]
    },
    '/admin/subscription': {
        title: 'Subscription & Billing',
        icon: Crown,
        steps: [
            {
                title: 'Current Plan',
                content: 'View your active subscription plan (LITE, PRO, or ENTERPRISE), its expiration date, and the key feature limits (Max Rooms, Max Room Types, Max Staff) included in the plan.'
            },
            {
                title: 'Upgrade Your Plan',
                content: 'Compare all available plans side-by-side and select a higher tier to unlock more rooms, staff accounts, Promotions, Online Payments (Stripe/Omise), and priority support.'
            },
            {
                title: 'Payment History',
                content: 'View a log of all past subscription payments with dates, amounts, and the plan purchased. Contact support if you see any billing discrepancies.'
            }
        ]
    },
    '/admin/settings/widget': {
        title: 'Booking Widget',
        icon: Globe,
        steps: [
            {
                title: 'Embed on Your Website',
                content: 'Copy the generated HTML snippet and paste it into your existing website\'s HTML to embed a fully functional booking button that opens your hotel\'s booking engine in a popup or iframe.'
            },
            {
                title: 'WordPress Plugin',
                content: 'Download the official WordPress plugin (.zip file) for a no-code installation on WordPress sites. Install via WP Admin → Plugins → Add New → Upload Plugin.'
            },
            {
                title: 'Preview & Test',
                content: 'Click "View Website" in the top header to see your public booking page live at any time. Share this URL directly with customers for direct bookings without commission.'
            }
        ]
    },
    '/admin/super/hotels': {
        title: 'Tenants & Hotels',
        icon: Building2,
        steps: [
            {
                title: 'Tenant Overview',
                content: 'View all hotels registered on the BookingKub platform. Each row shows the Hotel Name, Owner, Registration Date, active Subscription Plan, and account status.'
            },
            {
                title: 'Suspend / Unsuspend',
                content: 'Toggle a hotel\'s suspended status to immediately revoke or restore their access. Suspended hotels cannot log into the admin panel or accept new bookings.'
            },
            {
                title: 'Impersonate',
                content: 'Click "View as Hotel" to impersonate a hotel\'s admin account and see their dashboard as they would see it. Useful for support and troubleshooting.'
            }
        ]
    },
    '/admin/super/bookings': {
        title: 'Platform Bookings',
        icon: CalendarDays,
        steps: [
            {
                title: 'Global Booking View',
                content: 'Monitor all bookings made across every hotel on the entire BookingKub platform in one unified view. Filter by hotel, date range, or status to drill down.'
            },
            {
                title: 'Platform Health',
                content: 'Use this page to quickly spot anomalies such as unusually high cancellation rates or a hotel with zero bookings, which may indicate a configuration issue.'
            }
        ]
    },
    '/admin/super/packages': {
        title: 'Platform Packages',
        icon: Package,
        steps: [
            {
                title: 'Manage Subscription Plans',
                content: 'Create, edit, or delete the SaaS subscription plans that hotel owners can purchase (e.g., LITE, PRO, ENTERPRISE). Set the price, billing period, and a human-readable price label for each.'
            },
            {
                title: 'Feature Limits per Plan',
                content: 'For each plan, configure: Max Rooms, Max Room Types, Max Staff, and toggle access to premium features like Promotions and Online Payments (Stripe/Omise).'
            },
            {
                title: 'Display Settings',
                content: 'Set which plan is marked as "Popular" and customize the color and icon shown on the public pricing page to highlight recommended plans.'
            }
        ]
    },
    '/admin/super/cms': {
        title: 'Landing Page CMS',
        icon: Globe,
        steps: [
            {
                title: 'Edit Platform Landing Page',
                content: 'Update the content of the main BookingKub marketing website (the page hotel owners see before signing up). Modify the hero headline, sub-heading, feature descriptions, and pricing section copy.'
            },
            {
                title: 'Live Preview',
                content: 'After saving, visit the root URL of the platform (e.g., bookingkub.com) to see your changes live. Content updates apply immediately without a deployment.'
            }
        ]
    },
    '/admin/super/billing': {
        title: 'Platform Billing',
        icon: CreditCard,
        steps: [
            {
                title: 'Platform Payment Gateway',
                content: 'Configure the master Stripe or Omise keys used to collect subscription fees from hotel owners when they upgrade their plan. These are platform-level keys, separate from each hotel\'s own payment keys.'
            },
            {
                title: 'Subscription Payment History',
                content: 'View a detailed log of all subscription payments made by hotel owners across the platform — including the hotel name, plan purchased, amount, date, and Stripe Charge ID for reconciliation.'
            }
        ]
    },
    '/admin/super/messages': {
        title: 'Platform Messages',
        icon: MessageSquare,
        steps: [
            {
                title: 'Cross-Hotel Inquiries',
                content: 'View contact form messages from all hotels on the platform in one unified inbox. Each message shows the originating hotel, guest name, email, and message content.'
            },
            {
                title: 'Status Tracking',
                content: 'Mark messages as Read or Replied to track which inquiries have been handled by the platform support team.'
            }
        ]
    }
}

export const defaultGuide = {
    title: 'Welcome to BookingKub',
    icon: BookOpen,
    steps: [
        {
            title: 'Getting Started',
            content: 'Use the sidebar menu on the left to navigate between modules. Your hotel name is displayed at the top of the sidebar — click it to switch hotels if you manage multiple properties.'
        },
        {
            title: 'Context-Aware Help',
            content: 'Click the "Guide" button in the top header on any page to get specific instructions for that section. The guide content changes automatically based on the page you are on.'
        },
        {
            title: 'Global Search',
            content: 'Press Ctrl+K (or Cmd+K on Mac) from anywhere in the admin panel to open the Global Search. Search for Guests, Bookings, Rooms, or navigate to any menu quickly.'
        }
    ]
}
