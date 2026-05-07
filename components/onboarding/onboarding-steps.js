// Onboarding steps configuration for the Hotel Admin setup wizard
// Each step has bilingual content (EN/TH), links, and getSubChecks(data) → bool[]

export const ONBOARDING_STEPS = [
  {
    id: 'hotel-setup',
    icon: 'Building2',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-500/10',
    textColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-500/30',
    link: '/admin/settings?tab=branding',
    allowedRoles: ['admin', 'owner', 'hotel_admin', 'platform_admin'],
    // data = { hotel, roomTypes, rooms, staff, bookings }
    getSubChecks: (data) => [
      !!(data?.hotel?.name && data?.hotel?.description),
      !!(data?.hotel?.address),
      !!(data?.hotel?.logoUrl),
    ],
    en: {
      title: 'Set Up Your Hotel Profile',
      description: 'Add your hotel name, address, description, and upload your logo. This appears on your booking page and guest communications.',
      tip: '💡 A professional logo and complete profile builds guest trust and increases direct bookings.',
      cta: 'Go to Settings',
      checkList: [
        'Hotel name & description filled in',
        'Address & contact info added',
        'Logo uploaded',
      ],
    },
    th: {
      title: 'ตั้งค่าโปรไฟล์โรงแรม',
      description: 'เพิ่มชื่อโรงแรม ที่อยู่ คำอธิบาย และอัปโหลดโลโก้ ข้อมูลนี้จะแสดงในหน้าจองและอีเมลหาแขก',
      tip: '💡 โลโก้และโปรไฟล์ที่สมบูรณ์สร้างความน่าเชื่อถือและเพิ่มการจองโดยตรง',
      cta: 'ไปที่การตั้งค่า',
      checkList: [
        'กรอกชื่อและคำอธิบายโรงแรม',
        'เพิ่มที่อยู่และข้อมูลติดต่อ',
        'อัปโหลดโลโก้',
      ],
    },
  },
  {
    id: 'room-types',
    icon: 'LayoutGrid',
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-50 dark:bg-violet-500/10',
    textColor: 'text-violet-600 dark:text-violet-400',
    borderColor: 'border-violet-200 dark:border-violet-500/30',
    link: '/admin/rooms?tab=types',
    allowedRoles: ['admin', 'owner', 'hotel_admin', 'platform_admin', 'manager'],
    getSubChecks: (data) => {
      const types = data?.roomTypes || []
      return [
        types.length > 0,
        types.some(rt => (rt.basePrice > 0) || (rt.price > 0)),
        types.some(rt => rt.maxAdults > 0),
      ]
    },
    en: {
      title: 'Create Room Types',
      description: 'Define your room categories (e.g. Standard, Deluxe, Suite). Each type has its own base price, bed configuration, and max occupancy.',
      tip: '💡 Group similar rooms into one type. You can have multiple physical rooms under a single type.',
      cta: 'Manage Room Types',
      checkList: [
        'At least 1 room type created',
        'Base price set for each type',
        'Max occupancy configured',
      ],
    },
    th: {
      title: 'สร้างประเภทห้องพัก',
      description: 'กำหนดหมวดหมู่ห้องพัก เช่น Standard, Deluxe, Suite แต่ละประเภทมีราคาเริ่มต้น รูปแบบเตียง และจำนวนผู้เข้าพักสูงสุดของตัวเอง',
      tip: '💡 จัดกลุ่มห้องที่คล้ายกันไว้ในประเภทเดียว คุณสามารถมีหลายห้องภายใต้ประเภทเดียวได้',
      cta: 'จัดการประเภทห้อง',
      checkList: [
        'สร้างประเภทห้องอย่างน้อย 1 ประเภท',
        'ตั้งราคาเริ่มต้นสำหรับแต่ละประเภท',
        'กำหนดจำนวนผู้เข้าพักสูงสุด',
      ],
    },
  },
  {
    id: 'rooms',
    icon: 'BedDouble',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-500/30',
    link: '/admin/rooms',
    allowedRoles: ['admin', 'owner', 'hotel_admin', 'platform_admin', 'manager'],
    getSubChecks: (data) => {
      const rooms = data?.rooms || []
      return [
        rooms.length > 0,
        rooms.some(r => r.roomNumber),
        rooms.length > 0 && rooms.every(r => r.roomTypeId),
      ]
    },
    en: {
      title: 'Add Physical Rooms',
      description: 'Add each room with its room number and floor. These are the actual rooms guests will be assigned to during check-in.',
      tip: '💡 Use "Bulk Add" to create multiple rooms at once (e.g. Room 101–110 in one click).',
      cta: 'Manage Rooms',
      checkList: [
        'At least 1 room added',
        'Room numbers assigned',
        'Rooms linked to correct room type',
      ],
    },
    th: {
      title: 'เพิ่มห้องพักจริง',
      description: 'เพิ่มห้องพักแต่ละห้องพร้อมหมายเลขห้องและชั้น นี่คือห้องจริงที่แขกจะได้รับมอบหมายเมื่อ Check-in',
      tip: '💡 ใช้ "เพิ่มแบบกลุ่ม" เพื่อสร้างหลายห้องพร้อมกัน (เช่น ห้อง 101–110 ในคลิกเดียว)',
      cta: 'จัดการห้องพัก',
      checkList: [
        'เพิ่มห้องพักอย่างน้อย 1 ห้อง',
        'กำหนดหมายเลขห้อง',
        'เชื่อมห้องกับประเภทห้องที่ถูกต้อง',
      ],
    },
  },
  {
    id: 'rate-plans',
    icon: 'Tags',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50 dark:bg-amber-500/10',
    textColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-200 dark:border-amber-500/30',
    link: '/admin/rates',
    allowedRoles: ['admin', 'owner', 'hotel_admin', 'platform_admin', 'manager'],
    getSubChecks: (data) => {
      const plans = data?.ratePlans || []
      const hasRatePlan = plans.length > 0
      const hasCancelPolicy = plans.some(p => p.cancellationRule && p.cancellationRule.trim().length > 0)
      const hasBreakfast = plans.some(p => p.includesBreakfast)
      return [hasRatePlan, hasCancelPolicy, hasBreakfast]
    },
    en: {
      title: 'Set Rate Plans & Pricing',
      description: 'Create pricing plans for your room types. You can create multiple plans like "Standard Rate", "Non-Refundable", or "Bed & Breakfast".',
      tip: '💡 Offering at least 2 rate plans (e.g. Flexible + Non-Refundable) is proven to increase revenue.',
      cta: 'Manage Rates',
      checkList: [
        'At least 1 rate plan created',
        'Cancellation policy set',
        'Breakfast inclusion configured',
      ],
    },
    th: {
      title: 'ตั้งค่าแผนราคา',
      description: 'สร้างแผนราคาสำหรับประเภทห้องของคุณ คุณสามารถสร้างหลายแผน เช่น "ราคามาตรฐาน", "ไม่สามารถยกเลิกได้" หรือ "พักพร้อมอาหารเช้า"',
      tip: '💡 การมีอย่างน้อย 2 แผนราคา (เช่น ยืดหยุ่น + ไม่คืนเงิน) ช่วยเพิ่มรายได้',
      cta: 'จัดการราคา',
      checkList: [
        'สร้างแผนราคาอย่างน้อย 1 แผน',
        'กำหนดนโยบายการยกเลิก',
        'ตั้งค่าการรวมอาหารเช้า',
      ],
    },
  },
  {
    id: 'payment-setup',
    icon: 'CreditCard',
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-rose-50 dark:bg-rose-500/10',
    textColor: 'text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-200 dark:border-rose-500/30',
    link: '/admin/settings?tab=payment',
    allowedRoles: ['admin', 'owner', 'hotel_admin', 'platform_admin'],
    getSubChecks: (data) => {
      const h = data?.hotel
      return [
        !!(h?.bankAccountNumber || h?.bankName),
        !!(h?.promptPayId),
        !!(h?.stripePublicKey || h?.omisePublicKey),
      ]
    },
    en: {
      title: 'Configure Payment Methods',
      description: 'Set up how guests will pay. Add your bank account details for bank transfers, PromptPay ID for QR payments, or Stripe/Omise keys for online card payments.',
      tip: '💡 PromptPay + Bank Transfer is the quickest way to start accepting payments with no setup fees.',
      cta: 'Payment Settings',
      checkList: [
        'Bank account details added',
        'PromptPay ID configured',
        'Stripe/Omise keys added for card payments',
      ],
    },
    th: {
      title: 'ตั้งค่าวิธีการชำระเงิน',
      description: 'ตั้งค่าวิธีที่แขกจะชำระเงิน เพิ่มข้อมูลบัญชีธนาคารสำหรับโอนเงิน, หมายเลข PromptPay สำหรับ QR หรือคีย์ Stripe/Omise สำหรับบัตรเครดิต',
      tip: '💡 PromptPay + โอนเงิน เป็นวิธีที่เร็วที่สุดในการเริ่มรับชำระเงินโดยไม่มีค่าธรรมเนียมตั้งค่า',
      cta: 'การตั้งค่าการชำระเงิน',
      checkList: [
        'เพิ่มข้อมูลบัญชีธนาคาร',
        'ตั้งค่า PromptPay ID',
        'เพิ่มคีย์ Stripe/Omise สำหรับบัตรเครดิต',
      ],
    },
  },
  {
    id: 'add-staff',
    icon: 'Users',
    color: 'from-cyan-500 to-sky-600',
    bgColor: 'bg-cyan-50 dark:bg-cyan-500/10',
    textColor: 'text-cyan-600 dark:text-cyan-400',
    borderColor: 'border-cyan-200 dark:border-cyan-500/30',
    link: '/admin/staff',
    allowedRoles: ['admin', 'owner', 'hotel_admin', 'platform_admin', 'manager'],
    getSubChecks: (data) => {
      const staff = data?.staff || []
      return [
        staff.length > 0,
        staff.some(s => ['reception', 'manager', 'admin'].includes(s.role)),
        staff.length > 0,
      ]
    },
    en: {
      title: 'Invite Your Team',
      description: 'Add staff members and assign their roles. Reception staff can handle bookings and check-ins. Managers have broader access. Housekeepers get their own dedicated app.',
      tip: "💡 You can skip this step if you're running the hotel solo — you can always add staff later.",
      cta: 'Manage Staff',
      checkList: [
        'Staff invited via email',
        'Roles assigned (Reception / Manager)',
        'Staff have logged in',
      ],
      optional: true,
    },
    th: {
      title: 'เชิญทีมงานของคุณ',
      description: 'เพิ่มพนักงานและกำหนด Role พนักงาน Reception จัดการการจองและ Check-in Manager มีสิทธิ์เข้าถึงที่กว้างขึ้น แม่บ้านมีแอปเฉพาะของตัวเอง',
      tip: '💡 คุณสามารถข้ามขั้นตอนนี้ได้ถ้าจัดการโรงแรมคนเดียว — สามารถเพิ่มพนักงานได้ภายหลัง',
      cta: 'จัดการพนักงาน',
      checkList: [
        'เชิญพนักงานผ่านอีเมล',
        'กำหนด Role (Reception / Manager)',
        'พนักงานเข้าสู่ระบบแล้ว',
      ],
      optional: true,
    },
  },
  {
    id: 'first-booking',
    icon: 'PartyPopper',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50 dark:bg-green-500/10',
    textColor: 'text-green-600 dark:text-green-400',
    borderColor: 'border-green-200 dark:border-green-500/30',
    link: '/admin/bookings',
    allowedRoles: ['admin', 'owner', 'hotel_admin', 'platform_admin', 'manager', 'reception'],
    getSubChecks: (data) => {
      const bookings = data?.bookings || []
      const hasConfirmed = bookings.some(
        b => b.status === 'confirmed' || b.status === 'checked_in' || b.status === 'checked_out'
      )
      return [
        bookings.length > 0,
        hasConfirmed,
        hasConfirmed,
      ]
    },
    en: {
      title: 'Create Your First Booking',
      description: 'Everything is ready! Create a test booking to verify your setup. Go to the Bookings page and use "Create Booking" to manually add a reservation — or share your hotel link with guests to book online.',
      tip: '💡 Test the full guest experience: create a booking → check-in → check-out → view invoice.',
      cta: 'Go to Bookings',
      checkList: [
        'First booking created',
        'Booking confirmed (status = Confirmed)',
        'Invoice / confirmation visible',
      ],
    },
    th: {
      title: 'สร้างการจองครั้งแรก',
      description: 'ทุกอย่างพร้อมแล้ว! สร้างการจองทดสอบเพื่อตรวจสอบการตั้งค่า ไปที่หน้าการจองและใช้ "สร้างการจอง" เพื่อเพิ่มการจองด้วยตนเอง — หรือแชร์ลิงก์โรงแรมให้แขกจองออนไลน์',
      tip: '💡 ทดสอบประสบการณ์แขก: สร้างการจอง → Check-in → Check-out → ดู Invoice',
      cta: 'ไปที่การจอง',
      checkList: [
        'สร้างการจองแรกแล้ว',
        'การจองได้รับการยืนยัน (สถานะ = Confirmed)',
        'Invoice / ใบยืนยันมองเห็นได้',
      ],
    },
  },
]
