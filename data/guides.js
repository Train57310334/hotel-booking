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
    UserCircle
} from 'lucide-react'

export const guideData = {
    '/admin': {
        title: 'Dashboard Overview',
        icon: LayoutDashboard,
        steps: [
            {
                title: 'Key Metrics',
                content: 'View real-time stats like Total Revenue, New Bookings, and Occupancy Rate at a glance.'
            },
            {
                title: 'Today\'s Activity',
                content: 'Check who is arriving (Check-in) and leaving (Check-out) today to prepare your staff.'
            },
            {
                title: 'Occupancy Chart',
                content: 'Track your hotel\'s performance over the last 7 days.'
            }
        ]
    },
    '/admin/calendar': {
        title: 'Calendar Management',
        icon: CalendarDays,
        steps: [
            {
                title: 'Timeline View',
                content: 'See all bookings on a visual timeline. Each row represents a physical room.'
            },
            {
                title: 'Quick Details',
                content: 'Hover over any booking bar to see Guest Name and Status.'
            },
            {
                title: 'Navigation',
                content: 'Use the "Previous" and "Next" buttons to jump between months.'
            }
        ]
    },
    '/admin/bookings': {
        title: 'Booking Management',
        icon: BookOpen,
        steps: [
            {
                title: 'All Bookings',
                content: 'A comprehensive list of all reservations. Use the search bar to find specific guests.'
            },
            {
                title: 'Status Updates',
                content: 'Click on a booking to change status (e.g. from "Confirmed" to "Checked In").'
            },
            {
                title: 'Filtering',
                content: 'Filter by status (Pending, Confirmed, Cancelled) to organize your workflow.'
            }
        ]
    },
    '/admin/rooms': {
        title: 'Room Management',
        icon: BedDouble,
        steps: [
            {
                title: 'Room Types',
                content: 'Define categories like "Deluxe" or "Suite". Set base prices, capacity, and upload photos here.'
            },
            {
                title: 'Physical Rooms',
                content: 'Manage actual room numbers (e.g. 101, 102). Assign them to a Room Type.'
            },
            {
                title: 'Status',
                content: 'Mark rooms as "Clean", "Dirty", or "Maintenance" to control availability.'
            }
        ]
    },
    '/admin/settings': {
        title: 'System Settings',
        icon: Settings,
        steps: [
            {
                title: 'General',
                content: 'Configure site name and default currency.'
            },
            {
                title: 'Integrations',
                content: 'Setup Payment Gateways (Stripe) to accept credit cards.'
            },
            {
                title: 'Notifications',
                content: 'Configure SMTP for sending email confirmations to guests.'
            }
        ]
    },
    '/admin/reviews': {
        title: 'Review Management',
        icon: Star,
        steps: [
            {
                title: 'Moderation',
                content: 'Approve or Reject reviews. Only approved reviews appear on the public site.'
            },
            {
                title: 'Feedback Loop',
                content: 'Use the delete button to remove spam. Check customer comments to improve service.'
            }
        ]
    },
    '/admin/guests': {
        title: 'Guest Profiles',
        icon: Users,
        steps: [
            {
                title: 'History',
                content: 'View past stays and total spending for each guest.'
            },
            {
                title: 'CRM',
                content: 'Use contact info to send special offers or follow-ups.'
            }
        ]
    },
    '/admin/rates': {
        title: 'Rates & Availability',
        icon: Filter,
        steps: [
            {
                title: 'Rate Plans',
                content: 'Create pricing tiers like "Standard", "Non-Refundable", or "Breakfast Included".'
            }
        ]
    },

    '/admin/promotions': {
        title: 'Promotions',
        icon: TicketPercent,
        steps: [
            {
                title: 'Discount Codes',
                content: 'Create coupon codes (e.g. SUMMER2024) for marketing campaigns.'
            },
            {
                title: 'Restrictions',
                content: 'Set minimum stay requirements or valid date ranges to control usage.'
            }
        ]
    },
    '/admin/reports': {
        title: 'Analytics & Reports',
        icon: TrendingUp,
        steps: [
            {
                title: 'Financial Reports',
                content: 'Export monthly revenue and expense statements for accounting.'
            },
            {
                title: 'Occupancy Trends',
                content: 'Analyze peak seasons and low periods to adjust your pricing strategy.'
            }
        ]
    },
    '/admin/payments': {
        title: 'Payment Transactions',
        icon: CreditCard,
        steps: [
            {
                title: 'Transaction Logs',
                content: 'View all credit card charges and refunds in real-time.'
            },
            {
                title: 'Status',
                content: 'Monitor "Pending" vs "Paid" transactions to ensure you collect all revenue.'
            }
        ]
    },
    '/admin/owners': {
        title: 'Staff & Owners',
        icon: Users,
        steps: [
            {
                title: 'Access Control',
                content: 'Invite new staff members and assign roles (Manager, Front Desk, Housekeeping).'
            },
            {
                title: 'Permissions',
                content: 'Control who can view revenue data or change room prices.'
            }
        ]
    },
    '/admin/messages': {
        title: 'Guest Messages',
        icon: MessageSquare,
        steps: [
            {
                title: 'Direct Chat',
                content: 'Communicate directly with guests regarding special requests or arrival times.'
            },
            {
                title: 'Automated Replies',
                content: 'Set up quick responses for common questions like "Wifi Password" or "Breakfast Hours".'
            }
        ]
    },
    '/admin/account': {
        title: 'My Account',
        icon: UserCircle,
        steps: [
            {
                title: 'Profile',
                content: 'Update your personal details and contact information.'
            },
            {
                title: 'Security',
                content: 'Change your password and enable Two-Factor Authentication (if available).'
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
            content: 'Use the sidebar menu to navigate between different modules.'
        },
        {
            title: 'Need Help?',
            content: 'Click this Help button on any page to get specific instructions for that section.'
        }
    ]
}
