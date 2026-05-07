import { useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  X, ChevronRight, ChevronLeft, CheckCircle2, Circle,
  Building2, LayoutGrid, BedDouble, Tags, CreditCard,
  Users, PartyPopper, ExternalLink, Rocket, ArrowRight
} from 'lucide-react'
import { ONBOARDING_STEPS } from './onboarding-steps'

const iconMap = {
  Building2,
  LayoutGrid,
  BedDouble,
  Tags,
  CreditCard,
  Users,
  PartyPopper,
}

const labels = {
  en: {
    title: 'Hotel Setup Guide',
    subtitle: 'Complete these steps to start accepting bookings',
    step: 'Step',
    of: 'of',
    completed: 'completed',
    next: 'Next Step',
    prev: 'Back',
    finish: 'Finish Setup',
    goTo: 'Open',
    skip: 'Skip for now',
    optional: 'Optional',
    allDone: "🎉 You're all set!",
    allDoneDesc: 'Your hotel is fully configured. Start accepting bookings!',
    viewDashboard: 'View Dashboard',
    progress: 'Your progress',
    checklist: 'What to do:',
  },
  th: {
    title: 'คู่มือตั้งค่าโรงแรม',
    subtitle: 'ทำตามขั้นตอนเหล่านี้เพื่อเริ่มรับการจอง',
    step: 'ขั้นตอน',
    of: 'จาก',
    completed: 'เสร็จแล้ว',
    next: 'ขั้นตอนถัดไป',
    prev: 'ย้อนกลับ',
    finish: 'เสร็จสิ้นการตั้งค่า',
    goTo: 'เปิด',
    skip: 'ข้ามสำหรับตอนนี้',
    optional: 'ไม่บังคับ',
    allDone: '🎉 พร้อมแล้ว!',
    allDoneDesc: 'โรงแรมของคุณได้รับการกำหนดค่าครบถ้วนแล้ว เริ่มรับการจองได้เลย!',
    viewDashboard: 'ดูแดชบอร์ด',
    progress: 'ความคืบหน้าของคุณ',
    checklist: 'สิ่งที่ต้องทำ:',
  },
}

export default function OnboardingGuide({
  isOpen,
  onClose,
  currentStep,
  goToStep,
  goNext,
  goPrev,
  isStepComplete,
  progressPercent,
  completedCount,
  totalSteps,
  allDone,
  language = 'en',
  rawData,
  filteredSteps = [],
}) {
  const overlayRef = useRef(null)
  const step = filteredSteps[currentStep]
  const l = labels[language] || labels.en
  const stepContent = step?.[language] || step?.en
  const subChecks = step?.getSubChecks ? step.getSubChecks(rawData) : []

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentStep])

  if (!isOpen) return null

  const StepIcon = step ? iconMap[step.icon] || BedDouble : BedDouble

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      >
        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-slideUp">

          {/* Header */}
          <div className={`bg-gradient-to-r ${step?.color || 'from-blue-500 to-blue-600'} p-6 pb-4 relative overflow-hidden`}>
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute -bottom-10 -left-4 w-28 h-28 bg-white/10 rounded-full" />

            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-xl p-2.5">
                  <Rocket size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{l.title}</h2>
                  <p className="text-white/70 text-xs">{l.subtitle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-lg p-1.5"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/80 text-xs font-medium">{l.progress}</span>
                <span className="text-white font-bold text-sm">{completedCount}/{totalSteps} {l.completed}</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center gap-1.5 px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
            {filteredSteps.map((s, i) => {
              const done = isStepComplete(s.id)
              const active = i === currentStep
              return (
                <button
                  key={s.id}
                  onClick={() => goToStep(i)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0
                    ${active
                      ? `${s.bgColor} ${s.textColor} ${s.borderColor} border`
                      : done
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                        : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  {done
                    ? <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                    : <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold flex-shrink-0
                        ${active ? `border-current ${s.textColor}` : 'border-current'}`}>{i + 1}</span>
                  }
                  <span className="hidden sm:inline">{(s[language] || s.en)?.title?.split(' ').slice(0, 2).join(' ')}</span>
                </button>
              )
            })}
          </div>

          {/* Content */}
          {allDone ? (
            <div className="p-8 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{l.allDone}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">{l.allDoneDesc}</p>
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
              >
                {l.viewDashboard} <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div className="p-6">
              {/* Current Step Content */}
              <div className="flex items-start gap-4 mb-5">
                <div className={`${step.bgColor} ${step.borderColor} border rounded-2xl p-3.5 flex-shrink-0`}>
                  <StepIcon size={24} className={step.textColor} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {l.step} {currentStep + 1} {l.of} {totalSteps}
                    </span>
                    {stepContent?.optional && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 uppercase">
                        {l.optional}
                      </span>
                    )}
                    {isStepComplete(step.id) && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Done
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    {stepContent?.title}
                  </h3>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                {stepContent?.description}
              </p>

              {/* Checklist */}
              <div className="mb-4">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{l.checklist}</p>
                <ul className="space-y-2">
                  {stepContent?.checkList?.map((item, i) => {
                    const isChecked = subChecks[i] === true;
                    return (
                      <li key={i} className={`flex items-start gap-2.5 text-sm ${isChecked ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'}`}>
                        {isChecked ? (
                          <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Circle size={16} className="text-slate-300 dark:text-slate-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={isChecked ? 'line-through decoration-slate-300 dark:decoration-slate-600' : ''}>{item}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Tip Box */}
              {stepContent?.tip && (
                <div className={`${step.bgColor} ${step.borderColor} border rounded-xl p-3.5 mb-5 text-sm ${step.textColor} leading-relaxed`}>
                  {stepContent.tip}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={goPrev}
                  disabled={currentStep === 0}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} /> {l.prev}
                </button>

                <div className="flex items-center gap-3">
                  <Link
                    href={step.link}
                    onClick={onClose}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${step.bgColor} ${step.textColor} ${step.borderColor} hover:opacity-80`}
                  >
                    <ExternalLink size={15} />
                    {stepContent?.cta}
                  </Link>

                  {currentStep < totalSteps - 1 ? (
                    <button
                      onClick={goNext}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${step.color} hover:opacity-90 transition-opacity shadow-lg`}
                    >
                      {l.next} <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={onClose}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:opacity-90 transition-opacity shadow-lg"
                    >
                      {l.finish} <CheckCircle2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </>
  )
}
