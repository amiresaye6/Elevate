import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../../services/api'
import { toast } from 'react-hot-toast'
import {
  Video,
  Clock,
  Award,
  Lock,
  X,
  ChevronLeft,
  ChevronRight,
  Globe,
  Code,
  Check
} from 'lucide-react'

interface Stack {
  id: number
  name: string
  description: string
}

interface Availability {
  id: number
  mentorId: number
  dayOfWeek: string
  startTime: string
  endTime: string
}

interface Mentor {
  id: number
  name: string
  title: string
  bio: string
  hourlyRate: string
  stack: Stack
  availability: Availability[]
}

const BookingFlowPage: React.FC = () => {
  const { mentorId } = useParams<{ mentorId: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation(['student'])
  const isRtl = i18n.language.startsWith('ar')

  // States
  const [mentor, setMentor] = useState<Mentor | null>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  
  // Calendar states
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null) // e.g. "09:00"
  
  // Description/Goals
  const [description, setDescription] = useState('')

  // Load Mentor Schedule
  const fetchMentor = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/mentors/${mentorId}`)
      if (response.data && response.data.success) {
        setMentor(response.data.data)
      } else {
        throw new Error('Mentor fetch failed')
      }
    } catch (err: any) {
      console.error(err)
      toast.error(t('error_loading'))
      navigate('/student/sessions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mentorId) {
      fetchMentor()
    }
  }, [mentorId])

  if (loading || !mentor) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1329]/95 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 text-white">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
          <span className="text-sm font-semibold">{t('loading_mentor')}</span>
        </div>
      </div>
    )
  }

  // Weekday Name Mapper
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  // Check if a specific calendar date is available based on weekly rules
  const isDateAvailable = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Must be in the future
    if (date < today) return false

    const dayName = weekdays[date.getDay()]
    return mentor.availability.some(
      (av) => av.dayOfWeek.toLowerCase() === dayName.toLowerCase()
    )
  }

  // Get availability slot bounds for a date
  const getAvailabilityForDate = (date: Date) => {
    const dayName = weekdays[date.getDay()]
    return mentor.availability.filter(
      (av) => av.dayOfWeek.toLowerCase() === dayName.toLowerCase()
    )
  }

  // 45-minute slots generator
  const getSlotsForDate = (date: Date) => {
    const availabilities = getAvailabilityForDate(date)
    const allSlots: string[] = []

    availabilities.forEach((av) => {
      const [startH, startM] = av.startTime.split(':').map(Number)
      const [endH, endM] = av.endTime.split(':').map(Number)

      let currentTotal = startH * 60 + startM
      const endTotal = endH * 60 + endM

      while (currentTotal + 45 <= endTotal) {
        const slotH = Math.floor(currentTotal / 60)
        const slotM = currentTotal % 60
        const slotTime = `${String(slotH).padStart(2, '0')}:${String(slotM).padStart(2, '0')}`
        allSlots.push(slotTime)
        currentTotal += 45
      }
    })

    return allSlots
  }

  // Format Date and Time
  const formatDateTime = (dateStr: string) => {
    const dateObj = new Date(dateStr)
    
    const dateOptions: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: '2-digit', 
      year: 'numeric' 
    }
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    }

    const formattedDate = new Intl.DateTimeFormat(i18n.language, dateOptions).format(dateObj)
    const formattedTime = new Intl.DateTimeFormat(i18n.language, timeOptions).format(dateObj)
    
    return {
      date: formattedDate,
      time: `${formattedTime} EST`
    }
  }

  // Formatting 12-hour display for UI
  const format12Hour = (time24: string) => {
    const [hoursStr, minutesStr] = time24.split(':')
    const hours = parseInt(hoursStr, 10)
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const hours12 = hours % 12 === 0 ? 12 : hours % 12
    return `${String(hours12).padStart(2, '0')}:${minutesStr} ${ampm}`
  }

  // Month navigation
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    setSelectedDate(null)
    setSelectedTimeSlot(null)
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    setSelectedDate(null)
    setSelectedTimeSlot(null)
  }

  // Generate calendar days
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDayIndex = new Date(year, month, 1).getDay()
    const totalDays = new Date(year, month + 1, 0).getDate()

    const dayCells = []
    
    // Empty cells for weekday offset
    for (let i = 0; i < firstDayIndex; i++) {
      dayCells.push(null)
    }

    // Actual month days
    for (let day = 1; day <= totalDays; day++) {
      dayCells.push(new Date(year, month, day))
    }

    return dayCells
  }

  // Finalize booking
  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTimeSlot) {
      toast.error(t('toast_invalid_time'))
      return
    }

    if (description.trim().length < 20) {
      toast.error(t('toast_invalid_desc'))
      return
    }

    setBooking(true)
    try {
      // Build ISO Date: selectedDate (YYYY-MM-DD) + selectedTimeSlot (HH:MM)
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      
      const startTimeISO = `${year}-${month}-${day}T${selectedTimeSlot}:00`

      const response = await api.post('/sessions/book', {
        mentorId: mentor.id,
        startTime: startTimeISO,
        description: description
      })

      if (response.data && response.data.success) {
        toast.success(t('toast_booking_success'))
        navigate('/student/sessions')
      } else {
        throw new Error('Booking failed')
      }
    } catch (err: any) {
      console.error(err)
      const serverMessage = err.response?.data?.message || t('toast_booking_error')
      toast.error(serverMessage)
    } finally {
      setBooking(false)
    }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const calendarDays = getCalendarDays()
  const weekDaysShort = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1329]/90 backdrop-blur-sm overflow-y-auto">
      {/* Modal overlay window card */}
      <div className="relative bg-[#0e1730] border border-slate-800 text-slate-100 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px] animate-in zoom-in-95 duration-200">
        
        {/* Close button X */}
        <button
          onClick={() => navigate('/student/sessions')}
          className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors z-20`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: Mentor summary */}
        <div className="w-full md:w-[35%] bg-slate-900/40 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800/80">
          <div className="space-y-6">
            {/* Mentor Profile details */}
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-lg relative">
                {mentor.name.substring(0, 2).toUpperCase()}
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-extrabold text-xl leading-tight text-white">{mentor.name}</h3>
                <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1 mt-1">
                  <Code className="w-3.5 h-3.5" />
                  {mentor.title}
                </span>
              </div>
            </div>

            {/* Session details list */}
            <div className="space-y-4 pt-4 border-t border-slate-800/50">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t('session_details_title')}
              </h4>
              
              <div className="space-y-3.5">
                <div className={`flex items-start gap-3 text-xs leading-relaxed text-slate-300 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                  <Video className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span>{t('session_video_details')}</span>
                </div>
                <div className={`flex items-center gap-3 text-xs text-slate-300 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                  <Clock className="w-4.5 h-4.5 text-indigo-400" />
                  <span>{t('session_duration_details')}</span>
                </div>
                <div className={`flex items-center gap-3 text-xs text-slate-300 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                  <Award className="w-4.5 h-4.5 text-indigo-400" />
                  <span>{t('session_credit_details')}</span>
                </div>
              </div>
            </div>

            {/* Expertise tags */}
            <div className="space-y-3 pt-4 border-t border-slate-800/50">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t('expertise_title')}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-slate-800/60 border border-slate-700/50 text-slate-300 px-2.5 py-1 rounded-lg text-xs font-semibold">
                  {mentor.stack.name}
                </span>
                <span className="bg-slate-800/60 border border-slate-700/50 text-slate-300 px-2.5 py-1 rounded-lg text-xs font-semibold">
                  System Design
                </span>
                <span className="bg-slate-800/60 border border-slate-700/50 text-slate-300 px-2.5 py-1 rounded-lg text-xs font-semibold">
                  Algorithms
                </span>
              </div>
            </div>
          </div>

          {/* Secure Lock Footer */}
          <div className={`pt-6 border-t border-slate-800/50 flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider ${isRtl ? 'flex-row-reverse' : ''}`}>
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('secure_booking_footer')}</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Selection details */}
        <div className="flex-1 p-6 md:p-8 space-y-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            <h3 className="font-extrabold text-xl text-white pt-2">{t('booking_title')}</h3>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Calendar card grid */}
              <div className="lg:col-span-7 bg-slate-900/30 border border-slate-800 rounded-2xl p-4 space-y-4">
                {/* Month Navigator Header */}
                <div className="flex justify-between items-center px-1">
                  <span className="font-extrabold text-sm text-white">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={prevMonth}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={nextMonth}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

                {/* Grid cells */}
                <div className="grid grid-cols-7 gap-y-2.5 gap-x-1.5 text-center">
                  {/* Weekday headers */}
                  {weekDaysShort.map((day) => (
                    <span key={day} className="text-[10px] font-bold text-slate-500 uppercase">
                      {day}
                    </span>
                  ))}

                  {/* Day cells */}
                  {calendarDays.map((date, idx) => {
                    if (!date) return <span key={`empty-${idx}`} />;
                    
                    const isAvailable = isDateAvailable(date)
                    const isSelected = selectedDate?.toDateString() === date.toDateString()
                    const dayNum = date.getDate()

                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => {
                          if (isAvailable) {
                            setSelectedDate(date)
                            setSelectedTimeSlot(null) // reset slot
                          }
                        }}
                        disabled={!isAvailable}
                        className={`h-9 w-9 mx-auto rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all relative ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                            : isAvailable
                            ? 'text-slate-200 hover:bg-slate-800/80 cursor-pointer border border-indigo-500/20'
                            : 'text-slate-600 opacity-20 pointer-events-none'
                        }`}
                      >
                        <span>{dayNum}</span>
                        {/* Dot indicator under day */}
                        {isAvailable && (
                          <span className={`w-1 h-1 rounded-full absolute bottom-1.5 ${
                            isSelected ? 'bg-white' : 'bg-indigo-400'
                          }`}></span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Timezone label */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase pt-2 pl-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{t('timezone_local')} &bull; {Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
                </div>
              </div>

              {/* Time Slots area */}
              <div className="lg:col-span-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {selectedDate 
                    ? t('available_on', { date: formatDateTime(selectedDate.toISOString()).date })
                    : 'Select a Date'
                  }
                </h4>

                {selectedDate ? (
                  <div className="space-y-3">
                    {/* Time slots button list */}
                    <div className="grid grid-cols-2 gap-2">
                      {getSlotsForDate(selectedDate).map((slot24) => {
                        const isSelected = selectedTimeSlot === slot24
                        return (
                          <button
                            key={slot24}
                            onClick={() => setSelectedTimeSlot(slot24)}
                            className={`py-3 px-2 rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 border border-transparent'
                                : 'bg-slate-900/40 hover:bg-slate-800 text-slate-200 border border-slate-800'
                            }`}
                          >
                            {format12Hour(slot24)}
                          </button>
                        )
                      })}
                    </div>

                    {/* Edit button placeholder matching mockup */}
                    <button 
                      onClick={() => toast('Availability editing is coming soon!', { icon: '✏️' })}
                      className="w-full py-2.5 border border-slate-850 bg-slate-900/10 hover:bg-slate-900/30 text-xs font-semibold text-slate-400 hover:text-slate-350 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      ✏️ {t('edit_btn')}
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic p-6 border border-dashed border-slate-800 rounded-2xl text-center">
                    Please choose a date from the calendar to view available slots
                  </div>
                )}
              </div>

            </div>

            {/* Description/Goals textarea */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                {t('goals_label')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('goals_placeholder')}
                rows={3}
                className="w-full bg-slate-900/30 border border-slate-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500/50 text-sm text-slate-100 placeholder-slate-500 leading-relaxed resize-none transition-all"
              />
            </div>
          </div>

          {/* Confirm & policy block */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-slate-800/60 bg-[#0e1730]">
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              {t('cancel_agreement')}
            </p>

            <button
              onClick={handleConfirmBooking}
              disabled={booking || !selectedDate || !selectedTimeSlot}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-40 disabled:pointer-events-none text-white font-bold rounded-xl px-8 py-3 text-xs shadow-lg shadow-indigo-600/15 transition-all flex items-center justify-center gap-2 min-w-[150px]"
            >
              {booking ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <Check className="w-4.5 h-4.5" />
                  <span>{t('confirm_booking_btn')}</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}

export default BookingFlowPage
