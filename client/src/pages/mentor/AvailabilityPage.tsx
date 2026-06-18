import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../store'
import { fetchAvailability } from '../../store/slices/mentorSlice'
import {
  createAvailability,
  updateAvailability,
  deleteAvailability,
} from '../../services/mentorService'
import type {
  MentorAvailability,
  CreateAvailabilityPayload,
} from '../../types/mentor.types'

const DAYS = [
  'Monday', 'Tuesday', 'Wednesday',
  'Thursday', 'Friday', 'Saturday', 'Sunday',
]

const EMPTY_FORM = {
  dayOfWeek: '',
  startTime: '',
  endTime: '',
}

export default function AvailabilityPage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((s) => s.auth)
  const MENTOR_ID = user?.mentorProfileId ?? 1

  const { availability, loading, error } = useAppSelector((s) => s.mentor)

  const [form, setForm] = useState<CreateAvailabilityPayload>({
    mentorId: MENTOR_ID,
    ...EMPTY_FORM,
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (MENTOR_ID) {
      setForm((p) => ({ ...p, mentorId: MENTOR_ID }))
    }
    dispatch(fetchAvailability(MENTOR_ID))
  }, [dispatch, MENTOR_ID])

  const handleSubmit = async () => {
    if (!form.dayOfWeek || !form.startTime || !form.endTime) {
      toast.error('Please fill all fields')
      return
    }
    setSubmitting(true)
    try {
      if (editingId !== null) {
        await updateAvailability(editingId, {
          dayOfWeek: form.dayOfWeek,
          startTime: form.startTime,
          endTime: form.endTime,
        })
        toast.success('Slot updated successfully')
      } else {
        await createAvailability(form)
        toast.success('Slot added successfully')
      }
      setForm({ mentorId: MENTOR_ID, ...EMPTY_FORM })
      setEditingId(null)
      dispatch(fetchAvailability(MENTOR_ID))
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (slot: MentorAvailability) => {
    setEditingId(slot.id)
    setForm({
      mentorId: slot.mentorId,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
    })
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteAvailability(id)
      toast.success('Slot deleted')
      dispatch(fetchAvailability(MENTOR_ID))
    } catch {
      toast.error('Failed to delete slot')
    }
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ color: '#d8e3fb', fontFamily: 'Geist, sans-serif' }}
        >
          Availability Management
        </h1>
        <p className="text-sm mt-1" style={{ color: '#c7c4d7' }}>
          Configure your weekly availability for student sessions.
        </p>
      </div>

      {/* Form Card */}
      <div
        className="rounded-xl border p-6 space-y-5"
        style={{ background: '#152031', border: '1px solid #464554' }}
      >
        <h2
          className="text-sm font-semibold uppercase tracking-widest"
          style={{ color: '#c0c1ff', fontFamily: 'Geist, sans-serif' }}
        >
          {editingId !== null ? 'Edit Slot' : 'Add New Slot'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Day */}
          <div className="space-y-2">
            <label
              className="text-xs font-medium uppercase tracking-widest"
              style={{ color: '#908fa0', fontFamily: 'Geist, sans-serif' }}
            >
              Day of Week
            </label>
            <select
              value={form.dayOfWeek}
              onChange={(e) =>
                setForm((p) => ({ ...p, dayOfWeek: e.target.value }))
              }
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border transition-all"
              style={{
                background: '#0d1826',
                border: '1px solid #464554',
                color: form.dayOfWeek ? '#d8e3fb' : '#908fa0',
              }}
            >
              <option value="" disabled>Select day</option>
              {DAYS.map((d) => (
                <option key={d} value={d} style={{ background: '#152031' }}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Start Time */}
          <div className="space-y-2">
            <label
              className="text-xs font-medium uppercase tracking-widest"
              style={{ color: '#908fa0', fontFamily: 'Geist, sans-serif' }}
            >
              Start Time
            </label>
            <input
              type="time"
              value={form.startTime}
              onChange={(e) =>
                setForm((p) => ({ ...p, startTime: e.target.value }))
              }
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border transition-all"
              style={{
                background: '#0d1826',
                border: '1px solid #464554',
                color: '#d8e3fb',
                colorScheme: 'dark',
              }}
            />
          </div>

          {/* End Time */}
          <div className="space-y-2">
            <label
              className="text-xs font-medium uppercase tracking-widest"
              style={{ color: '#908fa0', fontFamily: 'Geist, sans-serif' }}
            >
              End Time
            </label>
            <input
              type="time"
              value={form.endTime}
              onChange={(e) =>
                setForm((p) => ({ ...p, endTime: e.target.value }))
              }
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border transition-all"
              style={{
                background: '#0d1826',
                border: '1px solid #464554',
                color: '#d8e3fb',
                colorScheme: 'dark',
              }}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-80 disabled:opacity-50"
            style={{
              background: '#c0c1ff',
              color: '#1000a9',
              fontFamily: 'Geist, sans-serif',
            }}
          >
            {submitting ? 'Saving...' : editingId !== null ? 'Update Slot' : 'Add Slot'}
          </button>
          {editingId !== null && (
            <button
              onClick={() => { setForm({ mentorId: MENTOR_ID, ...EMPTY_FORM }); setEditingId(null) }}
              className="px-5 py-2.5 rounded-lg text-sm font-medium border transition-all hover:opacity-70"
              style={{
                border: '1px solid #464554',
                color: '#c7c4d7',
                background: 'transparent',
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Slots List */}
      <div
        className="rounded-xl border p-6 space-y-4"
        style={{ background: '#152031', border: '1px solid #464554' }}
      >
        <h2
          className="text-sm font-semibold uppercase tracking-widest"
          style={{ color: '#c0c1ff', fontFamily: 'Geist, sans-serif' }}
        >
          Your Slots ({availability.length})
        </h2>

        {loading && (
          <div className="flex justify-center py-10">
            <div
              className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2"
              style={{ borderColor: '#c0c1ff' }}
            />
          </div>
        )}

        {error && (
          <p className="text-sm px-4 py-3 rounded-lg"
            style={{ background: '#93000a22', color: '#ffb4ab', border: '1px solid #93000a' }}>
            {error}
          </p>
        )}

        {!loading && availability.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm" style={{ color: '#908fa0' }}>
              No availability slots yet.
            </p>
            <p className="text-xs mt-1" style={{ color: '#464554' }}>
              Add your first slot above to get started.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {availability.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center justify-between rounded-lg px-4 py-3 border transition-all hover:border-opacity-70"
              style={{
                background: '#1f2a3c',
                border: '1px solid #464554',
              }}
            >
              <div className="flex items-center gap-4">
                <span
                  className="text-xs font-medium px-3 py-1 rounded-full"
                  style={{
                    background: '#2a3548',
                    color: '#c0c1ff',
                    fontFamily: 'Geist, sans-serif',
                  }}
                >
                  {slot.dayOfWeek}
                </span>
                <span className="text-sm" style={{ color: '#d8e3fb' }}>
                  {slot.startTime} → {slot.endTime}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(slot)}
                  className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:opacity-70"
                  style={{
                    border: '1px solid #464554',
                    color: '#c7c4d7',
                    background: 'transparent',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(slot.id)}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-70"
                  style={{
                    background: '#93000a',
                    color: '#ffb4ab',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}